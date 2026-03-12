const API_URL = import.meta.env.VITE_API_URL || '';

function getInitData() {
  return window.Telegram?.WebApp?.initData || '';
}

async function request(method, path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-telegram-init-data': getInitData(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (referral_code) => request('POST', '/api/auth/login', { referral_code }),

  // Game
  getState: () => request('GET', '/api/game/state'),
  tap: (taps) => request('POST', '/api/game/tap', { taps }),
  collectOffline: () => request('POST', '/api/game/collect-offline'),
  upgradeTap: () => request('POST', '/api/game/upgrade-tap'),
  prestige: () => request('POST', '/api/game/prestige'),
  getLeaderboard: () => request('GET', '/api/game/leaderboard'),

  // Buildings
  buyBuilding: (building_id) => request('POST', '/api/buildings/buy', { building_id }),
  upgradeBuilding: (building_id) => request('POST', '/api/buildings/upgrade', { building_id }),
  collectBuilding: (building_id) => request('POST', '/api/buildings/collect', { building_id }),
  collectAll: () => request('POST', '/api/buildings/collect-all'),

  // Heroes
  summonHero: (count) => request('POST', '/api/heroes/summon', { count }),

  // Tasks
  completeTask: (task_id) => request('POST', '/api/tasks/complete', { task_id }),

  // Ads
  adReward: () => request('POST', '/api/ads/reward'),
  adStatus: () => request('GET', '/api/ads/status'),

  // Payment
  createInvoice: (package_id) => request('POST', '/api/payment/create-invoice', { package_id }),
  getPackages: () => request('GET', '/api/payment/packages'),
};
