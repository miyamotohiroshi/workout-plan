import { TrainingPattern, Exercise, ExerciseRole, DaySchedule } from '@/types';
import { getExercise, exerciseImageUrl, youtubeSearchUrl } from '@/lib/exercises';

// 役割ごとの休憩時間と、重量を上げる目安の既定値
const ROLE_DEFAULTS: Record<ExerciseRole, { rest: string; progression: string }> = {
  main: {
    rest: '2〜3分',
    progression: '全セットで上限の回数ができたら、次回 +2.5kg（脚・デッドリフトは +5kg）',
  },
  sub: {
    rest: '90秒',
    progression: '全セットで上限の回数ができたら、次回は重量を1段階上げる',
  },
  finish: {
    rest: '60秒',
    progression: '同じ重量で回数を増やし、上限を超えたら重量を上げる',
  },
  core: {
    rest: '45〜60秒',
    progression: '回数（秒数）を毎週少しずつ伸ばし、楽になったら難しいやり方に変える',
  },
};

type Override = Partial<Pick<Exercise, 'description' | 'points' | 'rest' | 'progression'>>;

/** 種目マスターの内容に、その日のセット数・回数・役割を組み合わせてメニュー1行を作る */
export function ex(id: string, sets: number, reps: string, role: ExerciseRole, override: Override = {}): Exercise {
  const def = getExercise(id);
  const defaults = ROLE_DEFAULTS[role];
  return {
    id: def.id,
    name: def.name,
    icon: def.icon,
    sets,
    reps,
    role,
    description: override.description ?? def.description,
    points: override.points ?? def.points,
    rest: override.rest ?? defaults.rest,
    progression: override.progression ?? def.progression ?? defaults.progression,
    youtubeUrl: youtubeSearchUrl(def),
    imageUrl: exerciseImageUrl(def),
    part: def.part,
    equipment: def.equipment,
  };
}

/** 種目リストから「N種目 ／ 約X〜Y分」を作る (1種目あたり約10分、腹筋・首は約6分で計算) */
export function volumeLabel(exercises: Exercise[]): string {
  const minutes = exercises.reduce((sum, e) => sum + (e.role === 'core' || e.part === '首' ? 6 : 11), 0);
  const low = Math.round(minutes / 5) * 5;
  return `${exercises.length}種目 ／ 約${low}〜${low + 10}分`;
}

export function trainingDay(
  day: string,
  label: string,
  muscleGroup: string,
  gymType: 'free' | 'machine',
  headerIcon: string,
  headerTitle: string,
  exercises: Exercise[],
  machine?: { headerTitle: string; exercises: Exercise[] },
): DaySchedule {
  return {
    day, label, muscleGroup, gymType, isRest: false, headerIcon, headerTitle, headerVolume: volumeLabel(exercises), exercises,
    machineVariant: machine && { headerTitle: machine.headerTitle, headerVolume: volumeLabel(machine.exercises), exercises: machine.exercises },
  };
}

export function restDay(day: string, label: string, restIcon: string, restTitle: string, restMessage: string): DaySchedule {
  return { day, label, muscleGroup: '休み', gymType: 'rest', isRest: true, restIcon, restTitle, restMessage, exercises: [] };
}

// ===== 共通の曜日メニュー =====

// 月曜: 肩 + 三頭筋 (A・B 共通)
const shoulderDay = [
  ex('overhead-press', 4, '6〜8rep', 'main'),
  ex('shoulder-press', 3, '10〜12rep', 'sub'),
  ex('side-raise', 4, '12〜15rep', 'sub'),
  ex('rear-raise', 3, '12〜15rep', 'sub'),
  ex('skull-crusher', 3, '10〜12rep', 'sub'),
  ex('hanging-leg-raise', 3, '10〜15rep', 'core'),
  ex('neck', 2, '前後 各15rep', 'finish'),
];

// ===== Pattern A (週4回：月・木・金・土) =====
// ジムは火曜・水曜が休館日のため、この2日にはトレーニングを入れない

