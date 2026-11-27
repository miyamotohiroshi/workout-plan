'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { db, getPhotoUrl } from '@/lib/db';
import { PendingRecord } from '@/lib/recordContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type SubTab = 'size' | 'weight' | 'photo' | 'checkin';

const SUB_TABS: { id: SubTab; icon: string; label: string }[] = [
  { id: 'weight', icon: '🏋️', label: '重量' },
  { id: 'checkin', icon: '📅', label: '出席' },
  { id: 'size', icon: '📏', label: 'サイズ' },
  { id: 'photo', icon: '📸', label: '写真' },
];

const EXERCISE_GROUPS = [
  {
    group: '🏋️ バーベル',
    items: [
      { label: '[肩] バーベル・オーバーヘッドプレス', value: 'バーベル・オーバーヘッドプレス' },
      { label: '[背中] デッドリフト', value: 'デッドリフト' },
      { label: '[背中] バーベル・ベントオーバーロウ', value: 'バーベル・ベントオーバーロウ' },
      { label: '[背中] バーベル・グッドモーニング', value: 'バーベル・グッドモーニング' },
      { label: '[胸] バーベル・ベンチプレス', value: 'バーベル・ベンチプレス' },
      { label: '[脚] バーベル・スクワット', value: 'バーベル・スクワット' },
      { label: '[脚] バーベル・ヒップスラスト', value: 'バーベル・ヒップスラスト' },
      { label: '[脚] ルーマニアン・デッドリフト', value: 'ルーマニアン・デッドリフト' },
      { label: '[脚] カーフレイズ（バーベル）', value: 'カーフレイズ（バーベル）' },
      { label: '[腕] バーベル・カール', value: 'バーベル・カール' },
    ],
  },
  {
    group: '💪 ダンベル',
    items: [
      { label: '[肩] ダンベル・サイドレイズ', value: 'ダンベル・サイドレイズ' },
      { label: '[肩] ダンベル・リアレイズ', value: 'ダンベル・リアレイズ' },
      { label: '[肩] ショルダー・プレス', value: 'ショルダー・プレス' },
      { label: '[肩] ダンベル・シュラッグ', value: 'ダンベル・シュラッグ' },
      { label: '[胸] ダンベル・インクラインプレス', value: 'ダンベル・インクラインプレス' },
      { label: '[胸] ダンベル・フライ', value: 'ダンベル・フライ' },
      { label: '[背中] ダンベル・ワンハンドロウ', value: 'ダンベル・ワンハンドロウ' },
      { label: '[脚] ダンベル・ランジ', value: 'ダンベル・ランジ' },
    ],
  },
  {
    group: '🤖 マシン',
    items: [
      { label: '[肩] スミスマシン・ショルダープレス', value: 'スミスマシン・ショルダープレス' },
      { label: '[肩] マシン・サイドレイズ', value: 'マシン・サイドレイズ（またはダンベル）' },
      { label: '[背中] ラットプルダウン', value: 'ラットプルダウン' },
      { label: '[脚] スミスマシン・スクワット', value: 'スミスマシン・スクワット' },
      { label: '[脚] レッグプレス', value: 'レッグプレス' },
      { label: '[脚] レッグカール', value: 'レッグカール' },
      { label: '[脚] レッグエクステンション', value: 'レッグエクステンション' },
      { label: '[脚] カーフレイズ（マシン）', value: 'カーフレイズ（マシン）' },
    ],
  },
  {
    group: '🤸 その他',
    items: [
      { label: '[腕] ディップス（自重）', value: 'ディップス（自重）' },
      { label: '[腹筋] レッグレイズ', value: 'レッグレイズ' },
      { label: '[腹筋] プランク', value: 'プランク' },
    ],
  },
];

// フラットリスト（フィルター用）
const EXERCISES = EXERCISE_GROUPS.flatMap(g => g.items.map(i => i.value));

// 種目名 → 部位 マップ（ラベルの[部位]から自動生成）
const EXERCISE_PART_MAP: Record<string, string> = {};
EXERCISE_GROUPS.forEach(g => {
  g.items.forEach(item => {
    const match = item.label.match(/^\[([^\]]+)\]/);
    EXERCISE_PART_MAP[item.value] = match ? match[1] : '';
  });
});

const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日'];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function showToast(msg: string) {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText =
    'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:10px 20px;border-radius:100px;font-size:13px;font-weight:600;z-index:9999;opacity:1;transition:opacity .5s;';
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; }, 1800);
  setTimeout(() => { document.body.removeChild(el); }, 2400);
}

