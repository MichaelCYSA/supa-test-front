import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore, getGunStats, fmt } from '../../store/useStore';
import { BallBlastEngine } from '../../game/engine';
import { generateLevel, getStars, getLevelInfo } from '../../game/levels';

export default function GameScreen() {
  const { user, upgrades, completeLevel, setScreen, notify } = useStore();
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [gameState, setGameState] = useState('playing'); // playing | won | lost
  const [result, setResult] = useState(null);
  const [coinsDisplay, setCoinsDisplay] = useState(0);
  const [levelInfo, setLevelInfo] = useState(null);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const levelNum = user?.current_level || 1;
  const info = getLevelInfo(levelNum);

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const gun = getGunStats(upgrades);
    const levelData = generateLevel(levelNum, W);
    setLevelInfo(levelData);

    if (engineRef.current) engineRef.current.destroy();

    const engine = new BallBlastEngine(canvas, gun, {
      onCoin: (coins) => setCoinsDisplay(c => c + coins),
      onWin: async ({ coinsEarned, ballsDestroyed, timeSec }) => {
        clearInterval(timerRef.current);
        const stars = getStars(timeSec, levelData.timeFor3Stars, levelData.timeFor2Stars);
        const totalCoins = coinsEarned + levelData.coinReward;
        setResult({ won: true, stars, coinsEarned: totalCoins, timeSec, ballsDestroyed });
        setGameState('won');
        await completeLevel({ levelNum, coinsEarned: totalCoins, timeSec, ballsDestroyed });
      },
      onLose: ({ coinsEarned }) => {
        clearInterval(timerRef.current);
        setResult({ won: false, coinsEarned });
        setGameState('lost');
      },
    });

    engine.loadLevel(levelData);
    engine.start();
    engineRef.current = engine;
    startTimeRef.current = Date.now();
    setCoinsDisplay(0);
    setGameState('playing');

    // Timer
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 500);
  }, [levelNum, upgrades]);

  useEffect(() => {
    startGame();
    return () => {
      engineRef.current?.destroy();
      clearInterval(timerRef.current);
    };
  }, []);

  const handleExit = () => {
    engineRef.current?.destroy();
    clearInterval(timerRef.current);
    setScreen('home');
  };

  const handleRetry = () => {
    setResult(null);
    startGame();
  };

  const handleNext = () => {
    if (user.current_level <= levelNum) {
      handleExit();
    } else {
      setResult(null);
      startGame();
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#080820', display: 'flex', flexDirection: 'column' }}>
      {/* HUD */}
      {gameState === 'playing' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 14px',
          background: 'linear-gradient(180deg, rgba(8,8,32,0.95) 0%, transparent 100%)',
        }}>
          <button onClick={handleExit} style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 20, color: '#aaa', padding: '5px 12px', fontSize: 12, cursor: 'pointer',
          }}>
            ✕ Exit
          </button>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 800, fontSize: 15, color: info.tierColor }}>
              Level {levelNum}
            </div>
            <div style={{ fontSize: 10, color: '#555', letterSpacing: 1 }}>{info.tierName.toUpperCase()}</div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: '#fbbf24', fontWeight: 700 }}>
              🪙 {fmt(coinsDisplay)}
            </div>
            <div style={{ fontSize: 12, color: '#4f8ff7', fontWeight: 600, minWidth: 32, textAlign: 'right' }}>
              ⏱{timer}s
            </div>
          </div>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
      />

      {/* Result overlay */}
      {gameState !== 'playing' && result && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 16, padding: 24,
        }}>
          {result.won ? (
            <>
              <div style={{ fontSize: 60 }}>🎉</div>
              <div style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 900, fontSize: 28, color: '#fbbf24' }}>
                LEVEL {levelNum} CLEAR!
              </div>
              {/* Stars */}
              <div style={{ display: 'flex', gap: 8, fontSize: 36 }}>
                {[1, 2, 3].map(s => (
                  <span key={s} style={{ filter: s <= result.stars ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</span>
                ))}
              </div>
              {/* Stats */}
              <div style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16, padding: '14px 28px', display: 'flex', gap: 24,
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fbbf24' }}>🪙 {fmt(result.coinsEarned)}</div>
                  <div style={{ fontSize: 10, color: '#666' }}>COINS</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#4f8ff7' }}>⏱ {Math.floor(result.timeSec)}s</div>
                  <div style={{ fontSize: 10, color: '#666' }}>TIME</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#ff4757' }}>💥 {result.ballsDestroyed}</div>
                  <div style={{ fontSize: 10, color: '#666' }}>BALLS</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 300 }}>
                <button onClick={handleExit} style={btnStyle('ghost')}>🏠 Home</button>
                <button onClick={handleNext} style={btnStyle('primary')}>Next ▶</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 60 }}>💀</div>
              <div style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 900, fontSize: 26, color: '#ef4444' }}>
                GAME OVER
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>A ball reached the bottom!</div>
              {result.coinsEarned > 0 && (
                <div style={{ color: '#fbbf24', fontSize: 15 }}>🪙 +{fmt(result.coinsEarned)} coins saved</div>
              )}
              <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 300 }}>
                <button onClick={handleExit} style={btnStyle('ghost')}>🏠 Home</button>
                <button onClick={handleRetry} style={btnStyle('danger')}>🔄 Retry (-1 ⚡)</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function btnStyle(type) {
  const base = { flex: 1, padding: '13px 8px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', border: 'none', fontFamily: "'Exo 2', sans-serif" };
  if (type === 'primary') return { ...base, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff' };
  if (type === 'danger') return { ...base, background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: '#fff' };
  return { ...base, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#aaa' };
}
