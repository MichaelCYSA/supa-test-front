// ShopScreen.jsx
import { useStore, fmt } from '../../store/useStore';

const GEM_PACKS = [
  { id: 'gems_small', stars: 50, gems: 80, label: 'Starter Pack', icon: '💎', badge: null },
  { id: 'gems_medium', stars: 150, gems: 300, label: 'Popular Pack', icon: '💎💎', badge: '🔥' },
  { id: 'gems_large', stars: 500, gems: 1200, label: 'Value Pack', icon: '💎💎💎', badge: '💡 Best' },
];
const ENERGY_PACKS = [
  { id: 'energy_1', gems: 10, energy: 1, label: '+1 Energy' },
  { id: 'energy_5', gems: 40, energy: 5, label: '+5 Energy' },
  { id: 'energy_10', gems: 70, energy: 10, label: '+10 Energy 🔥' },
];
const COIN_PACKS = [
  { id: 'coins_small', gems: 20, coins: 5000, label: '5,000 Coins' },
  { id: 'coins_medium', gems: 50, coins: 15000, label: '15,000 Coins' },
  { id: 'coins_large', gems: 100, coins: 35000, label: '35,000 Coins 🔥' },
];

export function ShopScreen() {
  const { user, buyGems, buyEnergy, buyCoins } = useStore();
  if (!user) return null;

  const Section = ({ title, children }) => (
    <div>
      <div style={{ fontWeight: 700, fontSize: 12, color: '#555', letterSpacing: 1, marginBottom: 10 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  );

  return (
    <div style={{ padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontWeight: 900, fontSize: 20, color: '#e2e8ff' }}>🛒 Shop</div>
        <div style={{ fontSize: 12, color: '#555' }}>Gems: {user.gems} · Coins: {fmt(user.coins)}</div>
      </div>

      {/* What are Stars */}
      <div style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 14, padding: '10px 14px', fontSize: 11, color: '#4b9fa8' }}>
        💡 Telegram Stars (⭐) → buy in Telegram app under Settings → Stars
      </div>

      <Section title="⭐ BUY GEMS">
        {GEM_PACKS.map(p => (
          <div key={p.id} style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
            {p.badge && <span style={{ position: 'absolute', top: 8, right: 8, background: '#7c3aed', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>{p.badge}</span>}
            <span style={{ fontSize: 28 }}>{p.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#e2e8ff', fontSize: 14 }}>{p.label}</div>
              <div style={{ fontSize: 12, color: '#a855f7' }}>💎 {p.gems} gems</div>
            </div>
            <button onClick={() => buyGems(p.id)} style={{ padding: '8px 14px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
              ⭐ {p.stars}
            </button>
          </div>
        ))}
      </Section>

      <Section title="⚡ BUY ENERGY">
        {ENERGY_PACKS.map(p => (
          <div key={p.id} style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>⚡</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#e2e8ff', fontSize: 14 }}>{p.label}</div>
              <div style={{ fontSize: 11, color: '#555' }}>Instantly restore energy</div>
            </div>
            <button onClick={() => buyEnergy(p.id)} disabled={user.gems < p.gems}
              style={{ padding: '8px 12px', borderRadius: 10, border: 'none', background: user.gems >= p.gems ? 'linear-gradient(135deg, #0891b2, #0e7490)' : 'rgba(40,40,60,0.5)', color: user.gems >= p.gems ? '#fff' : '#444', fontWeight: 700, fontSize: 12, cursor: user.gems >= p.gems ? 'pointer' : 'not-allowed' }}>
              💎 {p.gems}
            </button>
          </div>
        ))}
      </Section>

      <Section title="🪙 BUY COINS">
        {COIN_PACKS.map(p => (
          <div key={p.id} style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>🪙</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#e2e8ff', fontSize: 14 }}>{p.label}</div>
              <div style={{ fontSize: 11, color: '#555' }}>For upgrading your cannon</div>
            </div>
            <button onClick={() => buyCoins(p.id)} disabled={user.gems < p.gems}
              style={{ padding: '8px 12px', borderRadius: 10, border: 'none', background: user.gems >= p.gems ? 'linear-gradient(135deg, #d97706, #b45309)' : 'rgba(40,40,60,0.5)', color: user.gems >= p.gems ? '#fff' : '#444', fontWeight: 700, fontSize: 12, cursor: user.gems >= p.gems ? 'pointer' : 'not-allowed' }}>
              💎 {p.gems}
            </button>
          </div>
        ))}
      </Section>
    </div>
  );
}

// TasksScreen.jsx
export function TasksScreen() {
  const { tasks, completedTaskIds, user, completeTask } = useStore();
  if (!user) return null;

  return (
    <div style={{ padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <div style={{ fontWeight: 900, fontSize: 20, color: '#e2e8ff' }}>📋 Quests</div>
        <div style={{ fontSize: 12, color: '#555' }}>{completedTaskIds.length}/{tasks.length} completed</div>
      </div>

      {/* Referral */}
      <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 16, padding: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#60a5fa', marginBottom: 4 }}>👥 Invite Friends → 💎 30 gems each</div>
        <div style={{ fontSize: 11, color: '#555', marginBottom: 12 }}>Your friend gets a bonus too!</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
            onClick={() => {
              const bot = import.meta.env.VITE_BOT_USERNAME || 'YourBot';
              const link = `https://t.me/${bot}?startapp=${user.telegram_id}`;
              window.Telegram?.WebApp?.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('🎯 Play Ball Blast! Shoot balls, upgrade your cannon!')}`);
            }}>
            📤 Share
          </button>
          <button style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#888', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
            onClick={() => { const bot = import.meta.env.VITE_BOT_USERNAME || 'YourBot'; navigator.clipboard?.writeText(`https://t.me/${bot}?startapp=${user.telegram_id}`); useStore.getState().notify('Copied!'); }}>
            📋
          </button>
        </div>
        <div style={{ fontSize: 11, color: '#555', marginTop: 8 }}>Referred: {user.referral_count || 0} friends</div>
      </div>

      {tasks.map(task => {
        const done = completedTaskIds.includes(task.id);
        return (
          <div key={task.id} onClick={() => !done && completeTask(task.id, task.external_link)}
            style={{ background: done ? 'rgba(34,197,94,0.06)' : 'rgba(15,15,40,0.9)', border: `1px solid ${done ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 14, padding: '14px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: done ? 'default' : 'pointer' }}>
            <div style={{ fontSize: 24, width: 40, height: 40, borderRadius: 10, background: done ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {done ? '✅' : task.icon || '⭐'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: done ? '#4ade80' : '#e2e8ff' }}>{task.title}</div>
              {task.description && <div style={{ fontSize: 11, color: '#555', marginTop: 1 }}>{task.description}</div>}
              <div style={{ fontSize: 11, marginTop: 4 }}>
                {task.reward_coins > 0 && <span style={{ color: '#fbbf24' }}>🪙 +{fmt(task.reward_coins)} </span>}
                {task.reward_gems > 0 && <span style={{ color: '#a855f7' }}>💎 +{task.reward_gems}</span>}
              </div>
            </div>
            <div style={{ color: done ? '#22c55e' : '#444', fontSize: 18 }}>{done ? '✓' : '›'}</div>
          </div>
        );
      })}
    </div>
  );
}

// LeaderboardScreen.jsx
import { useState, useEffect } from 'react';
import { api } from '../../api/client';

export function LeaderboardScreen() {
  const { user } = useStore();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeaderboard().then(r => { setBoard(r.leaderboard || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div style={{ padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <div style={{ fontWeight: 900, fontSize: 20, color: '#e2e8ff' }}>🏆 Leaderboard</div>
        <div style={{ fontSize: 12, color: '#555' }}>Top players by max level</div>
      </div>

      {loading && <div style={{ color: '#555', textAlign: 'center', padding: 40 }}>Loading...</div>}

      {board.map((p, i) => {
        const isMe = p.telegram_id === user?.telegram_id;
        return (
          <div key={p.telegram_id} style={{ background: isMe ? 'rgba(59,130,246,0.12)' : 'rgba(15,15,40,0.8)', border: `1px solid ${isMe ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)'}`, borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, textAlign: 'center', fontSize: i < 3 ? 22 : 13, color: '#555', fontWeight: 700, flexShrink: 0 }}>
              {i < 3 ? medals[i] : `${i + 1}`}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: isMe ? '#60a5fa' : '#e2e8ff' }}>
                {p.first_name || p.username || `Player ${p.telegram_id}`}
                {isMe && ' (you)'}
              </div>
              <div style={{ fontSize: 11, color: '#555' }}>💥 {(p.total_balls_destroyed || 0).toLocaleString()} balls</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#fbbf24' }}>Lv {p.max_level_reached}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
