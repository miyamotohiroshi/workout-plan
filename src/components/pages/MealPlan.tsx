'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  EXTRA_CATEGORY_LABELS,
  EXTRA_MEALS,
  ExtraCategory,
  NOODLE_RULES,
  MEAL_PATTERNS,
  MealPattern,
  MEAL_PREP_STEPS,
  MealSlot,
  SHOP_CATEGORIES,
  SLOT_LABELS,
  WeeklyCounts,
  buildShoppingList,
  defaultWeeklyCounts,
  formatAmount,
  mealImageUrl,
  mealProtein,
} from '@/lib/mealPatterns';

const COUNTS_KEY = 'meal-plan-weekly-counts';
const CHECKED_KEY = 'meal-plan-shopping-checked';

// 端末ごとの設定 (週の回数・買ったものチェック) はブラウザに保存する
function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 保存できない環境 (プライベートブラウズなど) では何もしない
  }
}

/** 月曜始まりの週の識別子 (買い物チェックを週ごとにリセットする) */
function weekId(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner'];

function MealCard({ meal, showPhoto = true }: { meal: MealPattern; showPhoto?: boolean }) {
  const image = mealImageUrl(meal);
  return (
    <article className="meal-card">
      {showPhoto && image && (
        <div className="meal-photo">
          <Image src={image} alt={meal.title} fill sizes="(max-width: 600px) 100vw, 560px" style={{ objectFit: 'cover' }} unoptimized />
          {meal.variant && <span className="meal-badge">{SLOT_LABELS[meal.slot].label}{meal.variant}</span>}
        </div>
      )}
      <div className="meal-body">
        <h4>{meal.title}</h4>
        <div className="meal-stats">
          <span className="meal-protein">タンパク質 約{mealProtein(meal)}g</span>
          <span>約{meal.kcal}kcal</span>
        </div>
        <ul className="meal-items">
          {meal.items.map(item => <li key={item}>{item}</li>)}
        </ul>
        <p className="meal-tip">💡 {meal.tip}</p>
      </div>
    </article>
  );
}

/** 定番以外の参考メニュー: 写真3列のギャラリー。タップで詳細を表示 */
function ExtraMealGallery({ meals }: { meals: MealPattern[] }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<MealPattern | null>(null);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  return (
    <div className="extra-meals">
      <button type="button" className={`extra-toggle${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)} aria-expanded={open}>
        🍽️ その他メニュー（参考・{meals.length}品）
        <span className="extra-chevron" aria-hidden="true" />
      </button>
      {open && (Object.keys(EXTRA_CATEGORY_LABELS) as ExtraCategory[]).map(category => {
        const group = meals.filter(m => (m.category ?? 'rice') === category);
        if (group.length === 0) return null;
        return (
          <section key={category} className="extra-section">
            <h5 className="extra-heading">{EXTRA_CATEGORY_LABELS[category]}<span>{group.length}品</span></h5>
            {category === 'noodle' && (
              <details className="noodle-rules">
                <summary>麺の日の5つのルール</summary>
                <ol>{NOODLE_RULES.map(rule => <li key={rule}>{rule}</li>)}</ol>
                <p>※ タンパク質は麺の分を含みません（麺の分で +6〜11g）</p>
              </details>
            )}
            <div className="extra-gallery">
              {group.map(m => (
                <button key={m.id} type="button" className="extra-item" onClick={() => setSelected(m)}>
                  <span className="extra-thumb">
                    <Image src={mealImageUrl(m)} alt={m.title} fill sizes="(max-width: 600px) 33vw, 180px" style={{ objectFit: 'cover' }} unoptimized />
                  </span>
                  <span className="extra-name">{m.title}</span>
                  <span className="extra-protein">P {mealProtein(m)}g</span>
                </button>
              ))}
            </div>
          </section>
        );
      })}
      {selected && (
        <div className="extra-modal" role="dialog" aria-modal="true" aria-label={selected.title} onClick={() => setSelected(null)}>
          <div className="extra-modal-inner" onClick={e => e.stopPropagation()}>
            <div className="extra-modal-photo">
              <Image src={mealImageUrl(selected)} alt={selected.title} fill sizes="(max-width: 600px) 100vw, 480px" style={{ objectFit: 'cover' }} unoptimized />
              <button type="button" className="extra-close" aria-label="閉じる" onClick={() => setSelected(null)}>×</button>
            </div>
            <MealCard meal={selected} showPhoto={false} />
          </div>
        </div>
      )}
    </div>
  );
}

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="meal-stepper">
      <button type="button" aria-label="減らす" onClick={() => onChange(Math.max(0, value - 1))}>−</button>
      <span>{value}</span>
      <button type="button" aria-label="増やす" onClick={() => onChange(Math.min(7, value + 1))}>+</button>
    </div>
  );
}

export default function MealPlan() {
  const [slot, setSlot] = useState<MealSlot>('breakfast');
  const [counts, setCounts] = useState<WeeklyCounts>(defaultWeeklyCounts);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const thisWeek = weekId();

  // ブラウザに保存した設定を読み込む (サーバー側の描画とずれないよう、表示後に読む)
  useEffect(() => {
    const savedCounts = readStorage<WeeklyCounts>(COUNTS_KEY, defaultWeeklyCounts());
    const savedChecked = readStorage<{ week: string; items: Record<string, boolean> }>(CHECKED_KEY, { week: '', items: {} });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage は表示後にしか読めない
    setCounts(savedCounts);
    setChecked(savedChecked.week === thisWeek ? savedChecked.items : {});
  }, [thisWeek]);

  const updateCount = (id: string, value: number) => {
    setCounts(prev => {
      const next = { ...prev, [id]: value };
      writeStorage(COUNTS_KEY, next);
      return next;
    });
  };

  const toggleChecked = (key: string) => {
    setChecked(prev => {
      const next = { ...prev, [key]: !prev[key] };
      writeStorage(CHECKED_KEY, { week: thisWeek, items: next });
      return next;
    });
  };

  const shopping = useMemo(() => buildShoppingList(counts), [counts]);
  const slotMeals = MEAL_PATTERNS.filter(m => m.slot === slot);
  const slotExtras = EXTRA_MEALS.filter(m => m.slot === slot);
  const snack = MEAL_PATTERNS.find(m => m.slot === 'snack')!;

  return (
    <div>
      {/* 1日の組み立て方 */}
      <div className="diet-card">
        <div className="diet-card-header">
          <div className="diet-icon">🧩</div>
          <div className="diet-title">1日の組み立て方</div>
        </div>
        <p className="meal-lead">
          朝・昼・夜で <strong>定番（A〜C、夜はA〜D）から1つずつ</strong>選び、<strong>プロテイン1杯</strong>を足すだけで
          タンパク質 <strong>約140〜150g</strong>（ご飯の分を入れると150g前後）になります。
        </p>
        <div className="meal-formula">
          <span>🌅 35〜41g</span>＋<span>☀️ 36〜41g</span>＋<span>🌙 39〜46g</span>＋<span>🥤 25g</span>
        </div>
      </div>

      {/* 朝・昼・夜のパターン */}
      <div className="meal-slot-tabs" role="tablist">
        {SLOTS.map(s => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={slot === s}
            className={slot === s ? 'active' : ''}
            onClick={() => setSlot(s)}
          >
            {SLOT_LABELS[s].icon} {SLOT_LABELS[s].label}ごはん
          </button>
        ))}
      </div>
      <div className="meal-grid">
        {slotMeals.map(m => <MealCard key={m.id} meal={m} />)}
      </div>
      {slotExtras.length > 0 && <ExtraMealGallery key={slot} meals={slotExtras} />}

      <div className="diet-card meal-snack">
        <div style={{ fontSize: 24 }}>🥤</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14 }}>間食：{snack.title}（タンパク質 {mealProtein(snack)}g）</div>
          <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>{snack.tip}</div>
        </div>
      </div>

      {/* 買い物リスト */}
      <div className="diet-card">
        <div className="diet-card-header">
          <div className="diet-icon">🛒</div>
          <div className="diet-title">今週の買い物リスト</div>
        </div>
        <p className="meal-lead">1週間に各パターンを何回食べるかを決めると、必要な食材の量を自動で計算します。</p>

        <div className="meal-count-grid">
          {SLOTS.map(s => {
            const meals = MEAL_PATTERNS.filter(m => m.slot === s);
            const total = meals.reduce((sum, m) => sum + (counts[m.id] ?? 0), 0);
            return (
              <div key={s} className="meal-count-col">
                <div className="meal-count-head">
                  {SLOT_LABELS[s].icon} {SLOT_LABELS[s].label}
                  <span className={total === 7 ? 'ok' : 'warn'}>{total}/7回</span>
                </div>
                {meals.map(m => (
                  <div key={m.id} className="meal-count-row">
                    <span>{m.variant}</span>
                    <Stepper value={counts[m.id] ?? 0} onChange={v => updateCount(m.id, v)} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {SHOP_CATEGORIES.map(category => {
          const lines = shopping.filter(l => l.item.category === category);
          if (lines.length === 0) return null;
          return (
            <div key={category} className="shop-group">
              <div className="shop-group-title">{category}</div>
              {lines.map(line => {
                const { amount, hint } = formatAmount(line);
                const done = !!checked[line.item.key];
                return (
                  <label key={line.item.key} className={`shop-row${done ? ' done' : ''}`}>
                    <input type="checkbox" checked={done} onChange={() => toggleChecked(line.item.key)} />
                    <span className="shop-name">{line.item.name}</span>
                    <span className="shop-amount">
                      {amount}
                      {hint && <small>（{hint}）</small>}
                    </span>
                  </label>
                );
              })}
            </div>
          );
        })}
        <p className="meal-note">※ 調味料（しょうゆ・みりん・生姜・焼肉のたれ・ポン酢）と油は家にある前提で省いています。チェックは毎週月曜にリセットされます。</p>
      </div>

      {/* 作り置き */}
      <div className="diet-card">
        <div className="diet-card-header">
          <div className="diet-icon">🧑‍🍳</div>
          <div className="diet-title">週末の作り置き（約1時間）</div>
        </div>
        <div className="tip-list">
          {MEAL_PREP_STEPS.map(step => (
            <div key={step.title} className="tip-item">
              <div className="tip-emoji">{step.icon}</div>
              <div><strong>{step.title}</strong><br />{step.body}</div>
            </div>
          ))}
          <div className="tip-item">
            <div className="tip-emoji">🏪</div>
            <div><strong>作れなかった日はコンビニで</strong><br />サラダチキン＋ゆで卵＋ギリシャヨーグルトで、朝Aや昼Aとほぼ同じタンパク質がとれる。</div>
          </div>
        </div>
      </div>

      {/* 食事管理 (目標と食事のポイント) */}
      <div className="diet-card">
        <div className="diet-card-header">
          <div className="diet-icon">📊</div>
          <div className="diet-title">1日の目標（減量期）</div>
        </div>
        <div className="macro-grid">
          <div className="macro-item">
            <div className="macro-val">2,300〜2,400</div>
            <div className="macro-label">カロリー (kcal)</div>
          </div>
          <div className="macro-item">
            <div className="macro-val">150〜160g</div>
            <div className="macro-label">タンパク質</div>
          </div>
          <div className="macro-item">
            <div className="macro-val">−300〜400</div>
            <div className="macro-label">今より減らす (kcal)</div>
          </div>
        </div>
      </div>

      <div className="diet-card">
        <div className="diet-card-header">
          <div className="diet-icon">⚡</div>
          <div className="diet-title">食事のポイント</div>
        </div>
        <div className="tip-list">
          <div className="tip-item"><div className="tip-emoji">🍗</div><div>タンパク質は<strong>毎食30〜40g</strong>。先にタンパク質のおかずを決めてから、ご飯の量を決める。</div></div>
          <div className="tip-item"><div className="tip-emoji">🍚</div><div>ご飯は<strong>1食150〜180g</strong>に固定。トレーニングの日の昼・夜は多め、休みの日は少なめに。</div></div>
          <div className="tip-item"><div className="tip-emoji">📉</div><div>減量期は<strong>週0.3〜0.5kg減</strong>がめやす。それより速いと筋肉も落ちるので、ご飯を少し戻す。</div></div>
          <div className="tip-item"><div className="tip-emoji">🕐</div><div><strong>トレーニング後30〜60分以内</strong>にプロテイン（＋おにぎり1個）。</div></div>
          <div className="tip-item"><div className="tip-emoji">🥑</div><div>良質な脂質（アボカド・ナッツ・オリーブオイル）は少量でOK。揚げ物と甘い飲み物を減らすのが一番効く。</div></div>
          <div className="tip-item"><div className="tip-emoji">💧</div><div>水分は<strong>1日2〜3L</strong>。クレアチン使用時は特に重要。</div></div>
          <div className="tip-item"><div className="tip-emoji">🚶</div><div><strong>食後10分の散歩</strong>を1日1回から。血糖値の急上昇を抑え、下腹の脂肪対策になる。</div></div>
        </div>
      </div>
    </div>
  );
}
