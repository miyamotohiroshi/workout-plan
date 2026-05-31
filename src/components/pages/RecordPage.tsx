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
import { supabase, getPhotoUrl } from '@/lib/supabase';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type SubTab = 'size' | 'weight' | 'photo' | 'checkin';

const SUB_TABS: { id: SubTab; icon: string; label: string }[] = [
  { id: 'size', icon: '📏', label: 'サイズ' },
  { id: 'weight', icon: '🏋️', label: '重量' },
  { id: 'photo', icon: '📸', label: '写真' },
  { id: 'checkin', icon: '📅', label: '出席' },
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
      { label: 'ディップス（自重）', value: 'ディップス（自重）' },
    ],
  },
];

// フラットリスト（フィルター用）
const EXERCISES = EXERCISE_GROUPS.flatMap(g => g.items.map(i => i.value));

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

// ── Check Supabase env ───────────────────────────────────────────────────────
function EnvWarning() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <div className="rec-card" style={{ color: '#ef4444', textAlign: 'center' }}>
        Supabase環境変数が設定されていません。<br />
        <code>.env.local</code> に<br />
        <code>NEXT_PUBLIC_SUPABASE_URL</code> と<br />
        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> を設定してください。
      </div>
    );
  }
  return null;
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
}

const METRIC_CONFIG = [
  { key: 'weight' as keyof BodyRecord, label: '体重(kg)', color: '#3b82f6' },
  { key: 'chest' as keyof BodyRecord, label: '胸囲(cm)', color: '#f59e0b' },
  { key: 'shoulder' as keyof BodyRecord, label: '肩幅(cm)', color: '#10b981' },
  { key: 'arm' as keyof BodyRecord, label: '腕囲(cm)', color: '#8b5cf6' },
  { key: 'thigh' as keyof BodyRecord, label: '太もも(cm)', color: '#ef4444' },
];

