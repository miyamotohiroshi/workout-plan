<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
require_auth();
require __DIR__ . '/storage.php';

$req = read_json_body();
$bucket = check_bucket($req['bucket'] ?? null);
$paths = $req['paths'] ?? null;
if (!is_array($paths)) respond_error('paths required');

foreach ($paths as $path) {
    $file = storage_file($bucket, check_path($path));
    if (is_file($file)) unlink($file);
}
respond(null);
