// 定番ごはん: 朝・昼・夜それぞれ A/B/C の3パターン + 間食。
// 買い物リストは「週に何回そのパターンを食べるか」から食材を合計して作る。
import { FOODS, FoodKey } from '@/lib/proteinFoods';

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type ShopCategory = '肉・魚' | '卵・乳製品・大豆' | '主食・果物' | '野菜' | '常備品';

export interface ShopItem {
  key: string;
  name: string;
  unit: 'g' | '個' | 'パック' | '缶' | 'ml' | '杯' | '本' | '袋';
  category: ShopCategory;
  /** 売っている単位 (例: 卵は10個パック)。あれば「◯パック」の目安を出す */
  pack?: { size: number; label: string };
}

export const SHOP_ITEMS: Record<string, ShopItem> = {
  chicken_breast: { key: 'chicken_breast', name: '鶏むね肉（皮なし）', unit: 'g', category: '肉・魚' },
  chicken_thigh: { key: 'chicken_thigh', name: '鶏もも肉（皮なし）', unit: 'g', category: '肉・魚' },
  pork: { key: 'pork', name: '豚ロース・こま切れ', unit: 'g', category: '肉・魚' },
  pork_shabu: { key: 'pork_shabu', name: '豚もも肉（しゃぶしゃぶ用）', unit: 'g', category: '肉・魚' },
  beef: { key: 'beef', name: '牛もも肉（赤身・薄切り）', unit: 'g', category: '肉・魚' },
  salmon: { key: 'salmon', name: '鮭（切り身）', unit: 'g', category: '肉・魚', pack: { size: 100, label: '切れ' } },
  mackerel: { key: 'mackerel', name: 'サバまたは鮭（切り身）', unit: 'g', category: '肉・魚', pack: { size: 150, label: '切れ' } },
  tuna: { key: 'tuna', name: 'ツナ缶（水煮）', unit: '缶', category: '肉・魚' },
  egg: { key: 'egg', name: '卵', unit: '個', category: '卵・乳製品・大豆', pack: { size: 10, label: 'パック（10個）' } },
  greek_yogurt: { key: 'greek_yogurt', name: 'ギリシャヨーグルト（無糖）', unit: 'g', category: '卵・乳製品・大豆', pack: { size: 100, label: 'カップ（100g）' } },
  natto: { key: 'natto', name: '納豆', unit: 'パック', category: '卵・乳製品・大豆', pack: { size: 3, label: '個入り（3パック）' } },
  tofu: { key: 'tofu', name: '豆腐（絹・木綿）', unit: 'g', category: '卵・乳製品・大豆', pack: { size: 150, label: '個（150g）' } },
  milk: { key: 'milk', name: '牛乳（低脂肪でも可）', unit: 'ml', category: '卵・乳製品・大豆', pack: { size: 1000, label: '本（1L）' } },
  rice: { key: 'rice', name: 'お米（炊く前）', unit: 'g', category: '主食・果物', pack: { size: 150, label: '合' } },
  banana: { key: 'banana', name: 'バナナ', unit: '本', category: '主食・果物' },
  broccoli: { key: 'broccoli', name: 'ブロッコリー（冷凍でも可）', unit: 'g', category: '野菜' },
  cabbage: { key: 'cabbage', name: 'キャベツ（千切りパックでも可）', unit: 'g', category: '野菜' },
  salad: { key: 'salad', name: 'サラダ用の葉物・ミニトマト', unit: 'g', category: '野菜' },
  onion_pepper: { key: 'onion_pepper', name: '玉ねぎ・ピーマン', unit: 'g', category: '野菜' },
  miso: { key: 'miso', name: 'みそ汁の具（わかめ・ねぎ）', unit: '袋', category: '常備品' },
  protein: { key: 'protein', name: 'プロテイン', unit: '杯', category: '常備品' },
};

export type ExtraCategory = 'rice' | 'noodle';

export const EXTRA_CATEGORY_LABELS: Record<ExtraCategory, string> = {
  rice: '🍛 ごはんもの',
  noodle: '🍜 麺',
};

