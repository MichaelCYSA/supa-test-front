import { useGameStore } from '../../store/useGameStore';

const TABS = [
  { id: 'main', emoji: '⚡', label: 'Tap' },
  { id: 'buildings', emoji: '🏚️', label: 'Build' },
  { id: 'heroes', emoji: '🧙', label: 'Heroes' },
  { id: 'tasks', emoji: '📋', label: 'Quests' },
  { id: 'shop', emoji: '💎', label: 'Shop' },
];

export default function BottomNav() {
  const { activeTab, setTab } = useGameStore();

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 70,
      background: 'rgba(10,0,21,0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(124,58,237,0.2)',
      display: 'flex',
      alignItems: 'center',
      zIndex: 200,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {TABS.map(tab => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              height: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative',
            }}
          >
            {active && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 40,
                height: 2,
                background: 'linear-gradient(90deg, #7c3aed, #c084fc)',
                borderRadius: '0 0 4px 4px',
              }} />
            )}
            <span style={{
              fontSize: 22,
              filter: active ? 'drop-shadow(0 0 8px rgba(192,132,252,0.8))' : 'grayscale(0.5) opacity(0.6)',
              transition: 'all 0.2s',
              transform: active ? 'scale(1.1)' : 'scale(1)',
            }}>
              {tab.emoji}
            </span>
            <span style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: 0.5,
              color: active ? '#c084fc' : '#4a3a6a',
              textTransform: 'uppercase',
              transition: 'color 0.2s',
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
