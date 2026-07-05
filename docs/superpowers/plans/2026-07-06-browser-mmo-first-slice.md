# Browser MMO First Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static GitHub Pages playable top-down browser MMO prototype with movement, woodcutting, inventory, XP, local save, and deploy workflow.

**Architecture:** The app uses static HTML, CSS, and ES modules with no build step. A central game loop coordinates input, simulation, rendering, UI state, and localStorage saves.

**Tech Stack:** HTML5 canvas, CSS, vanilla JavaScript modules, localStorage, GitHub Actions Pages deployment.

---

## File Structure

- `index.html`: App shell, HUD panels, canvas, and controls.
- `styles.css`: Full-screen game layout, panels, responsive behavior, and visual polish.
- `src/main.js`: Entry point, game loop, event wiring, UI updates, save cadence.
- `src/world.js`: Tile map, collisions, resource nodes, NPCs, and interaction helpers.
- `src/player.js`: Player defaults, input movement, click movement, collision-aware updates.
- `src/progression.js`: Inventory changes, XP, levels, and gathering rewards.
- `src/storage.js`: Versioned local save, load, and reset helpers.
- `src/render.js`: Canvas rendering for terrain, objects, player, prompts, and effects.
- `.github/workflows/pages.yml`: GitHub Pages static deployment workflow.
- `README.md`: Project summary, controls, local run instructions, and roadmap.
- `.gitignore`: Local scratch and OS files.

## Tasks

### Task 1: Static Shell And Styling

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `.gitignore`

- [ ] Add a full-screen game shell with a canvas, top HUD, right-side stats panel, bottom-left chat, and reset button.
- [ ] Add responsive CSS so the game is playable on desktop and does not overflow on narrow screens.
- [ ] Open `index.html` locally and confirm the page renders without script errors.
- [ ] Commit with `git commit -m "Add static game shell"`.

### Task 2: Game State And Simulation Modules

**Files:**
- Create: `src/world.js`
- Create: `src/player.js`
- Create: `src/progression.js`
- Create: `src/storage.js`

- [ ] Define a small tile world with grass, path, water, cabin, market, trees, and collision helpers.
- [ ] Define player movement with keyboard and click-to-move targets.
- [ ] Define Woodcutting XP, level calculation, inventory updates, and coins.
- [ ] Define localStorage load, save, and reset with schema version fallback.
- [ ] Run a browser import check through `index.html`.
- [ ] Commit with `git commit -m "Add MMO simulation state"`.

### Task 3: Canvas Rendering

**Files:**
- Create: `src/render.js`

- [ ] Render the tile world, resource nodes, NPCs, player, shadows, interaction target, and hover prompt.
- [ ] Keep rendering resolution crisp on high-DPI screens.
- [ ] Confirm resizing the browser keeps the player visible.
- [ ] Commit with `git commit -m "Render the first MMO world"`.

### Task 4: Main Loop And Interactions

**Files:**
- Create: `src/main.js`
- Modify: `index.html`

- [ ] Wire keyboard movement, pointer hover, click-to-move, and tree interaction.
- [ ] Add chopping timers, stumps, respawn, XP, inventory updates, and chat messages.
- [ ] Autosave after progress changes and periodically during play.
- [ ] Add reset-save button behavior.
- [ ] Manually verify movement, tree chopping, XP gain, respawn, refresh persistence, and reset.
- [ ] Commit with `git commit -m "Make the MMO slice playable"`.

### Task 5: GitHub Pages And Documentation

**Files:**
- Create: `.github/workflows/pages.yml`
- Create: `README.md`

- [ ] Add a Pages workflow that uploads the static repository contents.
- [ ] Document controls, current features, local run options, and the multiplayer roadmap.
- [ ] Run a simple local HTTP server and verify `index.html` loads through HTTP.
- [ ] Commit with `git commit -m "Add Pages deployment docs"`.

## Self-Review

- Spec coverage: The plan covers static hosting, top-down movement, tile world, woodcutting, inventory, XP, chat messages, local save, reset, and Pages deployment.
- Placeholder scan: No unresolved placeholders or deferred implementation steps are present in this plan.
- Type consistency: Module names and responsibilities match the design spec.