function SizeTab() {
  const [records, setRecords] = useState<BodyRecord[]>([]);
  const [date, setDate] = useState(todayStr());
  const [weight, setWeight] = useState('');
  const [chest, setChest] = useState('');
  const [shoulder, setShoulder] = useState('');
  const [arm, setArm] = useState('');
  const [thigh, setThigh] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeMetrics, setActiveMetrics] = useState<Set<string>>(new Set(['weight']));

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('body_records')
      .select('*')
      .order('date', { ascending: true });
    if (data) setRecords(data as BodyRecord[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!date) return;
    setSaving(true);
    const { error } = await supabase.from('body_records').insert({
      date,
      weight: weight ? parseFloat(weight) : null,
      chest: chest ? parseFloat(chest) : null,
      shoulder: shoulder ? parseFloat(shoulder) : null,
      arm: arm ? parseFloat(arm) : null,
      thigh: thigh ? parseFloat(thigh) : null,
    });
    setSaving(false);
    if (error) { alert('エラー: ' + error.message); return; }
    showToast('保存しました！');
    setWeight(''); setChest(''); setShoulder(''); setArm(''); setThigh('');
    load();
  };

  const del = async (id: string) => {
    if (!confirm('削除しますか？')) return;
    await supabase.from('body_records').delete().eq('id', id);
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

  return (
    <div className="record-panel active">
      <div className="rec-card">
        <div className="rec-card-title">計測データ入力</div>
        <div className="input-row">
          <div className="input-group" style={{ minWidth: '130px' }}>
            <label>日付</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="input-group">
            <label>体重(kg)</label>
            <input type="number" step="0.1" placeholder="75.0" value={weight} onChange={e => setWeight(e.target.value)} />
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
          {records.slice().reverse().map(r => (
            <div key={r.id} className="record-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontWeight: 700 }}>{r.date}</span>
                <button className="delete-btn" onClick={() => del(r.id)}>削除</button>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
                {r.weight != null && `体重 ${r.weight}kg`}
                {r.chest != null && ` 胸囲 ${r.chest}cm`}
                {r.shoulder != null && ` 肩幅 ${r.shoulder}cm`}
                {r.arm != null && ` 腕囲 ${r.arm}cm`}
                {r.thigh != null && ` 太もも ${r.thigh}cm`}
              </div>
            </div>
          ))}
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

function WeightTab() {
  const [records, setRecords] = useState<ExerciseRecord[]>([]);
  const [date, setDate] = useState(todayStr());
  const [exerciseName, setExerciseName] = useState(EXERCISES[0]);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterEx, setFilterEx] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('exercise_records')
      .select('*')
      .order('date', { ascending: false });
    if (data) setRecords(data as ExerciseRecord[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!date || !weight || !reps || !sets) { alert('全項目を入力してください'); return; }
    setSaving(true);
    const { error } = await supabase.from('exercise_records').insert({
      date,
      exercise_name: exerciseName,
      weight: parseFloat(weight),
      reps: parseInt(reps),
      sets: parseInt(sets),
    });
    setSaving(false);
    if (error) { alert('エラー: ' + error.message); return; }
    showToast('保存しました！');
    setWeight(''); setReps(''); setSets('');
    load();
  };

  const del = async (id: string) => {
    if (!confirm('削除しますか？')) return;
    await supabase.from('exercise_records').delete().eq('id', id);
    load();
  };

  // PB: highest weight per exercise
  const pbMap: Record<string, number> = {};
  records.forEach(r => {
    if (!(r.exercise_name in pbMap) || r.weight > pbMap[r.exercise_name]) {
      pbMap[r.exercise_name] = r.weight;
    }
  });

  const filtered = filterEx ? records.filter(r => r.exercise_name === filterEx) : records;

  return (
    <div className="record-panel active">
      <div className="rec-card">
        <div className="rec-card-title">重量記録入力</div>
        <div className="input-row">
          <div className="input-group" style={{ minWidth: '130px' }}>
            <label>日付</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        <div className="input-row">
          <div className="input-group" style={{ minWidth: '100%' }}>
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
        </div>
        <div className="input-row">
          <div className="input-group">
            <label>重量(kg)</label>
            <input type="number" step="0.5" placeholder="60" value={weight} onChange={e => setWeight(e.target.value)} />
          </div>
          <div className="input-group">
            <label>レップ数</label>
            <input type="number" placeholder="8" value={reps} onChange={e => setReps(e.target.value)} />
          </div>
          <div className="input-group">
            <label>セット数</label>
            <input type="number" placeholder="4" value={sets} onChange={e => setSets(e.target.value)} />
          </div>
        </div>
        <button className="save-btn" onClick={save} disabled={saving}>
          {saving ? '保存中...' : '💾 保存'}
        </button>
      </div>

      <div className="rec-card">
        <div className="rec-card-title">記録一覧</div>
        <div className="input-group" style={{ marginBottom: '10px' }}>
          <label>種目で絞り込み</label>
          <select value={filterEx} onChange={e => setFilterEx(e.target.value)}>
            <option value="">すべて</option>
            {EXERCISES.map(ex => <option key={ex} value={ex}>{ex}</option>)}
          </select>
        </div>
        <div className="record-list">
          {filtered.map(r => {
            const isPB = pbMap[r.exercise_name] === r.weight;
            return (
              <div key={r.id} className={`record-item${isPB ? ' pb' : ''}`}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>
                    {r.exercise_name}
                    {isPB && <span className="pb-badge">🏆 PB</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '2px' }}>
                    {r.date} ／ {r.weight}kg × {r.reps}rep × {r.sets}set
                  </div>
                </div>
                <button className="delete-btn" onClick={() => del(r.id)}>削除</button>
              </div>
            );
          })}
          {filtered.length === 0 && <div style={{ color: 'var(--text-sub)', fontSize: '13px', textAlign: 'center', padding: '16px' }}>記録がありません</div>}
        </div>
      </div>
    </div>
  );
}

// ── 写真記録 ────────────────────────────────────────────────────────────────
interface PhotoRecord {
  id: string;
  date: string;
  memo: string;
  storage_path: string;
}

