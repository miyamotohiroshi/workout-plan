<?php
// このファイルを config.php にコピーして値を設定する (config.php は Git に含めない)。
return [
    'db_host' => 'localhost', // Xserver は同一サーバー内なので通常 localhost (サーバーパネルの「MySQL設定」に表示されるホスト名でも可)
    'db_name' => 'your_db_name',
    'db_user' => 'your_db_user',
    'db_pass' => 'your_db_password',

    // ログイン設定。auth_pass_hash は次のコマンドで作る:
    //   php -r 'echo password_hash("パスワード", PASSWORD_DEFAULT), PHP_EOL;'
    // auth_secret はクッキー署名用のランダム文字列:
    //   php -r 'echo bin2hex(random_bytes(32)), PHP_EOL;'
    'auth_user' => 'your_login_id',
    'auth_pass_hash' => '',
    'auth_secret' => '',

    // 開発時に localhost:3000 などから API を呼ぶ場合のみ設定 (本番は空のまま)
    'allowed_origin' => '',
];