/** 麺の日のルール (麺のギャラリーの上に表示) */
export const NOODLE_RULES = [
  '麺は1玉まで（パスタは乾麺80g）。大盛り・替え玉はしない',
  'タンパク質のおかず30g以上を、麺に乗せるか横に添える',
  'もやし・キャベツ・きのこ・きゅうりで量を増やす',
  '麺の日はご飯なし（ラーメン＋チャーハンのような重ね食べはしない）',
  '汁は飲み干さない（特にラーメンは塩分が多い）',
];

export interface MealPattern {
  id: string;
  slot: MealSlot;
  variant: 'A' | 'B' | 'C' | 'D' | '';
  title: string;
  /** public/images/meals/<id>.jpg */
  hasImage: boolean;
  /** おおよそのカロリー (ご飯・調理油を含む) */
  kcal: number;
  /** 表示用の中身 */
  items: string[];
  /** 作り方・作り置きのコツ */
  tip: string;
  /** タンパク質トラッカーの食品と個数 (タンパク質の計算と、将来のワンタップ記録に使う) */
  tracker: Partial<Record<FoodKey, number>>;
  /** トラッカーの食品にないもの (冷凍ハンバーグなど) のタンパク質 g */
  extraProtein?: number;
  /** その他メニューのギャラリーで分ける見出し */
  category?: ExtraCategory;
  /** 買い物リスト用の材料 (1食分) */
  shopping: Partial<Record<keyof typeof SHOP_ITEMS, number>>;
  /** 週に食べる回数の初期値 */
  defaultPerWeek: number;
}

// ご飯 150g（炊いた後）≒ お米 68g（炊く前）
const RICE_150 = 68;
const RICE_180 = 82;

