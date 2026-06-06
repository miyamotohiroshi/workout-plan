'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Exercise } from '@/types';

type EquipmentCategory = 'barbell' | 'dumbbell' | 'machine' | 'bodyweight' | 'core';

export type ExerciseHistorySummary = {
  latest?: {
    weight: number;
    reps: number;
    sets: number;
  };
  pb?: number;
};

interface Props {
  exercise: Exercise;
  history?: ExerciseHistorySummary;
}

function getEquipmentCategory(name: string): EquipmentCategory {
  if (/マシン|スミス|ラットプル|レッグプレス|レッグカール|レッグエクステンション/.test(name)) return 'machine';
  if (/ディップス|自重/.test(name)) return 'bodyweight';
  if (/レッグレイズ|プランク/.test(name)) return 'core';
  if (/バーベル|デッドリフト|デットリフト/.test(name)) return 'barbell';
  if (/ダンベル|ショルダー・プレス|ショルダープレス/.test(name)) return 'dumbbell';
  return 'bodyweight';
}

function EquipmentIcon({ category }: { category: EquipmentCategory }) {
  const iconProps = {
    viewBox: '0 0 40 40',
    'aria-hidden': true,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 3,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (category === 'barbell') {
    return (
      <svg {...iconProps}>
        <path d="M5 20h30M8 14v12M12 12v16M28 12v16M32 14v12" />
      </svg>
    );
  }

  if (category === 'dumbbell') {
    return (
      <svg {...iconProps}>
        <path d="M8 14h12M7 11v6M11 10v8M20 10v8M24 11v6" />
        <path d="M16 26h12M15 23v6M19 22v8M28 22v8M32 23v6" />
      </svg>
    );
  }

  if (category === 'machine') {
    return (
      <svg {...iconProps}>
        <path d="M12 30V10h16v20M16 14h8M20 14v8M15 30h10M20 22l-5 6M20 22l5 6" />
        <circle cx="20" cy="22" r="2.5" />
      </svg>
    );
  }

  if (category === 'core') {
    return (
      <svg {...iconProps}>
        <path d="M20 8c-5 4-8 9-8 15a8 8 0 0 0 16 0c0-6-3-11-8-15Z" />
        <path d="M16 19h8M16 24h8" />
      </svg>
    );
  }

  return (
    <svg {...iconProps}>
      <circle cx="20" cy="9" r="4" />
      <path d="M20 13v10M12 17h16M15 31l5-8 5 8" />
    </svg>
  );
}

export default function ExerciseCard({ exercise, history }: Props) {
  const [open, setOpen] = useState(false);
  const latest = history?.latest;
  const equipmentCategory = getEquipmentCategory(exercise.name);

  return (
    <div className={`exercise-card${open ? ' open' : ''}`}>
      <div className="exercise-header" onClick={() => setOpen(!open)}>
        <div className={`ex-icon ${equipmentCategory}`}>
          <EquipmentIcon category={equipmentCategory} />
        </div>
        <div className="ex-meta">
          <div className="ex-name">{exercise.name}</div>
          <div className="ex-set">{exercise.sets}セット × {exercise.reps}</div>
        </div>
        <div className={`ex-chevron${open ? ' open' : ''}`} aria-hidden="true" />
      </div>
      <div className="exercise-detail">
        <div className="exercise-detail-inner">
          {exercise.imageUrl && (
            <div style={{ width: '100%', height: 180, position: 'relative', marginBottom: 12, borderRadius: 10, overflow: 'hidden' }}>
              <Image
                src={exercise.imageUrl}
                alt={exercise.name}
                fill
                style={{ objectFit: 'contain' }}
                className="ex-img"
                unoptimized
              />
            </div>
          )}
          <p className="ex-desc">{exercise.description}</p>
          <ul className="ex-points">
            {exercise.points.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
          {latest && (
            <div className="exercise-history">
              <div className="exercise-history-item">
                <span className="exercise-history-label">前回</span>
                <strong>{latest.weight}kg × {latest.reps}rep × {latest.sets}set</strong>
              </div>
              <div className="exercise-history-item">
                <span className="exercise-history-label">PB</span>
                <strong>{history?.pb ?? latest.weight}kg</strong>
              </div>
            </div>
          )}
          <a
            className="yt-btn"
            href={exercise.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            ▶ YouTube で解説を見る
          </a>
        </div>
      </div>
    </div>
  );
}
