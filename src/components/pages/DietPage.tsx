'use client';

import { useState } from 'react';
import ProteinTracker, { ProteinAchievementCalendar } from '@/components/pages/ProteinTracker';
import MealPlan from '@/components/pages/MealPlan';

type DietTab = 'tracker' | 'meals';

const TABS: { id: DietTab; icon: string; label: string }[] = [
  { id: 'tracker', icon: '📊', label: 'タンパク質トラッカー' },
  { id: 'meals', icon: '🍱', label: '定番ごはん' },
];

export default function DietPage() {
  const [tab, setTab] = useState<DietTab>('tracker');

  return (
    <div className="container">
      <div className="section">
        <div className="section-title"><span>食事</span></div>

        <div className="diet-tabs" role="tablist">
          {TABS.map(t => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={tab === t.id ? 'active' : ''}
              onClick={() => setTab(t.id)}
            >
              <span className="diet-tab-icon" aria-hidden="true">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'tracker' && (
          <>
            <ProteinTracker />
            <div style={{ height: 20 }} />
            <ProteinAchievementCalendar />
          </>
        )}
        {tab === 'meals' && <MealPlan />}
      </div>
    </div>
  );
}
