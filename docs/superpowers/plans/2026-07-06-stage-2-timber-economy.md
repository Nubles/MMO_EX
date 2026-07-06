# Stage 2 Timber Economy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the timber economy loop: sell logs for coins, buy an iron axe, persist equipment, and make the iron axe chop faster.

**Architecture:** Pure economy and equipment rules live in `src/progression.js` so they can be tested without a browser. `src/main.js` wires merchant proximity and buttons into the existing game loop, while HTML/CSS add compact equipment and market panels.

**Tech Stack:** Vanilla JavaScript modules, HTML5 canvas, CSS, Node's built-in test runner, localStorage.

---

## File Structure

- `src/progression.js`: Add timber economy constants, equipment state, axe metadata, log selling, axe buying, and chop duration lookup.
- `tests/progression.test.mjs`: New Node tests for save compatibility, selling logs, buying axe, and chop duration.
- `index.html`: Add equipment display and market action panel.
- `styles.css`: Style market buttons, disabled states, and small help text.
- `src/main.js`: Use equipped axe duration, detect Timber Buyer proximity, wire market buttons, update HUD and prompt text, persist equipment.
- `README.md`: Document stage-2 economy features and controls.

## Tasks

### Task 1: Economy Logic Tests

**Files:**
- Create: `tests/progression.test.mjs`

- [ ] Add Node tests that import `src/progression.js`.
- [ ] Test that old saves default to bronze axe.
- [ ] Test selling zero logs returns a blocked result.
- [ ] Test selling three logs gives twelve coins and clears logs.
- [ ] Test buying an iron axe fails without coins.
- [ ] Test buying an iron axe succeeds with forty coins and persists as owned/equipped.
- [ ] Test bronze and iron chop durations differ.
- [ ] Run `node --test tests/progression.test.mjs` and confirm tests fail before implementation.

### Task 2: Economy Implementation

**Files:**
- Modify: `src/progression.js`

- [ ] Add exported constants `LOG_SELL_PRICE`, `IRON_AXE_COST`, and `AXES`.
- [ ] Extend `createProgression` with `equipment.axe` and `ownedAxes`.
- [ ] Add `getAxeView(progress)`.
- [ ] Add `getChopDuration(progress, baseDuration)`.
- [ ] Add `sellAllLogs(progress)`.
- [ ] Add `buyIronAxe(progress)`.
- [ ] Extend `serializeProgression(progress)` with equipment state.
- [ ] Run `node --test tests/progression.test.mjs` and confirm tests pass.
- [ ] Commit with `git commit -m "Add timber economy rules"`.

### Task 3: Market UI

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

- [ ] Add an equipment section showing current axe and speed.
- [ ] Add a market section with merchant status text, sell logs button, and buy iron axe button.
- [ ] Style the action buttons and disabled state.
- [ ] Run HTTP server and confirm the page loads with the new controls.

### Task 4: Game Loop Integration

**Files:**
- Modify: `src/main.js`
- Modify: `src/world.js`
- Modify: `README.md`

- [ ] Import the new progression helpers.
- [ ] Use `getChopDuration(progress, CHOP_DURATION_MS)` when chopping starts.
- [ ] Detect when the player is near the Timber Buyer.
- [ ] Enable selling logs only near the merchant.
- [ ] Enable buying iron axe only near the merchant, with clear blocked chat messages.
- [ ] Update HUD with current axe and market status.
- [ ] Persist equipment after selling or buying.
- [ ] Update README with stage-2 features.
- [ ] Commit with `git commit -m "Add stage 2 timber market"`.

### Task 5: Verification And Push

**Files:**
- No new files.

- [ ] Run `node --test tests/progression.test.mjs`.
- [ ] Run `node --check` for all JS modules.
- [ ] Run the app through a local HTTP server.
- [ ] Browser-smoke test: gather logs, sell logs, buy iron axe with seeded state, refresh, and confirm iron axe persists.
- [ ] Commit any verification fixes.
- [ ] Push `main` to `origin`.

## Self-Review

- Spec coverage: The tasks cover selling logs, buying iron axe, persistent equipment, faster chopping, merchant proximity, UI controls, README docs, and browser verification.
- Placeholder scan: No unresolved placeholders or vague implementation-only steps are present.
- Type consistency: Function names are consistent across tests, implementation, and integration tasks.
