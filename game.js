// ── Constants ──────────────────────────────────────────────────────────────
const CANVAS_W = 800;
const CANVAS_H = 450;
const GROUND_Y = 400;

const GRAVITY    = 0.5;
const JUMP_VY    = -12;
const MOVE_SPEED = 3;
const MAX_FALL   = 18;

const WALL_SLIDE_SPEED = 1.5;
const WALL_JUMP_VX     = 4.5;

const PLAYER_W       = 28;
const PLAYER_H       = 48;
const PLAYER_MAX_HP  = 3;
const PLAYER_IFRAMES = 90;
const PLAYER_DRAW    = 72; // sprite draw size (square)

const ENEMY_W               = 28;
const ENEMY_H               = 44;
const ENEMY_SPEED           = 1.2;
const ENEMY_HP              = 2;
const ENEMY_DAMAGE_COOLDOWN = 60;
const ENEMY_BULLET_SPEED    = 4.5;
const ENEMY_BULLET_R        = 4;
const ENEMY_DRAW            = 56;

const BULLET_SPEED    = 8;
const BULLET_R        = 5;
const BULLET_MAX_DIST = 900;

const DOOR_W = 20;
const DOOR_H = 80;

const POWERUP_W        = 26;
const POWERUP_H        = 26;
const POWERUP_DURATION = 600;

// ── Animation Configs ──────────────────────────────────────────────────────
// sheet assigned after images load
const PLAYER_ANIMS = {
  idle:   { sheet: null, frames: 10, fw: 96,  fh: 96,  fps: 8,  loop: true  },
  run:    { sheet: null, frames: 16, fw: 96,  fh: 96,  fps: 12, loop: true  },
  attack: { sheet: null, frames: 7,  fw: 96,  fh: 96,  fps: 14, loop: false },
  hurt:   { sheet: null, frames: 4,  fw: 96,  fh: 96,  fps: 10, loop: false },
};
const ENEMY_ANIMS = {
  idle:   { sheet: null, frames: 4, fw: 81, fh: 71, fps: 8,  loop: true  },
  walk:   { sheet: null, frames: 4, fw: 81, fh: 71, fps: 10, loop: true  },
  attack: { sheet: null, frames: 8, fw: 81, fh: 71, fps: 12, loop: false },
  hurt:   { sheet: null, frames: 4, fw: 81, fh: 71, fps: 10, loop: false },
  death:  { sheet: null, frames: 7, fw: 81, fh: 71, fps: 8,  loop: false },
};

// ── Room Definitions ────────────────────────────────────────────────────────
// platforms array holds both horizontal platforms (w>h) and vertical walls (h>w)
const ROOMS = [
  {
    label: 'Room 1',
    bgColor: '#1a1a2e', groundColor: '#3a3a5e',
    platforms: [
      // Horizontal platforms
      { x: 120, y: 320, w: 120, h: 16 },
      { x: 420, y: 268, w: 120, h: 16 },
      // Vertical walls (aerial — float above ground so enemies can pass under)
      { x: 285, y: 190, w: 16, h: 120 },
      { x: 520, y: 180, w: 16, h: 130 },
    ],
    enemySpawns:  [{ x: 600, y: 356 }, { x: 710, y: 356 }],
    powerupSpawns:[{ x: 152, y: 294, type: 'speedBoost' }],
    door: { x: 762, y: 320 },
  },
  {
    label: 'Room 2',
    bgColor: '#1e1a2e', groundColor: '#3e3a5e',
    platforms: [
      // Horizontal platforms
      { x:  80, y: 340, w: 100, h: 16 },
      { x: 250, y: 280, w: 100, h: 16 },
      { x: 430, y: 310, w: 100, h: 16 },
      { x: 600, y: 240, w: 110, h: 16 },
      // Vertical walls (aerial)
      { x: 215, y: 210, w: 16, h: 100 },
      { x: 380, y: 185, w: 16, h: 125 },
      { x: 555, y: 165, w: 16, h: 145 },
    ],
    enemySpawns:  [{ x: 410, y: 356 }, { x: 480, y: 356 }, { x: 590, y: 356 }, { x: 690, y: 356 }],
    powerupSpawns:[{ x: 272, y: 254, type: 'doubleBullet' }, { x: 622, y: 214, type: 'higherJump' }],
    door: { x: 762, y: 320 },
  },
  {
    label: 'Room 3',
    bgColor: '#2e1a1a', groundColor: '#5e3a3a',
    platforms: [
      // Horizontal platforms
      { x:  60, y: 330, w: 80, h: 16 },
      { x: 195, y: 268, w: 90, h: 16 },
      { x: 345, y: 308, w: 80, h: 16 },
      { x: 455, y: 248, w: 90, h: 16 },
      { x: 590, y: 288, w: 80, h: 16 },
      { x: 685, y: 228, w: 80, h: 16 },
      // Vertical walls (aerial)
      { x: 160, y: 175, w: 16, h: 130 },
      { x: 315, y: 160, w: 16, h: 140 },
      { x: 440, y: 150, w: 16, h: 145 },
      { x: 570, y: 160, w: 16, h: 140 },
    ],
    enemySpawns: [
      { x: 280, y: 356 }, { x: 380, y: 356 }, { x: 470, y: 356 },
      { x: 510, y: 356 }, { x: 610, y: 356 }, { x: 710, y: 356 },
    ],
    powerupSpawns:[{ x: 217, y: 242, type: 'speedBoost' }, { x: 477, y: 222, type: 'doubleBullet' }],
    door: { x: 762, y: 320 },
  },
];

