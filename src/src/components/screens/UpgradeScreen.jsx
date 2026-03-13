import { useStore, fmt, getGunStats } from '../../store/useStore';

const UPGRADES = [
  { id: 'damage', name: 'Damage', icon: '⚔️', color: '#ef4444', maxLevel: 50,
    getVal: lvl => Math.max(1, Math.floor(Math.pow(1.4, lvl))),
    getCost: lvl => Math.floor(100 * Math.pow(1.18, lvl)),
    unit: 'dmg' },
  { id: 'fire_rate', name: 'Fire Rate', icon: '🔥', color: '#f97316', maxLevel: 20,
    getVal: lvl => parseFloat((2 + lvl * 0.5).toFixed(1)),
    getCost: lvl => Math.floor(300 * Math.pow(1.22, lvl)),
    unit: '/s' },
  { id: 'multi_shot', name: 'Multi-Shot', icon: '🎯', color: '#3b82f6', maxLevel: 4,
    getVal: lvl => lvl + 1,
    getCost: lvl => Math.floor(2000 * Math.pow(3.0, lvl)),
    unit: 'barrel' },
  { id: 'bullet_size', name: 'Bullet Size', icon: '⚪', color: '#06b6d4', maxLevel: 10,
    getVal: lvl => 4 + lvl * 2,
    getCost: lvl => Math.floor(500 * Math.pow(1.5, lvl)),
    unit: 'px' },
  { id: 'bullet_speed', name: 'Bullet Speed', icon: '⚡', color: '#fbbf24', maxLevel: 15,
    getVal: lvl => 400 + lvl * 40,
    getCost: lvl => Math.floor(400 * Math.pow(1.3, lvl)),
    unit: 'px/s' },
];

const SPECIALS = [
  { id: 'explosive', name: 'Explosive Rounds', icon: '💥', cost: 100, color: '#f97316',
    desc: 'Bullets explode on impact — area damage to nearby balls' },
  { id: 'shield', name: 'Force Shield', icon: '🛡️', cost: 80, color: '#06b6d4',
    desc: 'One free miss per level — ball bounces instead of killing you' },
];

export default function UpgradeScreen() {
  const { user, upgrades, buyUpgrade, buySpecial, setScreen } = useStore();
  if (!user || !upgrades) return null;

  const gun = getGunStats(upgrades);

  return (
    <div style={{ padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 20, color: '#e2e8ff' }}>⚔️ Upgrades</div>
          <div style={{ fontSize: 12, color: '#555' }}>Spend coins to upgrade your cannon</div>
        </div>
        <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: 16 }}>🪙 {fmt(user.coins)}</div>
      </div>

      {/* Gun stats summary */}
      <div style={{
        background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 16, padding: '12px 16px',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
      }}>
        {[
          { label: 'DMG', value: gun.damage },
          { label: 'RATE', value: gun.fireRate + '/s' },
          { label: 'BARRELS', value: gun.multiShot },
          { label: 'SIZE', value: gun.bulletSize },
          { label: 'SPEED', value: gun.bulletSpeed },
          { label: 'SPECIALS', value: (gun.hasExplosive ? '💥' : '') + (gun.hasShield ? '🛡️' : '') || '—' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#4f8ff7' }}>{s.value}</div>
            <div style={{ fontSize: 9, color: '#555', letterSpacing: 0.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upgrade cards */}
      {UPGRADES.map(upg => {
        const levelField = `${upg.id}_level`;
        const curLevel = upgrades[levelField] || 0;
        const isMax = curLevel >= upg.maxLevel;
        const cost = isMax ? 0 : upg.getCost(curLevel);
        const canAfford = user.coins >= cost;
        const curVal = upg.getVal(curLevel);
        const nextVal = isMax ? null : upg.getVal(curLevel + 1);
        const progress = curLevel / upg.maxLevel;

        return (
          <div key={upg.id} style={{
            background: 'rgba(15,15,40,0.9)', border: `1px solid ${upg.color}25`,
            borderRadius: 16, padding: '14px 14px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, fontSize: 24,
              background: `${upg.color}18`, border: `1px solid ${upg.color}35`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>{upg.icon}</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#e2e8ff' }}>{upg.name}</span>
                <span style={{ fontSize: 10, color: upg.color, fontWeight: 700 }}>
                  {isMax ? 'MAX' : `LV ${curLevel}`}
                </span>
              </div>
              {/* Progress bar */}
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, margin: '6px 0', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress * 100}%`, background: upg.color, borderRadius: 2, transition: 'width 0.3s' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#888' }}>
                  {curVal} {upg.unit}
                  {nextVal !== null && <span style={{ color: '#22c55e' }}> → {nextVal}</span>}
                </span>
                {!isMax && (
                  <button
                    onClick={() => canAfford && buyUpgrade(upg.id)}
                    disabled={!canAfford}
                    style={{
                      padding: '5px 12px', borderRadius: 8, border: 'none',
                      background: canAfford ? upg.color : 'rgba(40,40,60,0.6)',
                      color: canAfford ? '#fff' : '#444',
                      fontWeight: 700, fontSize: 11, cursor: canAfford ? 'pointer' : 'not-allowed',
                    }}
                  >
                    🪙 {fmt(cost)}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Special abilities */}
      <div style={{ fontWeight: 700, fontSize: 13, color: '#888', letterSpacing: 1, marginTop: 4 }}>
        ✨ SPECIAL ABILITIES (GEMS)
      </div>

      {SPECIALS.map(sp => {
        const owned = upgrades[`has_${sp.id}`];
        const canAfford = user.gems >= sp.cost;
        return (
          <div key={sp.id} style={{
            background: owned ? `${sp.color}12` : 'rgba(15,15,40,0.9)',
            border: `1px solid ${owned ? sp.color + '50' : sp.color + '20'}`,
            borderRadius: 16, padding: '14px 14px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ fontSize: 30, flexShrink: 0 }}>{sp.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: owned ? sp.color : '#e2e8ff' }}>{sp.name}</div>
              <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{sp.desc}</div>
            </div>
            {owned ? (
              <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 12 }}>✓ Owned</div>
            ) : (
              <button
                onClick={() => canAfford && buySpecial(sp.id)}
                disabled={!canAfford}
                style={{
                  padding: '8px 12px', borderRadius: 10, border: 'none', flexShrink: 0,
                  background: canAfford ? `linear-gradient(135deg, ${sp.color}, ${sp.color}99)` : 'rgba(40,40,60,0.6)',
                  color: canAfford ? '#fff' : '#444',
                  fontWeight: 700, fontSize: 12, cursor: canAfford ? 'pointer' : 'not-allowed',
                }}
              >
                💎 {sp.cost}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
