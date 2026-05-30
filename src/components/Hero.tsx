'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { SLIDE_IMAGES } from '@/lib/trainingData';

export default function Hero() {
  const [slideIdx, setSlideIdx] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 700);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const goSlide = useCallback((n: number) => {
    setSlideIdx(n);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % SLIDE_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero">
      {SLIDE_IMAGES.map((src, i) => (
        <div key={i} className={`slide${i === slideIdx ? ' active' : ''}`}>
          {isDesktop ? (
            <>
              <div
                className="slide-blur"
                style={{ backgroundImage: `url('${src}')` }}
              />
              <div
                className="slide-clear"
                style={{ backgroundImage: `url('${src}')` }}
              />
            </>
          ) : (
            <Image
              src={src}
              alt={`Slide ${i + 1}`}
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              priority={i === 0}
            />
          )}
        </div>
      ))}
      <div className="hero-overlay">
        <div className="hero-title">マッチョ計画 💪</div>
        <div className="hero-sub">ラグビー選手体型を目指す 1年計画</div>
      </div>
      <div className="slide-dots">
        {SLIDE_IMAGES.map((_, i) => (
          <div
            key={i}
            className={`dot${i === slideIdx ? ' active' : ''}`}
            onClick={() => goSlide(i)}
          />
        ))}
      </div>
    </div>
  );
}
