'use client';

type Tab = 'menu' | 'goal' | 'diet' | 'supp' | 'record';

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const MenuIcon = ({ active }: { active: boolean }) => (
  <svg width="31" height="31" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="18" y="28" width="28" height="8" rx="2" fill={active ? '#2F7DF6' : '#94a3b8'} />
    <rect x="10" y="20" width="8" height="24" rx="4" fill={active ? '#2F7DF6' : '#94a3b8'} />
    <rect x="46" y="20" width="8" height="24" rx="4" fill={active ? '#2F7DF6' : '#94a3b8'} />
    <rect x="5" y="26" width="6" height="12" rx="3" fill={active ? '#2F7DF6' : '#94a3b8'} />
    <rect x="53" y="26" width="6" height="12" rx="3" fill={active ? '#2F7DF6' : '#94a3b8'} />
  </svg>
);

const GoalIcon = ({ active }: { active: boolean }) => (
  <svg width="31" height="31" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="10" width="5" height="46" rx="2.5" fill={active ? '#4B5563' : '#94a3b8'} />
    <circle cx="17.5" cy="9" r="5" fill={active ? '#4B5563' : '#94a3b8'} />
    <path d="M20 15C30 10 39 20 49 15V38C39 43 30 33 20 38V15Z" fill={active ? '#FF3B30' : '#94a3b8'} />
  </svg>
);

const DietIcon = ({ active }: { active: boolean }) => (
  <svg width="31" height="31" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 30C16 18 24 11 32 11C40 11 48 18 49 30H15Z" fill={active ? '#FFFFFF' : '#f8fafc'} stroke={active ? '#D8DCE3' : '#cbd5e1'} strokeWidth="4" />
    <circle cx="24" cy="25" r="2.2" fill={active ? '#D8DCE3' : '#94a3b8'} />
    <circle cx="32" cy="21" r="2.2" fill={active ? '#D8DCE3' : '#94a3b8'} />
    <circle cx="40" cy="25" r="2.2" fill={active ? '#D8DCE3' : '#94a3b8'} />
    <circle cx="29" cy="31" r="2.2" fill={active ? '#D8DCE3' : '#94a3b8'} />
    <circle cx="37" cy="32" r="2.2" fill={active ? '#D8DCE3' : '#94a3b8'} />
    <path d="M12 31H52C50 45 42 53 32 53C22 53 14 45 12 31Z" fill={active ? '#FFD35A' : '#cbd5e1'} />
    <path d="M20 54H44V58C44 60 42 61 40 61H24C22 61 20 60 20 58V54Z" fill={active ? '#F5A623' : '#94a3b8'} />
  </svg>
);

const SuppIcon = ({ active }: { active: boolean }) => (
  <svg width="31" height="31" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="22" y="16" width="20" height="38" rx="4" fill={active ? '#F8FAFC' : '#f8fafc'} stroke={active ? '#8E6BE8' : '#94a3b8'} strokeWidth="4" />
    <rect x="17" y="20" width="30" height="9" rx="3" fill={active ? '#8E6BE8' : '#94a3b8'} />
    <rect x="21" y="8" width="22" height="7" rx="2" fill={active ? '#8E6BE8' : '#94a3b8'} />
    <path d="M42 17C51 17 55 23 55 30" stroke={active ? '#8E6BE8' : '#94a3b8'} strokeWidth="5" strokeLinecap="round" />
    <rect x="28" y="35" width="12" height="4" rx="2" fill={active ? '#8E6BE8' : '#94a3b8'} />
    <rect x="28" y="43" width="9" height="4" rx="2" fill={active ? '#8E6BE8' : '#94a3b8'} />
    <rect x="28" y="51" width="12" height="4" rx="2" fill={active ? '#8E6BE8' : '#94a3b8'} />
  </svg>
);

const RecordIcon = ({ active }: { active: boolean }) => (
  <svg width="31" height="31" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="13" y="10" width="36" height="46" rx="7" fill="#F8FAFC" stroke={active ? '#4B5563' : '#94a3b8'} strokeWidth="4" />
    <rect x="20" y="6" width="5" height="13" rx="2.5" fill={active ? '#4B5563' : '#94a3b8'} />
    <rect x="31" y="6" width="5" height="13" rx="2.5" fill={active ? '#4B5563' : '#94a3b8'} />
    <rect x="42" y="6" width="5" height="13" rx="2.5" fill={active ? '#4B5563' : '#94a3b8'} />
    <rect x="23" y="26" width="20" height="4" rx="2" fill={active ? '#A8B0BC' : '#cbd5e1'} />
    <rect x="23" y="37" width="18" height="4" rx="2" fill={active ? '#A8B0BC' : '#cbd5e1'} />
    <rect x="23" y="48" width="14" height="4" rx="2" fill={active ? '#A8B0BC' : '#cbd5e1'} />
    <circle cx="49" cy="47" r="13" fill={active ? '#4CAF50' : '#94a3b8'} />
    <path d="M49 39V55" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
    <path d="M41 47H57" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const TABS: { id: Tab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
  { id: 'menu',   label: 'メニュー', Icon: MenuIcon },
  { id: 'goal',   label: '目標',     Icon: GoalIcon },
  { id: 'supp',   label: 'サプリ',   Icon: SuppIcon },
  { id: 'diet',   label: '食事',     Icon: DietIcon },
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
              <span className="main-tab-icon">
                <tab.Icon active={active} />
              </span>
              <span className="main-tab-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
