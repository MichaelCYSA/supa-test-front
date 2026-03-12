import { useEffect } from "react";
import { useGameStore } from "./store/useGameStore";
import LoadingScreen from "./components/ui/LoadingScreen";
import BottomNav from "./components/ui/BottomNav";
import Header from "./components/ui/Header";
import MainScreen from "./components/screens/MainScreen";
import BuildingsScreen from "./components/screens/BuildingsScreen";
import HeroesScreen from "./components/screens/HeroesScreen";
import TasksScreen from "./components/screens/TasksScreen";
import ShopScreen from "./components/screens/ShopScreen";

const styles = `
  :root {
    --bg: #0a0015;
    --bg2: #110025;
    --bg3: #1a003a;
    --card: #1e0a3c;
    --card2: #2a0a50;
    --purple: #7c3aed;
    --purple-light: #9d5cf5;
    --gold: #fbbf24;
    --gold-dark: #d97706;
    --cyan: #06b6d4;
    --text: #f0e9ff;
    --text2: #c4b5fd;
    --text3: #7c6aad;
    --border: rgba(124,58,237,0.25);
    --glow: 0 0 20px rgba(124,58,237,0.4);
    --glow-gold: 0 0 20px rgba(251,191,36,0.5);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Exo 2', sans-serif;
    overflow: hidden;
    height: 100dvh;
  }

  #root {
    height: 100dvh;
    display: flex;
    flex-direction: column;
    background:
      radial-gradient(ellipse at 20% 10%, rgba(124,58,237,0.12) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 80%, rgba(6,182,212,0.06) 0%, transparent 60%),
      var(--bg);
  }

  .screen {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0 0 80px 0;
    scrollbar-width: none;
  }
  .screen::-webkit-scrollbar { display: none; }

  /* Cards */
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px;
  }
  .card-glow {
    box-shadow: var(--glow);
  }

  /* Buttons */
  .btn {
    border: none;
    cursor: pointer;
    font-family: 'Exo 2', sans-serif;
    font-weight: 600;
    border-radius: 12px;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .btn:active { transform: scale(0.95); }

  .btn-primary {
    background: linear-gradient(135deg, var(--purple), #5b21b6);
    color: white;
    padding: 12px 20px;
    box-shadow: 0 4px 15px rgba(124,58,237,0.3);
  }
  .btn-primary:hover { background: linear-gradient(135deg, var(--purple-light), var(--purple)); }

  .btn-gold {
    background: linear-gradient(135deg, var(--gold), var(--gold-dark));
    color: #1a0a00;
    padding: 12px 20px;
    box-shadow: 0 4px 15px rgba(251,191,36,0.3);
  }

  .btn-ghost {
    background: rgba(124,58,237,0.15);
    color: var(--text2);
    border: 1px solid var(--border);
    padding: 10px 16px;
  }

  .btn-disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* Rarity colors */
  .rarity-common { color: #9ca3af; }
  .rarity-rare { color: #3b82f6; }
  .rarity-epic { color: #a855f7; }
  .rarity-legendary { color: #f59e0b; }

  .rarity-bg-common { background: rgba(156,163,175,0.15); border-color: rgba(156,163,175,0.3); }
  .rarity-bg-rare { background: rgba(59,130,246,0.15); border-color: rgba(59,130,246,0.3); }
  .rarity-bg-epic { background: rgba(168,85,247,0.15); border-color: rgba(168,85,247,0.3); }
  .rarity-bg-legendary { background: rgba(245,158,11,0.15); border-color: rgba(245,158,11,0.4); }

  /* Animations */
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 10px rgba(124,58,237,0.3); }
    50% { box-shadow: 0 0 30px rgba(124,58,237,0.7); }
  }
  @keyframes float-up {
    0% { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-80px) scale(1.3); }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes bounce-in {
    0% { transform: scale(0.5); opacity: 0; }
    60% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes slide-up {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.2); }
  }

  .float-number {
    position: fixed;
    pointer-events: none;
    font-family: 'Cinzel', serif;
    font-weight: 700;
    font-size: 18px;
    color: var(--gold);
    text-shadow: 0 0 10px rgba(251,191,36,0.8);
    animation: float-up 1.2s ease-out forwards;
    z-index: 9999;
    white-space: nowrap;
  }

  /* Notification */
  .notification {
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9998;
    padding: 12px 24px;
    border-radius: 50px;
    font-size: 14px;
    font-weight: 600;
    animation: bounce-in 0.3s ease;
    white-space: nowrap;
    max-width: 90vw;
    text-align: center;
  }
  .notification-success { background: rgba(16,185,129,0.9); color: white; }
  .notification-error { background: rgba(239,68,68,0.9); color: white; }
  .notification-info { background: rgba(6,182,212,0.9); color: white; }
  .notification-reward {
    background: linear-gradient(135deg, rgba(251,191,36,0.9), rgba(217,119,6,0.9));
    color: #1a0a00;
    box-shadow: 0 4px 20px rgba(251,191,36,0.5);
  }

  /* Stars */
  .stars-bg {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }
  .star {
    position: absolute;
    width: 2px;
    height: 2px;
    background: white;
    border-radius: 50%;
    animation: twinkle var(--dur, 3s) ease-in-out infinite;
    animation-delay: var(--delay, 0s);
  }
`;

export default function App() {
  const { loaded, activeTab, floatingNumbers, notification, loadState } =
    useGameStore();

  useEffect(() => {
    // Init Telegram WebApp
    const twa = window.Telegram?.WebApp;
    if (twa) {
      twa.ready();
      twa.expand();
      twa.setHeaderColor("#0a0015");
      twa.setBackgroundColor("#0a0015");
      twa.disableVerticalSwipes?.();
    }

    loadState();
  }, []);

  return (
    <>
      <style>{styles}</style>

      {/* Starfield background */}
      <div className="stars-bg">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              "--dur": `${2 + Math.random() * 4}s`,
              "--delay": `${Math.random() * 4}s`,
              opacity: Math.random() * 0.8 + 0.2,
              width: `${Math.random() > 0.9 ? 3 : 2}px`,
              height: `${Math.random() > 0.9 ? 3 : 2}px`,
            }}
          />
        ))}
      </div>

      {!loaded ? (
        <LoadingScreen />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100dvh",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Header />
          <div className="screen">
            {activeTab === "main" && <MainScreen />}
            {activeTab === "buildings" && <BuildingsScreen />}
            {activeTab === "heroes" && <HeroesScreen />}
            {activeTab === "tasks" && <TasksScreen />}
            {activeTab === "shop" && <ShopScreen />}
          </div>
          <BottomNav />
        </div>
      )}

      {/* Floating tap numbers */}
      {floatingNumbers.map((f) => (
        <div
          key={f.id}
          className="float-number"
          style={{ left: f.x - 20, top: f.y - 20 }}
        >
          {f.amount}
        </div>
      ))}

      {/* Notification */}
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.msg}
        </div>
      )}
    </>
  );
}