export const MEAL_PATTERNS: MealPattern[] = [
  // ── 朝 ──
  {
    id: 'breakfast-a', slot: 'breakfast', variant: 'A', title: '卵とヨーグルトの高タンパク朝食', hasImage: true, kcal: 520,
    items: ['卵3個（目玉焼き or スクランブル）', 'ギリシャヨーグルト 100g', '納豆 1パック', 'ご飯 120g'],
    tip: 'ゆで卵を作り置きしておけば、焼く時間がない日も「ゆで卵3個」で同じ量になる。',
    tracker: { egg: 3, greek_yogurt: 1, natto: 1 },
    shopping: { egg: 3, greek_yogurt: 100, natto: 1, rice: 55 },
    defaultPerWeek: 3,
  },
  {
    id: 'breakfast-b', slot: 'breakfast', variant: 'B', title: 'プロテイン＋卵の時短朝食', hasImage: true, kcal: 420,
    items: ['プロテイン1杯（牛乳200mlで割る）', 'ゆで卵 1個', 'バナナ 1本'],
    tip: '忙しい朝用。作り置きのゆで卵を1個取るだけ。3分で終わる。',
    tracker: { protein: 1, milk: 1, egg: 1 },
    shopping: { protein: 1, milk: 200, egg: 1, banana: 1 },
    defaultPerWeek: 2,
  },
  {
    id: 'breakfast-c', slot: 'breakfast', variant: 'C', title: '焼き鮭の和朝食', hasImage: true, kcal: 620,
    items: ['焼き鮭 1切れ（100g）', '卵焼き（卵2個）', '納豆 1パック', 'ご飯 120g', 'みそ汁'],
    tip: '鮭は前の晩にまとめて焼いておくと、朝は温めるだけ。休日の朝におすすめ。',
    tracker: { fish: 2, egg: 2, natto: 1 },
    shopping: { salmon: 100, egg: 2, natto: 1, rice: 55, miso: 0.15 },
    defaultPerWeek: 2,
  },
  // ── 昼 ──
  {
    id: 'lunch-a', slot: 'lunch', variant: 'A', title: '鶏むねの作り置き弁当', hasImage: true, kcal: 560,
    items: ['サラダチキン（鶏むね150g）', 'ゆで卵 1個', 'ブロッコリー', 'ご飯 180g'],
    tip: '週末に鶏むね肉をまとめて茹でて（または低温調理）、150gずつ小分けにして冷凍。',
    tracker: { chicken_breast: 3, egg: 1 },
    shopping: { chicken_breast: 150, egg: 1, broccoli: 60, rice: RICE_180 },
    defaultPerWeek: 3,
  },
  {
    id: 'lunch-b', slot: 'lunch', variant: 'B', title: '豚の生姜焼き定食', hasImage: true, kcal: 700,
    items: ['豚の生姜焼き（豚肉150g）', '冷奴（豆腐100g）', 'キャベツの千切り', 'ご飯 180g'],
    tip: '豚肉は生姜・しょうゆ・みりんで下味をつけて150gずつ冷凍。焼くだけで完成。',
    tracker: { pork: 3, tofu: 1 },
    shopping: { pork: 150, tofu: 100, cabbage: 60, rice: RICE_180 },
    defaultPerWeek: 2,
  },
  {
    id: 'lunch-c', slot: 'lunch', variant: 'C', title: 'ツナと鶏むねのサラダボウル', hasImage: true, kcal: 520,
    items: ['ツナ缶（水煮）1缶', 'サラダチキン（鶏むね100g）', '葉物・ミニトマト', 'ご飯 150g（または玄米）'],
    tip: '作り置きの鶏むねとツナ缶を乗せるだけ。ドレッシングはノンオイルかポン酢で。',
    tracker: { tuna_can: 1, chicken_breast: 2 },
    shopping: { tuna: 1, chicken_breast: 100, salad: 80, rice: RICE_150 },
    defaultPerWeek: 2,
  },
  // ── 夜 ──
  {
    id: 'dinner-a', slot: 'dinner', variant: 'A', title: '鶏ももの照り焼き', hasImage: true, kcal: 620,
    items: ['鶏もも肉の照り焼き（200g・皮なし）', '豆腐 150g（湯豆腐・冷奴）', 'ブロッコリー', 'ご飯 150g'],
    tip: '減量期は皮を取ると約100kcal減。下味冷凍しておけばフライパンで焼くだけ。',
    tracker: { chicken_thigh: 4, tofu: 1.5 },
    shopping: { chicken_thigh: 200, tofu: 150, broccoli: 60, rice: RICE_150 },
    defaultPerWeek: 2,
  },
  {
    id: 'dinner-b', slot: 'dinner', variant: 'B', title: '焼き魚定食（サバ・鮭）', hasImage: true, kcal: 680,
    items: ['焼き魚（サバか鮭 150g）', '納豆 1パック', '卵 1個（目玉焼き・温泉卵）', 'ご飯 150g', 'みそ汁'],
    tip: 'サバは脂が多くカロリー高め。減量中は鮭にすると軽くなる。魚焼きグリルかフライパンで。',
    tracker: { fish: 3, natto: 1, egg: 1 },
    shopping: { mackerel: 150, natto: 1, egg: 1, rice: RICE_150, miso: 0.15 },
    defaultPerWeek: 2,
  },
  {
    id: 'dinner-c', slot: 'dinner', variant: 'C', title: '牛赤身と野菜の炒めもの', hasImage: true, kcal: 640,
    items: ['牛もも肉と玉ねぎ・ピーマンの炒めもの（牛肉150g）', 'ご飯 150g', 'デザート：ギリシャヨーグルト 100g'],
    tip: '赤身肉は鉄分・亜鉛もとれる。焼肉のたれ少量で炒めるだけ。',
    tracker: { beef: 3, greek_yogurt: 1 },
    shopping: { beef: 150, onion_pepper: 100, greek_yogurt: 100, rice: RICE_150 },
    defaultPerWeek: 1,
  },
  {
    id: 'dinner-d', slot: 'dinner', variant: 'D', title: '豚もも肉の冷しゃぶ', hasImage: true, kcal: 550,
    items: ['豚もも肉の冷しゃぶ（しゃぶしゃぶ用150g）', '豆腐 150g', 'レタス・きゅうり・トマト・大根おろし', 'ポン酢', 'ご飯 150g'],
    tip: '豚肉は沸騰直前のお湯でさっと茹でて冷水にとる。茹でて冷蔵すれば2日もつので作り置きにも。たれはごまだれではなくポン酢で（約100kcal減）。',
    tracker: { pork: 3, tofu: 1.5 },
    shopping: { pork_shabu: 150, tofu: 150, salad: 100, rice: RICE_150 },
    defaultPerWeek: 2,
  },
  // ── 間食 ──
  {
    id: 'snack-protein', slot: 'snack', variant: '', title: 'プロテイン1杯', hasImage: false, kcal: 120,
    items: ['プロテイン1杯（水で割る）'],
    tip: 'トレーニングの日は必ず。トレーニング後30〜60分以内に。',
    tracker: { protein: 1 },
    shopping: { protein: 1 },
    defaultPerWeek: 7,
  },
];

