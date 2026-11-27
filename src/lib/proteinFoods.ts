// タンパク質トラッカーの食品リスト (1単位あたりのタンパク質 g)。定番ごはんの計算でも使う。
export const FOODS = [
  { key: 'protein',       label: 'プロテイン',        unit: '1杯',     protein: 25  },
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
  { key: 'greek_yogurt',  label: 'ギリシャヨーグルト',unit: '100g',    protein: 10  },
  { key: 'yogurt',        label: '通常ヨーグルト',    unit: '100g',    protein: 3   },
] as const;

export type FoodKey = (typeof FOODS)[number]['key'];
