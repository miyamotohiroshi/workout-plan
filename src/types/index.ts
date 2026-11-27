/** メニュー内での役割: メイン / 補助 / 仕上げ / 腹筋 */
export type ExerciseRole = 'main' | 'sub' | 'finish' | 'core';

export interface Exercise {
  id?: string;
  name: string;
  sets: number;
  reps: string;
  icon: string;
  description: string;
  points: string[];
  youtubeUrl: string;
  imageUrl: string;
  role?: ExerciseRole;
  /** セット間の休憩時間 (例: '2〜3分') */
  rest?: string;
  /** 重量を上げる目安 */
  progression?: string;
  part?: string;
  equipment?: string;
}

export interface DaySchedule {
  day: string;
  label: string;
  muscleGroup: string;
  gymType: 'free' | 'machine' | 'rest';
  exercises: Exercise[];
  isRest: boolean;
  restMessage?: string;
  restIcon?: string;
  restTitle?: string;
  headerIcon?: string;
  headerTitle?: string;
  headerVolume?: string;
  /** マシンのジムに行けた日に切り替えて使うメニュー */
  machineVariant?: {
    headerTitle: string;
    headerVolume: string;
    exercises: Exercise[];
  };
}

export interface TrainingPattern {
  id: 'a' | 'b';
  name: string;
  description: string;
  schedule: DaySchedule[];
}

export interface BodyRecord {
  id: string;
  date: string;
  weight: number;
  chest?: number;
  shoulder?: number;
  arm?: number;
  thigh?: number;
}

export interface ExerciseRecord {
  id: string;
  date: string;
  exerciseName: string;
  weight: number;
  reps: number;
  sets: number;
}

export interface Photo {
  id: string;
  date: string;
  memo: string;
  url: string;
}

export interface Checkin {
  id: string;
  week: string;
  days: string[];
  weight?: number;
  memo?: string;
}
