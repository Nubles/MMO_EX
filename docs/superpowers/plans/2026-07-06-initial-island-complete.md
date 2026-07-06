# Initial Island Complete Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the first island with banking, copper smelting, simple slime combat, and a starter quest.

**Architecture:** Pure rules for inventory, bank, Smithing, Attack, HP, combat reward, and quest state live in `src/progression.js` and are covered by Node tests. World objects, rendering, and browser interactions extend the existing static canvas app without adding a backend or build step.

**Tech Stack:** Vanilla JavaScript modules, HTML5 canvas, CSS, Node's built-in test runner, localStorage.

---

## File Structure

- `tests/progression.test.mjs`: Add tests for bank, smelting, combat reward, HP reset, and quest completion.
- `src/progression.js`: Add bank state, copper bars, Smithing, Attack, HP, smelting, copper bar sale, slime reward, quest progress, and serialization.
- `src/world.js`: Add bank chest, workshop object, slime entities, slime respawn, and typed entity serialization.
- `src/render.js`: Render bank chest, workshop, slimes, and defeated slime state.
- `index.html`: Add copper bars, bank/workshop/combat/quest UI.
- `styles.css`: Add compact quest checklist and HP bar styles.
- `src/main.js`: Wire bank actions, smelting, slime combat, quest tracking, contextual UI, and save persistence.
- `README.md`: Document initial island completion.

## Tasks

### Task 1: Pure Rule Tests

**Files:**
- Modify: `tests/progression.test.mjs`

- [ ] Add old-save defaults test for bank, copper bars, Smithing XP, Attack XP, HP, and quest state.
- [ ] Add bank deposit/withdraw tests for logs, copper ore, and copper bars.
- [ ] Add smelting test: 2 copper ore -> 1 copper bar and +20 Smithing XP.
- [ ] Add copper bar sale test: 2 copper bars -> 28 coins.
- [ ] Add slime reward test: +18 Attack XP and +3 coins.
- [ ] Add quest completion test: all objectives complete grants 25 coins once.
- [ ] Run `node --test tests/progression.test.mjs` and confirm the new tests fail before implementation.

### Task 2: Pure Rule Implementation

**Files:**
- Modify: `src/progression.js`

- [ ] Add copper bars, bank state, Smithing XP, Attack XP, HP, and quest state defaults.
- [ ] Add `depositAll(progress, item)` and `withdrawAll(progress, item)`.
- [ ] Add `smeltCopperBar(progress)`.
- [ ] Add `sellAllCopperBars(progress)`.
- [ ] Add `awardSlimeDefeat(progress)`.
- [ ] Add `recordQuestProgress(progress, key)` and `completeQuestIfReady(progress)`.
- [ ] Extend serialization with all new state.
- [ ] Run `node --test tests/progression.test.mjs` and confirm all tests pass.
- [ ] Commit with `git commit -m "Add initial island progression rules"`.

### Task 3: World And UI Integration

**Files:**
- Modify: `src/world.js`
- Modify: `src/render.js`
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `src/main.js`
- Modify: `README.md`

- [ ] Add bank chest, workshop, and slime entities to the world.
- [ ] Render bank chest, workshop, active slimes, and defeated slimes.
- [ ] Add copper bar inventory, Smithing/Attack/HP/Quest UI, bank buttons, workshop button, and bar-sale button.
- [ ] Wire contextual bank actions near bank chest.
- [ ] Wire smelting near workshop.
- [ ] Wire copper bar selling near Prospector.
- [ ] Wire slime click combat, reward, respawn, and HP reset.
- [ ] Update quest objectives when chopping, mining, smelting, selling, and defeating slime.
- [ ] Update README.
- [ ] Commit with `git commit -m "Complete initial island systems"`.

### Task 4: Verification And Push

**Files:**
- No new files.

- [ ] Run `node --test tests/progression.test.mjs`.
- [ ] Run `node --check` for every JS module.
- [ ] Serve app over local HTTP.
- [ ] Browser-smoke test bank deposit/withdraw.
- [ ] Browser-smoke test smelting and copper bar sale.
- [ ] Browser-smoke test slime combat reward.
- [ ] Browser-smoke test starter quest completion.
- [ ] Push `main` to `origin`.

## Self-Review

- Spec coverage: The plan covers bank, copper bars, Smithing, combat, quest, UI, save compatibility, and verification.
- Placeholder scan: No unresolved placeholders or vague implementation steps remain.
- Type consistency: Planned function and DOM names are consistent across tasks.