// ── Canvas / HUD Setup ──────────────────────────────────────────────────────
const canvas      = document.getElementById('gameCanvas');
const ctx         = canvas.getContext('2d');
const hudHearts   = document.getElementById('hud-hearts');
const hudRoom     = document.getElementById('hud-room');
const overlay     = document.getElementById('overlay');
const overlayText = document.getElementById('overlay-text');

// ── Image Loading ────────────────────────────────────────────────────────────
const imgs = {};
let imgsLoaded = 0;
const IMG_KEYS = [
  'playerIdle', 'playerRun', 'playerAttack', 'playerHurt',
  'demonIdle', 'demonFlying', 'demonAttack', 'demonHurt', 'demonDeath', 'fireball',
];

function loadImg(key, src) {
  const img = new Image();
  img.onload = () => {
    imgsLoaded++;
    if (imgsLoaded === IMG_KEYS.length) startGame();
  };
  img.src = encodeURI(src);
  imgs[key] = img;
}

// ── State ───────────────────────────────────────────────────────────────────
const state = {
  roomIndex: 0,
  phase: 'play',
  player: {
    x: 80, y: GROUND_Y - PLAYER_H,
    vx: 0, vy: 0,
    onGround: false,
    hp: PLAYER_MAX_HP,
    iframes: 0,
    facingRight: true,
    jumpConsumed: false,
    touchingWallLeft: false,
    touchingWallRight: false,
    wallSliding: false,
    activeBoosts: { doubleBullet: 0, speedBoost: 0, higherJump: 0 },
    anim: { state: 'idle', frame: 0, timer: 0 },
  },
  enemies: [],
  bullets: [],
  enemyBullets: [],
  powerups: [],
  keys: {},
  mouse: { x: 400, y: 225 },
  shootCooldown: 0,
  roomCleared: false,
};

// ── Input ───────────────────────────────────────────────────────────────────
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (!state.keys[k]) {
    state.keys[k] = true;
    if (k === 'w') state.player.jumpConsumed = false;
  }
});
window.addEventListener('keyup', e => {
  const k = e.key.toLowerCase();
  state.keys[k] = false;
  if (k === 'w') state.player.jumpConsumed = false;
});
canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  state.mouse.x = e.clientX - r.left;
  state.mouse.y = e.clientY - r.top;
});
canvas.addEventListener('mousedown', e => {
  if (e.button !== 0 || state.phase !== 'play' || state.shootCooldown > 0) return;
  const p  = state.player;
  const cx = p.x + PLAYER_W / 2;
  const cy = p.y + PLAYER_H / 2;
  const angle  = Math.atan2(state.mouse.y - cy, state.mouse.x - cx);
  const spread = 0.15;
  const mkB = ang => ({ x: cx, y: cy, vx: Math.cos(ang) * BULLET_SPEED, vy: Math.sin(ang) * BULLET_SPEED, distTraveled: 0 });
  if (p.activeBoosts.doubleBullet > 0) {
    state.bullets.push(mkB(angle - spread / 2));
    state.bullets.push(mkB(angle + spread / 2));
  } else {
    state.bullets.push(mkB(angle));
  }
  state.shootCooldown = 15;
  setPlayerAnim('attack');
});

// ── Helpers ─────────────────────────────────────────────────────────────────
function setPlayerAnim(name) {
  const a = state.player.anim;
  if (a.state === name) return;
  a.state = name; a.frame = 0; a.timer = 0;
}

