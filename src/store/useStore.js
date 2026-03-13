import { create } from 'zustand';
import { api } from '../api/client';

export const useStore = create((set, get) => ({
  // State
  loaded: false,
  user: null,
  upgrades: null,
  tasks: [],
  completedTaskIds: [],
  energyStatus: { current: 5, max: 5, secondsUntilNext: 0 },
  adStatus: { watched: 0, adsMax: 3 },
  levelRecords: {},
  notification: null,
  screen: 'home', // 'home' | 'game' | 'upgrades' | 'shop' | 'tasks' | 'leaderboard'

  // ---- NAVIGATION ----
  setScreen: (screen) => set({ screen }),

  // ---- NOTIFICATION ----
  notify: (msg, type = 'success') => {
    set({ notification: { msg, type, id: Date.now() } });
    setTimeout(() => set(s => s.notification?.msg === msg ? { notification: null } : {}), 3000);
  },

  // ---- INIT ----
  init: async () => {
    try {
      const twa = window.Telegram?.WebApp;
      if (twa) { twa.ready(); twa.expand(); twa.setHeaderColor('#080820'); twa.setBackgroundColor('#080820'); twa.disableVerticalSwipes?.(); }

      const startParam = twa?.initDataUnsafe?.start_param;
      const data = await api.login(startParam);

      // Load level records
      const recordsRes = await api.getLevelRecords().catch(() => ({ records: [] }));
      const recordsMap = {};
      for (const r of recordsRes.records || []) recordsMap[r.level_num] = r;

      set({
        loaded: true,
        user: data.user,
        upgrades: data.upgrades,
        tasks: data.tasks,
        completedTaskIds: data.completedTaskIds,
        energyStatus: { current: data.user.energy, max: data.user.energy_max || 5, secondsUntilNext: 0 },
        levelRecords: recordsMap,
      });

      if (data.dailyReward) {
        const r = data.dailyReward;
        get().notify(`🎁 Day ${r.day}! +${r.coins > 0 ? r.coins + ' coins' : ''}${r.gems > 0 ? r.gems + ' gems' : ''}`, 'reward');
      }

      // Start energy timer
      get()._startEnergyTick();
    } catch (err) {
      console.error('Init failed:', err);
      set({ loaded: true });
    }
  },

  // ---- ENERGY COUNTDOWN ----
  _energyTimer: null,
  _startEnergyTick: () => {
    if (get()._energyTimer) clearInterval(get()._energyTimer);
    const timer = setInterval(async () => {
      const { energyStatus } = get();
      if (energyStatus.current < energyStatus.max) {
        const res = await api.getEnergyStatus().catch(() => null);
        if (res) set({ energyStatus: res, adStatus: { watched: res.adsWatched || 0, adsMax: res.adsMax || 3 } });
      }
    }, 15000);
    set({ _energyTimer: timer });
  },

  // ---- PLAY LEVEL ----
  startLevel: async (levelNum) => {
    try {
      const res = await api.useEnergy();
      set(s => ({
        user: { ...s.user, energy: res.energy },
        energyStatus: { ...s.energyStatus, current: res.energy },
        screen: 'game',
      }));
      return true;
    } catch (err) {
      get().notify(`❌ ${err.message || 'Not enough energy'}`, 'error');
      return false;
    }
  },

  // ---- COMPLETE LEVEL ----
  completeLevel: async ({ levelNum, coinsEarned, timeSec, ballsDestroyed }) => {
    try {
      const res = await api.completeLevel({ level_num: levelNum, coins_earned: coinsEarned, time_seconds: timeSec, balls_destroyed: ballsDestroyed });
      set(s => ({
        user: { ...s.user, coins: s.user.coins + coinsEarned, current_level: res.nextLevel, max_level_reached: Math.max(s.user.max_level_reached || 1, levelNum) },
        levelRecords: { ...s.levelRecords, [levelNum]: { level_num: levelNum, stars: res.stars, best_time_seconds: timeSec } },
      }));
      return res;
    } catch (err) {
      console.error('Complete level error:', err);
      return null;
    }
  },

  // ---- UPGRADES ----
  buyUpgrade: async (upgradeId) => {
    try {
      const res = await api.buyUpgrade(upgradeId);
      const updatedUpgrades = { ...get().upgrades, [`${upgradeId}_level`]: res.newLevel };
      const updatedUser = { ...get().user, coins: get().user.coins - res.cost };
      set({ upgrades: updatedUpgrades, user: updatedUser });
      get().notify(`⬆️ ${upgradeId.replace('_', ' ')} upgraded!`);
    } catch (err) {
      get().notify(`❌ ${err.message}`, 'error');
    }
  },

  buySpecial: async (specialId) => {
    try {
      await api.buySpecial(specialId);
      set(s => ({
        upgrades: { ...s.upgrades, [`has_${specialId}`]: true },
        user: { ...s.user, gems: s.user.gems - (specialId === 'explosive' ? 100 : 80) },
      }));
      get().notify('✨ Special ability unlocked!', 'reward');
    } catch (err) {
      get().notify(`❌ ${err.message}`, 'error');
    }
  },

  // ---- SHOP ----
  buyGems: async (packageId) => {
    try {
      const res = await api.createInvoice(packageId);
      window.Telegram?.WebApp?.openInvoice(res.invoiceLink, (status) => {
        if (status === 'paid') {
          setTimeout(() => api.login(null).then(d => set({ user: d.user })), 2000);
          get().notify('💎 Purchase successful!', 'reward');
        }
      });
    } catch (err) {
      get().notify(`❌ ${err.message}`, 'error');
    }
  },

  buyCoins: async (packageId) => {
    try {
      const res = await api.buyCoins(packageId);
      set(s => ({ user: { ...s.user, coins: res.coins, gems: res.gems } }));
      get().notify('🪙 Coins added!', 'reward');
    } catch (err) {
      get().notify(`❌ ${err.message}`, 'error');
    }
  },

  buyEnergy: async (packageId) => {
    try {
      const res = await api.buyEnergy(packageId);
      set(s => ({ user: { ...s.user, energy: res.energy, gems: res.gems }, energyStatus: { ...s.energyStatus, current: res.energy } }));
      get().notify('⚡ Energy added!', 'reward');
    } catch (err) {
      get().notify(`❌ ${err.message}`, 'error');
    }
  },

  // ---- ADS ----
  watchAd: async () => {
    const ADSGRAM_BLOCK_ID = import.meta.env.VITE_ADSGRAM_BLOCK_ID;
    const doReward = async () => {
      const res = await api.adReward();
      set(s => ({
        user: { ...s.user, energy: res.energy, coins: s.user.coins + res.coinsReward },
        energyStatus: { ...s.energyStatus, current: res.energy },
        adStatus: { watched: res.adsWatched, adsMax: res.adsMax },
      }));
      get().notify(`📺 +1 Energy & +${res.coinsReward} coins!`, 'reward');
    };

    if (ADSGRAM_BLOCK_ID && window.Adsgram) {
      try {
        const controller = window.Adsgram.init({ blockId: ADSGRAM_BLOCK_ID });
        controller.show().then(doReward).catch(() => get().notify('Ad not available', 'error'));
      } catch { doReward(); }
    } else {
      await doReward().catch(err => get().notify(`❌ ${err.message}`, 'error'));
    }
  },

  // ---- TASKS ----
  completeTask: async (taskId, externalLink) => {
    if (externalLink) {
      window.Telegram?.WebApp?.openLink
        ? window.Telegram.WebApp.openLink(externalLink)
        : window.open(externalLink, '_blank');
      await new Promise(r => setTimeout(r, 1500));
    }
    try {
      const res = await api.completeTask(taskId);
      set(s => ({
        completedTaskIds: [...s.completedTaskIds, taskId],
        user: { ...s.user, coins: s.user.coins + res.reward.coins, gems: s.user.gems + res.reward.gems },
      }));
      const msg = res.reward.gems > 0 ? `🎉 +${res.reward.gems} gems!` : `🎉 +${res.reward.coins} coins!`;
      get().notify(msg, 'reward');
    } catch (err) {
      get().notify(`❌ ${err.message}`, 'error');
    }
  },
}));

// Helpers
export function fmt(n) {
  n = Math.floor(n || 0);
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toLocaleString();
}

export function getGunStats(upgrades) {
  if (!upgrades) return { damage: 1, fireRate: 2, multiShot: 1, bulletSize: 4, bulletSpeed: 400, hasExplosive: false, hasShield: false };
  const dmgLvl = upgrades.damage_level || 0;
  const frLvl = upgrades.fire_rate_level || 0;
  const msLvl = upgrades.multi_shot_level || 0;
  const bsLvl = upgrades.bullet_size_level || 0;
  const bspLvl = upgrades.bullet_speed_level || 0;
  return {
    damage: Math.max(1, Math.floor(Math.pow(1.4, dmgLvl))),
    fireRate: parseFloat((2 + frLvl * 0.5).toFixed(1)),
    multiShot: msLvl + 1,
    bulletSize: 4 + bsLvl * 2,
    bulletSpeed: 400 + bspLvl * 40,
    hasExplosive: upgrades.has_explosive || false,
    hasShield: upgrades.has_shield || false,
  };
}