/** 定番 (A〜D) 以外の参考メニュー。写真のギャラリーで見せる (買い物リストには入れない) */
export const EXTRA_MEALS: MealPattern[] = [
  {
    id: 'extra-khao-man-gai', slot: 'dinner', variant: '', category: 'rice', title: 'カオマンガイ', hasImage: true, kcal: 620,
    items: ['鶏むね肉 150g（皮なし）', '鶏の茹で汁で炊いたご飯 180g', 'きゅうり・パクチー', 'たれ（しょうゆ・酢・生姜・にんにく）'],
    tip: '鶏ももの皮つきだと約200kcal増えるので、減量期は鶏むねで。炊飯器にお米・茹で汁・鶏むねを入れて炊けば一度に完成。',
    tracker: { chicken_breast: 3 },
    shopping: {},
    defaultPerWeek: 0,
  },
  {
    id: 'extra-gapao', slot: 'dinner', variant: '', category: 'rice', title: 'ガパオライス', hasImage: true, kcal: 650,
    items: ['鶏むねひき肉 150g', '目玉焼き 1個', 'パプリカ・玉ねぎ・バジル', 'ご飯 150g'],
    tip: '鶏ももひき肉や合いびき肉は脂が多いので、鶏むねひき肉を選ぶ。炒め油は小さじ1。ナンプラー・オイスターソースで味つけ。',
    tracker: { chicken_breast: 3, egg: 1 },
    shopping: {},
    defaultPerWeek: 0,
  },
  {
    id: 'extra-hamburg', slot: 'dinner', variant: '', category: 'rice', title: '冷凍ハンバーグ定食', hasImage: true, kcal: 720,
    items: ['冷凍ハンバーグ 1個（150g）', '目玉焼き 1個', '冷奴（豆腐150g）', 'ブロッコリー', 'ご飯 150g'],
    tip: '冷凍ハンバーグは脂が多くタンパク質は少なめ（150gで約20g）。卵と豆腐を足して35g以上に。成分表示でタンパク質が100gあたり15g以上のもの、または豆腐・鶏むねハンバーグを選ぶ。',
    tracker: { egg: 1, tofu: 1.5 },
    extraProtein: 20,
    shopping: {},
    defaultPerWeek: 0,
  },
  {
    id: 'extra-buta-kimchi', slot: 'dinner', variant: '', category: 'rice', title: '豚キムチ丼（温玉のせ）', hasImage: true, kcal: 600,
    items: ['豚もも肉 150g', 'キムチ 100g', '玉ねぎ・ニラ', '温泉卵 1個', 'ご飯 150g'],
    tip: '10分で完成。フライパン1つで豚ももを炒め、キムチと野菜を加えるだけ。冷しゃぶ用の豚ももを使い回せる。キムチは塩分が多いので、汁物は薄味に。',
    tracker: { pork: 3, egg: 1 },
    shopping: {},
    defaultPerWeek: 0,
  },
  {
    id: 'extra-mapo-don', slot: 'dinner', variant: '', category: 'rice', title: '鶏むね麻婆豆腐丼', hasImage: true, kcal: 600,
    items: ['木綿豆腐 300g', '鶏むねひき肉 100g', '豆板醤（トウバンジャン）・花椒（ホアジャオ）', 'ねぎ', 'ご飯 150g'],
    tip: 'タンパク質がいちばん多いメニュー。豆腐で量が増えて満腹になる。多めに作って翌日のお弁当にも。辛さは豆板醤で足し、ラー油は小さじ1まで。',
    tracker: { tofu: 3, chicken_breast: 2 },
    shopping: {},
    defaultPerWeek: 0,
  },
  {
    id: 'extra-dakgalbi-don', slot: 'dinner', variant: '', category: 'rice', title: 'タッカルビ丼（鶏むね）', hasImage: true, kcal: 600,
    items: ['鶏むね肉 150g', 'キャベツ・玉ねぎ', 'コチュジャンだれ（コチュジャン・しょうゆ・にんにく）', 'ご飯 150g'],
    tip: '甘辛でご飯がよく合う。ご飯は盛る前に150gと決めておく。チーズを乗せるなら、とろけるチーズ1枚（約60kcal）まで。',
    tracker: { chicken_breast: 3 },
    shopping: {},
    defaultPerWeek: 0,
  },
  // ── 麺 ── (タンパク質は麺の分を含まない。麺の分で +6〜11g)
  {
    id: 'extra-jajamen', slot: 'dinner', variant: '', category: 'noodle', title: 'ジャージャー麺', hasImage: true, kcal: 650,
    items: ['中華麺 1玉', '肉みそ（鶏むね か 豚赤身ひき肉 150g）', 'きゅうり・もやし', '温泉卵 1個'],
    tip: '合いびき肉は脂が多いので、鶏むねか豚赤身のひき肉に。甜麺醤（テンメンジャン）は糖分が多いので控えめにし、炒め油は小さじ1。肉みそは作り置きOK。',
    tracker: { pork: 3, egg: 1 },
    shopping: {},
    defaultPerWeek: 0,
  },
  {
    id: 'extra-curry-udon', slot: 'dinner', variant: '', category: 'noodle', title: 'カレーうどん（改良版）', hasImage: true, kcal: 650,
    items: ['うどん 1玉', '低脂質のレトルトカレー 1袋', 'サラダチキン 100g', '卵 1個', 'ねぎ'],
    tip: 'ふつうのレトルトカレーは脂が多く、肉はほとんど入っていない（タンパク質5g前後）。「脂質○g以下」のものを選び、サラダチキンと卵を足すのがポイント。',
    tracker: { chicken_breast: 2, egg: 1 },
    shopping: {},
    defaultPerWeek: 0,
  },
  {
    id: 'extra-natto-soba', slot: 'dinner', variant: '', category: 'noodle', title: '納豆そば', hasImage: true, kcal: 600,
    items: ['そば 1玉', '納豆 2パック', '温泉卵 1個', 'サラダチキン 80g', 'ねぎ・大根おろし'],
    tip: '麺の中で一番おすすめ。そばはタンパク質が多めで、血糖値も上がりにくい。いつもの納豆そばに卵とサラダチキンを足すだけ。',
    tracker: { natto: 2, egg: 1, chicken_breast: 1.6 },
    shopping: {},
    defaultPerWeek: 0,
  },
  {
    id: 'extra-tomato-pasta', slot: 'dinner', variant: '', category: 'noodle', title: '鶏むねときのこのトマトパスタ', hasImage: true, kcal: 600,
    items: ['パスタ 乾麺80g', '鶏むね肉 150g', 'トマト缶 1/2缶', 'きのこ・ほうれん草', 'オリーブオイル 小さじ1'],
    tip: 'クリーム系やカルボナーラは脂が多いので、トマトか和風に。乾麺を100g→80gにするだけで約70kcal減。',
    tracker: { chicken_breast: 3 },
    shopping: {},
    defaultPerWeek: 0,
  },
  {
    id: 'extra-ramen', slot: 'dinner', variant: '', category: 'noodle', title: '鶏むねのせ野菜ラーメン', hasImage: true, kcal: 650,
    items: ['袋麺 か チルド麺 1玉', 'サラダチキン 100g（チャーシューの代わり）', 'ゆで卵 2個', 'もやし・ねぎ たっぷり'],
    tip: 'スープは半分残す。外のラーメンは週1回までにして、「麺少なめ・味玉追加」で注文。チャーハンやライスは付けない。',
    tracker: { chicken_breast: 2, egg: 2 },
    shopping: {},
    defaultPerWeek: 0,
  },
  {
    id: 'extra-niku-udon', slot: 'dinner', variant: '', category: 'noodle', title: '肉うどん（肉そば）', hasImage: true, kcal: 550,
    items: ['うどん か そば 1玉', '牛もも か 豚もも薄切り 120g（甘辛煮）', '卵 1個', 'ねぎ・わかめ'],
    tip: '赤身の薄切り肉を、しょうゆ・みりんでさっと煮て乗せるだけ。冷しゃぶ用の豚ももを使い回せる。',
    tracker: { beef: 2.4, egg: 1 },
    shopping: {},
    defaultPerWeek: 0,
  },
];

