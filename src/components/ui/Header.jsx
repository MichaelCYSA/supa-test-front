import { useGameStore, formatNumber } from '../../store/useGameStore';

export default function Header() {
  const user = useGameStore(s => s.user);
  if (!user) return null;

  return (
    <div style={{
      padding: '10px 16px 8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid rgba(124,58,237,0.2)',
      background: 'rgba(10,0,21,0.9)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 22 }}>🔮</span>
        <div>
          <div style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 13,
            fontWeight: 700,
            color: '#c084fc',
            lineHeight: 1,
          }}>
            ARCANE
          </div>
          <div style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 9,
            color: '#7c6aad',
            letterSpacing: 2,
          }}>
            REALM
          </div>
        </div>
      </div>

      {/* Currencies */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {/* Mana */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          background: 'rgba(124,58,237,0.15)',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 20,
          padding: '5px 10px',
        }}>
          <span style={{ fontSize: 14 }}>✨</span>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#c4b5fd' }}>
            {formatNumber(user.mana)}
          </span>
        </div>

        {/* Crystals */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          background: 'rgba(251,191,36,0.12)',
          border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 20,
          padding: '5px 10px',
        }}>
          <span style={{ fontSize: 14 }}>💎</span>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#fbbf24' }}>
            {user.crystals.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
