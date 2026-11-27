<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
require_auth();

// テーブル/カラムのホワイトリスト。型は float / int / string / json。
// ここに無いテーブル・カラムは一切受け付けない。
const SCHEMA = [
    'body_records' => [
        'cols' => ['id' => 'string', 'date' => 'string', 'weight' => 'float', 'body_fat' => 'float',
                   'chest' => 'float', 'shoulder' => 'float', 'arm' => 'float', 'thigh' => 'float'],
        'pk' => 'id', 'uuid' => true,
    ],
    'exercise_records' => [
        'cols' => ['id' => 'string', 'date' => 'string', 'exercise_name' => 'string',
                   'weight' => 'float', 'reps' => 'int', 'sets' => 'int'],
        'pk' => 'id', 'uuid' => true,
    ],
    'photos' => [
        'cols' => ['id' => 'string', 'date' => 'string', 'memo' => 'string',
                   'storage_path' => 'string', 'angle' => 'string'],
        'pk' => 'id', 'uuid' => true,
    ],
    'checkins' => [
        'cols' => ['id' => 'string', 'week' => 'string', 'days' => 'json',
                   'weight' => 'float', 'memo' => 'string'],
        'pk' => 'id', 'uuid' => true,
    ],
    'protein_logs' => [
        'cols' => ['id' => 'string', 'date' => 'string', 'breakfast' => 'json', 'lunch' => 'json',
                   'dinner' => 'json', 'snack' => 'json'],
        'pk' => 'id', 'uuid' => true,
    ],
    'app_settings' => [
        'cols' => ['key' => 'string', 'value' => 'json'],
        'pk' => 'key', 'uuid' => false,
    ],
];

const OPS = ['eq' => '=', 'gte' => '>=', 'lt' => '<'];

function q(string $ident): string { return '`' . $ident . '`'; }

function check_col(array $cols, mixed $name): string {
    if (!is_string($name) || !isset($cols[$name])) respond_error('unknown column');
    return $name;
}

function encode_value(string $type, mixed $v): mixed {
    if ($v === null) return null;
    return match ($type) {
        'json' => json_encode($v, JSON_UNESCAPED_UNICODE),
        'float' => (float)$v,
        'int' => (int)$v,
        default => (string)$v,
    };
}

function decode_row(array $cols, array $row): array {
    foreach ($row as $k => $v) {
        if ($v === null) continue;
        $row[$k] = match ($cols[$k] ?? 'string') {
            'json' => json_decode($v, true),
            'float' => (float)$v,
            'int' => (int)$v,
            default => $v,
        };
    }
    return $row;
}

function build_where(array $cols, array $filters, array &$params): string {
    $parts = [];
    foreach ($filters as $f) {
        $col = q(check_col($cols, $f['col'] ?? null));
        $op = $f['op'] ?? '';
        if ($op === 'not_is' && ($f['val'] ?? null) === null) {
            $parts[] = "$col IS NOT NULL";
        } elseif (isset(OPS[$op])) {
            $parts[] = "$col " . OPS[$op] . ' ?';
            $params[] = $f['val'];
        } else {
            respond_error('unsupported filter');
        }
    }
    return $parts ? ' WHERE ' . implode(' AND ', $parts) : '';
}

// 書き込み用: カラム名の検証と値のエンコードを行い [列名[], 値[]] を返す
function prepare_row(array $cols, array $row): array {
    if (!$row) respond_error('empty row');
    $names = [];
    $values = [];
    foreach ($row as $k => $v) {
        $names[] = check_col($cols, $k);
        $values[] = encode_value($cols[$k], $v);
    }
    return [$names, $values];
}

$req = read_json_body();
$table = $req['table'] ?? '';
if (!is_string($table) || !isset(SCHEMA[$table])) respond_error('unknown table');
$def = SCHEMA[$table];
$cols = $def['cols'];
$op = $req['op'] ?? 'select';
$filters = is_array($req['filters'] ?? null) ? $req['filters'] : [];

try {
    $pdo = pdo();

    if ($op === 'select') {
        $selected = ($req['columns'] ?? '*') === '*'
            ? array_keys($cols)
            : array_map(fn($c) => check_col($cols, trim($c)), explode(',', (string)$req['columns']));
        $params = [];
        $sql = 'SELECT ' . implode(', ', array_map('q', $selected)) . ' FROM ' . q($table)
             . build_where($cols, $filters, $params);
        $orders = [];
        foreach (($req['order'] ?? []) as $o) {
            $orders[] = q(check_col($cols, $o['col'] ?? null)) . (empty($o['asc']) ? ' DESC' : ' ASC');
        }
        if ($orders) $sql .= ' ORDER BY ' . implode(', ', $orders);
        $limit = isset($req['limit']) ? (int)$req['limit'] : (!empty($req['single']) ? 1 : 0);
        if ($limit > 0) $sql .= ' LIMIT ' . $limit;
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = array_map(fn($r) => decode_row($cols, $r), $stmt->fetchAll());
        respond(!empty($req['single']) ? ($rows[0] ?? null) : $rows);
    }

    if ($op === 'insert' || $op === 'upsert') {
        $rows = $req['rows'] ?? null;
        if (!is_array($rows)) respond_error('rows required');
        if (array_is_list($rows) === false) $rows = [$rows];
        $conflict = $op === 'upsert' ? check_col($cols, $req['onConflict'] ?? $def['pk']) : null;
        foreach ($rows as $row) {
            if ($def['uuid'] && !isset($row['id'])) $row['id'] = uuid_v4();
            [$names, $values] = prepare_row($cols, $row);
            $sql = 'INSERT INTO ' . q($table) . ' (' . implode(', ', array_map('q', $names)) . ') VALUES ('
                 . implode(', ', array_fill(0, count($names), '?')) . ')';
            if ($conflict !== null) {
                $updates = array_values(array_filter($names, fn($n) => $n !== $conflict && $n !== $def['pk']));
                if (!$updates) $updates = [$conflict]; // 更新対象が無い場合の no-op
                $sql .= ' ON DUPLICATE KEY UPDATE '
                      . implode(', ', array_map(fn($n) => q($n) . ' = VALUES(' . q($n) . ')', $updates));
            }
            $pdo->prepare($sql)->execute($values);
        }
        respond(null);
    }

    if ($op === 'update') {
        if (!$filters) respond_error('filter required'); // 全件更新の事故防止
        [$names, $values] = prepare_row($cols, $req['rows'] ?? []);
        $params = $values;
        $sql = 'UPDATE ' . q($table) . ' SET '
             . implode(', ', array_map(fn($n) => q($n) . ' = ?', $names))
             . build_where($cols, $filters, $params);
        $pdo->prepare($sql)->execute($params);
        respond(null);
    }

    if ($op === 'delete') {
        if (!$filters) respond_error('filter required'); // 全件削除の事故防止
        $params = [];
        $sql = 'DELETE FROM ' . q($table) . build_where($cols, $filters, $params);
        $pdo->prepare($sql)->execute($params);
        respond(null);
    }

    respond_error('unsupported op');
} catch (PDOException $e) {
    error_log('[db.php] ' . $e->getMessage());
    respond_error('データベースエラーが発生しました', 500);
}
