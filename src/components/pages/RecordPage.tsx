'use client';

// TODO: Supabase integration for all sub-tabs
// - サイズ: Connect to body_records table (weight, chest, shoulder, arm, thigh)
// - 重量: Connect to exercise_records table (exerciseName, weight, reps, sets)
// - 写真: Connect to photos table + Supabase Storage bucket
// - 出席: Connect to checkins table (week, days, weight, memo)

import { useState } from 'react';

type SubTab = 'size' | 'weight' | 'photo' | 'checkin';

const SUB_TABS: { id: SubTab; icon: string; label: string }[] = [
  { id: 'size', icon: '📏', label: 'サイズ' },
  { id: 'weight', icon: '🏋️', label: '重量' },
  { id: 'photo', icon: '📸', label: '写真' },
  { id: 'checkin', icon: '📅', label: '出席' },
];

const PLACEHOLDER_CONFIG: Record<SubTab, { icon: string; title: string; desc: string }> = {
  size: {
    icon: '📏',
    title: 'サイズ記録',
    desc: '体重・胸囲・肩幅・腕囲・太ももなどの\n計測値を記録・グラフ化します。',
  },
  weight: {
    icon: '🏋️',
    title: 'トレーニング重量記録',
    desc: '各種目のベスト重量・セット・repを記録し\n成長を可視化します。',
  },
  photo: {
    icon: '📸',
    title: 'ボディ写真',
    desc: '定期的なボディ写真を記録して\n変化を視覚的に確認できます。',
  },
  checkin: {
    icon: '📅',
    title: '出席・チェックイン',
    desc: 'トレーニング実施日と週ごとの\n達成率を記録・可視化します。',
  },
};

export default function RecordPage() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('size');
  const config = PLACEHOLDER_CONFIG[activeSubTab];

  return (
    <div className="container">
      <div className="section">
        <div className="section-title"><span>記録</span></div>

        <div className="record-sub-tabs">
          {SUB_TABS.map((tab) => (
            <div
              key={tab.id}
              className={`record-sub-tab${activeSubTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveSubTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </div>
          ))}
        </div>

        <div className="placeholder-card">
          <div className="placeholder-icon">{config.icon}</div>
          <div className="placeholder-title">{config.title}</div>
          <div className="placeholder-desc" style={{ whiteSpace: 'pre-line' }}>{config.desc}</div>
          <div className="placeholder-badge">🔧 Supabase連携後に実装予定</div>
        </div>
      </div>
    </div>
  );
}