function createEnemy(x, y, tier) {
  const sb = [320, 180, 120][tier]; const sv = [180, 120, 80][tier];
  const jb = [250, 180, 130][tier]; const jv = [100,  80, 60][tier];
  return {
    x, y, vx: 0, vy: 0,
    onGround: false,
    hp: ENEMY_HP,
    damageCooldown: 0,
    facingRight: false,
    tier,
    dying: false,
    deathDone: false,
    shootCooldown: sb + Math.floor(Math.random() * sv),
    jumpCooldown:  jb + Math.floor(Math.random() * jv),
    anim: { state: 'idle', frame: 0, timer: 0 },
  };
}

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function resolveAABB(entity, eW, eH, rect) {
  if (!rectsOverlap(entity.x, entity.y, eW, eH, rect.x, rect.y, rect.w, rect.h)) return null;
  const oL = (entity.x + eW) - rect.x;
  const oR = (rect.x + rect.w) - entity.x;
  const oT = (entity.y + eH) - rect.y;
  const oB = (rect.y + rect.h) - entity.y;
  if (Math.min(oT, oB) < Math.min(oL, oR)) {
    if (oT < oB) { entity.y = rect.y - eH; entity.vy = 0; entity.onGround = true; return 'top'; }
    else          { entity.y = rect.y + rect.h; entity.vy = 0; return 'bottom'; }
  } else {
    if (oL < oR) { entity.x = rect.x - eW;      entity.vx = 0; return 'side-right'; }
    else         { entity.x = rect.x + rect.w;  entity.vx = 0; return 'side-left';  }
  }
}

function applyPhysics(entity, eW, eH) {
  entity.vy += GRAVITY;
  if (entity.vy > MAX_FALL) entity.vy = MAX_FALL;
  entity.y += entity.vy; entity.x += entity.vx;
  entity.onGround = false;
  resolveAABB(entity, eW, eH, { x: 0, y: GROUND_Y, w: CANVAS_W, h: CANVAS_H - GROUND_Y });
  for (const p of ROOMS[state.roomIndex].platforms) resolveAABB(entity, eW, eH, p);
}

function applyPhysicsFlying(entity, eW, eH) {
  entity.y += entity.vy; entity.x += entity.vx;
  entity.x = Math.max(0, Math.min(CANVAS_W - eW, entity.x));
  entity.y = Math.max(20, Math.min(GROUND_Y - eH - 40, entity.y)); // stay airborne, never touch floor
  for (const p of ROOMS[state.roomIndex].platforms) resolveAABB(entity, eW, eH, p);
}

function applyPhysicsPlayer() {
  const p = state.player;
  p.vy += GRAVITY;
  if (p.vy > MAX_FALL) p.vy = MAX_FALL;
  p.y += p.vy; p.x += p.vx;
  p.onGround = false;
  p.touchingWallLeft = false; p.touchingWallRight = false;
  const r0 = resolveAABB(p, PLAYER_W, PLAYER_H, { x: 0, y: GROUND_Y, w: CANVAS_W, h: CANVAS_H - GROUND_Y });
  if (r0 === 'side-right') p.touchingWallRight = true;
  if (r0 === 'side-left')  p.touchingWallLeft  = true;
  for (const plat of ROOMS[state.roomIndex].platforms) {
    const r = resolveAABB(p, PLAYER_W, PLAYER_H, plat);
    if (r === 'side-right') p.touchingWallRight = true;
    if (r === 'side-left')  p.touchingWallLeft  = true;
  }
  if (p.x <= 0)                   { p.x = 0;                   p.vx = 0; p.touchingWallLeft  = true; }
  if (p.x >= CANVAS_W - PLAYER_W) { p.x = CANVAS_W - PLAYER_W; p.vx = 0; p.touchingWallRight = true; }
  if (p.y > CANVAS_H) p.y = CANVAS_H - PLAYER_H;
}

// Advance one animation frame; returns true when a non-looping anim finishes
function advanceAnim(anim, cfg) {
  anim.timer++;
  if (anim.timer >= Math.ceil(60 / cfg.fps)) {
    anim.timer = 0;
    anim.frame++;
    if (anim.frame >= cfg.frames) {
      if (cfg.loop) { anim.frame = 0; }
      else          { anim.frame = cfg.frames - 1; return true; }
    }
  }
  return false;
}

