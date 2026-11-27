# Xserver + MySQL へのデプロイ

構成: Next.js を静的ファイルに書き出し (`out/`)、データ保存は PHP API (`server/api/`) + MySQL、画像はサーバー上の `uploads/` に保存。

## 1. MySQL の準備
1. サーバーパネルの「MySQL設定」で DB を作成し、「MySQLユーザ追加」でユーザーを作って DB へのアクセス権を付与する (DB名・ユーザー・パスワードを控える。ホストは通常 `localhost`)
2. 「phpMyAdmin」(サーバーパネルから開く) で [server/sql/schema.sql](server/sql/schema.sql) を実行 (文字コード utf8mb4)

## 2. ビルド
```bash
npm run build   # out/ に静的ファイルが出力される
```

## 3. アップロード (FTP (FTPソフト or ファイルマネージャ))
公開ディレクトリ (`ドメイン名/public_html/`) を次の形にする。

```
public_html/
├── (out/ の中身すべて)   index.html, _next/, manifest.json, icon.png ...
├── api/                  server/api/ の中身 (config.php は下記で作成)
└── uploads/              server/uploads/ の中身 (.htaccess を含める)
```

- `api/config.sample.php` を `api/config.php` にコピーし、DB接続情報を記入
- `uploads/` の書き込み権限を 755 (書けない場合は 707) にする
- サブディレクトリに置く場合は `manifest.json` / `icon.png` の絶対パスの修正が必要 (ドメイン直下か専用サブドメイン推奨)

## 4. アクセス制限 (推奨)
Supabase 時代と同様にアプリ側にログインは無く、URL を知っていれば誰でも読み書きできます。
サーバーパネルの「アクセス制限」または `public_html/.htaccess` の Basic 認証で保護してください。

## 5. Supabase からのデータ移行
1. Supabase の Table Editor で各テーブルを CSV エクスポート
   (`body_records`, `exercise_records`, `photos`, `checkins`, `protein_logs`, `app_settings`)
2. phpMyAdmin の「インポート」で CSV を取り込む (列名が一致しない余分な列、例: `created_at` は除外)
   - `id` は UUID のまま取り込める
   - `days` / `breakfast` / `lunch` / `dinner` / `snack` / `value` は JSON 文字列のまま入る
3. Storage の `photos` と `hero-images` バケットのファイルをダウンロードし、
   同じパス構成で `uploads/photos/...` `uploads/hero-images/...` に FTP アップロード

## ローカル開発
フロントは `npm run dev`。API を試す場合は、本番サーバーの `config.php` に `allowed_origin => 'http://localhost:3000'` を設定し、`.env.local` に `NEXT_PUBLIC_API_BASE` / `NEXT_PUBLIC_UPLOADS_BASE` を書く ([.env.example](.env.example) 参照)。