function PhotoTab() {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [date, setDate] = useState(todayStr());
  const [memo, setMemo] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('photos')
      .select('*')
      .order('date', { ascending: true });
    if (data) setPhotos(data as PhotoRecord[]);
  }, []);

  useEffect(() => { load(); }, [load]);

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
      const path = `${date}-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from('photos').upload(path, blob, { contentType: 'image/jpeg' });
      if (upErr) { alert('アップロードエラー: ' + upErr.message); return; }
      const { error: dbErr } = await supabase.from('photos').insert({ date, memo, storage_path: path });
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
    await supabase.storage.from('photos').remove([photo.storage_path]);
    await supabase.from('photos').delete().eq('id', photo.id);
    load();
  };

  const before = photos[0];
  const after = photos[photos.length - 1];
  const showComparison = photos.length >= 2 && before.id !== after.id;

  return (
    <div className="record-panel active">
      <div className="rec-card">
        <div className="rec-card-title">写真アップロード</div>
        <div className="input-row">
          <div className="input-group" style={{ minWidth: '130px' }}>
            <label>日付</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="input-group" style={{ minWidth: '180px' }}>
            <label>メモ</label>
            <input type="text" placeholder="コメント（任意）" value={memo} onChange={e => setMemo(e.target.value)} />
          </div>
        </div>
        <div
          className="photo-upload-area"
          onClick={() => fileRef.current?.click()}
        >
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

      {showComparison && (
        <div className="rec-card">
          <div className="rec-card-title">Before / After 比較</div>
          <div className="comparison-wrap">
            <div className="comparison-side">
              <img src={getPhotoUrl(before.storage_path)} alt="before" />
              <div className="comparison-tag">BEFORE</div>
              <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: '10px', borderRadius: '6px', padding: '2px 6px' }}>{before.date}</div>
            </div>
            <div className="comparison-side">
              <img src={getPhotoUrl(after.storage_path)} alt="after" />
              <div className="comparison-tag">AFTER</div>
              <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: '10px', borderRadius: '6px', padding: '2px 6px' }}>{after.date}</div>
            </div>
          </div>
        </div>
      )}

      {photos.length > 0 && (
        <div className="rec-card">
          <div className="rec-card-title">フォトギャラリー</div>
          <div className="photo-grid">
            {photos.slice().reverse().map(p => (
              <div key={p.id} className="photo-item">
                <img src={getPhotoUrl(p.storage_path)} alt={p.date} />
                <div className="photo-item-label">
                  <div>{p.date}</div>
                  {p.memo && <div style={{ opacity: .8 }}>{p.memo}</div>}
                </div>
                <button
                  onClick={() => del(p)}
                  style={{
                    position: 'absolute', top: '6px', right: '6px',
                    background: 'rgba(0,0,0,.55)', color: '#fff', border: 'none',
                    borderRadius: '8px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer',
                  }}
                >削除</button>
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

// ── 出席チェックイン ──────────────────────────────────────────────────────────
interface CheckinRecord {
  id: string;
  week: string;
  days: string[];
  weight: number | null;
  memo: string;
}

function CheckinTab() {
  const [records, setRecords] = useState<CheckinRecord[]>([]);
  const [week, setWeek] = useState(todayStr());
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [weight, setWeight] = useState('');
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('checkins')
      .select('*')
      .order('week', { ascending: false });
    if (data) setRecords(data as CheckinRecord[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleDay = (day: string) => {
    setSelectedDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) { next.delete(day); } else { next.add(day); }
      return next;
    });
  };

  const save = async () => {
    if (!week || selectedDays.size === 0) { alert('日付とトレーニング日を選択してください'); return; }
    setSaving(true);
    const { error } = await supabase.from('checkins').insert({
      week,
      days: Array.from(selectedDays),
      weight: weight ? parseFloat(weight) : null,
      memo,
    });
    setSaving(false);
    if (error) { alert('エラー: ' + error.message); return; }
    showToast('保存しました！');
    setSelectedDays(new Set()); setWeight(''); setMemo('');
    load();
  };

  const del = async (id: string) => {
    if (!confirm('削除しますか？')) return;
    await supabase.from('checkins').delete().eq('id', id);
    load();
  };

  // Stats
  const totalDays = records.reduce((s, r) => s + (r.days?.length || 0), 0);
  const totalWeeks = records.length;
  const avgPerWeek = totalWeeks > 0 ? (totalDays / totalWeeks).toFixed(1) : '0';

  // Calendar for current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Collect all trained dates from checkins
  const trainedDates = new Set<string>();
  records.forEach(r => {
    // days are weekday labels, use week date as anchor
    // Store the week date if any day was trained
    if (r.days && r.days.length > 0) {
      // Map week date to actual dates based on selected days
      const weekDate = new Date(r.week);
      // week is a Monday anchor — find the ISO week start
      DAY_LABELS.forEach((label, idx) => {
        if (r.days.includes(label)) {
          // idx 0=月(Mon)...6=日(Sun)
          const dayOffset = idx; // Mon=0
          const d = new Date(weekDate);
          // Adjust to Monday of that week
          const dayOfWeek = (d.getDay() + 6) % 7; // Mon=0
          d.setDate(d.getDate() - dayOfWeek + dayOffset);
          trainedDates.add(d.toISOString().slice(0, 10));
        }
      });
    }
  });

  // Build calendar cells: Mon-first
  const calStart = (firstDay + 6) % 7; // shift Sun=0 → Mon=0
  const cells: (number | null)[] = Array(calStart).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  return (
    <div className="record-panel active">
      <div className="rec-card">
        <div className="rec-card-title">チェックイン入力</div>
        <div className="input-row">
          <div className="input-group" style={{ minWidth: '130px' }}>
            <label>週（日付）</label>
            <input type="date" value={week} onChange={e => setWeek(e.target.value)} />
          </div>
          <div className="input-group">
            <label>体重(kg)</label>
            <input type="number" step="0.1" placeholder="75.0" value={weight} onChange={e => setWeight(e.target.value)} />
          </div>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-sub)', marginBottom: '6px' }}>トレーニング実施日</div>
          <div className="checkin-days">
            {DAY_LABELS.map(d => (
              <div
                key={d}
                className={`checkin-day${selectedDays.has(d) ? ' selected' : ''}`}
                onClick={() => toggleDay(d)}
              >
                {d}
              </div>
            ))}
          </div>
        </div>
        <div className="input-group" style={{ marginBottom: '10px' }}>
          <label>メモ</label>
          <input type="text" placeholder="今週の振り返り（任意）" value={memo} onChange={e => setMemo(e.target.value)} />
        </div>
        <button className="save-btn" onClick={save} disabled={saving}>
          {saving ? '保存中...' : '✅ チェックイン'}
        </button>
      </div>

      <div className="rec-card">
        <div className="rec-card-title">統計</div>
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

        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '6px' }}>
          {year}年{month + 1}月
        </div>
        <div className="calendar-grid">
          {['月', '火', '水', '木', '金', '土', '日'].map(d => (
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
          {records.map(r => (
            <div key={r.id} className="record-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontWeight: 700 }}>{r.week}</span>
                <button className="delete-btn" onClick={() => del(r.id)}>削除</button>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
                {r.days?.join(' ')} ／ {r.days?.length || 0}日
                {r.weight != null && ` ／ 体重 ${r.weight}kg`}
                {r.memo && ` ／ ${r.memo}`}
              </div>
            </div>
          ))}
          {records.length === 0 && <div style={{ color: 'var(--text-sub)', fontSize: '13px', textAlign: 'center', padding: '16px' }}>記録がありません</div>}
        </div>
      </div>
    </div>
  );
}

// ── Main RecordPage ──────────────────────────────────────────────────────────
export default function RecordPage() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('size');

  return (
    <div className="container">
      <div className="section">
        <div className="section-title"><span>記録</span></div>
        <EnvWarning />

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
        {activeSubTab === 'weight' && <WeightTab />}
        {activeSubTab === 'photo' && <PhotoTab />}
        {activeSubTab === 'checkin' && <CheckinTab />}
      </div>
    </div>
  );
}