export const SLOT_LABELS: Record<MealSlot, { label: string; icon: string }> = {
  breakfast: { label: '朝', icon: '🌅' },
  lunch: { label: '昼', icon: '☀️' },
  dinner: { label: '夜', icon: '🌙' },
  snack: { label: '間食', icon: '🥤' },
};

const proteinPerUnit = new Map<string, number>(FOODS.map(f => [f.key, f.protein]));

/** タンパク質トラッカーと同じ計算 (ご飯などの主食は含まない) */
export function mealProtein(meal: MealPattern): number {
  const total = Object.entries(meal.tracker).reduce((sum, [key, qty]) => sum + (proteinPerUnit.get(key) ?? 0) * (qty ?? 0), 0)
    + (meal.extraProtein ?? 0);
  return Math.round(total);
}

export function mealImageUrl(meal: MealPattern): string {
  return meal.hasImage ? `/images/meals/${meal.id}.jpg` : '';
}

export type WeeklyCounts = Record<string, number>;

export function defaultWeeklyCounts(): WeeklyCounts {
  return Object.fromEntries(MEAL_PATTERNS.map(m => [m.id, m.defaultPerWeek]));
}

export interface ShoppingLine {
  item: ShopItem;
  amount: number;
}

/** 週の回数から、買う食材の合計を出す */
export function buildShoppingList(counts: WeeklyCounts): ShoppingLine[] {
  const totals = new Map<string, number>();
  MEAL_PATTERNS.forEach(meal => {
    const times = counts[meal.id] ?? 0;
    if (!times) return;
    Object.entries(meal.shopping).forEach(([key, amount]) => {
      totals.set(key, (totals.get(key) ?? 0) + (amount ?? 0) * times);
    });
  });
  const order = Object.keys(SHOP_ITEMS);
  return Array.from(totals.entries())
    .filter(([, amount]) => amount > 0)
    .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
    .map(([key, amount]) => ({ item: SHOP_ITEMS[key], amount }));
}

