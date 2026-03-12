import { useGameStore, formatNumber, BUILDINGS_CONFIG, BUILDINGS_ORDER, calcUpgradeCost, calcProductionPerSec } from '../../store/useGameStore';

export default function BuildingsScreen() {
  const { user, buildings, heroes, buyBuilding, upgradeBuilding, collectAll } = useGameStore();
  if (!user) return null;

  const ownedMap = {};
  for (const b of buildings) ownedMap[b.building_id] = b;

  let totalPerSec = 0;
  for (const b of buildings) {
    totalPerSec += calcProductionPerSec(b.building_id, b.level, 1);
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Top bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: '#c4b5fd', fontWeight: 700 }}>
            Buildings
          </div>
          <div style={{ fontSize: 11, color: '#7c6aad' }}>
            🏭 {formatNumber(totalPerSec * 3600)}/hr
          </div>
        </div>
        {buildings.length > 0 && (
          <button
            className="btn btn-primary"
            onClick={collectAll}
            style={{ fontSize: 12, padding: '8px 14px' }}
          >
            ✨ Collect All
          </button>
        )}
      </div>

      {/* Buildings list */}
      {BUILDINGS_ORDER.map(buildingId => {
        const config = BUILDINGS_CONFIG[buildingId];
        const owned = ownedMap[buildingId];
        const isUnlocked = user.total_mana_earned >= config.unlockAt;
        const isOwned = !!owned;
        const level = owned?.level || 0;
        const upgradeCost = isOwned ? calcUpgradeCost(buildingId, level) : config.baseCost;
        const canAfford = user.mana >= upgradeCost;
        const maxLevel = level >= 25;
        const prodPerHour = isOwned ? calcProductionPerSec(buildingId, level, 1) * 3600 : 0;

        // Collect readiness
        const secondsSince = isOwned
          ? Math.max(0, (Date.now() - new Date(owned.last_collected).getTime()) / 1000)
          : 0;
        const prodPerSec = calcProductionPerSec(buildingId, level, 1);
        const pendingMana = Math.min(Math.floor(prodPerSec * secondsSince), Math.floor(prodPerSec * 4 * 3600));
        const hasPending = pendingMana > 0;

        return (
          <div
            key={buildingId}
            style={{
              background: isOwned ? 'rgba(124,58,237,0.12)' : 'rgba(20,0,40,0.5)',
              border: `1px solid ${isOwned ? 'rgba(124,58,237,0.35)' : 'rgba(60,30,80,0.4)'}`,
              borderRadius: 16,
              padding: 14,
              opacity: isUnlocked ? 1 : 0.5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Emoji */}
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: isOwned ? 'rgba(124,58,237,0.2)' : 'rgba(40,20,60,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                flexShrink: 0,
                border: `1px solid ${isOwned ? 'rgba(124,58,237,0.3)' : 'rgba(60,30,80,0.3)'}`,
                filter: isOwned ? '' : 'grayscale(0.7)',
              }}>
                {config.emoji}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: isOwned ? '#e2d9ff' : '#7c6aad',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {config.name}
                  </span>
                  {isOwned && (
                    <span style={{
                      background: 'rgba(124,58,237,0.3)',
                      color: '#c4b5fd',
                      fontSize: 9,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 8,
                      flexShrink: 0,
                    }}>
                      LVL {level}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#7c6aad', marginTop: 2 }}>
                  {isOwned
                    ? `⚡ ${formatNumber(prodPerHour)}/hr`
                    : isUnlocked
                      ? config.description
                      : `🔒 Earn ${formatNumber(config.unlockAt)} total mana`
                  }
                </div>
                {isOwned && hasPending && (
                  <div style={{ fontSize: 11, color: '#fbbf24', marginTop: 2 }}>
                    ✨ {formatNumber(pendingMana)} ready
                  </div>
                )}
              </div>

              {/* Action button */}
              <div style={{ flexShrink: 0 }}>
                {!isUnlocked ? (
                  <div style={{ fontSize: 20 }}>🔒</div>
                ) : !isOwned ? (
                  <button
                    className={`btn btn-primary ${canAfford ? '' : 'btn-disabled'}`}
                    onClick={() => canAfford && buyBuilding(buildingId)}
                    style={{ fontSize: 11, padding: '7px 12px', flexDirection: 'column', gap: 2 }}
                  >
                    <span>Buy</span>
                    <span style={{ fontSize: 10, opacity: 0.8 }}>✨{formatNumber(config.baseCost)}</span>
                  </button>
                ) : maxLevel ? (
                  <div style={{
                    fontSize: 11,
                    color: '#fbbf24',
                    background: 'rgba(251,191,36,0.1)',
                    border: '1px solid rgba(251,191,36,0.3)',
                    borderRadius: 8,
                    padding: '6px 10px',
                    fontWeight: 700,
                  }}>
                    MAX ⭐
                  </div>
                ) : (
                  <button
                    className={`btn ${canAfford ? 'btn-primary' : 'btn-ghost btn-disabled'}`}
                    onClick={() => canAfford && upgradeBuilding(buildingId)}
                    style={{ fontSize: 11, padding: '7px 12px', flexDirection: 'column', gap: 2 }}
                  >
                    <span>↑ UP</span>
                    <span style={{ fontSize: 10, opacity: 0.8 }}>✨{formatNumber(upgradeCost)}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