function drawSprite(cfg, anim, destX, destY, drawW, drawH, flipX) {
  if (!cfg.sheet) return;
  ctx.save();
  if (flipX) {
    ctx.translate(destX + drawW, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(cfg.sheet, anim.frame * cfg.fw, 0, cfg.fw, cfg.fh, 0, destY, drawW, drawH);
  } else {
    ctx.drawImage(cfg.sheet, anim.frame * cfg.fw, 0, cfg.fw, cfg.fh, destX, destY, drawW, drawH);
  }
  ctx.restore();
}

function hurtPlayer() {
  const p = state.player;
  p.hp -= 1; p.iframes = PLAYER_IFRAMES;
  setPlayerAnim('hurt');
  updateHUD();
  if (p.hp <= 0) triggerGameOver();
}

// ── Update: Player ───────────────────────────────────────────────────────────
function updatePlayer() {
  const p = state.player;
  const b = p.activeBoosts;
  const spd = b.speedBoost > 0 ? MOVE_SPEED * 1.7  : MOVE_SPEED;
  const jvy = b.higherJump > 0 ? JUMP_VY    * 1.35 : JUMP_VY;

  p.vx = 0;
  if (state.keys['a']) { p.vx = -spd; p.facingRight = false; }
  if (state.keys['d']) { p.vx =  spd; p.facingRight = true;  }

  if (state.keys['w'] && p.onGround && !p.jumpConsumed) {
    p.vy = jvy; p.onGround = false; p.jumpConsumed = true;
  }
  // Wall jump — W + D while on left wall, or W + A while on right wall
  if (state.keys['w'] && !p.onGround && !p.jumpConsumed) {
    if (p.wallSliding && p.touchingWallLeft && state.keys['d']) {
      p.vy = jvy; p.vx = WALL_JUMP_VX; p.jumpConsumed = true;
      p.facingRight = true;
    } else if (p.wallSliding && p.touchingWallRight && state.keys['a']) {
      p.vy = jvy; p.vx = -WALL_JUMP_VX; p.jumpConsumed = true;
      p.facingRight = false;
    }
  }

  applyPhysicsPlayer();

  const presL = !!state.keys['a'], presR = !!state.keys['d'];
  p.wallSliding = ((p.touchingWallLeft && presL) || (p.touchingWallRight && presR)) && !p.onGround && p.vy > 0;
  if (p.wallSliding && p.vy > WALL_SLIDE_SPEED) p.vy = WALL_SLIDE_SPEED;

  // Advance animation
  const pa = p.anim;
  const pc = PLAYER_ANIMS[pa.state];
  const done = advanceAnim(pa, pc);
  if (done) {
    // Non-looping finished → return to movement state
    const next = Math.abs(p.vx) > 0.1 ? 'run' : 'idle';
    pa.state = next; pa.frame = 0; pa.timer = 0;
  } else if (pc.loop) {
    const should = Math.abs(p.vx) > 0.1 ? 'run' : 'idle';
    if (pa.state !== should) { pa.state = should; pa.frame = 0; pa.timer = 0; }
  }

  if (p.iframes > 0) p.iframes--;
  if (state.shootCooldown > 0) state.shootCooldown--;
  // powerups are permanent — no decrement
}

// ── Update: Enemies ──────────────────────────────────────────────────────────
function updateEnemies() {
  const pl = state.player;
  const px = pl.x + PLAYER_W / 2;
  const py = pl.y + PLAYER_H / 2;

  for (const e of state.enemies) {
    // Dying: only advance death anim
    if (e.dying) {
      if (advanceAnim(e.anim, ENEMY_ANIMS.death)) e.deathDone = true;
      continue;
    }

    // 2D flying chase toward player
    const dx = px - (e.x + ENEMY_W / 2);
    const dy = py - (e.y + ENEMY_H / 2);
    const dist = Math.hypot(dx, dy) || 1;
    e.vx = (dx / dist) * ENEMY_SPEED;
    e.vy = (dy / dist) * ENEMY_SPEED;
    e.facingRight = dx > 0;

    // Shoot fireball
    if (e.shootCooldown > 0) {
      e.shootCooldown--;
    } else {
      state.enemyBullets.push({ x: e.x + ENEMY_W / 2, y: e.y + ENEMY_H / 2, vx: (dx/dist)*ENEMY_BULLET_SPEED, vy: (dy/dist)*ENEMY_BULLET_SPEED, distTraveled: 0 });
      const sb = [320,180,120][e.tier]; const sv = [180,120,80][e.tier];
      e.shootCooldown = sb + Math.floor(Math.random() * sv);
      if (e.anim.state !== 'hurt') { e.anim.state = 'attack'; e.anim.frame = 0; e.anim.timer = 0; }
    }

    applyPhysicsFlying(e, ENEMY_W, ENEMY_H);

    // Contact damage
    if (e.damageCooldown > 0) {
      e.damageCooldown--;
    } else if (rectsOverlap(e.x, e.y, ENEMY_W, ENEMY_H, pl.x, pl.y, PLAYER_W, PLAYER_H)) {
      if (pl.iframes === 0) {
        e.damageCooldown = ENEMY_DAMAGE_COOLDOWN;
        hurtPlayer();
      }
    }

    // Advance enemy animation
    const ea = e.anim;
    const ec = ENEMY_ANIMS[ea.state];
    const done = advanceAnim(ea, ec);
    if (done) {
      // Non-looping finished → return to movement state
      ea.state = Math.abs(e.vx) > 0.1 ? 'walk' : 'idle';
      ea.frame = 0; ea.timer = 0;
    } else if (ec.loop) {
      const should = Math.abs(e.vx) > 0.1 ? 'walk' : 'idle';
      if (ea.state !== should) { ea.state = should; ea.frame = 0; ea.timer = 0; }
    }
  }

  // Remove fully dead enemies
  state.enemies = state.enemies.filter(e => !e.deathDone);
}

// ── Update: Player Bullets ───────────────────────────────────────────────────
function updateBullets() {
  const removeBullets = new Set();

  for (let bi = 0; bi < state.bullets.length; bi++) {
    const b = state.bullets[bi];
    b.x += b.vx; b.y += b.vy; b.distTraveled += BULLET_SPEED;
    if (b.distTraveled > BULLET_MAX_DIST || b.x < 0 || b.x > CANVAS_W || b.y < 0 || b.y > CANVAS_H) {
      removeBullets.add(bi); continue;
    }
    // Stop on ground or any platform/wall
    { const room = ROOMS[state.roomIndex];
      if (b.y + BULLET_R >= GROUND_Y ||
          room.platforms.some(p => rectsOverlap(b.x - BULLET_R, b.y - BULLET_R, BULLET_R*2, BULLET_R*2, p.x, p.y, p.w, p.h))) {
        removeBullets.add(bi); continue;
      }
    }
    for (const e of state.enemies) {
      if (e.dying) continue;
      if (rectsOverlap(b.x - BULLET_R, b.y - BULLET_R, BULLET_R * 2, BULLET_R * 2, e.x, e.y, ENEMY_W, ENEMY_H)) {
        e.hp -= 1;
        removeBullets.add(bi);
        if (e.hp <= 0) {
          e.dying = true;
          e.anim.state = 'death'; e.anim.frame = 0; e.anim.timer = 0;
        } else {
          e.anim.state = 'hurt'; e.anim.frame = 0; e.anim.timer = 0;
        }
        break;
      }
    }
  }
  state.bullets = state.bullets.filter((_, i) => !removeBullets.has(i));

  if (!state.roomCleared && state.enemies.filter(e => !e.dying).length === 0) {
    state.roomCleared = true;
    showOverlayTimed('Door Unlocked!', 1500);
  }
}

// ── Update: Enemy Bullets ────────────────────────────────────────────────────
function updateEnemyBullets() {
  const pl = state.player;
  const toRemove = new Set();
  for (let i = 0; i < state.enemyBullets.length; i++) {
    const b = state.enemyBullets[i];
    b.x += b.vx; b.y += b.vy; b.distTraveled += ENEMY_BULLET_SPEED;
    if (b.distTraveled > BULLET_MAX_DIST || b.x < 0 || b.x > CANVAS_W || b.y < 0 || b.y > CANVAS_H) {
      toRemove.add(i); continue;
    }
    // Stop on ground or any platform/wall
    { const room = ROOMS[state.roomIndex];
      if (b.y + ENEMY_BULLET_R >= GROUND_Y ||
          room.platforms.some(p => rectsOverlap(b.x - ENEMY_BULLET_R, b.y - ENEMY_BULLET_R, ENEMY_BULLET_R*2, ENEMY_BULLET_R*2, p.x, p.y, p.w, p.h))) {
        toRemove.add(i); continue;
      }
    }
    if (pl.iframes === 0 && rectsOverlap(b.x - ENEMY_BULLET_R, b.y - ENEMY_BULLET_R, ENEMY_BULLET_R*2, ENEMY_BULLET_R*2, pl.x, pl.y, PLAYER_W, PLAYER_H)) {
      toRemove.add(i);
      hurtPlayer();
    }
  }
  state.enemyBullets = state.enemyBullets.filter((_, i) => !toRemove.has(i));
}

// ── Update: Power-ups ────────────────────────────────────────────────────────
function updatePowerups() {
  const pl = state.player;
  const toRemove = [];
  for (let i = 0; i < state.powerups.length; i++) {
    const pu = state.powerups[i];
    pu.bob = (pu.bob + 0.05) % (Math.PI * 2);
    if (rectsOverlap(pl.x, pl.y, PLAYER_W, PLAYER_H, pu.x, pu.y, POWERUP_W, POWERUP_H)) {
      pl.activeBoosts[pu.type] = POWERUP_DURATION;
      toRemove.push(i);
    }
  }
  for (let i = toRemove.length - 1; i >= 0; i--) state.powerups.splice(toRemove[i], 1);
}

// ── Room / Flow ──────────────────────────────────────────────────────────────
function generateEnemySpawns(room, count) {
  const spawns = [];
  const pCX = 80 + PLAYER_W / 2;
  const pCY = GROUND_Y - PLAYER_H / 2;
  const MIN_PLAYER_DIST = 220;
  const MIN_ENEMY_DIST  = 80;

  for (let i = 0; i < count; i++) {
    let x, y, ok;
    let tries = 0;
    do {
      x = 200 + Math.random() * (CANVAS_W - 250); // well away from left-edge spawn
      y = 40  + Math.random() * 260;              // 40–300: full flying range
      ok = Math.hypot(x - pCX, y - pCY) >= MIN_PLAYER_DIST &&
           !spawns.some(s => Math.hypot(x - s.x, y - s.y) < MIN_ENEMY_DIST) &&
           !room.platforms.some(p => rectsOverlap(x, y, ENEMY_W, ENEMY_H, p.x, p.y, p.w, p.h));
      tries++;
    } while (!ok && tries < 80);
    spawns.push({ x, y });
  }
  return spawns;
}

function loadRoom(index) {
  if (index >= ROOMS.length) { triggerWin(); return; }
  state.roomIndex = index; state.phase = 'play';
  state.roomCleared = false; state.bullets = []; state.enemyBullets = [];
  const p = state.player;
  p.x = 80; p.y = GROUND_Y - PLAYER_H; p.vx = 0; p.vy = 0;
  p.onGround = p.wallSliding = p.touchingWallLeft = p.touchingWallRight = false;
  p.anim = { state: 'idle', frame: 0, timer: 0 };
  const count = ROOMS[index].enemySpawns.length;
  state.enemies = generateEnemySpawns(ROOMS[index], count).map(s => createEnemy(s.x, s.y, index));
  state.powerups = (ROOMS[index].powerupSpawns || []).map(s => ({ x: s.x, y: s.y, type: s.type, bob: 0 }));
  hudRoom.textContent = ROOMS[index].label;
  hideOverlay();
}

function checkDoorEntry() {
  if (!state.roomCleared) return;
  const door = ROOMS[state.roomIndex].door;
  const p = state.player;
  if (rectsOverlap(p.x, p.y, PLAYER_W, PLAYER_H, door.x, door.y, DOOR_W, DOOR_H)) beginTransition();
}

function beginTransition() {
  state.phase = 'transitioning';
  state.player.anim = { state: 'run', frame: 0, timer: 0 };
  overlayText.textContent = `Entering ${ROOMS[state.roomIndex + 1]?.label ?? 'Victory'}...`;
  overlay.classList.add('visible');
}

function autoWalkTransition() {
  const p = state.player;
  p.vy += GRAVITY;
  if (p.vy > MAX_FALL) p.vy = MAX_FALL;
  p.y += p.vy; p.x += 3;
  p.onGround = false;
  resolveAABB(p, PLAYER_W, PLAYER_H, { x: 0, y: GROUND_Y, w: CANVAS_W, h: CANVAS_H - GROUND_Y });
  advanceAnim(p.anim, PLAYER_ANIMS.run);
  if (p.x > CANVAS_W + 10) loadRoom(state.roomIndex + 1);
}

function triggerGameOver() {
  state.phase = 'gameover';
  overlayText.textContent = 'GAME OVER\nClick to Restart';
  overlay.classList.add('visible');
  overlay.style.pointerEvents = 'auto';
  overlay.addEventListener('click', restartGame, { once: true });
}

function triggerWin() {
  state.phase = 'win';
  overlayText.textContent = 'YOU WIN!\nClick to Play Again';
  overlay.classList.add('visible');
  overlay.style.pointerEvents = 'auto';
  overlay.addEventListener('click', restartGame, { once: true });
}

function restartGame() {
  overlay.style.pointerEvents = 'none';
  const p = state.player;
  p.hp = PLAYER_MAX_HP; p.iframes = 0;
  p.activeBoosts = { doubleBullet: 0, speedBoost: 0, higherJump: 0 };
  state.shootCooldown = 0;
  updateHUD();
  loadRoom(0);
}

function showOverlayTimed(text, ms) {
  overlayText.textContent = text;
  overlay.classList.add('visible');
  setTimeout(() => { if (state.phase === 'play') hideOverlay(); }, ms);
}

function hideOverlay() { overlay.classList.remove('visible'); }

// ── HUD ──────────────────────────────────────────────────────────────────────
function updateHUD() {
  const hp = state.player.hp;
  hudHearts.textContent = '♥'.repeat(Math.max(0, hp)) + '♡'.repeat(Math.max(0, PLAYER_MAX_HP - hp));
}

// ── Render ───────────────────────────────────────────────────────────────────
function render() {
  const room = ROOMS[state.roomIndex];
  const p    = state.player;

  ctx.fillStyle = room.bgColor;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.fillStyle = room.groundColor;
  ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);
  ctx.fillStyle = '#7a7aae';
  ctx.fillRect(0, GROUND_Y, CANVAS_W, 3);

  for (const plat of room.platforms) {
    const isWall = plat.h > plat.w;
    ctx.fillStyle = isWall ? '#363660' : '#4a4a7e';
    ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
    ctx.fillStyle = '#8a8abe';
    if (isWall) {
      // Highlight left and right edges
      ctx.fillRect(plat.x, plat.y, 3, plat.h);
      ctx.fillRect(plat.x + plat.w - 3, plat.y, 3, plat.h);
    } else {
      // Highlight top edge
      ctx.fillRect(plat.x, plat.y, plat.w, 3);
    }
  }

  // Door
  const door = room.door;
  ctx.fillStyle = state.roomCleared ? '#00cc66' : '#cc3300';
  ctx.fillRect(door.x, door.y, DOOR_W, DOOR_H);
  if (!state.roomCleared) {
    ctx.fillStyle = '#cc9900'; ctx.fillRect(door.x + 5, door.y + 22, 10, 12);
    ctx.fillStyle = '#ffcc00'; ctx.fillRect(door.x + 6, door.y + 32, 8, 8);
    ctx.fillStyle = room.bgColor;
    ctx.beginPath(); ctx.arc(door.x + 10, door.y + 24, 4, 0, Math.PI * 2); ctx.fill();
  }

  // Power-ups
  const puColors = { doubleBullet: '#00ffff', speedBoost: '#ffff00', higherJump: '#00ff66' };
  const puLabels = { doubleBullet: '2x', speedBoost: 'SPD', higherJump: 'JMP' };
  ctx.font = 'bold 9px monospace';
  for (const pu of state.powerups) {
    const by = Math.sin(pu.bob) * 4;
    ctx.fillStyle = puColors[pu.type];
    ctx.fillRect(pu.x, pu.y + by, POWERUP_W, POWERUP_H);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
    ctx.strokeRect(pu.x, pu.y + by, POWERUP_W, POWERUP_H);
    ctx.fillStyle = '#000'; ctx.textAlign = 'center';
    ctx.fillText(puLabels[pu.type], pu.x + POWERUP_W / 2, pu.y + by + 17);
    ctx.textAlign = 'left';
  }

  // Enemies (sprite, aspect-correct)
  for (const e of state.enemies) {
    const ec = ENEMY_ANIMS[e.anim.state];
    const dw = ENEMY_DRAW;
    const dh = Math.round(dw * ec.fh / ec.fw);
    const ex = e.x + (ENEMY_W - dw) / 2;
    const ey = e.y + (ENEMY_H - dh) / 2;
    drawSprite(ec, e.anim, ex, ey, dw, dh, !e.facingRight);
  }

  // Fireball projectiles
  for (const b of state.enemyBullets) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(Math.atan2(b.vy, b.vx));
    if (imgs.fireball?.complete) ctx.drawImage(imgs.fireball, -24, -16, 48, 32);
    ctx.restore();
  }

  // Player bullets — shurikens
  for (const b of state.bullets) {
    const spin = b.distTraveled * 0.18;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(spin);
    ctx.fillStyle = '#d0d8ff';
    ctx.strokeStyle = '#6688ff';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const ang = (i * Math.PI) / 4;
      const r = i % 2 === 0 ? 7 : 2.5;
      i === 0 ? ctx.moveTo(Math.cos(ang) * r, Math.sin(ang) * r)
              : ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
    }
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  // Player (sprite)
  const blink = p.iframes > 0 && Math.floor(p.iframes / 6) % 2 === 0;
  ctx.globalAlpha = blink ? 0.3 : 1;

  // Wall slide sparks
  if (p.wallSliding) {
    ctx.fillStyle = '#88ddff';
    const sx = p.touchingWallLeft ? p.x - 4 : p.x + PLAYER_W + 1;
    for (let i = 0; i < 3; i++) ctx.fillRect(sx, p.y + 6 + i * 14, 3, 6);
  }

  const pc = PLAYER_ANIMS[p.anim.state];
  const pdx = p.x + (PLAYER_W - PLAYER_DRAW) / 2;
  const pdy = p.y + PLAYER_H - PLAYER_DRAW;
  drawSprite(pc, p.anim, pdx, pdy, PLAYER_DRAW, PLAYER_DRAW, !p.facingRight);

  ctx.globalAlpha = 1;

  // Active power-up HUD
  const boosts = p.activeBoosts;
  const puHud = [
    { key: 'doubleBullet', label: '2x SHOT', fill: '#00ffff', bar: '#006666', bg: 'rgba(0,255,255,0.12)' },
    { key: 'speedBoost',   label: 'SPEED',   fill: '#ffff00', bar: '#666600', bg: 'rgba(255,255,0,0.12)'  },
    { key: 'higherJump',   label: 'JUMP+',   fill: '#00ff66', bar: '#006633', bg: 'rgba(0,255,102,0.12)' },
  ];
  let hx = 10; const hy = CANVAS_H - 38;
  ctx.font = 'bold 11px monospace';
  for (const d of puHud) {
    const rem = boosts[d.key]; if (rem <= 0) continue;
    const w = 62;
    ctx.fillStyle = d.bg; ctx.fillRect(hx, hy, w, 22);
    ctx.fillStyle = d.fill; ctx.fillText(d.label, hx + 4, hy + 15);
    ctx.fillStyle = d.bar;  ctx.fillRect(hx, hy + 22, w, 3);
    ctx.fillStyle = d.fill; ctx.fillRect(hx, hy + 22, w * (rem / POWERUP_DURATION), 3);
    hx += w + 6;
  }

  updateHUD();
}

