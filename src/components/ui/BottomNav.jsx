import { useStore } from '../../store/useStore';

const TABS = [
  { id: 'home',        emoji: '🎯', label: 'Play'    },
  { id: 'upgrades',    emoji: '⚔️', label: 'Upgrade' },
  { id: 'shop',        emoji: '💎', label: 'Shop'    },
  { id: 'tasks',       emoji: '📋', label: 'Quests'  },
  { id: 'leaderboard', emoji: '🏆', label: 'Ranks'   },
];

export default function BottomNav() {
  const { screen, setScreen } = useStore();

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 64,
      background: 'rgba(8,8,32,0.97)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'stretch',
      zIndex: 200,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {TABS.map(tab => {
        const active = screen === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setScreen(tab.id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 2, background: 'none', border: 'none',
              cursor: 'pointer', position: 'relative',
              transition: 'opacity 0.15s',
            }}
          >
            {/* Active indicator */}
            {active && (
              <div style={{
                position: 'absolute', top: 0, left: '50%',
                transform: 'translateX(-50%)',
                width: 32, height: 2,
                background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                borderRadius: '0 0 3px 3px',
              }} />
            )}

            <span style={{
              fontSize: 20,
              filter: active
                ? 'drop-shadow(0 0 6px rgba(59,130,246,0.9))'
                : 'grayscale(0.6) opacity(0.5)',
              transform: active ? 'scale(1.12)' : 'scale(1)',
              transition: 'all 0.2s',
            }}>
              {tab.emoji}
            </span>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: 0.3,
              textTransform: 'uppercase',
              color: active ? '#60a5fa' : '#333',
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
