'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Exercise } from '@/types';

interface Props {
  exercise: Exercise;
}

export default function ExerciseCard({ exercise }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`exercise-card${open ? ' open' : ''}`}>
      <div className="exercise-header" onClick={() => setOpen(!open)}>
        <div className="ex-icon">{exercise.icon}</div>
        <div className="ex-meta">
          <div className="ex-name">{exercise.name}</div>
          <div className="ex-set">{exercise.sets}セット × {exercise.reps}</div>
        </div>
        <div className="ex-chevron">›</div>
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
