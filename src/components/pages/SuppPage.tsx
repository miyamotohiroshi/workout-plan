'use client';

export default function SuppPage() {
  return (
    <div className="container">
      <div className="section">
        <div className="section-title"><span>プロテイン・サプリ</span></div>

        <div className="supp-card">
          <div className="supp-icon">🥛</div>
          <div>
            <div className="supp-name">MYPROTEIN ホエイプロテイン（ナチュラルバニラ）</div>
            <div className="supp-desc">体重×2g（約140g）のタンパク質目標を食事だけで達成するのは難しいため、1日1〜2杯で補完。1杯あたり約25g。溶かしやすく飲みやすい。</div>
            <div className="supp-timing">⏰ トレ後30分以内 ／ 朝食補完 ／ 就寝前（任意）</div>
          </div>
        </div>

        <div className="supp-card">
          <div className="supp-icon">⚡</div>
          <div>
            <div className="supp-name">クレアチン（モノハイドレート）5g/日</div>
            <div className="supp-desc">ATP再合成を促進し、瞬発力・最大筋力・トレーニングボリュームを向上させる。科学的根拠が最も豊富なサプリ。筋肉に水分を引き込むため体重が1〜2kg増えるが、これは筋肉内の水分（脂肪ではない）。</div>
            <div className="supp-timing">⏰ タイミングはいつでもOK（毎日継続が重要）</div>
          </div>
        </div>

        <div className="supp-card">
          <div className="supp-icon" style={{ background: 'linear-gradient(135deg,#fef9c3,#fef08a)' }}>☀️</div>
          <div>
            <div className="supp-name">ビタミンD（オプション）</div>
            <div className="supp-desc">テストステロン産生・骨密度・免疫力をサポート。室内トレが多い場合は不足しがち。2,000〜4,000IUを目安に。</div>
            <div className="supp-timing">⏰ 朝食後に服用</div>
          </div>
        </div>

        <div className="supp-card">
          <div className="supp-icon" style={{ background: 'linear-gradient(135deg,#fce7f3,#fbcfe8)' }}>🐟</div>
          <div>
            <div className="supp-name">オメガ3（フィッシュオイル）（オプション）</div>
            <div className="supp-desc">炎症を抑え、関節の健康を維持。激しいトレーニングによる炎症を軽減し、回復を促進。</div>
            <div className="supp-timing">⏰ 食事と一緒に1〜2粒</div>
          </div>
        </div>
      </div>
    </div>
  );
}