/** 「1,200g（約1.2kg）」「卵 13個 → 2パック」などの表示 */
export function formatAmount(line: ShoppingLine): { amount: string; hint: string } {
  const { item, amount } = line;
  let text: string;
  if (item.unit === 'g' && amount >= 1000) text = `${(Math.round(amount / 100) / 10).toLocaleString()}kg`;
  else if (item.unit === 'ml' && amount >= 1000) text = `${(Math.round(amount / 100) / 10).toLocaleString()}L`;
  else if (item.unit === '袋') text = '1袋';
  else text = `${Math.round(amount).toLocaleString()}${item.unit}`;
  if (item.key === 'rice') text = `${Math.round(amount / 10) * 10}g`;

  let hint = '';
  if (item.pack && item.unit !== '袋') {
    const packs = amount / item.pack.size;
    hint = item.key === 'rice'
      ? `約${(Math.round(packs * 2) / 2).toLocaleString()}${item.pack.label}`
      : `${Math.ceil(packs)}${item.pack.label}`;
  }
  return { amount: text, hint };
}

export const SHOP_CATEGORIES: ShopCategory[] = ['肉・魚', '卵・乳製品・大豆', '主食・果物', '野菜', '常備品'];

/** 週末の作り置き手順 */
export const MEAL_PREP_STEPS = [
  { icon: '🍗', title: '鶏むね肉をまとめて茹でる', body: '沸騰したお湯に入れて火を止め、フタをして20分。150g・100gずつ小分けにして冷凍（昼A・昼C用）。' },
  { icon: '🥚', title: 'ゆで卵を10個作る', body: '沸騰後8分で半熟〜固ゆで。殻をむいて保存容器へ。冷蔵で4日もつ（朝A・朝B・昼A用）。' },
  { icon: '🥩', title: '肉に下味をつけて冷凍', body: '鶏もも（照り焼き）・豚（生姜焼き）・牛（焼肉のたれ）を1食分ずつ袋に入れて冷凍。夜は焼くだけ。' },
  { icon: '🍚', title: 'ご飯をまとめて炊く', body: '150g・180gずつラップで包んで冷凍。量を決めておくとカロリーがぶれない。' },
  { icon: '🥦', title: '野菜は「切ってある・冷凍」で楽をする', body: '冷凍ブロッコリー・千切りキャベツ・カット野菜を活用。洗う・切る手間をなくす。' },
];
