<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
require __DIR__ . '/auth.php';

$req = read_json_body();
$config = auth_config();

$ok = is_string($req['user'] ?? null) && is_string($req['password'] ?? null)
    && hash_equals($config['auth_user'], $req['user'])
    && password_verify($req['password'], $config['auth_pass_hash']);

if (!$ok) {
    sleep(1); // 総当たりの抑止
    respond_error('ユーザー名またはパスワードが違います', 401);
}

auth_issue($config['auth_user']);
respond(['user' => $config['auth_user']]);