// 基本はフリーウェイトのジム。マシンのジムに行けた日は aMachineLegs に切り替える
const aFreeLegs = [
  ex('barbell-squat', 4, '8rep', 'main'),
  ex('romanian-deadlift', 3, '10rep', 'sub', {
    points: ['膝は軽く曲げた状態を固定', 'ハムの引っ張りを感じる深さまで前傾', '木曜にデッドリフトをしているので、限界の手前（あと2〜3回できる重さ）で止める'],
  }),
  ex('bulgarian-split-squat', 3, '10rep（片脚）', 'sub'),
  ex('hip-thrust', 3, '10rep', 'sub'),
  ex('calf-raise-barbell', 4, '15〜20rep', 'finish'),
  ex('plank', 3, '45〜60秒', 'core'),
];

const aMachineLegs = [
  ex('smith-squat', 4, '8〜10rep', 'main'),
  ex('leg-press', 3, '10〜12rep', 'sub'),
  ex('leg-curl', 3, '12rep', 'sub'),
  ex('leg-extension', 3, '15rep', 'finish'),
  ex('calf-raise-machine', 4, '15〜20rep', 'finish'),
  ex('plank', 3, '45〜60秒', 'core'),
];

const aBackBiceps = [
  ex('deadlift', 4, '5rep', 'main'),
  ex('pull-up', 4, 'できる回数（目標6〜10rep）', 'main', { rest: '2分' }),
  ex('barbell-row', 3, '8rep', 'sub'),
  ex('barbell-curl', 3, '10rep', 'sub'),
  ex('shrug', 3, '12rep', 'finish'),
  ex('ab-roller', 3, '8〜12rep', 'core'),
  ex('neck', 2, '前後 各15rep', 'finish'),
];

const aChest = [
  ex('bench-press', 4, '8rep', 'main'),
  ex('incline-press', 3, '10rep', 'sub'),
  ex('dumbbell-fly', 3, '12rep', 'sub'),
  ex('side-raise', 3, '15rep', 'finish', {
    description: '週2回目の肩中部への刺激。月曜より軽めでポンプを狙う。',
    points: ['月曜より少し軽い重量でコントロール重視', '15〜20repで筋肉に血を集める'],
  }),
  ex('close-grip-bench', 3, '8〜10rep', 'finish'),
  ex('leg-raise', 3, '15rep', 'core'),
];

export const PATTERN_A: TrainingPattern = {
  id: 'a',
  name: 'Pattern A',
  description: '週4回（月・木・金・土）',
  schedule: [
    trainingDay('月', 'mon', '肩', 'free', '💪', '月曜：肩 + 三頭筋', shoulderDay),
    restDay('火', 'tue', '🚶', '火曜：アクティブレスト（ジム休館日）', '7000〜9000歩の歩行を目標に。\n食後の10分散歩で代謝を維持。\n月曜の疲労を抜く日。'),
    restDay('水', 'wed', '😴', '水曜：完全休養日（ジム休館日）', '筋肉は休んでいる間に育ちます。\n睡眠と栄養補給を優先して\n木曜からの3日間に備えましょう。'),
    trainingDay('木', 'thu', '背中', 'free', '🏋️', '木曜：背中 + 二頭筋', aBackBiceps),
    trainingDay('金', 'fri', '胸', 'free', '🫁', '金曜：胸 + 肩（補助）', aChest),
    trainingDay('土', 'sat', '脚', 'free', '🦵', '土曜：脚（フリーウェイト）', aFreeLegs, { headerTitle: '土曜：脚（マシン集中）', exercises: aMachineLegs }),
    restDay('日', 'sun', '🛌', '日曜：完全休養日', '週の疲労をリセット。\n来週のトレーニングに備えて\nしっかり睡眠・栄養補給を。'),
  ],
};

// ===== Pattern B (週4回：月・木・金・日) =====

