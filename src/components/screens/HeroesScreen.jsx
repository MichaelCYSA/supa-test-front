import { useState } from 'react';
import { useGameStore, formatNumber } from '../../store/useGameStore';

const HEROES_CONFIG = [
  { id: 'apprentice', name: 'Young Apprentice', rarity: 'common', emoji: '🧙', description: '+10% Apprentice Hut/level' },
  { id: 'scholar', name: 'Scholar', rarity: 'common', emoji: '📖', description: '+10% Spell Library/level' },
  { id: 'alchemist', name: 'Alchemist', rarity: 'common', emoji: '🧪', description: '+10% Alchemy Lab/level' },
  { id: 'tinker', name: 'Tinker', rarity: 'common', emoji: '⚙️', description: '+10% Golem Workshop/level' },
  { id: 'dragonkeeper', name: 'Dragon Keeper', rarity: 'common', emoji: '🦎', description: '+10% Dragon Nest/level' },
  { id: 'stargazer', name: 'Stargazer', rarity: 'common', emoji: '⭐', description: '+10% Astral Tower/level' },
  { id: 'war_mage', name: 'War Mage', rarity: 'rare', emoji: '⚔️', description: '+25% tap power/level' },
  { id: 'time_bender', name: 'Time Bender', rarity: 'rare', emoji: '⏳', description: '+25% offline time/level' },
  { id: 'void_witch', name: 'Void Witch', rarity: 'rare', emoji: '🔮', description: '+30% Void Portal/level' },
  { id: 'arcane_scholar', name: 'Arcane Scholar', rarity: 'rare', emoji: '🌙', description: '+15% global/level' },
  { id: 'archmage', name: 'Archmage', rarity: 'epic', emoji: '🧝', description: '+40% global/level' },
  { id: 'phoenix', name: 'Phoenix', rarity: 'epic', emoji: '🔥', description: '+50% tap power/level' },
  { id: 'elder_dragon', name: 'Elder Dragon', rarity: 'epic', emoji: '🐲', description: '+35% global/level' },
  { id: 'void_lord', name: 'Void Lord', rarity: 'legendary', emoji: '👁️', description: '+80% global/level' },
  { id: 'the_creator', name: 'The Creator', rarity: 'legendary', emoji: '✨', description: '+100% all/level' },
];

const RARITY_COLORS = { common: '#9ca3af', rare: '#3b82f6', epic: '#a855f7', legendary: '#f59e0b' };
const RARITY_BG = {
  common: 'rgba(156,163,175,0.1)',
  rare: 'rgba(59,130,246,0.12)',
  epic: 'rgba(168,85,247,0.12)',
  legendary: 'rgba(245,158,11,0.15)',
};

