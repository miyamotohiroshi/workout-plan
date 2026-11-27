<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
require_auth();
require __DIR__ . '/storage.php';

$bucket = check_bucket($_POST['bucket'] ?? null);
$path = check_path($_POST['path'] ?? null);
$upsert = ($_POST['upsert'] ?? '0') === '1';

$file = $_FILES['file'] ?? null;
if (!$file || $file['error'] !== UPLOAD_ERR_OK) respond_error('upload failed');
if ($file['size'] > MAX_UPLOAD_BYTES) respond_error('file too large', 413);

// 拡張子ではなく中身が JPEG であることを確認
$info = @getimagesize($file['tmp_name']);
if (!$info || $info[2] !== IMAGETYPE_JPEG) respond_error('JPEG only', 415);

$dest = storage_file($bucket, $path);
if (!$upsert && file_exists($dest)) respond_error('already exists', 409);
if (!is_dir(dirname($dest)) && !mkdir(dirname($dest), 0755, true)) respond_error('storage error', 500);
if (!move_uploaded_file($file['tmp_name'], $dest)) respond_error('storage error', 500);

respond(['path' => $path]);
