'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Exercise } from '@/types';

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

export default function ExerciseCard({ exercise, history }: Props) {
  const [open, setOpen] = useState(false);
  const latest = history?.latest;

  return (
    <div className={`exercise-card${open ? ' open' : ''}`}>
      <div className="exercise-header" onClick={() => setOpen(!open)}>
        <div className="ex-icon">{exercise.icon}</div>
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
