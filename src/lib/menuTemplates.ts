// 今後ほかのユーザーが使う想定のメニュー型 (テンプレート)。
// まだ画面には出していない。人ごとのメニュー機能を作るときに、ここから選んでもらう想定。
import { DaySchedule } from '@/types';
import { ex, restDay, trainingDay } from '@/lib/trainingData';

export interface MenuTemplate {
  id: string;
  name: string;
  level: '初心者' | '中級' | '上級';
  daysPerWeek: number;
  /** 必要な設備 */
  equipment: string;
  description: string;
  schedule: DaySchedule[];
}

const rest = (day: string, label: string) =>
  restDay(day, label, '😴', `${day}曜：休養日`, '筋肉は休んでいる間に育ちます。\n散歩などで軽く体を動かしましょう。');

// ── 初心者：週3回 全身 ──────────────────────────
const fullBodyA = [
  ex('goblet-squat', 3, '10〜12rep', 'main'),
  ex('chest-press', 3, '10〜12rep', 'main'),
  ex('lat-pulldown', 3, '10〜12rep', 'sub'),
  ex('shoulder-press', 3, '10〜12rep', 'sub'),
  ex('plank', 3, '30〜45秒', 'core'),
];
const fullBodyB = [
  ex('leg-press', 3, '10〜12rep', 'main'),
  ex('push-up', 3, 'できる回数', 'main'),
  ex('cable-row', 3, '10〜12rep', 'sub'),
  ex('side-raise', 3, '12〜15rep', 'sub'),
  ex('hammer-curl', 2, '12rep', 'finish'),
  ex('side-plank', 2, '左右 各30秒', 'core'),
];

// ── 中級：週4回 上半身／下半身 ──────────────────
const upper1 = [
  ex('bench-press', 4, '6〜8rep', 'main'),
  ex('barbell-row', 4, '6〜8rep', 'main'),
  ex('overhead-press', 3, '8〜10rep', 'sub'),
  ex('pull-up', 3, 'できる回数', 'sub'),
  ex('skull-crusher', 3, '10〜12rep', 'finish'),
  ex('barbell-curl', 3, '10〜12rep', 'finish'),
];
const lower1 = [
  ex('barbell-squat', 4, '6〜8rep', 'main'),
  ex('romanian-deadlift', 3, '8〜10rep', 'sub'),
  ex('leg-curl', 3, '10〜12rep', 'sub'),
  ex('calf-raise-machine', 4, '12〜15rep', 'finish'),
  ex('hanging-leg-raise', 3, '10〜15rep', 'core'),
];
const upper2 = [
  ex('incline-press', 4, '8〜10rep', 'main'),
  ex('cable-row', 3, '10〜12rep', 'sub'),
  ex('lat-pulldown', 3, '10〜12rep', 'sub'),
  ex('side-raise', 4, '12〜15rep', 'sub'),
  ex('triceps-pushdown', 3, '12rep', 'finish'),
  ex('hammer-curl', 3, '12rep', 'finish'),
];
const lower2 = [
  ex('deadlift', 4, '5rep', 'main'),
  ex('bulgarian-split-squat', 3, '10rep（片脚）', 'sub'),
  ex('leg-press', 3, '12rep', 'sub'),
  ex('leg-extension', 3, '15rep', 'finish'),
  ex('ab-roller', 3, '8〜12rep', 'core'),
];

