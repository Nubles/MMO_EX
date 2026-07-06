# Stage 3 Copper Mining Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add copper mining as the second gathering loop: copper rocks, Mining XP, copper ore inventory, and a Prospector ore market.

**Architecture:** Mining uses the existing resource-node loop and extends it by resource type. Progression rules stay testable in `src/progression.js`; world resource definitions live in `src/world.js`; UI and game-loop routing live in `src/main.js`.

**Tech Stack:** Vanilla JavaScript modules, HTML5 canvas, CSS, Node's built-in test runner, localStorage.

---

## File Structure

- `tests/progression.test.mjs`: Add Mining and copper ore economy tests.
- `src/progression.js`: Add copper ore inventory, Mining XP view, mining reward, ore selling, and save serialization.
- `src/world.js`: Add copper rock resources, Prospector NPC, per-resource respawn duration, and typed resource serialization.
- `src/render.js`: Render trees and rocks by resource type, including depleted rock state.
- `index.html`: Add copper ore inventory and Mining skill display, plus sell ore button.
- `src/main.js`: Route resource gathering by type, show Mining UI, wire Prospector market, and save resource state.
- `README.md`: Document Mining and Prospector market.

## Tasks

### Task 1: Mining Progression Tests

**Files:**
- Modify: `tests/progression.test.mjs`

- [ ] Add tests for default copper ore and Mining XP on old saves.
- [ ] Add test for `awardMining` adding 1 copper ore and 30 Mining XP.
- [ ] Add test for `getMiningView` returning level 1 and next XP.
- [ ] Add test for selling zero copper ore being blocked.
- [ ] Add test for selling four copper ore earning 24 coins and clearing ore.
- [ ] Run `node --test tests/progression.test.mjs` and confirm the new tests fail because the API is missing.

### Task 2: Mining Progression Implementation

**Files:**
- Modify: `src/progression.js`

- [ ] Add `COPPER_ORE_SELL_PRICE = 6` and `MINING_REWARD_XP = 30`.
- [ ] Extend inventory with `copperOre`.
- [ ] Extend skills with `miningXp`.
- [ ] Add `awardMining(progress)`.
- [ ] Add `getMiningView(progress)`.
- [ ] Add `sellAllCopperOre(progress)`.
- [ ] Extend serialization with copper ore and Mining XP.
- [ ] Run `node --test tests/progression.test.mjs` and confirm all tests pass.
- [ ] Commit with `git commit -m "Add copper mining progression rules"`.

### Task 3: Typed World Resources

**Files:**
- Modify: `src/world.js`

- [ ] Add copper rock layout near a mining camp.
- [ ] Add Prospector NPC with id `prospector`.
- [ ] Make resources include both trees and copper rocks.
- [ ] Add per-resource respawn duration in `depleteResource`.
- [ ] Preserve compatibility with old saved resources that only know tree ids.
- [ ] Run syntax check for `src/world.js`.

### Task 4: Rendering And UI Markup

**Files:**
- Modify: `src/render.js`
- Modify: `index.html`
- Modify: `styles.css`

- [ ] Render copper rocks as gray rocks with copper highlights.
- [ ] Render depleted copper rocks as cracked low rocks.
- [ ] Add copper ore inventory row.
- [ ] Add Mining skill section and XP track.
- [ ] Add `Sell Copper Ore` market button.
- [ ] Run syntax check for `src/render.js`.

### Task 5: Game Loop Integration

**Files:**
- Modify: `src/main.js`
- Modify: `README.md`

- [ ] Import Mining helpers and copper ore sell price.
- [ ] Generalize active resource action from chopping to gathering.
- [ ] Tree resources award Woodcutting and logs.
- [ ] Copper rock resources award Mining and copper ore.
- [ ] Market panel supports Timber Buyer and Prospector.
- [ ] Prospector sells all copper ore for coins.
- [ ] UI updates copper ore, Mining progress, and market button states.
- [ ] README documents Stage 3.
- [ ] Run unit tests and syntax checks.
- [ ] Commit with `git commit -m "Add copper mining loop"`.

### Task 6: Browser Verification And Push

**Files:**
- No new files.

- [ ] Run local HTTP server.
- [ ] Browser-smoke test fresh save: mine copper rock, confirm copper ore and Mining XP.
- [ ] Browser-smoke test seeded near Prospector: sell copper ore for coins.
- [ ] Browser-smoke test refresh persistence for copper ore, Mining XP, and depleted resources.
- [ ] Stop local server.
- [ ] Push `main` to `origin`.

## Self-Review

- Spec coverage: Tasks cover copper rocks, Mining XP, copper ore inventory, Prospector market, rendering, save compatibility, and browser verification.
- Placeholder scan: No unresolved placeholders or vague implementation steps remain.
- Type consistency: Function and DOM id names are consistent across tasks.
