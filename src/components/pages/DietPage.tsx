'use client';

import ProteinTracker, { ProteinAchievementCalendar } from '@/components/pages/ProteinTracker';

export default function DietPage() {
  return (
    <div className="container">
      <div className="section">
        <div className="section-title"><span>タンパク質トラッカー</span></div>
        <ProteinTracker />
      </div>

      <div className="section">
        <ProteinAchievementCalendar />
      </div>

      <div className="section">
        <div className="section-title"><span>食事管理</span></div>

        <div className="diet-card">
          <div className="diet-card-header">
            <div className="diet-icon">📊</div>
            <div className="diet-title">1日のマクロ目標</div>
          </div>
          <div className="macro-grid">
            <div className="macro-item">
              <div className="macro-val">2,700</div>
              <div className="macro-label">カロリー (kcal)</div>
            </div>
            <div className="macro-item">
              <div className="macro-val">140g</div>
              <div className="macro-label">タンパク質</div>
            </div>
            <div className="macro-item">
              <div className="macro-val">+250</div>
              <div className="macro-label">増量幅 (kcal)</div>
            </div>
          </div>
        </div>

        <div className="diet-card">
          <div className="diet-card-header">
            <div className="diet-icon">⚡</div>
            <div className="diet-title">食事のポイント</div>
          </div>
          <div className="tip-list">
            <div className="tip-item"><div className="tip-emoji">🍗</div><div>タンパク質は<strong>毎食30〜40g</strong>を目安に。鶏胸肉・卵・魚・大豆が主力。</div></div>
            <div className="tip-item"><div className="tip-emoji">🍚</div><div>炭水化物は<strong>トレ前後に重点配分</strong>。白米・オートミール・バナナが優秀。</div></div>
            <div className="tip-item"><div className="tip-emoji">📈</div><div><strong>急激な増量はしない</strong>。+200〜300kcalで少しずつ。下腹に脂肪がつくサインに注意。</div></div>
            <div className="tip-item"><div className="tip-emoji">🕐</div><div><strong>トレ後30〜60分以内</strong>にプロテイン+炭水化物（おにぎりなど）を摂る。</div></div>
            <div className="tip-item"><div className="tip-emoji">🥑</div><div>良質な脂質（アボカド・ナッツ・オリーブオイル）はホルモン産生に必須。</div></div>
            <div className="tip-item"><div className="tip-emoji">💧</div><div>水分は<strong>1日2〜3L</strong>。クレアチン使用時は特に重要。</div></div>
            <div className="tip-item"><div className="tip-emoji">🚶</div><div>食後10分散歩を習慣化。血糖値スパイクを抑え、下腹脂肪を防ぐ。</div></div>
          </div>
        </div>

        <div className="diet-card">
          <div className="diet-card-header">
            <div className="diet-icon">🍽️</div>
            <div className="diet-title">1日の食事モデル</div>
          </div>
          <div className="tip-list">
            <div className="tip-item"><div className="tip-emoji">🌅</div><div><strong>朝食：</strong>卵3個・オートミール・バナナ・プロテイン → 約700kcal / P40g</div></div>
            <div className="tip-item"><div className="tip-emoji">☀️</div><div><strong>昼食：</strong>鶏胸肉150g・白米200g・野菜・味噌汁 → 約700kcal / P45g</div></div>
            <div className="tip-item"><div className="tip-emoji">🏋️</div><div><strong>トレ後：</strong>プロテイン1杯 + おにぎり1個 → 約350kcal / P30g</div></div>
            <div className="tip-item"><div className="tip-emoji">🌙</div><div><strong>夕食：</strong>魚or肉150g・白米200g・野菜・スープ → 約700kcal / P40g</div></div>
            <div className="tip-item"><div className="tip-emoji">🌛</div><div><strong>就寝前（任意）：</strong>ギリシャヨーグルト or カゼインプロテイン → 約200kcal / P20g</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
