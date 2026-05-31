'use client';

export default function SuppPage() {
  return (
    <div className="container">
      <div className="section">
        <div className="section-title"><span>プロテイン・サプリ</span></div>

        <div className="supp-group-title">毎日</div>

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
            <div className="supp-name">ビタミンD3 1,000IU/日</div>
            <div className="supp-desc">室内中心で日光を浴びる機会が少ないため、骨密度・免疫・筋機能の土台として毎日補う。マルチビタミンを飲む日は合計約1,400IUで無理のない範囲。4,000IU/日は超えない。</div>
            <div className="supp-timing">⏰ 朝食後 or 昼食後（脂質のある食事と一緒）</div>
          </div>
        </div>

        <div className="supp-group-title">適宜</div>

        <div className="supp-card">
          <div className="supp-icon" style={{ background: 'linear-gradient(135deg,#ede9fe,#ddd6fe)' }}>💊</div>
          <div>
            <div className="supp-name">マルチビタミン（食事が乱れた日）</div>
            <div className="supp-desc">毎日固定ではなく、外食・野菜不足・食事量が少ない日の保険として使う。ビタミンDは1粒あたり400IU、鉄も少量含むため、男性は常用より必要な日に絞る運用が無難。</div>
            <div className="supp-timing">⏰ 食事が乱れた日の夕食後（寝つきが悪ければ昼食後）</div>
          </div>
        </div>

        <div className="supp-card">
          <div className="supp-icon" style={{ background: 'linear-gradient(135deg,#fce7f3,#fbcfe8)' }}>🐟</div>
          <div>
            <div className="supp-name">オメガ3（フィッシュオイル）（任意）</div>
            <div className="supp-desc">魚を週2回以上食べない場合の補助。EPA/DHAで健康維持をサポートするが、筋肥大目的の主役ではない。鮭・サバ・イワシ・サンマなどを食べる日は不要。</div>
            <div className="supp-timing">⏰ 魚を食べない日の食後に1〜2粒</div>
          </div>
        </div>
      </div>
    </div>
  );
}