// 翌日 (金曜) にデッドリフトがあるため、木曜はハムストリングス・腰に重い種目を入れない
const bFreeLegs = [
  ex('barbell-squat', 4, '8rep', 'main'),
  ex('hip-thrust', 4, '10rep', 'sub'),
  ex('lunge', 3, '12rep（片脚）', 'sub'),
  ex('calf-raise-barbell', 4, '15〜20rep', 'finish'),
  ex('plank', 3, '45〜60秒', 'core'),
];

const bBackChest = [
  ex('deadlift', 4, '5rep', 'main'),
  ex('pull-up', 4, 'できる回数（目標6〜10rep）', 'main', { rest: '2分' }),
  ex('bench-press', 4, '8rep', 'main', {
    description: '胸板の厚みを作る。背中デーと合わせることで上半身を一気に鍛える。',
  }),
  ex('barbell-row', 3, '8rep', 'sub'),
  ex('incline-press', 3, '10rep', 'sub'),
  ex('ab-roller', 3, '8〜12rep', 'core'),
  ex('neck', 2, '前後 各15rep', 'finish'),
];

// 基本はフリーウェイトのジム。マシンのジムに行けた日は bMachine に切り替える
const bFreeSunday = [
  ex('shoulder-press', 4, '10rep', 'sub'),
  ex('side-raise', 4, '15rep', 'finish', {
    description: '週2回目の三角筋中部刺激。ポンプを意識して軽めでテンポよく。',
    points: ['月曜より軽めの重量で高rep', '肩に血を集めてパンプを感じる'],
  }),
  ex('bulgarian-split-squat', 3, '10rep（片脚）', 'sub'),
  ex('romanian-deadlift', 3, '10rep', 'sub', {
    description: 'ハムストリングスをストレッチしながら鍛える。金曜のデッドリフトと合わせて太ももの裏を強化。',
  }),
  ex('one-arm-row', 3, '10rep（片側）', 'sub'),
  ex('overhead-triceps-extension', 3, '12rep', 'finish'),
  ex('leg-raise', 3, '15rep', 'core'),
];

const bMachine = [
  ex('smith-shoulder-press', 4, '10rep', 'sub'),
  ex('machine-side-raise', 4, '15rep', 'finish'),
  ex('leg-press', 4, '12rep', 'sub', {
    description: '木曜スクワットの補完として大腿四頭筋・大臀筋をさらに追い込む。',
  }),
  ex('leg-curl', 3, '12rep', 'sub', {
    description: 'ハムストリングスをマシンで単独に追い込む。金曜のデッドリフトと合わせて太ももの裏を強化。',
  }),
  ex('lat-pulldown', 3, '10rep', 'sub'),
  ex('triceps-pushdown', 3, '12rep', 'finish'),
  ex('leg-raise', 3, '15rep', 'core'),
];

export const PATTERN_B: TrainingPattern = {
  id: 'b',
  name: 'Pattern B',
  description: '週4回（月・木・金・日）',
  schedule: [
    trainingDay('月', 'mon', '肩', 'free', '💪', '月曜：肩 + 三頭筋', shoulderDay),
    restDay('火', 'tue', '🚶', '火曜：アクティブレスト（ジム休館日）', '7000〜9000歩の歩行を目標に。\n食後の10分散歩で代謝を維持。'),
    restDay('水', 'wed', '😴', '水曜：完全休養日（ジム休館日）', '月〜火の疲労をリセット。\n木曜のトレーニングに備える。'),
    trainingDay('木', 'thu', '脚', 'free', '🦵', '木曜：脚（フリーウェイト）', bFreeLegs),
    trainingDay('金', 'fri', '背中+胸', 'free', '🏋️', '金曜：背中 + 胸', bBackChest),
    restDay('土', 'sat', '🚶', '土曜：アクティブレスト', '7000〜9000歩の歩行を目標に。\n日曜のトレーニングに備えて回復を優先。'),
    trainingDay('日', 'sun', '肩+脚', 'free', '★', '日曜：肩 + 脚 + 腕（フリーウェイト）', bFreeSunday, { headerTitle: '日曜：肩 + 脚 + 腕（マシン）', exercises: bMachine }),
  ],
};
