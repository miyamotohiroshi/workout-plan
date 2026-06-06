'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { PATTERN_A, PATTERN_B } from '@/lib/trainingData';
import DayTabs from '@/components/training/DayTabs';
import ExerciseCard, { ExerciseHistorySummary } from '@/components/training/ExerciseCard';
import { TrainingPattern, DaySchedule } from '@/types';

type ExerciseRecord = {
  exercise_name: string;
  date: string;
  weight: number;
  reps: number;
  sets: number;
};

type ExerciseHistoryMap = Record<string, ExerciseHistorySummary>;

const BODY_PART_IMAGES: Record<string, string> = {
  'a-mon': '/bodyParts/shoulder.jpg',
  'a-tue': '/bodyParts/legs__machine.jpg',
  'a-thu': '/bodyParts/back.jpg',
  'a-fri': '/bodyParts/chest.jpg',
  'b-mon': '/bodyParts/shoulder.jpg',
  'b-thu': '/bodyParts/legs.jpg',
  'b-fri': '/bodyParts/back-chest.jpg',
  'b-sun': '/bodyParts/sholder-legs__machine.jpg',
};

function getBodyPartTitle(title: string) {
  return title.replace(/^[月火水木金土日]曜：/, '');
}

function getBodyPartVolume(volume: string) {
  const [count, duration] = volume.split('／').map(part => part.trim());
  return {
    count: count || '',
    duration: (duration || '').replace(/約(\d+)〜(\d+)分/, '約$1分〜$2分'),
  };
}

function DayPanel({
  daySchedule,
  patternId,
  exerciseHistory,
}: {
  daySchedule: DaySchedule;
  patternId: string;
  exerciseHistory: ExerciseHistoryMap;
}) {
  if (daySchedule.isRest) {
    return (
      <div className="training-panel active">
        <div className="rest-card">
          <div className="rest-icon">{daySchedule.restIcon}</div>
          <h3>{daySchedule.restTitle}</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{daySchedule.restMessage}</p>
        </div>
      </div>
    );
  }

  const gymType = daySchedule.gymType;
  const imageSrc = BODY_PART_IMAGES[`${patternId}-${daySchedule.label}`];
  const bodyPartTitle = getBodyPartTitle(daySchedule.headerTitle ?? daySchedule.muscleGroup);
  const bodyPartVolume = getBodyPartVolume(daySchedule.headerVolume ?? '');
  const badgeStyle =
    gymType === 'machine'
      ? { background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)' }
      : gymType === 'free'
      ? { background: 'linear-gradient(135deg,#eff6ff,#dbeafe)' }
      : {};

  return (
    <div className="training-panel active">
      {imageSrc ? (
        <div className="body-part-hero">
          <div className="body-part-image" style={{ position: 'relative' }}>
            <Image
              src={imageSrc}
              alt={bodyPartTitle}
              fill
              sizes="180px"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              priority={patternId === 'a' && daySchedule.label === 'mon'}
            />
            <div className="body-part-image-fade" />
          </div>
          <div className="body-part-copy">
            <div className="body-part-kicker">
              {gymType === 'machine' ? 'マシンジム' : 'フリーウェイト'}
            </div>
            <h3>{bodyPartTitle}</h3>
            <div className="body-part-volume">
              <span>{bodyPartVolume.count}</span>
              <i />
              <span>{bodyPartVolume.duration}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="day-header">
          <div className="day-badge" style={badgeStyle}>
            {daySchedule.headerIcon}
          </div>
          <div className="day-info">
            <div className={`gym-tag${gymType === 'machine' ? ' machine' : ''}`}>
              {gymType === 'machine' ? '★ マシンジム' : '🏠 フリーウェイト'}
            </div>
            <h3>{daySchedule.headerTitle}</h3>
            <div className="volume">{daySchedule.headerVolume}</div>
          </div>
        </div>
      )}
      {daySchedule.exercises.map((ex, i) => (
        <ExerciseCard key={i} exercise={ex} history={exerciseHistory[ex.name]} />
      ))}
    </div>
  );
}

function PatternSection({ pattern, exerciseHistory }: { pattern: TrainingPattern; exerciseHistory: ExerciseHistoryMap }) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const activeDay = pattern.schedule[activeDayIndex];

  return (
    <div>
      <DayTabs
        schedule={pattern.schedule}
        activeDayIndex={activeDayIndex}
        onDayChange={setActiveDayIndex}
      />
      <DayPanel daySchedule={activeDay} patternId={pattern.id} exerciseHistory={exerciseHistory} />
    </div>
  );
}

export default function MenuPage() {
  const [activePattern, setActivePattern] = useState<'a' | 'b'>('a');
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistoryMap>({});

  useEffect(() => {
    let cancelled = false;

    async function loadExerciseHistory() {
      const { data } = await supabase
        .from('exercise_records')
        .select('exercise_name, date, weight, reps, sets')
        .order('date', { ascending: false });

      if (cancelled) return;

      const next: ExerciseHistoryMap = {};
      (data as ExerciseRecord[] | null)?.forEach(record => {
        const current = next[record.exercise_name];
        if (!current) {
          next[record.exercise_name] = {
            latest: {
              weight: record.weight,
              reps: record.reps,
              sets: record.sets,
            },
            pb: record.weight,
          };
          return;
        }

        current.pb = Math.max(current.pb ?? record.weight, record.weight);
      });
      setExerciseHistory(next);
    }

    loadExerciseHistory();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="container">
      <div className="section">
        <div className="section-title">
          週間<span>トレーニング</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-sub)', marginBottom: 4 }}>
          その週の予定に合わせてパターンを選択
        </div>

        <div className="pattern-toggle">
          <div
            className={`pattern-btn${activePattern === 'a' ? ' active' : ''}`}
            onClick={() => setActivePattern('a')}
          >
            <div className="p-name">Pattern A</div>
            <div className="p-desc">火曜：マシンジム週</div>
          </div>
          <div
            className={`pattern-btn${activePattern === 'b' ? ' active' : ''}`}
            onClick={() => setActivePattern('b')}
          >
            <div className="p-name">Pattern B</div>
            <div className="p-desc">日曜：マシンジム週</div>
          </div>
        </div>
      </div>

      {activePattern === 'a' ? (
        <PatternSection pattern={PATTERN_A} exerciseHistory={exerciseHistory} />
      ) : (
        <PatternSection pattern={PATTERN_B} exerciseHistory={exerciseHistory} />
      )}
    </div>
  );
}
