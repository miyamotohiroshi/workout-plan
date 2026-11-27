<?php
declare(strict_types=1);

// アップロード先: <サイトルート>/uploads/<bucket>/<path>
const BUCKETS = ['photos', 'hero-images'];
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function uploads_root(): string {
    return dirname(__DIR__) . '/uploads';
}

function check_bucket(mixed $bucket): string {
    if (!is_string($bucket) || !in_array($bucket, BUCKETS, true)) respond_error('invalid bucket');
    return $bucket;
}

function check_path(mixed $path): string {
    if (!is_string($path) || !preg_match('#^[A-Za-z0-9_\-]+(/[A-Za-z0-9_\-]+)*\.jpg$#', $path)) {
        respond_error('invalid path');
    }
    return $path;
}

function storage_file(string $bucket, string $path): string {
    return uploads_root() . '/' . $bucket . '/' . $path;
}
