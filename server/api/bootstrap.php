<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

$config = require __DIR__ . '/config.php';

if (!empty($config['allowed_origin'])) {
    header('Access-Control-Allow-Origin: ' . $config['allowed_origin']);
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Credentials: true');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond_error('POST only', 405);
}

function require_auth(): void {
    require_once __DIR__ . '/auth.php';
    if (auth_user() === null) respond_error('unauthorized', 401);
}

function respond(mixed $data): never {
    echo json_encode(['data' => $data], JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION);
    exit;
}

function respond_error(string $message, int $status = 400): never {
    http_response_code($status);
    echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function pdo(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        global $config;
        $dsn = "mysql:host={$config['db_host']};dbname={$config['db_name']};charset=utf8mb4";
        $pdo = new PDO($dsn, $config['db_user'], $config['db_pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }
    return $pdo;
}

function uuid_v4(): string {
    $b = random_bytes(16);
    $b[6] = chr((ord($b[6]) & 0x0f) | 0x40);
    $b[8] = chr((ord($b[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($b), 4));
}

function read_json_body(): array {
    $body = json_decode(file_get_contents('php://input') ?: '', true);
    if (!is_array($body)) respond_error('invalid JSON');
    return $body;
}