// ── 上級：週6回 プッシュ／プル／レッグ ───────────
const push = [
  ex('bench-press', 4, '6〜8rep', 'main'),
  ex('overhead-press', 3, '8〜10rep', 'sub'),
  ex('incline-press', 3, '10rep', 'sub'),
  ex('side-raise', 4, '12〜15rep', 'sub'),
  ex('triceps-pushdown', 3, '12rep', 'finish'),
  ex('dips', 2, 'できる回数', 'finish'),
];
const pull = [
  ex('deadlift', 3, '5rep', 'main'),
  ex('pull-up', 4, 'できる回数', 'main'),
  ex('barbell-row', 3, '8rep', 'sub'),
  ex('face-pull', 3, '15rep', 'finish'),
  ex('barbell-curl', 3, '10rep', 'finish'),
  ex('hammer-curl', 2, '12rep', 'finish'),
];
const legs = [
  ex('barbell-squat', 4, '6〜8rep', 'main'),
  ex('romanian-deadlift', 3, '8〜10rep', 'sub'),
  ex('leg-press', 3, '12rep', 'sub'),
  ex('leg-curl', 3, '12rep', 'finish'),
  ex('calf-raise-machine', 4, '15rep', 'finish'),
  ex('hanging-leg-raise', 3, '10〜15rep', 'core'),
];

// ── 初心者〜中級：自宅（ダンベル + 自重） ────────
const homeA = [
  ex('goblet-squat', 4, '12rep', 'main'),
  ex('push-up', 4, 'できる回数', 'main'),
  ex('one-arm-row', 3, '10rep（片側）', 'sub'),
  ex('shoulder-press', 3, '10〜12rep', 'sub'),
  ex('plank', 3, '45秒', 'core'),
];
const homeB = [
  ex('bulgarian-split-squat', 3, '10rep（片脚）', 'main'),
  ex('romanian-deadlift', 3, '10〜12rep', 'sub', { points: ['ダンベルを両手に持って行う', '膝は軽く曲げた状態を固定', 'ハムの引っ張りを感じる深さまで前傾'] }),
  ex('side-raise', 3, '15rep', 'sub'),
  ex('hammer-curl', 3, '12rep', 'finish'),
  ex('leg-raise', 3, '15rep', 'core'),
];

// ── 中級〜上級：ラグビーの体づくり ──────────────
const rugbyPower = [
  ex('barbell-squat', 4, '5rep', 'main'),
  ex('hip-thrust', 3, '8rep', 'sub'),
  ex('kettlebell-swing', 4, '15rep', 'sub'),
  ex('farmers-walk', 3, '30m', 'finish'),
  ex('neck', 2, '前後 各15rep', 'finish'),
];
const rugbyUpper = [
  ex('bench-press', 4, '5rep', 'main'),
  ex('pull-up', 4, 'できる回数', 'main'),
  ex('barbell-row', 3, '8rep', 'sub'),
  ex('shrug', 3, '12rep', 'finish'),
  ex('ab-roller', 3, '10rep', 'core'),
];
const rugbyPull = [
  ex('deadlift', 4, '3〜5rep', 'main'),
  ex('bulgarian-split-squat', 3, '8rep（片脚）', 'sub'),
  ex('leg-curl', 3, '10rep', 'sub'),
  ex('neck', 2, '前後 各15rep', 'finish'),
  ex('side-plank', 3, '左右 各40秒', 'core'),
];
const rugbyAccessory = [
  ex('overhead-press', 4, '6rep', 'main'),
  ex('incline-press', 3, '8rep', 'sub'),
  ex('one-arm-row', 3, '10rep（片側）', 'sub'),
  ex('face-pull', 3, '15rep', 'finish'),
  ex('dips', 3, 'できる回数', 'finish'),
  ex('hanging-leg-raise', 3, '10〜15rep', 'core'),
];

