'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/db';

function formatWeight(weight: number) {
  return Number.isInteger(weight) ? String(weight) : weight.toFixed(1);
}

type LatestBody = { weight: number; bodyFat: number | null; date: string };

export default function GoalPage() {
  // 現在の体重 = 記録 > サイズ で入力した体重の最新値
  const [latest, setLatest] = useState<LatestBody | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLatestBodyRecord() {
      const { data } = await db
        .from('body_records')
        .select('weight, body_fat, date')
        .not('weight', 'is', null)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!cancelled && data?.weight != null) {
        setLatest({
          weight: Number(data.weight),
          bodyFat: data.body_fat != null ? Number(data.body_fat) : null,
          date: String(data.date).slice(0, 10),
        });
      }
    }

    loadLatestBodyRecord();
    return () => { cancelled = true; };
  }, []);

  const currentWeightLabel = latest ? formatWeight(latest.weight) : '—';
  const recordedOn = latest ? latest.date.slice(5).replace('-', '/') : '';

  return (
    <div className="container">
      <div className="section">
        <div className="section-title"><span>目標</span></div>

        <div className="goal-grid">
          <div className="goal-card accent">
            <div className="label">最終目標体重</div>
            <div className="value">78<span className="unit">〜80 kg</span></div>
          </div>
          <div className="goal-card">
            <div className="label">現在の体重{recordedOn && <span style={{ fontWeight: 400 }}>（{recordedOn} 記録）</span>}</div>
            <div className="value">{currentWeightLabel}<span className="unit"> kg</span></div>
          </div>
          <div className="goal-card">
            <div className="label">摂取カロリー目標（減量期）</div>
            <div className="value">2,300<span className="unit">〜2,400 kcal</span></div>
          </div>
          <div className="goal-card">
            <div className="label">タンパク質目標</div>
            <div className="value">150<span className="unit">〜160 g/日</span></div>
          </div>
        </div>

        <div className="body-card" style={{ marginTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>進め方（2ステップ）</div>
          <div className="tip-list">
            <div className="tip-item">
              <div className="tip-emoji">①</div>
              <div><strong>今：体脂肪を落とす（2〜3か月・2026年2月末めやす）</strong><br />体重 74〜75kg まで。トレーニングの重量は落とさない。下腹がすっきりしたら次へ</div>
            </div>
            <div className="tip-item">
              <div className="tip-emoji">②</div>
              <div><strong>次：ゆっくり増量して 78〜80kg へ</strong><br />月 +0.3〜0.5kg のペース。ウエストが増え始めたらカロリーを少し戻す</div>
            </div>
          </div>
        </div>

        <div className="body-card">
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
            {latest?.bodyFat != null && (
              <div className="body-item">
                <div className="bi-label">体脂肪率</div>
                <div className="bi-val">{formatWeight(latest.bodyFat)} %</div>
              </div>
            )}
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
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>体づくりの方針</div>
          <div className="tip-list">
            <div className="tip-item"><div className="tip-emoji">⚖️</div><div>体重だけでなく<strong>ウエストと体脂肪率</strong>をセットで見る（同じ80kgでも見た目が大きく違う）</div></div>
            <div className="tip-item"><div className="tip-emoji">🚶</div><div>有酸素は<strong>1日8,000歩</strong>が目標。まずは<strong>食後10分の散歩を1日1回</strong>から</div></div>
            <div className="tip-item"><div className="tip-emoji">🍗</div><div>毎食<strong>タンパク質30g以上</strong>。食事は朝・昼・夜の定番パターンを決めて作り置き</div></div>
            <div className="tip-item"><div className="tip-emoji">📉</div><div>減量期は<strong>-300〜400kcal</strong>。体重は週0.3〜0.5kg減がめやす（速すぎると筋肉も落ちる）</div></div>
            <div className="tip-item"><div className="tip-emoji">📈</div><div>増量期は<strong>+200〜300kcal</strong>ずつ段階的に増やす</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
