'use client';

type Tab = 'menu' | 'goal' | 'diet' | 'supp' | 'record';

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const MenuIcon = ({ active }: { active: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="14" r="8" fill={active ? '#2F7DF6' : '#94a3b8'}/>
    <rect x="16" y="26" width="32" height="9" rx="4.5" fill={active ? '#2F7DF6' : '#94a3b8'}/>
    <rect x="11" y="28" width="5" height="18" rx="2.5" fill={active ? '#2F7DF6' : '#94a3b8'}/>
    <rect x="48" y="28" width="5" height="18" rx="2.5" fill={active ? '#2F7DF6' : '#94a3b8'}/>
    <rect x="24" y="35" width="16" height="21" rx="5" fill={active ? '#2F7DF6' : '#94a3b8'}/>
  </svg>
);

const GoalIcon = ({ active }: { active: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="10" width="4" height="42" rx="2" fill={active ? '#4B5563' : '#94a3b8'}/>
    <path d="M24 14C32 10 40 18 48 14V34C40 38 32 30 24 34V14Z" fill={active ? '#FF4B3E' : '#94a3b8'}/>
    <path d="M14 52H34C37 52 40 55 40 58H8C8 55 11 52 14 52Z" fill={active ? '#FF4B3E' : '#94a3b8'}/>
  </svg>
);

const DietIcon = ({ active }: { active: boolean }) => (
  <svg width="31" height="31" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 34H52C50 47 42 54 32 54C22 54 14 47 12 34Z" fill={active ? '#D8D2C8' : '#cbd5e1'}/>
    <path d="M17 34C19 25 27 20 33 25C38 17 49 21 50 34H17Z" fill={active ? '#69BE3B' : '#94a3b8'}/>
    <circle cx="27" cy="33" r="6" fill={active ? '#FF4B3E' : '#94a3b8'}/>
    <circle cx="39" cy="32" r="6" fill={active ? '#FF4B3E' : '#94a3b8'}/>
    <circle cx="27" cy="33" r="2" fill="#FFFFFF"/>
    <circle cx="39" cy="32" r="2" fill="#FFFFFF"/>
    <path d="M24 25L21 18" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
    <path d="M38 24L41 17" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
    <path d="M46 29C49 25 52 24 55 25" stroke={active ? '#4DAE35' : '#94a3b8'} strokeWidth="5" strokeLinecap="round"/>
  </svg>
);

const SuppIcon = ({ active }: { active: boolean }) => (
  <svg width="31" height="31" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect x="23" y="18" width="18" height="36" rx="4" fill={active ? '#D9DDE3' : '#cbd5e1'}/>
    <rect x="20" y="13" width="24" height="8" rx="3" fill={active ? '#2F7DF6' : '#94a3b8'}/>
    <rect x="24" y="9" width="6" height="6" rx="2" fill={active ? '#2F7DF6' : '#94a3b8'}/>
    <rect x="34" y="9" width="6" height="6" rx="2" fill={active ? '#2F7DF6' : '#94a3b8'}/>
    <path d="M34 27L25 40H32L29 51L40 36H33L34 27Z" fill={active ? '#2F7DF6' : '#94a3b8'}/>
  </svg>
);

const RecordIcon = ({ active }: { active: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="11" width="34" height="44" rx="6" fill="#F8FAFC" stroke={active ? '#C9CED6' : '#cbd5e1'} strokeWidth="3"/>
    <rect x="22" y="7" width="4" height="11" rx="2" fill={active ? '#6B7280' : '#94a3b8'}/>
    <rect x="31" y="7" width="4" height="11" rx="2" fill={active ? '#6B7280' : '#94a3b8'}/>
    <rect x="40" y="7" width="4" height="11" rx="2" fill={active ? '#6B7280' : '#94a3b8'}/>
    <rect x="23" y="25" width="18" height="4" rx="2" fill={active ? '#C9CED6' : '#e2e8f0'}/>
    <rect x="23" y="36" width="18" height="4" rx="2" fill={active ? '#C9CED6' : '#e2e8f0'}/>
    <circle cx="48" cy="46" r="12" fill={active ? '#2F7DF6' : '#94a3b8'}/>
    <path d="M48 39V53" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round"/>
    <path d="M41 46H55" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

const TABS: { id: Tab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
  { id: 'menu',   label: 'メニュー', Icon: MenuIcon },
  { id: 'goal',   label: '目標',     Icon: GoalIcon },
  { id: 'diet',   label: '食事',     Icon: DietIcon },
  { id: 'supp',   label: 'サプリ',   Icon: SuppIcon },
  { id: 'record', label: '記録',     Icon: RecordIcon },
];

export default function MainNav({ activeTab, onTabChange }: Props) {
  return (
    <nav className="main-nav">
      <div className="main-tabs">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`main-tab${active ? ' active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <tab.Icon active={active} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