export const MENU_TEMPLATES: MenuTemplate[] = [
  {
    id: 'beginner-fullbody',
    name: '初心者：週3回 全身',
    level: '初心者',
    daysPerWeek: 3,
    equipment: 'ジム（マシン中心）',
    description: '1回で全身を鍛える。フォームを覚えながら、全部位を週3回ずつ刺激する。',
    schedule: [
      trainingDay('月', 'mon', '全身A', 'machine', '🔰', '月曜：全身A', fullBodyA),
      rest('火', 'tue'),
      trainingDay('水', 'wed', '全身B', 'machine', '🔰', '水曜：全身B', fullBodyB),
      rest('木', 'thu'),
      trainingDay('金', 'fri', '全身A', 'machine', '🔰', '金曜：全身A', fullBodyA),
      rest('土', 'sat'),
      rest('日', 'sun'),
    ],
  },
  {
    id: 'upper-lower',
    name: '中級：週4回 上半身／下半身',
    level: '中級',
    daysPerWeek: 4,
    equipment: 'ジム（フリーウェイト + マシン）',
    description: '上半身と下半身を交互に。全部位を週2回鍛えられ、筋肥大の効率が高い。',
    schedule: [
      trainingDay('月', 'mon', '上半身', 'free', '💪', '月曜：上半身（重め）', upper1),
      trainingDay('火', 'tue', '下半身', 'free', '🦵', '火曜：下半身（スクワット）', lower1),
      rest('水', 'wed'),
      trainingDay('木', 'thu', '上半身', 'machine', '💪', '木曜：上半身（回数多め）', upper2),
      trainingDay('金', 'fri', '下半身', 'free', '🦵', '金曜：下半身（デッドリフト）', lower2),
      rest('土', 'sat'),
      rest('日', 'sun'),
    ],
  },
  {
    id: 'push-pull-legs',
    name: '上級：週6回 プッシュ／プル／レッグ',
    level: '上級',
    daysPerWeek: 6,
    equipment: 'ジム（フリーウェイト + マシン）',
    description: '押す・引く・脚の3分割を週2周。トレーニング量を多く確保したい人向け。',
    schedule: [
      trainingDay('月', 'mon', '押す', 'free', '💥', '月曜：プッシュ（胸・肩・三頭）', push),
      trainingDay('火', 'tue', '引く', 'free', '🧗', '火曜：プル（背中・二頭）', pull),
      trainingDay('水', 'wed', '脚', 'free', '🦵', '水曜：レッグ', legs),
      trainingDay('木', 'thu', '押す', 'free', '💥', '木曜：プッシュ（胸・肩・三頭）', push),
      trainingDay('金', 'fri', '引く', 'free', '🧗', '金曜：プル（背中・二頭）', pull),
      trainingDay('土', 'sat', '脚', 'free', '🦵', '土曜：レッグ', legs),
      rest('日', 'sun'),
    ],
  },
  {
    id: 'home-dumbbell',
    name: '自宅：ダンベル + 自重 週4回',
    level: '初心者',
    daysPerWeek: 4,
    equipment: '可変式ダンベル・ベンチ（自宅）',
    description: 'ジムに行けない人向け。ダンベルと自重だけで全身を鍛える。',
    schedule: [
      trainingDay('月', 'mon', '全身A', 'free', '🏠', '月曜：自宅 全身A', homeA),
      trainingDay('火', 'tue', '全身B', 'free', '🏠', '火曜：自宅 全身B', homeB),
      rest('水', 'wed'),
      trainingDay('木', 'thu', '全身A', 'free', '🏠', '木曜：自宅 全身A', homeA),
      trainingDay('金', 'fri', '全身B', 'free', '🏠', '金曜：自宅 全身B', homeB),
      rest('土', 'sat'),
      rest('日', 'sun'),
    ],
  },
  {
    id: 'rugby-strength',
    name: 'ラグビーの体づくり 週4回',
    level: '中級',
    daysPerWeek: 4,
    equipment: 'ジム（フリーウェイト・ケトルベル）',
    description: '筋力・瞬発力・首と体幹を重視。当たり負けしない体を作る。',
    schedule: [
      trainingDay('月', 'mon', '下半身', 'free', '⚡', '月曜：下半身（パワー）', rugbyPower),
      trainingDay('火', 'tue', '上半身', 'free', '🏉', '火曜：上半身（押す・引く）', rugbyUpper),
      rest('水', 'wed'),
      trainingDay('木', 'thu', '下半身', 'free', '⚓', '木曜：下半身（引く）', rugbyPull),
      trainingDay('金', 'fri', '上半身', 'free', '🏉', '金曜：上半身（補強）', rugbyAccessory),
      rest('土', 'sat'),
      rest('日', 'sun'),
    ],
  },
];
