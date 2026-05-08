# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Vanilla HTML/CSS/JavaScript tic-tac-toe game. No build step, no dependencies, no package manager — open `index.html` directly in a browser.

## Running the game

Open `index.html` in any browser. No server needed.

## Architecture

Three files:

- `index.html` — markup and 3×3 grid of `<button class="cell">` elements
- `style.css` — dark-themed layout; `.x` / `.o` color classes applied on move; `.winning` highlights the winning line
- `script.js` — all game logic: `board` array (9 cells), `currentPlayer`, `checkWinner()` against `WINNING_LINES`, click handler, and `reset()`

State lives entirely in `script.js` module-level variables (`board`, `currentPlayer`, `gameOver`). DOM is the only rendering target — no virtual DOM or framework.

## Git workflow

After every meaningful change, commit and push to GitHub so work is never lost:

```
git add <changed files>
git commit -m "short, clear description of what changed and why"
git push origin master
```

Commit message rules:
- Use imperative mood: "Add reset button" not "Added reset button"
- Be specific: "Fix win detection for diagonal lines" not "Fix bug"
- One logical change per commit — don't bundle unrelated changes
