const BASE = import.meta.env.VITE_API_URL || '';

function getInitData() { return window.Telegram?.WebApp?.initData || ''; }

async function req(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': getInitData() },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  login: (ref) => req('POST', '/api/auth/login', { referral_code: ref }),
  getEnergyStatus: () => req('GET', '/api/energy/status'),
  useEnergy: () => req('POST', '/api/energy/use'),
  adReward: () => req('POST', '/api/energy/ad-reward'),
  buyEnergy: (pkg) => req('POST', '/api/energy/buy', { package_id: pkg }),
  buyUpgrade: (id) => req('POST', '/api/upgrades/buy', { upgrade_id: id }),
  buySpecial: (id) => req('POST', '/api/upgrades/buy-special', { special_id: id }),
  buyCoins: (pkg) => req('POST', '/api/upgrades/buy-coins', { package_id: pkg }),
  completeLevel: (d) => req('POST', '/api/levels/complete', d),
  getLevelRecords: () => req('GET', '/api/levels/records'),
  getLeaderboard: () => req('GET', '/api/levels/leaderboard'),
  completeTask: (id) => req('POST', '/api/levels/task-complete', { task_id: id }),
  createInvoice: (pkg) => req('POST', '/api/payment/create-invoice', { package_id: pkg }),
};
