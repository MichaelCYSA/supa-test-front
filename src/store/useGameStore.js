import { create } from 'zustand';
import { api } from '../api/client';

const BUILDINGS_CONFIG = {
  apprentice_hut: { name: 'Apprentice Hut', emoji: '🏚️', baseCost: 100, baseProductionPerHour: 10, unlockAt: 0 },
  spell_library: { name: 'Spell Library', emoji: '📚', baseCost: 500, baseProductionPerHour: 50, unlockAt: 200 },
  alchemy_lab: { name: 'Alchemy Lab', emoji: '⚗️', baseCost: 2000, baseProductionPerHour: 200, unlockAt: 1000 },
  golem_workshop: { name: 'Golem Workshop', emoji: '🤖', baseCost: 8000, baseProductionPerHour: 800, unlockAt: 5000 },
  dragon_nest: { name: 'Dragon Nest', emoji: '🐉', baseCost: 32000, baseProductionPerHour: 3200, unlockAt: 20000 },
  astral_tower: { name: 'Astral Tower', emoji: '🗼', baseCost: 128000, baseProductionPerHour: 12800, unlockAt: 80000 },
  arcane_sanctum: { name: 'Arcane Sanctum', emoji: '⛩️', baseCost: 512000, baseProductionPerHour: 51200, unlockAt: 300000 },
  void_portal: { name: 'Void Portal', emoji: '🌀', baseCost: 2048000, baseProductionPerHour: 204800, unlockAt: 1200000 },
};

const RARITY_COLORS = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

export const BUILDINGS_ORDER = Object.keys(BUILDINGS_CONFIG);

function calcUpgradeCost(buildingId, level) {
  const b = BUILDINGS_CONFIG[buildingId];
  return Math.floor(b.baseCost * Math.pow(1.5, level - 1));
}

function calcProductionPerSec(buildingId, level, globalMult) {
  const b = BUILDINGS_CONFIG[buildingId];
  const hourly = b.baseProductionPerHour * level * Math.pow(1.08, level - 1);
  return (hourly / 3600) * globalMult;
}

function calcGlobalMult(heroes) {
  let mult = 1;
  for (const hero of heroes) {
    if (hero.bonus_type === 'global' || hero.bonus_type === 'all') {
      mult += hero.bonus_per_level * hero.level;
    }
  }
  return mult;
}

export { BUILDINGS_CONFIG, RARITY_COLORS, calcUpgradeCost, calcProductionPerSec };

