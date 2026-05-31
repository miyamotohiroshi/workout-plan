'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

type MealKey = 'breakfast' | 'lunch' | 'dinner' | 'snack';
type MealData = Record<string, number>;
type MealsData = Record<MealKey, MealData>;
type PendingSave = { date: string; meals: MealsData };

const PROTEIN_TARGET = 140;

const FOODS = [
  { key: 'egg',           label: '卵',               unit: '個',      protein: 6   },
  { key: 'chicken_breast',label: '鶏胸肉・ささみ',    unit: '50g',     protein: 11.5 },
  { key: 'chicken_thigh', label: '鶏もも',            unit: '50g',     protein: 8.5 },
  { key: 'beef',          label: '牛肉',              unit: '50g',     protein: 10  },
  { key: 'pork',          label: '豚肉',              unit: '50g',     protein: 10  },
  { key: 'fish',          label: '魚（鮭・サバ等）',  unit: '50g',     protein: 11  },
  { key: 'tofu',          label: '豆腐',              unit: '100g',    protein: 6   },
  { key: 'tuna_can',      label: 'ツナ缶',            unit: '1缶',     protein: 18  },
  { key: 'natto',         label: '納豆',              unit: '1パック', protein: 6.6 },
  { key: 'milk',          label: '牛乳・豆乳',        unit: '200ml',   protein: 6.8 },
  { key: 'protein',       label: 'プロテイン',        unit: '1杯',     protein: 25  },
  { key: 'greek_yogurt',  label: 'ギリシャヨーグルト',unit: '100g',    protein: 10  },
] as const;

const MEALS: { key: MealKey; label: string; icon: string }[] = [
  { key: 'breakfast', label: '朝食', icon: '🌅' },
  { key: 'lunch',     label: '昼食', icon: '☀️' },
  { key: 'dinner',    label: '夕食', icon: '🌙' },
  { key: 'snack',     label: '間食', icon: '🍎' },
];

function emptyMeals(): MealsData {
  return { breakfast: {}, lunch: {}, dinner: {}, snack: {} };
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayStr() {
  return formatDate(new Date());
}

function addDays(dateStr: string, delta: number) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return formatDate(new Date(year, month - 1, day + delta));
}

function getMealProtein(data: MealData): number {
  const foodTotal = FOODS.reduce((sum, f) => sum + (data[f.key] ?? 0) * f.protein, 0);
  return Math.round((foodTotal + (data.custom ?? 0)) * 10) / 10;
}

