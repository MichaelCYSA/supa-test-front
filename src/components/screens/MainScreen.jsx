import { useRef, useState } from 'react';
import { useGameStore, formatNumber, BUILDINGS_CONFIG, calcProductionPerSec } from '../../store/useGameStore';

const PRESTIGE_REQUIRED = 1_000_000;
const ADSGRAM_BLOCK_ID = import.meta.env.VITE_ADSGRAM_BLOCK_ID || '';

export default function MainScreen() {
  const { user, buildings, heroes, adStatus, tap, watchAd, upgradeTap, prestige, showNotification } = useGameStore();
  const orbRef = useRef(null);
  const [orbScale, setOrbScale] = useState(1);

  if (!user) return null;

  const handleTap = (e) => {
    const rect = orbRef.current?.getBoundingClientRect();
    const touches = e.touches || e.changedTouches || [e];
    for (const touch of touches) {
      const x = touch.clientX || touch.pageX;
      const y = touch.clientY || touch.pageY;
      tap(x, y);
    }
    setOrbScale(0.93);
    setTimeout(() => setOrbScale(1), 100);
  };

  // Calculate production rate
  let prodPerSec = 0;
  for (const b of buildings) {
    prodPerSec += calcProductionPerSec(b.building_id, b.level, 1);
  }
  const prodPerHour = prodPerSec * 3600;

  const TAP_UPGRADES = [
    null,
    { level: 1, cost: 500, power: 2, label: 'Empowered Touch' },
    { level: 2, cost: 2000, power: 5, label: 'Arcane Strike' },
    { level: 3, cost: 8000, power: 10, label: 'Spell Surge' },
    { level: 4, cost: 30000, power: 20, label: 'Void Touch' },
    { level: 5, cost: 100000, power: 50, label: 'Reality Shatter' },
    { level: 6, cost: 500000, power: 100, label: 'Cosmic Tap' },
    { level: 7, cost: 2000000, power: 250, label: 'Omnipotent Strike' },
    { level: 8, cost: 10000000, power: 500, label: 'Big Bang Tap' },
  ];
  const nextTapUpgrade = TAP_UPGRADES[user.tap_upgrades + 1] || null;
  const currentTapPower = TAP_UPGRADES[user.tap_upgrades]?.power || 1;
  const canUpgradeTap = nextTapUpgrade && user.mana >= nextTapUpgrade.cost;
  const canPrestige = user.total_mana_earned >= PRESTIGE_REQUIRED;
  const prestigeProgress = Math.min(1, user.total_mana_earned / PRESTIGE_REQUIRED);

  const handleAdWatch = async () => {
    if (!adStatus.canWatch && adStatus.remaining <= 0) {
      showNotification('No ads available. Come back later!', 'error');
      return;
    }

    // Adsgram SDK integration
    if (ADSGRAM_BLOCK_ID && window.Adsgram) {
      try {
        const adController = window.Adsgram.init({ blockId: ADSGRAM_BLOCK_ID });
        adController.show().then(() => {
          watchAd();
        }).catch(() => {
          showNotification('Ad not available, try later', 'error');
        });
      } catch {
        // Fallback: just reward (dev mode)
        watchAd();
      }
    } else {
      // Dev mode - reward directly
      watchAd();
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Stats bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 8,
      }}>
        {[
          { label: 'Level', value: user.level || 1, icon: '⚡' },
          { label: 'Per Hour', value: formatNumber(prodPerHour), icon: '🏭' },
          { label: 'Prestige', value: user.prestige_count || 0, icon: '✨' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 12,
            padding: '10px 8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 16, marginBottom: 2 }}>{stat.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#c4b5fd' }}>{stat.value}</div>
            <div style={{ fontSize: 9, color: '#7c6aad', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Main Orb */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        {/* Essence bonus */}
        {user.essence > 0 && (
          <div style={{
            background: 'rgba(251,191,36,0.1)',
            border: '1px solid rgba(251,191,36,0.3)',
            borderRadius: 20,
            padding: '4px 14px',
            fontSize: 12,
            color: '#fbbf24',
          }}>
            ✨ Essence x{user.essence} (+{(user.essence * 10)}% all production)
          </div>
        )}

        {/* The magical orb */}
        <div
          ref={orbRef}
          onTouchStart={handleTap}
          onClick={handleTap}
          style={{
            width: 180,
            height: 180,
            borderRadius: '50%',
            cursor: 'pointer',
            transform: `scale(${orbScale})`,
            transition: 'transform 0.1s ease',
            position: 'relative',
            background: 'radial-gradient(circle at 35% 35%, #a855f7, #7c3aed 40%, #3b0764 70%, #1a0030)',
            boxShadow: `
              0 0 40px rgba(124,58,237,0.6),
              0 0 80px rgba(124,58,237,0.3),
              inset 0 0 40px rgba(192,132,252,0.2)
            `,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          {/* Inner glow rings */}
          <div style={{
            position: 'absolute',
            inset: -8,
            borderRadius: '50%',
            border: '2px solid rgba(192,132,252,0.3)',
            animation: 'spin-slow 8s linear infinite',
          }} />
          <div style={{
            position: 'absolute',
            inset: -16,
            borderRadius: '50%',
            border: '1px solid rgba(124,58,237,0.2)',
            animation: 'spin-slow 12s linear infinite reverse',
          }} />

          <span style={{ fontSize: 64, filter: 'drop-shadow(0 0 20px rgba(192,132,252,0.8))' }}>
            🔮
          </span>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, color: '#7c6aad', letterSpacing: 1 }}>
            TAP TO GENERATE
          </div>
          <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: 16 }}>
            +{currentTapPower} ✨ per tap
          </div>
        </div>
      </div>

      {/* Prestige progress */}
      <div style={{
        background: 'rgba(124,58,237,0.1)',
        border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: 12,
        padding: '12px 14px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
          <span style={{ color: '#c4b5fd', fontWeight: 600 }}>🌟 Ascension Progress</span>
          <span style={{ color: '#7c6aad' }}>
            {formatNumber(user.total_mana_earned)} / {formatNumber(PRESTIGE_REQUIRED)}
          </span>
        </div>
        <div style={{
          height: 6,
          background: 'rgba(124,58,237,0.2)',
          borderRadius: 3,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${prestigeProgress * 100}%`,
            background: canPrestige
              ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
              : 'linear-gradient(90deg, #7c3aed, #c084fc)',
            borderRadius: 3,
            transition: 'width 0.5s ease',
          }} />
        </div>
        {canPrestige && (
          <button
            className="btn btn-gold"
            onClick={() => {
              if (confirm('Ascend? Your buildings will reset, but you keep heroes and earn Essence (+10% all production forever).')) {
                prestige();
              }
            }}
            style={{ width: '100%', marginTop: 10, fontSize: 14 }}
          >
            ✨ ASCEND NOW
          </button>
        )}
      </div>

      {/* Tap Upgrade */}
      {nextTapUpgrade && (
        <div style={{
          background: 'rgba(124,58,237,0.1)',
          border: `1px solid ${canUpgradeTap ? 'rgba(124,58,237,0.5)' : 'rgba(124,58,237,0.15)'}`,
          borderRadius: 12,
          padding: '12px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#c4b5fd' }}>
              👆 {nextTapUpgrade.label}
            </div>
            <div style={{ fontSize: 11, color: '#7c6aad' }}>
              +{nextTapUpgrade.power} mana/tap
            </div>
          </div>
          <button
            className={`btn btn-primary ${canUpgradeTap ? '' : 'btn-disabled'}`}
            onClick={() => canUpgradeTap && upgradeTap()}
            style={{ fontSize: 12, padding: '8px 14px' }}
          >
            ✨ {formatNumber(nextTapUpgrade.cost)}
          </button>
        </div>
      )}

      {/* Watch Ad */}
      <div style={{
        background: 'rgba(6,182,212,0.08)',
        border: '1px solid rgba(6,182,212,0.2)',
        borderRadius: 12,
        padding: '12px 14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#67e8f9' }}>
            📺 Watch Ad → +2h Income
          </div>
          <div style={{ fontSize: 11, color: '#7c6aad' }}>
            {adStatus.watched}/{adStatus.limit} watched today
          </div>
        </div>
        <button
          className={`btn ${adStatus.remaining > 0 ? '' : 'btn-disabled'}`}
          onClick={handleAdWatch}
          style={{
            background: adStatus.remaining > 0 ? 'rgba(6,182,212,0.2)' : 'rgba(50,50,50,0.2)',
            border: `1px solid ${adStatus.remaining > 0 ? 'rgba(6,182,212,0.4)' : 'rgba(50,50,50,0.2)'}`,
            color: adStatus.remaining > 0 ? '#67e8f9' : '#555',
            fontSize: 12,
            padding: '8px 14px',
            borderRadius: 8,
          }}
        >
          {adStatus.remaining > 0 ? `Watch (${adStatus.remaining})` : 'Done'}
        </button>
      </div>

      {/* Streak */}
      {user.login_streak > 0 && (
        <div style={{
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 12,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ fontSize: 24 }}>🔥</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#fbbf24' }}>
              {user.login_streak} Day Streak!
            </div>
            <div style={{ fontSize: 11, color: '#7c6aad' }}>Log in tomorrow for bigger rewards</div>
          </div>
        </div>
      )}
    </div>
  );
}
