// ============================================================
// BALL BLAST ENGINE - Pure Canvas Game
// ============================================================

const BALL_COLORS = ['#ff4757','#ff6b35','#ffa502','#2ed573','#1e90ff','#a855f7','#ff4da6','#00d2d3'];

const CANNON_HEIGHT = 60;
const CANNON_WIDTH = 32;
const FLOOR_Y_OFFSET = 80; // cannon bottom margin

export class BallBlastEngine {
  constructor(canvas, gunStats, callbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gun = gunStats;
    this.cb = callbacks; // { onWin, onLose, onCoin, onScore }

    this.W = canvas.width;
    this.H = canvas.height;
    this.FLOOR_Y = this.H - FLOOR_Y_OFFSET;

    this.balls = [];
    this.bullets = [];
    this.particles = [];
    this.coinTexts = []; // floating "+N" text effects

    this.cannon = { x: this.W / 2, targetX: this.W / 2 };
    this.score = 0;
    this.coinsEarned = 0;
    this.ballsDestroyed = 0;
    this.shieldUsed = false;

    this.running = false;
    this.raf = null;
    this.lastTime = 0;
    this.lastFireTime = 0;
    this.startTime = 0;

    // BG stars
    this.stars = Array.from({ length: 50 }, () => ({
      x: Math.random() * 1000,
      y: Math.random() * 1000,
      r: Math.random() * 1.5 + 0.5,
      a: Math.random() * 0.7 + 0.3,
    }));

    this._bindInput();
  }

