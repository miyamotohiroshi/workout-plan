'use client';

type Tab = 'menu' | 'goal' | 'diet' | 'supp' | 'record';

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'menu', icon: '🏋️', label: 'メニュー' },
  { id: 'goal', icon: '🎯', label: '目標' },
  { id: 'diet', icon: '🥗', label: '食事' },
  { id: 'supp', icon: '💊', label: 'サプリ' },
  { id: 'record', icon: '📊', label: '記録' },
];

export default function MainNav({ activeTab, onTabChange }: Props) {
  return (
    <nav className="main-nav">
      <div className="main-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`main-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
