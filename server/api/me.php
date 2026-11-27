<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
require __DIR__ . '/auth.php';

$user = auth_user();
if ($user === null) respond_error('unauthorized', 401);
auth_issue($user); // 使うたびに期限を90日先へ延ばす
respond(['user' => $user]);