export default function ProteinTracker() {
  const [date, setDate] = useState(todayStr());
  const [meals, setMeals] = useState<MealsData>(emptyMeals);
  const [openMeal, setOpenMeal] = useState<MealKey>('breakfast');
  const [saveError, setSaveError] = useState('');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef<PendingSave | null>(null);
  const dateRef = useRef(date);
  const mealsRef = useRef(meals);
  useEffect(() => { dateRef.current = date; }, [date]);
  useEffect(() => { mealsRef.current = meals; }, [meals]);

  const load = useCallback(async () => {
    const loadDate = date;
    const { data } = await supabase
      .from('protein_logs')
      .select('*')
      .eq('date', loadDate)
      .maybeSingle();

    if (dateRef.current !== loadDate || pendingSaveRef.current?.date === loadDate) {
      return;
    }

    const loadedMeals = data
      ? {
          breakfast: data.breakfast ?? {},
          lunch:     data.lunch     ?? {},
          dinner:    data.dinner    ?? {},
          snack:     data.snack     ?? {},
        }
      : emptyMeals();

    mealsRef.current = loadedMeals;
    setMeals(loadedMeals);
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const saveNow = async (saveMeals: MealsData, saveDate: string) => {
    const { error } = await supabase.from('protein_logs').upsert(
      { date: saveDate, ...saveMeals },
      { onConflict: 'date' }
    );
    if (error) {
      console.error('Protein log save error:', error);
      setSaveError(`保存に失敗しました: ${error.message}`);
      return false;
    }
    setSaveError('');
    return true;
  };

  const debouncedSave = (newMeals: MealsData, saveDate: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    pendingSaveRef.current = { date: saveDate, meals: newMeals };
    saveTimer.current = setTimeout(() => {
      const pending = pendingSaveRef.current;
      if (!pending) return;
      pendingSaveRef.current = null;
      saveTimer.current = null;
      saveNow(pending.meals, pending.date);
    }, 800);
  };

  const updateQty = (meal: MealKey, key: string, delta: number) => {
    const saveDate = dateRef.current;
    setMeals(prev => {
      const current = prev[meal][key] ?? 0;
      const next = Math.max(0, current + delta);
      const updated = { ...prev, [meal]: { ...prev[meal], [key]: next } };
      mealsRef.current = updated;
      debouncedSave(updated, saveDate);
      return updated;
    });
  };

  const setCustom = (meal: MealKey, val: string) => {
    const num = parseFloat(val) || 0;
    const saveDate = dateRef.current;
    setMeals(prev => {
      const updated = { ...prev, [meal]: { ...prev[meal], custom: num } };
      mealsRef.current = updated;
      debouncedSave(updated, saveDate);
      return updated;
    });
  };

  const totalProtein = MEALS.reduce((sum, m) => sum + getMealProtein(meals[m.key]), 0);
  const pct = Math.min(100, Math.round((totalProtein / PROTEIN_TARGET) * 100));

  // 日付ナビ：切り替え前に即時保存
  const changeDate = async (delta: number) => {
    const pending = pendingSaveRef.current;
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    if (pending) {
      pendingSaveRef.current = null;
      const saved = await saveNow(pending.meals, pending.date);
      if (!saved) return;
    }
    const nextDate = addDays(dateRef.current, delta);
    dateRef.current = nextDate;
    setDate(nextDate);
  };

  return (
    <div>
      {/* 日付ナビ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <button onClick={() => changeDate(-1)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '4px 8px', color: 'var(--text-sub)' }}>‹</button>
        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
          {date === todayStr() ? `今日 (${date})` : date}
        </span>
        <button onClick={() => changeDate(1)} disabled={date === todayStr()} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '4px 8px', color: date === todayStr() ? '#e2e8f0' : 'var(--text-sub)' }}>›</button>
      </div>

      {saveError && (
        <div style={{ marginBottom: '10px', padding: '10px 12px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '12px', fontWeight: 700 }}>
          {saveError}
        </div>
      )}

      {/* 合計プログレスバー */}
      <div style={{ background: 'var(--card-bg)', backdropFilter: 'blur(12px)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '10px', border: '1px solid rgba(255,255,255,.7)', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700 }}>今日のタンパク質</span>
          <span style={{ fontSize: '20px', fontWeight: 800, color: pct >= 100 ? '#059669' : 'var(--primary)' }}>
            {Math.round(totalProtein * 10) / 10}<span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-sub)' }}>g</span>
            <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-sub)' }}> / {PROTEIN_TARGET}g</span>
          </span>
        </div>
        <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '5px',
            width: `${pct}%`,
            background: pct >= 100
              ? 'linear-gradient(to right,#059669,#34d399)'
              : 'linear-gradient(to right,#2563eb,#0ea5e9)',
            transition: 'width .4s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>{pct}% 達成</span>
          <span style={{ fontSize: '11px', color: pct >= 100 ? '#059669' : 'var(--text-sub)', fontWeight: pct >= 100 ? 700 : 400 }}>
            {pct >= 100 ? '🎉 目標達成！' : `あと ${Math.round((PROTEIN_TARGET - totalProtein) * 10) / 10}g`}
          </span>
        </div>

        {/* 食事別サマリー */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px', marginTop: '12px' }}>
          {MEALS.map(m => {
            const p = getMealProtein(meals[m.key]);
            return (
              <div key={m.key} onClick={() => setOpenMeal(m.key)} style={{ textAlign: 'center', background: openMeal === m.key ? 'rgba(37,99,235,.08)' : '#f8fafc', borderRadius: '10px', padding: '8px 4px', cursor: 'pointer', border: openMeal === m.key ? '1.5px solid rgba(37,99,235,.3)' : '1.5px solid transparent', transition: 'all .2s' }}>
                <div style={{ fontSize: '16px' }}>{m.icon}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-sub)', marginTop: '2px' }}>{m.label}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: p > 0 ? 'var(--primary)' : 'var(--text-sub)', marginTop: '2px' }}>{p > 0 ? `${p}g` : '-'}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 食事入力パネル */}
      {MEALS.map(m => openMeal === m.key && (
        <div key={m.key} style={{ background: 'var(--card-bg)', backdropFilter: 'blur(12px)', borderRadius: 'var(--radius)', padding: '14px', border: '1px solid rgba(255,255,255,.7)', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 800 }}>{m.icon} {m.label}</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>
              {getMealProtein(meals[m.key])}g
            </span>
          </div>

          {/* フードリスト */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {FOODS.map(f => {
              const qty = meals[m.key][f.key] ?? 0;
              const p = Math.round(qty * f.protein * 10) / 10;
              return (
                <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: qty > 0 ? 'rgba(37,99,235,.05)' : '#f8fafc', borderRadius: '10px', border: qty > 0 ? '1px solid rgba(37,99,235,.15)' : '1px solid transparent' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: qty > 0 ? 700 : 400, color: qty > 0 ? 'var(--text)' : 'var(--text-sub)' }}>{f.label}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-sub)' }}>{f.unit} = {f.protein}g</div>
                  </div>
                  {/* ステッパー */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <button onClick={() => updateQty(m.key, f.key, -1)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sub)' }}>−</button>
                    <span style={{ minWidth: '24px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: qty > 0 ? 'var(--primary)' : 'var(--text-sub)' }}>{qty}</span>
                    <button onClick={() => updateQty(m.key, f.key, 1)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1.5px solid', borderColor: 'var(--primary)', background: 'linear-gradient(135deg,#2563eb,#0ea5e9)', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>+</button>
                  </div>
                  {/* タンパク質表示 */}
                  <div style={{ minWidth: '36px', textAlign: 'right', fontSize: '12px', fontWeight: 700, color: qty > 0 ? 'var(--primary)' : '#e2e8f0' }}>
                    {qty > 0 ? `${p}g` : ''}
                  </div>
                </div>
              );
            })}

            {/* 自由入力 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: (meals[m.key].custom ?? 0) > 0 ? 'rgba(37,99,235,.05)' : '#f8fafc', borderRadius: '10px', border: (meals[m.key].custom ?? 0) > 0 ? '1px solid rgba(37,99,235,.15)' : '1px solid transparent' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', color: 'var(--text-sub)' }}>自由入力</div>
                <div style={{ fontSize: '10px', color: 'var(--text-sub)' }}>タンパク質量を直接入力</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0"
                  value={meals[m.key].custom || ''}
                  onChange={e => setCustom(m.key, e.target.value)}
                  style={{ width: '60px', padding: '6px 8px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontWeight: 700, textAlign: 'center', color: 'var(--text)' }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>g</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
