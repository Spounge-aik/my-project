# my-project

A browser-based game project built with vanilla HTML, CSS, and JavaScript. Contains two games — a side-scroller action game and a tic-tac-toe game. No build step, no dependencies — open the HTML files directly in a browser.

---

## Side-Scroller (main game)

Open `game.html` in a browser.

### Gameplay

Progress through 3 rooms by defeating all enemies. Reach the door on the right side of each room to advance. You have 3 hearts — lose them all and it's game over.

### Controls

| Key | Action |
|-----|--------|
| `A` / `D` | Move left / right |
| `W` or `Space` | Jump |
| `Left click` | Shoot |

**Wall jump:** Press `W`/`Space` + the direction away from the wall while sliding against it.

### Powerups

Powerups appear on platforms and last for 10 seconds:

| Powerup | Effect |
|---------|--------|
| Flask (blue) | Double bullet — fires two projectiles at once |
| Flask (green) | Higher jump |
| Flask (red) | Speed boost |

### Enemies

- **Flying Demon** — hovers and fires fireballs at the player. Has idle, flying, attack, hurt, and death animations.

### Rooms

| Room | Enemies | Notes |
|------|---------|-------|
| 1 | 2 | Intro room, speed boost powerup |
| 2 | 4 | More platforms and walls, double bullet + higher jump powerups |
| 3 | 6 | Most complex layout, two powerups |

### Architecture

| File | Purpose |
|------|---------|
| `game.html` | Canvas element + HUD overlay |
| `game.css` | Layout and HUD styling |
| `game.js` | All game logic: physics, animation, rooms, enemies, powerups |
| `Sprites/` | Player and enemy sprite sheets (PNG) |
| `Background/` | Background image assets |

`game.js` is structured as:
- **Constants** — physics, sizes, speeds at the top
- **Room definitions** — platform layouts, enemy spawns, powerup spawns per room
- **State object** — single source of truth for player, enemies, bullets, powerups
- **Game loop** — `requestAnimationFrame` loop running update + draw each frame

---

## Tic-Tac-Toe

Open `index.html` in a browser. Two-player, takes turns in the same browser window.

### Architecture

| File | Purpose |
|------|---------|
| `index.html` | 3×3 grid of `<button>` elements |
| `style.css` | Dark theme, X/O colours, winning line highlight |
| `script.js` | Board state, win detection, click handler, reset |
