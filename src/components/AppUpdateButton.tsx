'use client';

import { useState } from 'react';

// ビルド時刻 (next.config.ts で埋め込む)。どのバージョンを見ているか確認できるようにする
const BUILD_TIME = process.env.NEXT_PUBLIC_BUILD_TIME ?? '';

// 入口のページ類。ここだけ取り直せば、プログラム・画像はファイル名が変わるので新しいものが読まれる
const ENTRY_FILES = [
  '/',
  '/index.html',
  '/index.txt',
  '/manifest.json',
  '/__next._full.txt',
  '/__next._head.txt',
  '/__next._index.txt',
  '/__next._tree.txt',
  '/__next.__PAGE__.txt',
];

function formatBuildTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** ブラウザに残った古いページをサーバーの最新版に置き換えて、再読み込みする */
export default function AppUpdateButton() {
  const [updating, setUpdating] = useState(false);

  const update = async () => {
    setUpdating(true);
    // cache: 'reload' = キャッシュを使わずに取り直し、ブラウザのキャッシュも新しい内容で上書きする
    await Promise.allSettled(ENTRY_FILES.map(path => fetch(path, { cache: 'reload', credentials: 'same-origin' })));
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }
    } catch {
      // Cache Storage を使っていない環境では何もしない
    }
    window.location.reload();
  };

  const built = formatBuildTime(BUILD_TIME);

  return (
    <div className="app-update">
      <button type="button" onClick={update} disabled={updating}>
        {updating ? '更新中…' : '🔄 最新版に更新'}
      </button>
      <p>
        画面が古いままに見えるときに押してください（ログインはそのまま）。
        {built && <><br />このアプリのバージョン：{built}</>}
      </p>
    </div>
  );
}
