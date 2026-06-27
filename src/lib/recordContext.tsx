'use client';
import { createContext, useContext } from 'react';

export type PendingRecord = {
  exerciseName: string;
  weight: number;
  reps: number;
  sets: number;
};

type RecordContextType = {
  navigateToRecord: (record: PendingRecord) => void;
};

export const RecordContext = createContext<RecordContextType>({
  navigateToRecord: () => {},
});

export function useRecordContext() {
  return useContext(RecordContext);
}
