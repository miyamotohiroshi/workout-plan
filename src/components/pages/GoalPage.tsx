'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const DEFAULT_CURRENT_WEIGHT = 66;

function formatWeight(weight: number) {
  return Number.isInteger(weight) ? String(weight) : weight.toFixed(1);
}

export default function GoalPage() {
  const [currentWeight, setCurrentWeight] = useState(DEFAULT_CURRENT_WEIGHT);

  useEffect(() => {
    let cancelled = false;

    async function loadLatestCheckinWeight() {
      const { data } = await supabase
        .from('checkins')
        .select('weight')
        .not('weight', 'is', null)
        .order('week', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!cancelled && data?.weight != null) {
        setCurrentWeight(Number(data.weight));
      }
    }

    loadLatestCheckinWeight();
    return () => { cancelled = true; };
  }, []);

  const currentWeightLabel = formatWeight(currentWeight);

  return (
    <div className="container">
      <div className="section">
        <div className="section-title"><span>目標</span></div>

        <div className="goal-grid">
          <div className="goal-card accent">
            <div className="label">目標体重</div>
            <div className="value">72<span className="unit">〜75 kg</span></div>
          </div>
          <div className="goal-card">
            <div className="label">現在の体重</div>
            <div className="value">{currentWeightLabel}<span className="unit"> kg</span></div>
          </div>
          <div className="goal-card">
            <div className="label">摂取カロリー目標</div>
            <div className="value">2,700<span className="unit"> kcal</span></div>
          </div>
          <div className="goal-card">
            <div className="label">タンパク質目標</div>
            <div className="value">140<span className="unit"> g/日</span></div>
          </div>
        </div>

        <div className="body-card" style={{ marginTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>現在のボディプロフィール</div>
          <div className="body-grid">
            <div className="body-item">
              <div className="bi-label">身長</div>
              <div className="bi-val">172 cm</div>
            </div>
            <div className="body-item">
              <div className="bi-label">体重</div>
              <div className="bi-val">{currentWeightLabel} kg</div>
            </div>
            <div className="body-item" style={{ gridColumn: '1 / -1' }}>
              <div className="bi-label">身体の特徴</div>
              <div className="bi-val" style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.6, marginTop: 4 }}>
                脚の土台はある ／ 腰回りは細め ／ 下腹に脂肪がつきやすい ／ 肩と背中は伸び代大
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: 14 }} />

        <div className="priority-list">
          <div style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 600, marginBottom: 2 }}>優先部位</div>
          <div className="priority-item">
            <div className="priority-rank">1</div>
            <div className="priority-label">肩（三角筋）</div>
            <div className="priority-bar-wrap">
              <div className="priority-bar" style={{ width: '100%' }} />
            </div>
          </div>
          <div className="priority-item">
            <div className="priority-rank r2">2</div>
            <div className="priority-label">脚（太もも・お尻）</div>
            <div className="priority-bar-wrap">
              <div className="priority-bar" style={{ width: '85%', background: 'linear-gradient(to right,#7c3aed,#a78bfa)' }} />
            </div>
          </div>
          <div className="priority-item">
            <div className="priority-rank r3">3</div>
            <div className="priority-label">背中</div>
            <div className="priority-bar-wrap">
              <div className="priority-bar" style={{ width: '70%', background: 'linear-gradient(to right,#0891b2,#38bdf8)' }} />
            </div>
          </div>
          <div className="priority-item">
            <div className="priority-rank r4">4</div>
            <div className="priority-label">胸</div>
            <div className="priority-bar-wrap">
              <div className="priority-bar" style={{ width: '55%', background: 'linear-gradient(to right,#059669,#34d399)' }} />
            </div>
          </div>
          <div className="priority-item">
            <div className="priority-rank r5">5</div>
            <div className="priority-label">腹筋</div>
            <div className="priority-bar-wrap">
              <div className="priority-bar" style={{ width: '35%', background: 'linear-gradient(to right,#d97706,#fbbf24)' }} />
            </div>
          </div>
        </div>

        <div className="body-card">
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>目指す体型</div>
          <div className="tip-list">
            <div className="tip-item"><div className="tip-emoji">💪</div><div>肩の盛り上がり（三角筋）が際立つシルエット</div></div>
            <div className="tip-item"><div className="tip-emoji">🦵</div><div>太い脚（太もも・お尻）でどっしりした土台</div></div>
            <div className="tip-item"><div className="tip-emoji">🫁</div><div>胸板の厚みで服を着たときに映える体</div></div>
            <div className="tip-item"><div className="tip-emoji">🔺</div><div>Vシェイプで背中から見ても存在感のある体</div></div>
            <div className="tip-item"><div className="tip-emoji">👕</div><div>服を着た時に肩幅が出る、厚みのあるアスリート体型</div></div>
          </div>
        </div>

        <div className="body-card">
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>増量方針</div>
          <div className="tip-list">
            <div className="tip-item"><div className="tip-emoji">📈</div><div>急激に増やさず、<strong>+200〜300kcal</strong>ずつ段階的に増やす</div></div>
            <div className="tip-item"><div className="tip-emoji">🎯</div><div>目標体重 <strong>72〜75kg</strong>を1年かけて達成</div></div>
            <div className="tip-item"><div className="tip-emoji">🚶</div><div>有酸素は毎日<strong>7000〜9000歩</strong> + 食後10分散歩（長時間ランニング不要）</div></div>
            <div className="tip-item"><div className="tip-emoji">🍽️</div><div>下腹に脂肪がついてきたらカロリーを少し絞る</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
