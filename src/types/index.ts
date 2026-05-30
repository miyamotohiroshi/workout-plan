export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  icon: string;
  description: string;
  points: string[];
  youtubeUrl: string;
  imageUrl: string;
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
