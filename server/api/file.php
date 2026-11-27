<?php
declare(strict_types=1);
// 画像の配信 (ログイン必須)。GET /api/file.php?b=<bucket>&p=<path>
require __DIR__ . '/auth.php';

function not_found(int $status): never { http_response_code($status); exit; }

if (auth_user() === null) not_found(401);

$bucket = $_GET['b'] ?? '';
$path = $_GET['p'] ?? '';
$validBucket = in_array($bucket, ['photos', 'hero-images'], true);
$validPath = is_string($path) && preg_match('#^[A-Za-z0-9_\-]+(/[A-Za-z0-9_\-]+)*\.jpg$#', $path);
if (!$validBucket || !$validPath) not_found(400);

$file = dirname(__DIR__) . '/uploads/' . $bucket . '/' . $path;
if (!is_file($file)) not_found(404);

header('Content-Type: image/jpeg');
header('Content-Length: ' . filesize($file));
header('Cache-Control: private, max-age=86400');
header('X-Content-Type-Options: nosniff');
readfile($file);
