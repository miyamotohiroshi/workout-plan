<?php
declare(strict_types=1);

const AUTH_COOKIE = 'wp_auth';
const AUTH_TTL = 60 * 60 * 24 * 90; // 90日

function auth_config(): array {
    static $config = null;
    return $config ??= require __DIR__ . '/config.php';
}

function b64url(string $s): string { return rtrim(strtr(base64_encode($s), '+/', '-_'), '='); }
function b64url_decode(string $s): string|false { return base64_decode(strtr($s, '-_', '+/')); }

function auth_sign(string $payload): string {
    return b64url(hash_hmac('sha256', $payload, auth_config()['auth_secret'], true));
}

// 期限付きの署名トークンをクッキーに入れる (サーバー側にセッションは持たない)
function auth_issue(string $user): void {
    $payload = b64url(json_encode(['u' => $user, 'exp' => time() + AUTH_TTL]));
    setcookie(AUTH_COOKIE, $payload . '.' . auth_sign($payload), [
        'expires' => time() + AUTH_TTL,
        'path' => '/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function auth_clear(): void {
    setcookie(AUTH_COOKIE, '', ['expires' => 1, 'path' => '/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
}

function auth_user(): ?string {
    $cookie = $_COOKIE[AUTH_COOKIE] ?? '';
    $parts = explode('.', $cookie);
    if (count($parts) !== 2 || !hash_equals(auth_sign($parts[0]), $parts[1])) return null;
    $data = json_decode((string)b64url_decode($parts[0]), true);
    if (!is_array($data) || ($data['exp'] ?? 0) < time()) return null;
    return $data['u'] === auth_config()['auth_user'] ? $data['u'] : null;
}