// ── サイズ記録 ────────────────────────────────────────────────────────────────
interface BodyRecord {
  id: string;
  date: string;
  weight: number | null;
  chest: number | null;
  shoulder: number | null;
  arm: number | null;
  thigh: number | null;
  body_fat: number | null;
}

const METRIC_CONFIG = [
  { key: 'weight' as keyof BodyRecord, label: '体重(kg)', color: '#3b82f6' },
  { key: 'body_fat' as keyof BodyRecord, label: '体脂肪率(%)', color: '#06b6d4' },
  { key: 'chest' as keyof BodyRecord, label: '胸囲(cm)', color: '#f59e0b' },
  { key: 'shoulder' as keyof BodyRecord, label: '肩幅(cm)', color: '#10b981' },
  { key: 'arm' as keyof BodyRecord, label: '腕囲(cm)', color: '#8b5cf6' },
  { key: 'thigh' as keyof BodyRecord, label: '太もも(cm)', color: '#ef4444' },
];

function SizeTab() {
  const [records, setRecords] = useState<BodyRecord[]>([]);
  const [date, setDate] = useState(todayStr());
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [chest, setChest] = useState('');
  const [shoulder, setShoulder] = useState('');
  const [arm, setArm] = useState('');
  const [thigh, setThigh] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeMetrics, setActiveMetrics] = useState<Set<string>>(new Set(['weight']));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editBodyFat, setEditBodyFat] = useState('');
  const [editChest, setEditChest] = useState('');
  const [editShoulder, setEditShoulder] = useState('');
  const [editArm, setEditArm] = useState('');
  const [editThigh, setEditThigh] = useState('');

  const parseOptionalNumber = (value: string) => value ? parseFloat(value) : null;

  const load = useCallback(async () => {
    const { data } = await db
      .from('body_records')
      .select('*')
      .order('date', { ascending: true });
    if (data) setRecords(data as BodyRecord[]);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialRecords() {
      const { data } = await db
        .from('body_records')
        .select('*')
        .order('date', { ascending: true });

      if (!cancelled && data) setRecords(data as BodyRecord[]);
    }

    loadInitialRecords();
    return () => { cancelled = true; };
  }, []);

  const save = async () => {
    if (!date) return;
    setSaving(true);
    const { error } = await db.from('body_records').insert({
      date,
      weight: parseOptionalNumber(weight),
      body_fat: parseOptionalNumber(bodyFat),
      chest: parseOptionalNumber(chest),
      shoulder: parseOptionalNumber(shoulder),
      arm: parseOptionalNumber(arm),
      thigh: parseOptionalNumber(thigh),
    });
    setSaving(false);
    if (error) { alert('エラー: ' + error.message); return; }
    showToast('保存しました！');
    setWeight(''); setBodyFat(''); setChest(''); setShoulder(''); setArm(''); setThigh('');
    load();
  };

  const startEdit = (r: BodyRecord) => {
    setEditingId(r.id);
    setEditDate(r.date);
    setEditWeight(r.weight != null ? String(r.weight) : '');
    setEditBodyFat(r.body_fat != null ? String(r.body_fat) : '');
    setEditChest(r.chest != null ? String(r.chest) : '');
    setEditShoulder(r.shoulder != null ? String(r.shoulder) : '');
    setEditArm(r.arm != null ? String(r.arm) : '');
    setEditThigh(r.thigh != null ? String(r.thigh) : '');
  };

  const saveEdit = async () => {
    if (!editingId || !editDate) return;
    const { error } = await db.from('body_records').update({
      date: editDate,
      weight: parseOptionalNumber(editWeight),
      body_fat: parseOptionalNumber(editBodyFat),
      chest: parseOptionalNumber(editChest),
      shoulder: parseOptionalNumber(editShoulder),
      arm: parseOptionalNumber(editArm),
      thigh: parseOptionalNumber(editThigh),
    }).eq('id', editingId);
    if (error) { alert('エラー: ' + error.message); return; }
    showToast('更新しました！');
    setEditingId(null);
    load();
  };

  const del = async (id: string) => {
    if (!confirm('削除しますか？')) return;
    await db.from('body_records').delete().eq('id', id);
    setEditingId(null);
    load();
  };

  const toggleMetric = (key: string) => {
    setActiveMetrics(prev => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });
  };

  const labels = records.map(r => r.date.slice(5));
  const datasets = METRIC_CONFIG.filter(m => activeMetrics.has(m.key as string)).map(m => ({
    label: m.label,
    data: records.map(r => r[m.key] as number | null),
    borderColor: m.color,
    backgroundColor: m.color + '33',
    tension: 0.3,
    spanGaps: true,
    pointRadius: 4,
  }));

  const renderMetrics = (r: BodyRecord) => (
    <>
      {r.weight != null && `体重 ${r.weight}kg`}
      {r.body_fat != null && ` 体脂肪率 ${r.body_fat}%`}
      {r.chest != null && ` 胸囲 ${r.chest}cm`}
      {r.shoulder != null && ` 肩幅 ${r.shoulder}cm`}
      {r.arm != null && ` 腕囲 ${r.arm}cm`}
      {r.thigh != null && ` 太もも ${r.thigh}cm`}
    </>
  );

  const renderItem = (r: BodyRecord) => {
    const isEditing = editingId === r.id;
    return (
      <div key={r.id} style={{ marginBottom: '8px' }}>
        <div className="record-item">
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>{r.date}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '4px' }}>
              {renderMetrics(r)}
            </div>
          </div>
          <button
            className="delete-btn"
            onClick={() => isEditing ? setEditingId(null) : startEdit(r)}
            style={{ color: isEditing ? '#94a3b8' : 'var(--primary)', fontSize: '12px', fontWeight: 600 }}
          >
            {isEditing ? '閉じる' : '編集'}
          </button>
        </div>

        {isEditing && (
          <div style={{
            background: '#f8fafc', borderRadius: '12px',
            padding: '12px', marginTop: '4px',
            border: '1px solid rgba(59,130,246,0.2)',
          }}>
            <div className="input-row">
              <div className="input-group">
                <label>日付</label>
                <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
              </div>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>体重(kg)</label>
                <input type="number" step="0.1" value={editWeight} onChange={e => setEditWeight(e.target.value)} />
              </div>
              <div className="input-group">
                <label>体脂肪率(%)</label>
                <input type="number" step="0.1" value={editBodyFat} onChange={e => setEditBodyFat(e.target.value)} />
              </div>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>胸囲(cm)</label>
                <input type="number" step="0.1" value={editChest} onChange={e => setEditChest(e.target.value)} />
              </div>
              <div className="input-group">
                <label>肩幅(cm)</label>
                <input type="number" step="0.1" value={editShoulder} onChange={e => setEditShoulder(e.target.value)} />
              </div>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>腕囲(cm)</label>
                <input type="number" step="0.1" value={editArm} onChange={e => setEditArm(e.target.value)} />
              </div>
              <div className="input-group">
                <label>太もも(cm)</label>
                <input type="number" step="0.1" value={editThigh} onChange={e => setEditThigh(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <button onClick={() => del(r.id)} style={{ flex: 1, background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                削除
              </button>
              <button onClick={saveEdit} style={{ flex: 2, background: 'linear-gradient(135deg,#2563eb,#0ea5e9)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                保存
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="record-panel active">
      <div className="rec-card">
        <div className="rec-card-title">計測データ入力</div>
        <div className="input-row">
          <div className="input-group">
            <label>日付</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        <div className="input-row">
          <div className="input-group">
            <label>体重(kg)</label>
            <input type="number" step="0.1" placeholder="75.0" value={weight} onChange={e => setWeight(e.target.value)} />
          </div>
          <div className="input-group">
            <label>体脂肪率(%)</label>
            <input type="number" step="0.1" placeholder="20.0" value={bodyFat} onChange={e => setBodyFat(e.target.value)} />
          </div>
        </div>
        <div className="input-row">
          <div className="input-group">
            <label>胸囲(cm)</label>
            <input type="number" step="0.1" placeholder="100" value={chest} onChange={e => setChest(e.target.value)} />
          </div>
          <div className="input-group">
            <label>肩幅(cm)</label>
            <input type="number" step="0.1" placeholder="48" value={shoulder} onChange={e => setShoulder(e.target.value)} />
          </div>
        </div>
        <div className="input-row">
          <div className="input-group">
            <label>腕囲(cm)</label>
            <input type="number" step="0.1" placeholder="35" value={arm} onChange={e => setArm(e.target.value)} />
          </div>
          <div className="input-group">
            <label>太もも(cm)</label>
            <input type="number" step="0.1" placeholder="58" value={thigh} onChange={e => setThigh(e.target.value)} />
          </div>
        </div>
        <button className="save-btn" onClick={save} disabled={saving}>
          {saving ? '保存中...' : '💾 保存'}
        </button>
      </div>

      {records.length > 0 && (
        <div className="rec-card">
          <div className="rec-card-title">グラフ</div>
          <div style={{ marginBottom: '8px' }}>
            {METRIC_CONFIG.map(m => (
              <button
                key={m.key as string}
                className={`chart-toggle-btn${activeMetrics.has(m.key as string) ? ' active' : ''}`}
                style={activeMetrics.has(m.key as string) ? { borderColor: m.color, color: m.color, background: m.color + '15' } : {}}
                onClick={() => toggleMetric(m.key as string)}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="chart-wrap">
            <Line
              data={{ labels, datasets }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: false } },
              }}
            />
          </div>
        </div>
      )}

      <div className="rec-card">
        <div className="rec-card-title">記録一覧</div>
        <div className="record-list">
          {records.slice().reverse().map(r => renderItem(r))}
          {records.length === 0 && <div style={{ color: 'var(--text-sub)', fontSize: '13px', textAlign: 'center', padding: '16px' }}>記録がありません</div>}
        </div>
      </div>
    </div>
  );
}

// ── 重量記録 ────────────────────────────────────────────────────────────────
interface ExerciseRecord {
  id: string;
  date: string;
  exercise_name: string;
  weight: number;
  reps: number;
  sets: number;
}

function WeightTab({ pendingRecord, onClearPending }: { pendingRecord?: PendingRecord | null; onClearPending?: () => void }) {
  const [records, setRecords] = useState<ExerciseRecord[]>([]);
  const [date, setDate] = useState(todayStr());
  const [exerciseName, setExerciseName] = useState(EXERCISES[0]);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterEx, setFilterEx] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editExercise, setEditExercise] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editReps, setEditReps] = useState('');
  const [editSets, setEditSets] = useState('');

  const load = useCallback(async () => {
    const { data } = await db
      .from('exercise_records')
      .select('*')
      .order('date', { ascending: false });
    if (data) setRecords(data as ExerciseRecord[]);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialRecords() {
      const { data } = await db
        .from('exercise_records')
        .select('*')
        .order('date', { ascending: false });

      if (!cancelled && data) setRecords(data as ExerciseRecord[]);
    }

    loadInitialRecords();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!pendingRecord) return;
    setExerciseName(pendingRecord.exerciseName);
    if (pendingRecord.weight > 0) setWeight(String(pendingRecord.weight));
    if (pendingRecord.reps > 0) setReps(String(pendingRecord.reps));
    if (pendingRecord.sets > 0) setSets(String(pendingRecord.sets));
    setDate(todayStr());
    onClearPending?.();
  }, [pendingRecord]);

  const save = async () => {
    if (!date || !weight || !reps || !sets) { alert('全項目を入力してください'); return; }
    setSaving(true);
    const { error } = await db.from('exercise_records').insert({
      date, exercise_name: exerciseName,
      weight: parseFloat(weight), reps: parseInt(reps), sets: parseInt(sets),
    });
    setSaving(false);
    if (error) { alert('エラー: ' + error.message); return; }
    showToast('保存しました！');
    setWeight(''); setReps(''); setSets('');
    load();
  };

  const startEdit = (r: ExerciseRecord) => {
    setEditingId(r.id);
    setEditDate(r.date);
    setEditExercise(r.exercise_name);
    setEditWeight(String(r.weight));
    setEditReps(String(r.reps));
    setEditSets(String(r.sets));
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await db.from('exercise_records').update({
      date: editDate, exercise_name: editExercise,
      weight: parseFloat(editWeight), reps: parseInt(editReps), sets: parseInt(editSets),
    }).eq('id', editingId);
    if (error) { alert('エラー: ' + error.message); return; }
    showToast('更新しました！');
    setEditingId(null);
    load();
  };

  const del = async (id: string) => {
    if (!confirm('削除しますか？')) return;
    await db.from('exercise_records').delete().eq('id', id);
    setEditingId(null);
    load();
  };

  // PB per exercise
  const pbMap: Record<string, number> = {};
  records.forEach(r => {
    if (!(r.exercise_name in pbMap) || r.weight > pbMap[r.exercise_name])
      pbMap[r.exercise_name] = r.weight;
  });

  const filtered = filterEx ? records.filter(r => r.exercise_name === filterEx) : records;

  // 日付ごとにグループ化（すべて表示時のみ）
  const renderList = () => {
    if (filtered.length === 0) {
      return <div style={{ color: 'var(--text-sub)', fontSize: '13px', textAlign: 'center', padding: '16px' }}>記録がありません</div>;
    }

    if (filterEx) {
      // 絞り込み中：グループなしでそのまま表示
      return filtered.map(r => renderItem(r));
    }

    // すべて表示：日付ごとにグループ化
    const groups: { date: string; items: ExerciseRecord[] }[] = [];
    filtered.forEach(r => {
      const last = groups[groups.length - 1];
      if (last && last.date === r.date) {
        last.items.push(r);
      } else {
        groups.push({ date: r.date, items: [r] });
      }
    });

    return groups.map(g => (
      <div key={g.date}>
        <div style={{
          fontSize: '11px', fontWeight: 700, color: 'var(--primary)',
          padding: '10px 4px 6px',
          borderBottom: '1px solid rgba(59,130,246,0.15)',
          marginBottom: '6px', letterSpacing: '0.05em',
        }}>
          📅 {g.date}
        </div>
        {g.items.map(r => renderItem(r))}
      </div>
    ));
  };

  const renderItem = (r: ExerciseRecord) => {
    const isPB = pbMap[r.exercise_name] === r.weight;
    const isEditing = editingId === r.id;
    return (
      <div key={r.id} style={{ marginBottom: '8px' }}>
        <div className={`record-item${isPB ? ' pb' : ''}`}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px' }}>
              <span style={{
                display: 'inline-block', minWidth: '2.5em',
                fontSize: '11px', fontWeight: 700,
                color: 'var(--text-sub)',
              }}>
                {EXERCISE_PART_MAP[r.exercise_name] ?? ''}
              </span>
              <span style={{ color: 'var(--text-sub)', fontWeight: 400 }}>｜</span>
              <span>
                {r.exercise_name}
                {isPB && <span className="pb-badge" style={{ marginLeft: '4px' }}>🏆 PB</span>}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '2px', paddingLeft: 'calc(2.5em + 18px)' }}>
              {filterEx && <span>{r.date} ／ </span>}
              {r.weight}kg × {r.reps}rep × {r.sets}set
            </div>
          </div>
          <button
            className="delete-btn"
            onClick={() => isEditing ? setEditingId(null) : startEdit(r)}
            style={{ color: isEditing ? '#94a3b8' : 'var(--primary)', fontSize: '12px', fontWeight: 600 }}
          >
            {isEditing ? '閉じる' : '編集'}
          </button>
        </div>

        {/* インライン編集フォーム */}
        {isEditing && (
          <div style={{
            background: '#f8fafc', borderRadius: '12px',
            padding: '12px', marginTop: '4px',
            border: '1px solid rgba(59,130,246,0.2)',
          }}>
            <div className="input-row">
              <div className="input-group">
                <label>日付</label>
                <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
              </div>
            </div>
            <div className="input-group" style={{ marginBottom: '8px' }}>
              <label>種目</label>
              <select value={editExercise} onChange={e => setEditExercise(e.target.value)}>
                {EXERCISE_GROUPS.map(g => (
                  <optgroup key={g.group} label={g.group}>
                    {g.items.map(item => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>重量(kg)</label>
                <input type="number" step="0.5" value={editWeight} onChange={e => setEditWeight(e.target.value)} />
              </div>
              <div className="input-group">
                <label>rep</label>
                <input type="number" value={editReps} onChange={e => setEditReps(e.target.value)} />
              </div>
              <div className="input-group">
                <label>set</label>
                <input type="number" value={editSets} onChange={e => setEditSets(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <button onClick={() => del(r.id)} style={{ flex: 1, background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                削除
              </button>
              <button onClick={saveEdit} style={{ flex: 2, background: 'linear-gradient(135deg,#2563eb,#0ea5e9)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                保存
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="record-panel active">
      <div className="rec-card">
        <div className="rec-card-title">重量記録入力</div>
        <div className="input-row">
          <div className="input-group">
            <label>日付</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        <div className="input-group" style={{ marginBottom: '8px' }}>
          <label>種目</label>
          <select value={exerciseName} onChange={e => setExerciseName(e.target.value)}>
            {EXERCISE_GROUPS.map(g => (
              <optgroup key={g.group} label={g.group}>
                {g.items.map(item => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="input-row">
          <div className="input-group">
            <label>重量(kg)</label>
            <input type="number" step="0.5" placeholder="60" value={weight} onChange={e => setWeight(e.target.value)} />
          </div>
          <div className="input-group">
            <label>rep数</label>
            <input type="number" placeholder="8" value={reps} onChange={e => setReps(e.target.value)} />
          </div>
          <div className="input-group">
            <label>set数</label>
            <input type="number" placeholder="4" value={sets} onChange={e => setSets(e.target.value)} />
          </div>
        </div>
        <button className="save-btn" onClick={save} disabled={saving}>
          {saving ? '保存中...' : '💾 保存'}
        </button>
      </div>

      <div className="rec-card">
        <div className="rec-card-title">記録一覧</div>
        <div className="input-group" style={{ marginBottom: '12px' }}>
          <label>種目で絞り込み</label>
          <select value={filterEx} onChange={e => { setFilterEx(e.target.value); setEditingId(null); }}>
            <option value="">すべて</option>
            {EXERCISES.map(ex => <option key={ex} value={ex}>{ex}</option>)}
          </select>
        </div>
        <div className="record-list">{renderList()}</div>
      </div>
    </div>
  );
}

// ── 写真記録 ────────────────────────────────────────────────────────────────
const ANGLES = ['正面', '横（左）', '横（右）', '背中'] as const;

const ANGLE_PATH: Record<string, string> = {
  '正面': 'front',
  '横（左）': 'left',
  '横（右）': 'right',
  '背中': 'back',
};
type Angle = typeof ANGLES[number];

interface PhotoRecord {
  id: string;
  date: string;
  memo: string;
  storage_path: string;
  angle: Angle;
}

function PhotoTab() {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [date, setDate] = useState(todayStr());
  const [memo, setMemo] = useState('');
  const [angle, setAngle] = useState<Angle>('正面');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editMemo, setEditMemo] = useState('');
  const [lightbox, setLightbox] = useState<PhotoRecord | null>(null);

  const load = useCallback(async () => {
    const { data } = await db
      .from('photos')
      .select('*')
      .order('date', { ascending: true });
    if (data) setPhotos(data as PhotoRecord[]);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialPhotos() {
      const { data } = await db
        .from('photos')
        .select('*')
        .order('date', { ascending: true });

      if (!cancelled && data) setPhotos(data as PhotoRecord[]);
    }

    loadInitialPhotos();
    return () => { cancelled = true; };
  }, []);

  const resizeImage = (file: File, maxWidth = 800): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('canvas error')); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          URL.revokeObjectURL(url);
          if (blob) resolve(blob);
          else reject(new Error('blob error'));
        }, 'image/jpeg', 0.85);
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const handleFile = async (file: File) => {
    if (!date) { alert('日付を入力してください'); return; }
    setUploading(true);
    try {
      const blob = await resizeImage(file);
      const path = `${date}-${ANGLE_PATH[angle] ?? 'other'}-${Date.now()}.jpg`;
      const { error: upErr } = await db.storage.from('photos').upload(path, blob);
      if (upErr) { alert('アップロードエラー: ' + upErr.message); return; }
      const { error: dbErr } = await db.from('photos').insert({ date, memo, storage_path: path, angle });
      if (dbErr) { alert('DB保存エラー: ' + dbErr.message); return; }
      showToast('保存しました！');
      setMemo('');
      load();
    } finally {
      setUploading(false);
    }
  };

  const del = async (photo: PhotoRecord) => {
    if (!confirm('削除しますか？')) return;
    await db.storage.from('photos').remove([photo.storage_path]);
    await db.from('photos').delete().eq('id', photo.id);
    load();
  };

  const startEdit = (photo: PhotoRecord) => {
    setEditingId(photo.id);
    setEditDate(photo.date);
    setEditMemo(photo.memo ?? '');
  };

  const saveEdit = async (photo: PhotoRecord) => {
    const { error } = await db
      .from('photos')
      .update({ date: editDate, memo: editMemo })
      .eq('id', photo.id);
    if (error) { alert('更新エラー: ' + error.message); return; }
    showToast('更新しました！');
    setEditingId(null);
    load();
  };

  // 角度ごとにグループ化してBefore/After
  const angleGroups = ANGLES.map(a => ({
    angle: a,
    photos: photos.filter(p => (p.angle ?? '正面') === a),
  })).filter(g => g.photos.length >= 2);

  return (
    <div className="record-panel active">
      <div className="rec-card">
        <div className="rec-card-title">写真アップロード</div>
        <div className="input-row">
          <div className="input-group">
            <label>日付</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="input-group">
            <label>角度</label>
            <select value={angle} onChange={e => setAngle(e.target.value as Angle)}>
              {ANGLES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <div className="input-row">
          <div className="input-group">
            <label>メモ（任意）</label>
            <input type="text" placeholder="初回・3ヶ月後 など" value={memo} onChange={e => setMemo(e.target.value)} />
          </div>
        </div>
        <div className="photo-upload-area" onClick={() => fileRef.current?.click()}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>📷</div>
          <div style={{ fontSize: '13px', color: 'var(--text-sub)' }}>
            {uploading ? 'アップロード中...' : 'タップして写真を選択'}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
          />
        </div>
      </div>

      {angleGroups.length > 0 && (
        <div className="rec-card">
          <div className="rec-card-title">Before / After 比較</div>
          {angleGroups.map(g => {
            const before = g.photos[0];
            const after = g.photos[g.photos.length - 1];
            return (
              <div key={g.angle} style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>
                  📐 {g.angle}
                </div>
                <div className="comparison-wrap">
                  <div className="comparison-side">
                    <img src={getPhotoUrl(before.storage_path)} alt="before" />
                    <div className="comparison-tag">BEFORE</div>
                    <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: '10px', borderRadius: '6px', padding: '2px 6px' }}>{before.date}</div>
                  </div>
                  <div className="comparison-side">
                    <img src={getPhotoUrl(after.storage_path)} alt="after" />
                    <div className="comparison-tag" style={{ background: 'rgba(37,99,235,.8)' }}>AFTER</div>
                    <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: '10px', borderRadius: '6px', padding: '2px 6px' }}>{after.date}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ライトボックス */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
        >
          <img
            src={getPhotoUrl(lightbox.storage_path)}
            alt={lightbox.date}
            style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '12px' }}
          />
          <div style={{ color: '#fff', marginTop: '12px', fontSize: '13px', textAlign: 'center' }}>
            <div style={{ fontWeight: 700 }}>{lightbox.angle ?? '正面'}</div>
            <div style={{ opacity: 0.7 }}>{lightbox.date}{lightbox.memo ? `　${lightbox.memo}` : ''}</div>
            <div style={{ marginTop: '8px', opacity: 0.5, fontSize: '11px' }}>タップで閉じる</div>
          </div>
        </div>
      )}

      {photos.length > 0 && (
        <div className="rec-card">
          <div className="rec-card-title">フォトギャラリー</div>
          <div className="photo-grid">
            {photos.slice().reverse().map(p => (
              <div key={p.id} className="photo-item">
                {/* 画像タップ → 拡大 */}
                <img
                  src={getPhotoUrl(p.storage_path)}
                  alt={p.date}
                  onClick={() => setLightbox(p)}
                  style={{ cursor: 'pointer' }}
                />
                <div className="photo-item-label">
                  <div style={{ fontWeight: 700 }}>{p.angle ?? '正面'}</div>
                  <div>{p.date}</div>
                  {p.memo && <div style={{ opacity: .8 }}>{p.memo}</div>}
                </div>
                {/* 操作ボタン */}
                <div style={{ position: 'absolute', top: '6px', right: '6px', display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => startEdit(p)}
                    style={{ background: 'rgba(37,99,235,.8)', color: '#fff', border: 'none', borderRadius: '8px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}
                  >編集</button>
                  <button
                    onClick={() => del(p)}
                    style={{ background: 'rgba(0,0,0,.55)', color: '#fff', border: 'none', borderRadius: '8px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}
                  >削除</button>
                </div>
                {/* インライン編集フォーム */}
                {editingId === p.id && (
                  <div
                    onClick={e => e.stopPropagation()}
                    style={{
                      position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.97)',
                      borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px',
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>📝 編集</div>
                    <div className="input-group">
                      <label>日付</label>
                      <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label>メモ</label>
                      <input type="text" placeholder="メモ（任意）" value={editMemo} onChange={e => setEditMemo(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => saveEdit(p)}
                        style={{ flex: 1, background: 'linear-gradient(135deg,#2563eb,#0ea5e9)', color: '#fff', border: 'none', borderRadius: '10px', padding: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      >保存</button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{ flex: 1, background: '#f1f5f9', color: 'var(--text)', border: 'none', borderRadius: '10px', padding: '8px', fontSize: '12px', cursor: 'pointer' }}
                      >キャンセル</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {photos.length === 0 && (
        <div className="rec-card" style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '32px 20px' }}>
          写真がありません
        </div>
      )}
    </div>
  );
}

// ── 出席（重量タブの記録日から自動集計） ──────────────────────────────────────
interface LegacyCheckin {
  week: string;
  days: string[] | null;
}

// 'YYYY-MM-DD' をローカル日付として扱う (new Date(str) は UTC 解釈になり日本時間でずれるため)
function parseLocalDate(s: string) {
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatLocalDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// その日を含む週の月曜日
function mondayOf(s: string) {
  const d = parseLocalDate(s);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return formatLocalDate(d);
}

function CheckinTab() {
  const [trainedDates, setTrainedDates] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [exRes, ckRes] = await Promise.all([
        db.from('exercise_records').select('date'),
        db.from('checkins').select('week, days'),
      ]);
      if (cancelled) return;

      const dates = new Set<string>();
      ((exRes.data ?? []) as { date: string }[]).forEach(r => {
        if (r.date) dates.add(r.date.slice(0, 10));
      });
      // 以前に手入力した出席データもカレンダーに残す
      ((ckRes.data ?? []) as LegacyCheckin[]).forEach(r => {
        if (!r.week || !r.days) return;
        const monday = parseLocalDate(mondayOf(r.week));
        DAY_LABELS.forEach((label, idx) => {
          if (!r.days!.includes(label)) return;
          const d = new Date(monday);
          d.setDate(d.getDate() + idx);
          dates.add(formatLocalDate(d));
        });
      });

      setTrainedDates(dates);
      setLoaded(true);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // 週ごとにまとめる (新しい週が上)
  const weekMap = new Map<string, string[]>();
  trainedDates.forEach(date => {
    const w = mondayOf(date);
    weekMap.set(w, [...(weekMap.get(w) ?? []), date]);
  });
  const weeks = Array.from(weekMap.entries())
    .map(([week, dates]) => ({ week, dates: dates.sort() }))
    .sort((a, b) => b.week.localeCompare(a.week));

  // Stats
  const totalDays = trainedDates.size;
  const totalWeeks = weeks.length;
  const avgPerWeek = totalWeeks > 0 ? (totalDays / totalWeeks).toFixed(1) : '0';

  // Calendar for selected month
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build calendar cells: Mon-first
  const calStart = (firstDay + 6) % 7; // shift Sun=0 → Mon=0
  const cells: (number | null)[] = Array(calStart).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const changeCalendarMonth = (delta: number) => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const weekLabel = (week: string) => {
    const start = parseLocalDate(week);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.getMonth() + 1}/${start.getDate()}〜${end.getMonth() + 1}/${end.getDate()}`;
  };
  const weekdayLabel = (date: string) => DAY_LABELS[(parseLocalDate(date).getDay() + 6) % 7];

  return (
    <div className="record-panel active">
      <div className="rec-card">
        <div className="rec-card-title">統計</div>
        <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginBottom: '10px' }}>
          「重量」タブで記録した日が自動で出席になります
        </div>
        <div className="stat-row">
          <div className="stat-box">
            <div className="stat-val">{totalDays}</div>
            <div className="stat-label">総トレーニング日数</div>
          </div>
          <div className="stat-box">
            <div className="stat-val">{totalWeeks}</div>
            <div className="stat-label">記録週数</div>
          </div>
          <div className="stat-box">
            <div className="stat-val">{avgPerWeek}</div>
            <div className="stat-label">週平均日数</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <button
            onClick={() => changeCalendarMonth(-1)}
            style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', padding: '4px 8px', color: 'var(--text-sub)' }}
          >
            ‹
          </button>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>
            {year}年{String(month + 1).padStart(2, '0')}月
          </div>
          <button
            onClick={() => changeCalendarMonth(1)}
            style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', padding: '4px 8px', color: 'var(--text-sub)' }}
          >
            ›
          </button>
        </div>
        <div className="calendar-grid">
          {DAY_LABELS.map(d => (
            <div key={d} className="cal-header">{d}</div>
          ))}
          {cells.map((day, i) => {
            if (!day) return <div key={`e${i}`} />;
            const dateStr = `${monthStr}-${String(day).padStart(2, '0')}`;
            const trained = trainedDates.has(dateStr);
            return (
              <div key={dateStr} className={`cal-day${trained ? ' trained' : ''}`}>
                {day}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rec-card">
        <div className="rec-card-title">週間記録</div>
        <div className="record-list">
          {weeks.map(w => (
            <div key={w.week} className="record-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginBottom: '8px' }}>
              <span style={{ fontWeight: 700 }}>{weekLabel(w.week)}</span>
              <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
                {w.dates.map(weekdayLabel).join(' ')} ／ {w.dates.length}日
              </div>
            </div>
          ))}
          {loaded && weeks.length === 0 && (
            <div style={{ color: 'var(--text-sub)', fontSize: '13px', textAlign: 'center', padding: '16px' }}>記録がありません</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main RecordPage ──────────────────────────────────────────────────────────
export default function RecordPage({ pendingRecord, onClearPending }: { pendingRecord?: PendingRecord | null; onClearPending?: () => void }) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('size');

  useEffect(() => {
    if (pendingRecord) {
      setActiveSubTab('weight');
    }
  }, [pendingRecord]);

  return (
    <div className="container">
      <div className="section">
        <div className="section-title"><span>記録</span></div>

        <div className="record-subtabs">
          {SUB_TABS.map(tab => (
            <div
              key={tab.id}
              className={`record-subtab${activeSubTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveSubTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </div>
          ))}
        </div>

        {activeSubTab === 'size' && <SizeTab />}
        {activeSubTab === 'weight' && <WeightTab pendingRecord={pendingRecord} onClearPending={onClearPending} />}
        {activeSubTab === 'photo' && <PhotoTab />}
        {activeSubTab === 'checkin' && <CheckinTab />}
      </div>
    </div>
  );
}
