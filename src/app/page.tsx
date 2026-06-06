'use client';

import { useState, useEffect, useRef } from 'react';
import Hero from '@/components/Hero';
import MainNav from '@/components/MainNav';
import MenuPage from '@/components/pages/MenuPage';
import GoalPage from '@/components/pages/GoalPage';
import DietPage from '@/components/pages/DietPage';
import SuppPage from '@/components/pages/SuppPage';
import RecordPage from '@/components/pages/RecordPage';

type Tab = 'menu' | 'goal' | 'diet' | 'supp' | 'record';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('menu');
  const activeTabRef = useRef<Tab>('menu');
  const scrollPositionsRef = useRef<Partial<Record<Tab, number>>>({});

  const getNavPinnedScrollY = () => {
    const nav = document.querySelector('.main-nav');
    if (!nav) return 0;
    return nav.getBoundingClientRect().top + window.scrollY;
  };

  useEffect(() => {
    const handleScroll = () => {
      const btn = document.getElementById('scrollTop');
      if (btn) {
        btn.classList.toggle('show', window.scrollY > 300);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabChange = (tab: Tab) => {
    if (tab === activeTabRef.current) return;

    scrollPositionsRef.current[activeTabRef.current] = window.scrollY;
    const fallbackY = getNavPinnedScrollY();
    const nextY = scrollPositionsRef.current[tab] ?? fallbackY;

    activeTabRef.current = tab;
    setActiveTab(tab);
    requestAnimationFrame(() => {
      window.scrollTo({ top: nextY, behavior: 'auto' });
    });
  };

  return (
    <>
      <Hero />
      <MainNav activeTab={activeTab} onTabChange={handleTabChange} />

      <div className={activeTab === 'menu' ? 'page active' : 'page'}>
        <MenuPage />
      </div>
      <div className={activeTab === 'goal' ? 'page active' : 'page'}>
        <GoalPage />
      </div>
      <div className={activeTab === 'diet' ? 'page active' : 'page'}>
        <DietPage />
      </div>
      <div className={activeTab === 'supp' ? 'page active' : 'page'}>
        <SuppPage />
      </div>
      <div className={activeTab === 'record' ? 'page active' : 'page'}>
        <RecordPage />
      </div>

      <footer className="footer">
        毎日7,000〜9,000歩 ✦ 食後10分散歩 ✦ 睡眠7〜8時間<br />
        <span style={{ opacity: 0.5, fontSize: 11, marginTop: 4, display: 'block' }}>マッチョ計画 2025〜2026</span>
      </footer>

      <button
        className="scroll-top"
        id="scrollTop"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        ↑
      </button>
    </>
  );
}
