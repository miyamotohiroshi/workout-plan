import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

// npm run dev のときだけ /api を中継する先 (本番のAPI)。.env.local の DEV_API_PROXY で変更可
const DEV_API_PROXY = process.env.DEV_API_PROXY || 'https://workout.fate-design.jp/api';

const baseConfig: NextConfig = {
  images: {
    // 静的エクスポートでは画像最適化サーバーが使えない
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default function config(phase: string): NextConfig {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    // 開発時: localhost:3000/api/* を本番APIへ中継する。
    // ブラウザからは同じ localhost との通信に見えるので、ログインのクッキーもそのまま使える。
    // ※ ローカルでの操作は本番データに反映される
    return {
      ...baseConfig,
      async rewrites() {
        return [{ source: '/api/:path*', destination: `${DEV_API_PROXY}/:path*` }];
      },
    };
  }

  return {
    ...baseConfig,
    // レンタルサーバーでは Node.js を常駐できないため、静的ファイル (out/) として書き出す
    output: 'export',
  };
}