  loadLevel(levelData) {
    this.balls = levelData.balls.map(b => ({
      ...b,
      color: BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)],
      dead: false,
      flashTimer: 0,
    }));
    this.bullets = [];
    this.particles = [];
    this.coinTexts = [];
    this.coinsEarned = 0;
    this.ballsDestroyed = 0;
    this.score = 0;
    this.shieldUsed = false;
    this.cannon.x = this.W / 2;
    this.cannon.targetX = this.W / 2;
  }

  start() {
    this.running = true;
    this.startTime = performance.now();
    this.lastTime = this.startTime;
    this.lastFireTime = this.startTime;
    this._loop(this.startTime);
  }

  stop() {
    this.running = false;
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
  }

  destroy() {
    this.stop();
    this.canvas.removeEventListener('touchstart', this._onTouchStart);
    this.canvas.removeEventListener('touchmove', this._onTouchMove);
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
  }

  _bindInput() {
    const getX = (clientX) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.W / rect.width;
      return Math.max(CANNON_WIDTH, Math.min(this.W - CANNON_WIDTH, (clientX - rect.left) * scaleX));
    };
    this._onTouchStart = (e) => { this.cannon.targetX = getX(e.touches[0].clientX); };
    this._onTouchMove = (e) => { e.preventDefault(); this.cannon.targetX = getX(e.touches[0].clientX); };
    this._onMouseMove = (e) => { this.cannon.targetX = getX(e.clientX); };
    this.canvas.addEventListener('touchstart', this._onTouchStart, { passive: true });
    this.canvas.addEventListener('touchmove', this._onTouchMove, { passive: false });
    this.canvas.addEventListener('mousemove', this._onMouseMove);
  }

  _loop(ts) {
    if (!this.running) return;
    const dt = Math.min((ts - this.lastTime) / 1000, 0.05);
    this.lastTime = ts;
    this._update(dt, ts);
    this._render();
    this.raf = requestAnimationFrame(t => this._loop(t));
  }

  _update(dt, ts) {
    // Move cannon
    const diff = this.cannon.targetX - this.cannon.x;
    this.cannon.x += Math.sign(diff) * Math.min(Math.abs(diff), 900 * dt);

    // Fire
    const interval = 1000 / this.gun.fireRate;
    if (ts - this.lastFireTime >= interval) {
      this._fire();
      this.lastFireTime = ts;
    }

    // Update bullets
    const bspd = this.gun.bulletSpeed;
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      // Wall bounce
      if (b.x - b.r < 0) { b.x = b.r; b.vx = Math.abs(b.vx); }
      if (b.x + b.r > this.W) { b.x = this.W - b.r; b.vx = -Math.abs(b.vx); }
      // Remove if out of bounds
      if (b.y + b.r < 0 || b.y > this.H) { this.bullets.splice(i, 1); }
    }

    // Update balls
    let gameLost = false;
    for (const ball of this.balls) {
      if (ball.dead) continue;
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      ball.flashTimer = Math.max(0, ball.flashTimer - dt);

      // Wall bounce
      if (ball.x - ball.radius < 0) { ball.x = ball.radius; ball.vx = Math.abs(ball.vx); }
      if (ball.x + ball.radius > this.W) { ball.x = this.W - ball.radius; ball.vx = -Math.abs(ball.vx); }
      // Ceiling bounce
      if (ball.y - ball.radius < 0) { ball.y = ball.radius; ball.vy = Math.abs(ball.vy); }
      // Floor = lose
      if (ball.y + ball.radius > this.FLOOR_Y) {
        if (this.gun.hasShield && !this.shieldUsed) {
          this.shieldUsed = true;
          ball.vy = -Math.abs(ball.vy) * 0.8;
          this._spawnParticles(ball.x, this.FLOOR_Y, '#00d2d3', 8);
          this.cb.onScore?.('🛡️ Shield!');
        } else {
          gameLost = true;
        }
      }
    }

    if (gameLost) {
      this.stop();
      this.cb.onLose({ coinsEarned: this.coinsEarned, ballsDestroyed: this.ballsDestroyed });
      return;
    }

    // Collisions
    this._checkCollisions();

    // Process destroyed balls
    const toAdd = [];
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];
      if (!ball.dead && ball.hp <= 0) {
        ball.dead = true;
        this.ballsDestroyed++;

        const coins = ball.size * ball.size * (3 + Math.floor(ball.maxHp / 20));
        this.coinsEarned += coins;
        this._spawnParticles(ball.x, ball.y, ball.color, 10 + ball.size * 3);
        this._addCoinText(ball.x, ball.y, coins);
        this.cb.onCoin?.(coins);

        if (ball.size > 1) {
          const ns = ball.size - 1;
          const nr = 14 + ns * 12;
          const nhp = Math.ceil(ball.maxHp * 0.45);
          for (const side of [-1, 1]) {
            toAdd.push({
              size: ns, hp: nhp, maxHp: nhp,
              x: ball.x + side * ball.radius * 0.5,
              y: ball.y,
              vx: (Math.abs(ball.vx) + 0.5) * side,
              vy: -(Math.abs(ball.vy) * 0.7 + 0.5),
              radius: nr, color: ball.color, dead: false, flashTimer: 0,
            });
          }
        }
      }
    }

    this.balls = this.balls.filter(b => !b.dead);
    this.balls.push(...toAdd);

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 300 * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Update coin texts
    for (let i = this.coinTexts.length - 1; i >= 0; i--) {
      const t = this.coinTexts[i];
      t.y -= 60 * dt;
      t.life -= dt;
      if (t.life <= 0) this.coinTexts.splice(i, 1);
    }

    // Win check
    if (this.balls.length === 0 && this.running) {
      const timeSec = (performance.now() - this.startTime) / 1000;
      this.stop();
      this.cb.onWin({ coinsEarned: this.coinsEarned, ballsDestroyed: this.ballsDestroyed, timeSec });
    }
  }

  _fire() {
    const barrels = this.gun.multiShot;
    const speed = this.gun.bulletSpeed;
    const r = this.gun.bulletSize;
    const spread = barrels > 1 ? 14 : 0; // total degrees spread

    for (let i = 0; i < barrels; i++) {
      const angle = barrels === 1 ? 0 : -spread / 2 + (spread / (barrels - 1)) * i;
      const rad = (angle * Math.PI) / 180;
      this.bullets.push({
        x: this.cannon.x + Math.sin(rad) * 10,
        y: this.FLOOR_Y - CANNON_HEIGHT,
        vx: Math.sin(rad) * speed,
        vy: -speed,
        r,
        damage: this.gun.damage,
      });
    }
  }

  _checkCollisions() {
    for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
      const bul = this.bullets[bi];
      let hit = false;
      for (const ball of this.balls) {
        if (ball.dead || ball.hp <= 0) continue;
        const dx = bul.x - ball.x, dy = bul.y - ball.y;
        if (dx * dx + dy * dy < (bul.r + ball.radius) * (bul.r + ball.radius)) {
          ball.hp -= bul.damage;
          ball.flashTimer = 0.08;

          if (this.gun.hasExplosive) {
            // Area damage
            for (const other of this.balls) {
              if (other === ball || other.dead) continue;
              const ex = bul.x - other.x, ey = bul.y - other.y;
              if (ex * ex + ey * ey < 4000) other.hp -= bul.damage * 0.3;
            }
            this._spawnParticles(bul.x, bul.y, '#ff6b35', 6);
          }

          hit = true;
          break;
        }
      }
      if (hit) this.bullets.splice(bi, 1);
    }
  }

  _spawnParticles(x, y, color, count) {
    if (this.particles.length > 300) return;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.8;
      const spd = 80 + Math.random() * 200;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 40,
        color,
        r: 2 + Math.random() * 3,
        life: 0.25 + Math.random() * 0.35,
      });
    }
  }

  _addCoinText(x, y, coins) {
    this.coinTexts.push({ x, y, text: `+${coins}`, life: 0.9 });
  }

  // ---- RENDER ----
  _render() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;

    // Background
    ctx.fillStyle = '#080820';
    ctx.fillRect(0, 0, W, H);

    // Stars
    for (const s of this.stars) {
      ctx.globalAlpha = s.a;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x % W, s.y % H, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Floor line (danger zone indicator)
    ctx.strokeStyle = 'rgba(255,71,87,0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(0, this.FLOOR_Y);
    ctx.lineTo(W, this.FLOOR_Y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Particles
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / 0.4);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Bullets
    ctx.shadowColor = '#00d4ff';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#00d4ff';
    for (const b of this.bullets) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Balls
    for (const ball of this.balls) {
      if (ball.dead) continue;
      this._drawBall(ball);
    }

    // Coin texts
    ctx.textAlign = 'center';
    ctx.font = 'bold 13px sans-serif';
    for (const t of this.coinTexts) {
      ctx.globalAlpha = Math.min(1, t.life * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;

    // Cannon
    this._drawCannon();
  }

  _drawBall(ball) {
    const ctx = this.ctx;
    const { x, y, radius, hp, maxHp, color, flashTimer } = ball;
    const hpRatio = Math.max(0, hp / maxHp);

    ctx.shadowColor = flashTimer > 0 ? '#ffffff' : color;
    ctx.shadowBlur = flashTimer > 0 ? 25 : 12;

    // Body gradient
    const g = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.35, 1, x, y, radius);
    const baseColor = flashTimer > 0 ? '#ffffff' : color;
    g.addColorStop(0, baseColor + 'ee');
    g.addColorStop(0.7, color + 'aa');
    g.addColorStop(1, color + '44');

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // HP arc ring
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x, y, radius - 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * hpRatio);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.lineCap = 'butt';

    // HP number
    const displayHp = Math.ceil(hp);
    const fs = Math.max(9, Math.min(radius * 0.52, 22));
    const label = displayHp >= 10000 ? `${(displayHp/1000).toFixed(0)}K`
      : displayHp >= 1000 ? `${(displayHp/1000).toFixed(1)}K`
      : displayHp.toString();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${fs}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);
  }

  _drawCannon() {
    const ctx = this.ctx;
    const x = this.cannon.x;
    const y = this.FLOOR_Y;
    const W = CANNON_WIDTH;
    const H = CANNON_HEIGHT;

    ctx.shadowColor = '#4f8ff7';
    ctx.shadowBlur = 18;

    // Barrel
    const barrelGrad = ctx.createLinearGradient(x - 7, 0, x + 7, 0);
    barrelGrad.addColorStop(0, '#1a3a7a');
    barrelGrad.addColorStop(0.5, '#4f8ff7');
    barrelGrad.addColorStop(1, '#1a3a7a');
    ctx.fillStyle = barrelGrad;
    ctx.beginPath();
    ctx.roundRect(x - 6, y - H, 12, H * 0.65, 3);
    ctx.fill();

    // Barrel tip glow
    ctx.fillStyle = '#00d4ff';
    ctx.beginPath();
    ctx.arc(x, y - H, 5, 0, Math.PI * 2);
    ctx.fill();

    // Body
    const bodyGrad = ctx.createLinearGradient(x - W / 2, 0, x + W / 2, 0);
    bodyGrad.addColorStop(0, '#0f1f5c');
    bodyGrad.addColorStop(0.5, '#3060c0');
    bodyGrad.addColorStop(1, '#0f1f5c');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(x - W / 2, y - H * 0.42, W, H * 0.42 + 20, 8);
    ctx.fill();

    // Wheels
    for (const side of [-1, 1]) {
      ctx.fillStyle = '#1a3060';
      ctx.strokeStyle = '#4f8ff7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + side * (W / 2 - 4), y + 4, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
  }

  resize(w, h) {
    this.W = w; this.H = h;
    this.FLOOR_Y = h - FLOOR_Y_OFFSET;
    this.canvas.width = w;
    this.canvas.height = h;
  }
}
