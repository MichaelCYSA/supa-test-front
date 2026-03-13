import { useEffect } from 'react';
import { useStore } from './store/useStore';
import HomeScreen from './components/screens/HomeScreen';
import GameScreen from './components/screens/GameScreen';
import UpgradeScreen from './components/screens/UpgradeScreen';
import { ShopScreen, TasksScreen, LeaderboardScreen } from './components/screens/ShopTasksLeaderboard';
import BottomNav from './components/ui/BottomNav';
import LoadingScreen from './components/ui/LoadingScreen';
import Notification from './components/ui/Notification';

const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080820;
    --bg2: #0f0f35;
    --card: #111130;
    --border: rgba(255,255,255,0.06);
    --text: #e2e8ff;
    --text2: #8888aa;
    --blue: #3b82f6;
    --blue-dark: #1d4ed8;
    --gold: #fbbf24;
    --purple: #a855f7;
    --green: #22c55e;
    --red: #ef4444;
    --cyan: #06b6d4;
  }

  html, body, #root {
    width: 100%; height: 100%;
    overflow: hidden;
    background: var(--bg);
    color: var(--text);
    font-family: 'Exo 2', 'Segoe UI', sans-serif;
  }

  body {
    overscroll-behavior: none;
    position: fixed;
    -webkit-font-smoothing: antialiased;
  }

  #root {
    display: flex;
    flex-direction: column;
    height: 100dvh;
  }

  button { font-family: inherit; }

  /* Scrollable content area */
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .scroll-area::-webkit-scrollbar { display: none; }

  /* Animations */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes popIn {
    0%   { transform: scale(0.7); opacity: 0; }
    70%  { transform: scale(1.06); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.5; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0.15; transform: scale(0.8); }
    50%       { opacity: 0.9;  transform: scale(1.2); }
  }

  .fade-up   { animation: fadeUp   0.3s ease both; }
  .pop-in    { animation: popIn    0.35s cubic-bezier(.34,1.56,.64,1) both; }
  .slide-down { animation: slideDown 0.3s ease both; }
`;

export default function App() {
  const { loaded, screen, notification, init } = useStore();

  useEffect(() => { init(); }, []);

  const isGame = screen === 'game';

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {/* Starfield (only when not in game — engine has its own) */}
      {!isGame && <Starfield />}

      {!loaded ? (
        <LoadingScreen />
      ) : isGame ? (
        <GameScreen />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', position: 'relative', zIndex: 1 }}>
          <TopBar />
          <div className="scroll-area" style={{ paddingBottom: 70 }}>
            {screen === 'home'        && <HomeScreen />}
            {screen === 'upgrades'    && <UpgradeScreen />}
            {screen === 'shop'        && <ShopScreen />}
            {screen === 'tasks'       && <TasksScreen />}
            {screen === 'leaderboard' && <LeaderboardScreen />}
          </div>
          <BottomNav />
        </div>
      )}

      {notification && <Notification key={notification.id} {...notification} />}
    </>
  );
}

// ---- TOP BAR ----
function TopBar() {
  const { user } = useStore();
  if (!user) return null;

  return (
    <div style={{
      padding: '10px 16px 8px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      background: 'rgba(8,8,32,0.9)',
      backdropFilter: 'blur(12px)',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 22 }}>🎯</span>
        <div>
          <div style={{ fontWeight: 900, fontSize: 14, color: '#4f8ff7', lineHeight: 1, letterSpacing: 0.5 }}>
            BALL BLAST
          </div>
          <div style={{ fontSize: 9, color: '#333', letterSpacing: 2 }}>TELEGRAM</div>
        </div>
      </div>

      {/* Currencies */}
      <div style={{ display: 'flex', gap: 8 }}>
        <CurrencyBadge icon="🪙" value={fmtShort(user.coins)} color="rgba(251,191,36,0.15)" border="rgba(251,191,36,0.3)" text="#fbbf24" />
        <CurrencyBadge icon="💎" value={user.gems} color="rgba(168,85,247,0.12)" border="rgba(168,85,247,0.3)" text="#c084fc" />
      </div>
    </div>
  );
}

function CurrencyBadge({ icon, value, color, border, text }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      background: color, border: `1px solid ${border}`,
      borderRadius: 20, padding: '4px 10px',
    }}>
      <span style={{ fontSize: 13 }}>{icon}</span>
      <span style={{ fontWeight: 800, fontSize: 13, color: text }}>{value}</span>
    </div>
  );
}

function fmtShort(n) {
  n = Math.floor(n || 0);
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toLocaleString();
}

// ---- STARFIELD BG ----
function Starfield() {
  const stars = Array.from({ length: 55 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() > 0.88 ? 3 : 2,
    dur: `${2 + Math.random() * 4}s`,
    delay: `${Math.random() * 5}s`,
    opacity: 0.2 + Math.random() * 0.7,
  }));

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position: 'absolute',
          left: s.left, top: s.top,
          width: s.size, height: s.size,
          borderRadius: '50%',
          background: '#fff',
          opacity: s.opacity,
          animation: `twinkle ${s.dur} ease-in-out infinite`,
          animationDelay: s.delay,
        }} />
      ))}
    </div>
  );
}
