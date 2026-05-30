'use client';

import { DaySchedule } from '@/types';

interface Props {
  schedule: DaySchedule[];
  activeDayIndex: number;
  onDayChange: (index: number) => void;
}

export default function DayTabs({ schedule, activeDayIndex, onDayChange }: Props) {
  return (
    <div className="day-tabs-wrap">
      <div className="day-tabs">
        {schedule.map((daySchedule, i) => (
          <div
            key={daySchedule.label}
            className={`day-tab${i === activeDayIndex ? ' active' : ''}${daySchedule.isRest ? ' rest' : ''}`}
            onClick={() => onDayChange(i)}
          >
            <span className="day-name">{daySchedule.day}</span>
            <span className="day-sep" />
            <span className="day-sub">{daySchedule.muscleGroup}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
