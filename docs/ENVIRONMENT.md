# 環境まとめ（本番・ローカル・画像）

> このリポジトリは公開 (Public) のため、パスワード・DB接続情報・ログインIDはここに書かない。
> それらは本番サーバー上の `api/config.php`（Git 管理外）にだけある。

## 本番

| 項目 | 内容 |
| --- | --- |
| URL | https://workout.fate-design.jp/ |
| サーバー | Xserver（レンタルサーバー） |
| 公開ディレクトリ | `public_html/`（`out/` の中身 + `api/` + `uploads/`） |
| フロント | Next.js の静的書き出し（`npm run build` → `out/`）。Node.js は動かしていない |
| API | https://workout.fate-design.jp/api/ （PHP。ソースは [server/api/](../server/api/)） |
| データベース | Xserver の MySQL。テーブル定義は [server/sql/schema.sql](../server/sql/schema.sql) |
| 接続設定 | 本番サーバーの `public_html/api/config.php`（DB接続・ログインID・パスワードのハッシュ・署名用シークレット） |
| デプロイ | FTP で手動アップロード。手順は [DEPLOY.md](../DEPLOY.md) |

### テーブル
`body_records`（サイズ・体重）/ `exercise_records`（重量）/ `photos`（写真）/ `checkins`（旧・出席の手入力）/ `protein_logs`（食事・タンパク質）/ `app_settings`（ヒーロー画像などの設定）

※ 「出席」タブは `exercise_records` の記録日から自動集計している。`checkins` は以前の手入力データの表示用に読むだけで、新規には書き込まない。

## ログイン

- ログイン画面: [src/components/AuthGate.tsx](../src/components/AuthGate.tsx)、判定: [server/api/login.php](../server/api/login.php) / [auth.php](../server/api/auth.php)
- 現在は **ユーザー1人だけ**（`config.php` の `auth_user` / `auth_pass_hash`）
- ログイン状態は署名付きクッキー `wp_auth`（有効期限 90 日）

### パスワードを忘れたとき
元のパスワードは復元できない（ハッシュのみ保存）。新しく作り直す:

```bash
php -r '$p = readline("新しいパスワード: "); echo password_hash($p, PASSWORD_DEFAULT), PHP_EOL;'
```

出力された `$2y$...` を本番の `public_html/api/config.php` の `auth_pass_hash` に貼り付ける（手元の `server/api/config.php` も合わせておく）。

## ローカル開発

```bash
npm run dev   # http://localhost:3000
```

- **ローカルは本番のデータベースを読み書きしている。**
  開発サーバーは `localhost:3000/api/*` を本番の `https://workout.fate-design.jp/api/*` へ中継する（[next.config.ts](../next.config.ts) の `rewrites`）。
  ローカルで記録の追加・編集・削除をすると **本番データがそのまま変わる**。
- ログインも本番と同じID・パスワード。クッキーは `localhost` に保存される。
- 中継先を変えたいときは `.env.local` に `DEV_API_PROXY=https://.../api` を書く。
- この中継は `npm run dev` のときだけ有効。`npm run build`（本番用）には含まれない。
- 本番サーバーの `config.php` の変更（`allowed_origin` など）は不要。

## 画像

| 種類 | 置き場所 | 表示のされ方 |
| --- | --- | --- |
| 記録の写真（「写真」タブ） | 本番サーバー `public_html/uploads/photos/` | `api/file.php?b=photos&p=...` 経由（ログイン必須） |
| ヒーロー画像（トップのスライド） | 本番サーバー `public_html/uploads/hero-images/` | `api/file.php?b=hero-images&p=...` 経由（ログイン必須） |
| 種目の説明画像（メニュー） | `public/images/exercises/<種目ID>.jpg`（ビルドで `out/` に含まれる） | Figma の AI 画像生成で作成（横長 3:2・960×640）。種目との対応は [src/lib/exercises.ts](../src/lib/exercises.ts) の `hasImage` |
| アイコン・favicon | `public/`（ビルドで `out/` に含まれる） | 静的ファイル |

- アップロードは `api/upload.php`、削除は `api/remove.php`。JPG のみ・1 枚 5MB まで（[server/api/storage.php](../server/api/storage.php)）。
- `uploads/` は直接アクセス禁止（[server/uploads/.htaccess](../server/uploads/.htaccess)）。必ず `file.php` を通す。
- ローカルでも画像は中継経由で **本番サーバーの `uploads/`** を読んでいる。

## 履歴

- 以前は Supabase（DB と Storage）を使っていた。Xserver + PHP API + MySQL へ移行済み（移行手順は [DEPLOY.md](../DEPLOY.md) の「Supabase からのデータ移行」）。
