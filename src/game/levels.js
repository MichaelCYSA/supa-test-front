// ============================================================
// BALL BLAST - Level Generator (500 levels)
// ============================================================

// Ball radius by size
const RADII = { 1: 22, 2: 36, 3: 50, 4: 64 };

export function generateLevel(levelNum, canvasWidth = 390) {
  const W = canvasWidth;

  // Difficulty tiers (every 50 levels)
  const tier = Math.floor((levelNum - 1) / 50); // 0-9
  const inTier = (levelNum - 1) % 50;

  // Base HP: exponential growth
  const baseHp = Math.ceil(5 * Math.pow(1.12, levelNum - 1));

  // Ball count: 2 at L1, up to 8 at L200+
  const ballCount = Math.min(2 + Math.floor(levelNum / 25), 8);

  // Ball speed: increases with level
  const baseSpeed = 1.2 + Math.min(levelNum * 0.012, 3.5);

  // Size distribution: higher levels introduce bigger balls
  const maxSize = Math.min(1 + Math.floor(levelNum / 20), 4);

  const balls = [];
  const spacing = (W - 120) / Math.max(1, ballCount - 1);

  for (let i = 0; i < ballCount; i++) {
    // Vary sizes but never exceed maxSize
    let size;
    const roll = Math.random();
    if (maxSize >= 4 && roll > 0.75) size = 4;
    else if (maxSize >= 3 && roll > 0.5) size = 3;
    else if (maxSize >= 2 && roll > 0.25) size = 2;
    else size = 1;

    size = Math.min(size, maxSize);

    const radius = RADII[size];
    const hp = Math.ceil(baseHp * (size * size * 0.8));
    const startX = 60 + spacing * i + (Math.random() - 0.5) * 30;
    const startY = -(radius + 20 + i * 15);
    const speedVariation = 0.8 + Math.random() * 0.4;
    const vx = (Math.random() - 0.5) * baseSpeed * 1.5;
    const vy = baseSpeed * speedVariation;

    balls.push({
      size,
      hp,
      maxHp: hp,
      x: Math.max(radius + 10, Math.min(W - radius - 10, startX)),
      y: startY,
      vx: vx === 0 ? 0.5 : vx,
      vy: Math.max(0.8, vy),
      radius,
    });
  }

  // Coin reward (scales with level)
  const baseCoins = 50 + levelNum * 8 + tier * 200;

  // Bonus for completing cleanly
  const coinReward = baseCoins;

  // Stars thresholds (time in seconds)
  const timeFor3Stars = Math.max(8, 20 - Math.floor(levelNum / 30));
  const timeFor2Stars = timeFor3Stars * 2;

  return {
    levelNum,
    balls,
    coinReward,
    timeFor3Stars,
    timeFor2Stars,
    ballCount,
    tier,
  };
}

export function getStars(timeSec, timeFor3, timeFor2) {
  if (timeSec <= timeFor3) return 3;
  if (timeSec <= timeFor2) return 2;
  return 1;
}

export function getLevelInfo(levelNum) {
  const tier = Math.floor((levelNum - 1) / 50);
  const tierNames = ['Beginner', 'Apprentice', 'Fighter', 'Warrior', 'Elite', 'Master', 'Champion', 'Legend', 'Mythic', 'Godlike'];
  const tierColors = ['#6b7280', '#3b82f6', '#22c55e', '#eab308', '#f97316', '#ef4444', '#a855f7', '#06b6d4', '#f43f5e', '#fbbf24'];

  return {
    tier,
    tierName: tierNames[Math.min(tier, tierNames.length - 1)],
    tierColor: tierColors[Math.min(tier, tierColors.length - 1)],
    world: Math.ceil(levelNum / 10),
  };
}