// ── Main Loop ────────────────────────────────────────────────────────────────
function loop() {
  if (state.phase === 'play') {
    updatePlayer(); updateEnemies(); updateBullets(); updateEnemyBullets(); updatePowerups(); checkDoorEntry();
  } else if (state.phase === 'transitioning') {
    autoWalkTransition();
  }
  render();
  requestAnimationFrame(loop);
}

function startGame() {
  // Link loaded images to animation configs
  PLAYER_ANIMS.idle.sheet   = imgs.playerIdle;
  PLAYER_ANIMS.run.sheet    = imgs.playerRun;
  PLAYER_ANIMS.attack.sheet = imgs.playerAttack;
  PLAYER_ANIMS.hurt.sheet   = imgs.playerHurt;
  ENEMY_ANIMS.idle.sheet    = imgs.demonIdle;
  ENEMY_ANIMS.walk.sheet    = imgs.demonFlying;
  ENEMY_ANIMS.attack.sheet  = imgs.demonAttack;
  ENEMY_ANIMS.hurt.sheet    = imgs.demonHurt;
  ENEMY_ANIMS.death.sheet   = imgs.demonDeath;
  loadRoom(0);
  requestAnimationFrame(loop);
}

// ── Load Images (triggers startGame when all done) ──────────────────────────
loadImg('playerIdle',   'Sprites/PC Sprites/IDLE.png');
loadImg('playerRun',    'Sprites/PC Sprites/RUN.png');
loadImg('playerAttack', 'Sprites/PC Sprites/ATTACK 1.png');
loadImg('playerHurt',   'Sprites/PC Sprites/HURT.png');
loadImg('demonIdle',    'Sprites/NPC Sprites/Flying Demon/Sprites/with_outline/IDLE.png');
loadImg('demonFlying',  'Sprites/NPC Sprites/Flying Demon/Sprites/with_outline/FLYING.png');
loadImg('demonAttack',  'Sprites/NPC Sprites/Flying Demon/Sprites/with_outline/ATTACK.png');
loadImg('demonHurt',    'Sprites/NPC Sprites/Flying Demon/Sprites/with_outline/HURT.png');
loadImg('demonDeath',   'Sprites/NPC Sprites/Flying Demon/Sprites/with_outline/DEATH.png');
loadImg('fireball',     'Sprites/NPC Sprites/Flying Demon/Sprites/projectile.png');
