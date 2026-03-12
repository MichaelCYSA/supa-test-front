import { useState, useEffect } from 'react';
import { useGameStore, formatNumber } from '../../store/useGameStore';
import { api } from '../../api/client';

const PACKAGES = [
  { id: 'pack_50', stars: 50, crystals: 500, label: 'Starter Pack', emoji: '💎', badge: null },
  { id: 'pack_150', stars: 150, crystals: 2000, label: 'Mage Pack', emoji: '🔮', badge: '🔥 Popular' },
  { id: 'pack_500', stars: 500, crystals: 8000, label: 'Archmage Pack', emoji: '🧝', badge: '💡 Best Value' },
  { id: 'pack_1000', stars: 1000, crystals: 20000, label: 'Void Lord Pack', emoji: '👁️', badge: '⭐ Legendary' },
];

export default function ShopScreen() {
  const { user, buyPackage, showNotification } = useGameStore();
  const [purchasing, setPurchasing] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    api.getLeaderboard().then(r => setLeaderboard(r.leaderboard || [])).catch(() => {});
  }, []);

  if (!user) return null;

  const handleBuy = async (pkg) => {
    setPurchasing(pkg.id);
    try {
      await buyPackage(pkg.id);
    } catch {}
    setPurchasing(null);
  };

  const crystalPerStar = (pkg) => (pkg.crystals / pkg.stars).toFixed(1);

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: '#c4b5fd', fontWeight: 700 }}>
          Shop
        </div>
        <div style={{ fontSize: 11, color: '#7c6aad' }}>
          Buy crystals with Telegram Stars ⭐
        </div>
      </div>

      {/* Crystal balance */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(180,100,0,0.1))',
        border: '1px solid rgba(251,191,36,0.3)',
        borderRadius: 16,
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 11, color: '#7c6aad' }}>Your Balance</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 24, fontWeight: 900, color: '#fbbf24' }}>
            💎 {user.crystals.toLocaleString()}
          </div>
        </div>
        <div style={{ fontSize: 11, color: '#7c6aad', textAlign: 'right' }}>
          Use crystals to<br />summon heroes
        </div>
      </div>

      {/* Stars packages */}
      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, color: '#7c6aad', letterSpacing: 1 }}>
        ⭐ CRYSTAL PACKS
      </div>

      {PACKAGES.map(pkg => (
        <div
          key={pkg.id}
          style={{
            background: pkg.badge?.includes('Best') || pkg.badge?.includes('Legendary')
              ? 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(30,0,80,0.4))'
              : 'rgba(124,58,237,0.08)',
            border: `1px solid ${pkg.badge ? 'rgba(124,58,237,0.4)' : 'rgba(124,58,237,0.2)'}`,
            borderRadius: 16,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {pkg.badge && (
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              color: '#fff',
              fontSize: 9,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '0 16px 0 10px',
            }}>
              {pkg.badge}
            </div>
          )}

          <div style={{ fontSize: 36 }}>{pkg.emoji}</div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#e2d9ff' }}>
              {pkg.label}
            </div>
            <div style={{ fontSize: 13, color: '#fbbf24', fontWeight: 600 }}>
              💎 {pkg.crystals.toLocaleString()} crystals
            </div>
            <div style={{ fontSize: 10, color: '#7c6aad' }}>
              {crystalPerStar(pkg)} crystals per ⭐
            </div>
          </div>

          <button
            className={`btn btn-gold ${purchasing === pkg.id ? 'btn-disabled' : ''}`}
            onClick={() => handleBuy(pkg)}
            disabled={purchasing === pkg.id}
            style={{ fontSize: 13, padding: '10px 16px', flexDirection: 'column', gap: 2 }}
          >
            <span>{purchasing === pkg.id ? '...' : `⭐ ${pkg.stars}`}</span>
          </button>
        </div>
      ))}

      {/* What are Stars */}
      <div style={{
        background: 'rgba(6,182,212,0.06)',
        border: '1px solid rgba(6,182,212,0.15)',
        borderRadius: 14,
        padding: '12px 14px',
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#67e8f9', marginBottom: 4 }}>
          💡 What are Telegram Stars?
        </div>
        <div style={{ fontSize: 11, color: '#7c6aad', lineHeight: 1.5 }}>
          Stars (⭐) are Telegram's built-in payment currency. You can buy them in the Telegram app under Settings → Telegram Stars, or from the payment screen that opens when you tap a pack above.
        </div>
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, color: '#7c6aad', letterSpacing: 1 }}>
            🏆 LEADERBOARD
          </div>
          <div style={{
            background: 'rgba(124,58,237,0.08)',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 14,
            overflow: 'hidden',
          }}>
            {leaderboard.slice(0, 10).map((player, i) => {
              const isMe = player.telegram_id === user.telegram_id;
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <div
                  key={player.telegram_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    background: isMe ? 'rgba(124,58,237,0.2)' : 'transparent',
                    borderBottom: i < 9 ? '1px solid rgba(124,58,237,0.1)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>
                    {medals[i] || `${i + 1}`}
                  </span>
                  <span style={{ flex: 1, fontSize: 13, color: isMe ? '#c4b5fd' : '#9ca3af' }}>
                    {player.first_name || player.username || `Player ${player.telegram_id}`}
                    {isMe && ' (you)'}
                  </span>
                  <span style={{ fontSize: 12, color: '#7c6aad' }}>
                    ✨ {formatNumber(player.total_mana_earned)}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