export const useGameStore = create((set, get) => ({
  // State
  loaded: false,
  user: null,
  buildings: [], // array of { building_id, level, last_collected }
  heroes: [],    // user's owned heroes
  tasks: [],
  completedTaskIds: [],
  adStatus: { watched: 0, limit: 10, remaining: 10 },

  // UI
  activeTab: 'main',
  floatingNumbers: [],
  notification: null,

  // ---- ACTIONS ----

  setTab: (tab) => set({ activeTab: tab }),

  showNotification: (msg, type = 'success') => {
    set({ notification: { msg, type } });
    setTimeout(() => set({ notification: null }), 3000);
  },

  addFloat: (amount, x, y) => {
    const id = Date.now() + Math.random();
    set(s => ({ floatingNumbers: [...s.floatingNumbers, { id, amount, x, y }] }));
    setTimeout(() => {
      set(s => ({ floatingNumbers: s.floatingNumbers.filter(f => f.id !== id) }));
    }, 1200);
  },

  // Load full state from API
  loadState: async () => {
    try {
      const tgWebApp = window.Telegram?.WebApp;
      const startParam = tgWebApp?.initDataUnsafe?.start_param;

      // Login (handles daily reward)
      const loginRes = await api.login(startParam || null);

      // Load full state
      const state = await api.getState();
      const adSt = await api.adStatus().catch(() => ({ watched: 0, limit: 10, remaining: 10 }));

      set({
        loaded: true,
        user: state.user,
        buildings: state.buildings,
        heroes: state.heroes,
        tasks: state.tasks,
        completedTaskIds: state.completedTaskIds,
        adStatus: adSt,
      });

      // Collect offline earnings
      if (state.buildings.length > 0) {
        try {
          const offline = await api.collectOffline();
          if (offline.earned > 0) {
            set(s => ({
              user: { ...s.user, mana: s.user.mana + offline.earned },
              notification: {
                msg: `⚡ Offline: +${formatNumber(offline.earned)} mana`,
                type: 'info',
              },
            }));
            setTimeout(() => set({ notification: null }), 4000);
          }
        } catch {}
      }

      // Show daily reward
      if (loginRes.dailyReward) {
        const r = loginRes.dailyReward;
        const msg = r.crystals > 0
          ? `🎁 Day ${r.day} reward: +${r.crystals} crystals!`
          : `🎁 Day ${r.day} reward: +${formatNumber(r.mana)} mana!`;
        set({ notification: { msg, type: 'reward' } });
        setTimeout(() => set({ notification: null }), 4000);
      }

      // Start passive income tick
      get()._startTick();
    } catch (err) {
      console.error('Load state failed:', err);
      set({ loaded: true }); // show error state
    }
  },

  // Passive income simulation (client-side)
  _tickInterval: null,
  _startTick: () => {
    const store = get();
    if (store._tickInterval) clearInterval(store._tickInterval);
    const interval = setInterval(() => {
      const s = get();
      if (!s.user || !s.buildings.length) return;
      const globalMult = 1; // simplified, full calc on server
      let totalPerSec = 0;
      for (const b of s.buildings) {
        totalPerSec += calcProductionPerSec(b.building_id, b.level, globalMult);
      }
      set(ss => ({
        user: {
          ...ss.user,
          mana: ss.user.mana + totalPerSec,
          total_mana_earned: ss.user.total_mana_earned + totalPerSec,
        },
      }));
    }, 1000);
    set({ _tickInterval: interval });
  },

  // Tap batch queue
  _pendingTaps: 0,
  _tapTimer: null,
  tap: (x, y) => {
    const s = get();
    if (!s.user) return;

    // Optimistic update
    const tapPower = s.user.tap_upgrades > 0 ? [1,2,5,10,20,50,100,250,500][s.user.tap_upgrades] || 1 : 1;
    set(ss => ({
      user: {
        ...ss.user,
        mana: ss.user.mana + tapPower,
        total_mana_earned: ss.user.total_mana_earned + tapPower,
        total_taps: (ss.user.total_taps || 0) + 1,
      },
      _pendingTaps: ss._pendingTaps + 1,
    }));

    // Haptic
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');

    // Floating number
    get().addFloat(`+${tapPower}`, x, y);

    // Flush to server every 2s
    clearTimeout(get()._tapTimer);
    const timer = setTimeout(async () => {
      const pending = get()._pendingTaps;
      if (pending > 0) {
        set({ _pendingTaps: 0 });
        try {
          await api.tap(pending);
        } catch {}
      }
    }, 2000);
    set({ _tapTimer: timer });
  },

  // Buildings
  buyBuilding: async (buildingId) => {
    try {
      await api.buyBuilding(buildingId);
      const state = await api.getState();
      set({ user: state.user, buildings: state.buildings });
      get().showNotification(`✅ ${BUILDINGS_CONFIG[buildingId].name} purchased!`);
    } catch (err) {
      get().showNotification(`❌ ${err.message}`, 'error');
    }
  },

  upgradeBuilding: async (buildingId) => {
    try {
      const res = await api.upgradeBuilding(buildingId);
      const state = await api.getState();
      set({ user: state.user, buildings: state.buildings });
      get().showNotification(`⬆️ Upgraded to level ${res.newLevel}!`);
    } catch (err) {
      get().showNotification(`❌ ${err.message}`, 'error');
    }
  },

  collectAll: async () => {
    try {
      const res = await api.collectAll();
      if (res.totalEarned > 0) {
        set(s => ({
          user: { ...s.user, mana: s.user.mana + res.totalEarned },
          buildings: s.buildings.map(b => ({ ...b, last_collected: new Date().toISOString() })),
        }));
        get().showNotification(`✨ Collected ${formatNumber(res.totalEarned)} mana!`);
      }
    } catch (err) {
      get().showNotification(`❌ ${err.message}`, 'error');
    }
  },

  // Heroes
  summonHero: async (count) => {
    try {
      const res = await api.summonHero(count);
      const state = await api.getState();
      set({ user: state.user, heroes: state.heroes });
      return res.results;
    } catch (err) {
      get().showNotification(`❌ ${err.message}`, 'error');
      return null;
    }
  },

  // Tasks
  completeTask: async (taskId) => {
    try {
      const res = await api.completeTask(taskId);
      set(s => ({
        completedTaskIds: [...s.completedTaskIds, taskId],
        user: {
          ...s.user,
          mana: s.user.mana + res.reward.mana,
          crystals: s.user.crystals + res.reward.crystals,
        },
      }));
      const msg = res.reward.crystals > 0
        ? `🎉 +${res.reward.crystals} crystals!`
        : `🎉 +${formatNumber(res.reward.mana)} mana!`;
      get().showNotification(msg, 'reward');
    } catch (err) {
      get().showNotification(`❌ ${err.message}`, 'error');
    }
  },

  // Ads
  watchAd: async () => {
    // This triggers Adsgram SDK on client, then calls our API
    try {
      const res = await api.adReward();
      set(s => ({
        user: { ...s.user, mana: s.user.mana + res.manaReward },
        adStatus: { ...s.adStatus, watched: res.adsWatched, remaining: res.adsRemaining },
      }));
      get().showNotification(`📺 +${formatNumber(res.manaReward)} mana from ad!`, 'reward');
    } catch (err) {
      get().showNotification(`❌ ${err.message}`, 'error');
    }
  },

  // Payment
  buyPackage: async (packageId) => {
    try {
      const res = await api.createInvoice(packageId);
      // Open Telegram payment
      window.Telegram?.WebApp?.openInvoice(res.invoiceLink, (status) => {
        if (status === 'paid') {
          // Reload state to get new crystals
          setTimeout(() => get().loadState(), 2000);
          get().showNotification('💎 Purchase successful!', 'reward');
        }
      });
    } catch (err) {
      get().showNotification(`❌ ${err.message}`, 'error');
    }
  },

  upgradeTap: async () => {
    try {
      const res = await api.upgradeTap();
      set(s => ({
        user: {
          ...s.user,
          tap_upgrades: res.newLevel,
          mana: s.user.mana - res.upgrade.cost,
        },
      }));
      get().showNotification(`👆 Tap upgraded: ${res.upgrade.label}!`, 'success');
    } catch (err) {
      get().showNotification(`❌ ${err.message}`, 'error');
    }
  },

  prestige: async () => {
    try {
      const res = await api.prestige();
      const state = await api.getState();
      set({
        user: state.user,
        buildings: state.buildings,
        heroes: state.heroes,
      });
      get().showNotification(`✨ Ascended! You have ${res.essence} essence!`, 'reward');
    } catch (err) {
      get().showNotification(`❌ ${err.message}`, 'error');
    }
  },
}));

export function formatNumber(n) {
  n = Math.floor(n);
  if (n >= 1e15) return (n / 1e15).toFixed(1) + 'Q';
  if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toLocaleString();
}