export default function HeroesScreen() {
  const { user, heroes, summonHero } = useGameStore();
  const [summoning, setSummoning] = useState(false);
  const [results, setResults] = useState(null);

  if (!user) return null;

  const SINGLE_COST = 100;
  const TEN_COST = 900;
  const ownedMap = {};
  for (const h of heroes) ownedMap[h.hero_id] = h;

  const handleSummon = async (count) => {
    setSummoning(true);
    setResults(null);
    const res = await summonHero(count);
    if (res) setResults(res);
    setSummoning(false);
  };

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: '#c4b5fd', fontWeight: 700 }}>
          Heroes
        </div>
        <div style={{ fontSize: 11, color: '#7c6aad' }}>
          {heroes.length}/{HEROES_CONFIG.length} collected
        </div>
      </div>

      {/* Summon buttons */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(30,0,80,0.3))',
        border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: 20,
        padding: 16,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 32, marginBottom: 6 }}>🎴</div>
        <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, color: '#c4b5fd', marginBottom: 4 }}>
          Summon Heroes
        </div>
        <div style={{ fontSize: 11, color: '#7c6aad', marginBottom: 14 }}>
          Common 60% · Rare 25% · Epic 12% · Legendary 3%
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className={`btn btn-primary ${user.crystals >= SINGLE_COST ? '' : 'btn-disabled'}`}
            onClick={() => user.crystals >= SINGLE_COST && handleSummon(1)}
            style={{ flex: 1, fontSize: 13 }}
            disabled={summoning}
          >
            💎 {SINGLE_COST} · ×1
          </button>
          <button
            className={`btn btn-gold ${user.crystals >= TEN_COST ? '' : 'btn-disabled'}`}
            onClick={() => user.crystals >= TEN_COST && handleSummon(10)}
            style={{ flex: 1, fontSize: 13 }}
            disabled={summoning}
          >
            💎 {TEN_COST} · ×10
          </button>
        </div>
      </div>

      {/* Summon results */}
      {summoning && (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <div style={{ fontSize: 40, animation: 'spin-slow 1s linear infinite' }}>🔮</div>
          <div style={{ color: '#c4b5fd', marginTop: 8 }}>Summoning...</div>
        </div>
      )}

      {results && !summoning && (
        <div style={{
          background: 'rgba(10,0,21,0.8)',
          border: '1px solid rgba(124,58,237,0.4)',
          borderRadius: 16,
          padding: 14,
          animation: 'bounce-in 0.3s ease',
        }}>
          <div style={{ textAlign: 'center', fontFamily: "'Cinzel', serif", fontSize: 14, color: '#c4b5fd', marginBottom: 12 }}>
            🎉 Summon Results
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {results.map((r, i) => (
              <div
                key={i}
                style={{
                  background: RARITY_BG[r.hero.rarity],
                  border: `1px solid ${RARITY_COLORS[r.hero.rarity]}50`,
                  borderRadius: 12,
                  padding: '8px 12px',
                  textAlign: 'center',
                  minWidth: 70,
                }}
              >
                <div style={{ fontSize: 24 }}>{r.hero.emoji}</div>
                <div style={{ fontSize: 10, color: RARITY_COLORS[r.hero.rarity], fontWeight: 700, marginTop: 2 }}>
                  {r.hero.name}
                </div>
                {r.isDuplicate && (
                  <div style={{ fontSize: 9, color: '#fbbf24', marginTop: 1 }}>
                    +1 LVL
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => setResults(null)}
            style={{ width: '100%', marginTop: 12, fontSize: 12 }}
          >
            Close
          </button>
        </div>
      )}

      {/* Hero collection */}
      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: '#7c6aad', letterSpacing: 1 }}>
        COLLECTION
      </div>

      {['legendary', 'epic', 'rare', 'common'].map(rarity => {
        const rarityHeroes = HEROES_CONFIG.filter(h => h.rarity === rarity);
        return (
          <div key={rarity}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              color: RARITY_COLORS[rarity],
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 8,
            }}>
              {rarity}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {rarityHeroes.map(hero => {
                const owned = ownedMap[hero.id];
                return (
                  <div
                    key={hero.id}
                    style={{
                      background: owned ? RARITY_BG[rarity] : 'rgba(20,0,40,0.5)',
                      border: `1px solid ${owned ? RARITY_COLORS[rarity] + '50' : 'rgba(60,30,80,0.3)'}`,
                      borderRadius: 14,
                      padding: '12px 8px',
                      textAlign: 'center',
                      filter: owned ? '' : 'grayscale(0.8) opacity(0.5)',
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 4, position: 'relative' }}>
                      {hero.emoji}
                      {owned && (
                        <span style={{
                          position: 'absolute',
                          top: -4,
                          right: -4,
                          background: RARITY_COLORS[rarity],
                          color: '#000',
                          fontSize: 8,
                          fontWeight: 900,
                          padding: '1px 4px',
                          borderRadius: 6,
                        }}>
                          {owned.level}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: owned ? '#e2d9ff' : '#555', lineHeight: 1.2 }}>
                      {hero.name}
                    </div>
                    {owned && (
                      <div style={{ fontSize: 8, color: '#7c6aad', marginTop: 3 }}>
                        {hero.description}
                      </div>
                    )}
                    {!owned && (
                      <div style={{ fontSize: 9, color: '#555', marginTop: 2 }}>???</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
