# Region Gates and Guidebook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add named region unlocks, a visible Ridge Gate, and a guidebook panel that recommends the next useful player goal.

**Architecture:** Keep region and guidebook rules pure in `src/progression.js`, add the gate as a normal world object in `src/world.js`, and keep DOM work in `src/main.js` plus `index.html`. Rendering stays canvas-only and draws the gate using the existing object-rendering pattern.

**Tech Stack:** Plain JavaScript modules, Canvas 2D, HTML/CSS, Node test runner.

---

### Task 1: Pure Region and Guidebook Rules

**Files:**
- Modify: `src/progression.js`
- Test: `tests/progression.test.mjs`

- [ ] Add tests for `getRegionStatus(progress)` returning First Island unlocked, Ashwood Ridge locked before charter completion, Ashwood Ridge unlocked after charter completion, and Iron Hollow locked as coming soon.
- [ ] Add tests for `getGuidebook(progress)` returning the correct recommended next step for charter incomplete, charter complete without copper sword, copper sword without bronze shield, and starter gear complete.
- [ ] Implement `REGIONS`, `RECIPES`, `RESOURCE_HINTS`, `getRegionStatus(progress)`, and `getGuidebook(progress)` in `src/progression.js`.
- [ ] Run `node --test tests\progression.test.mjs` and confirm the new tests pass.

### Task 2: Ridge Gate World Object

**Files:**
- Modify: `src/world.js`
- Modify: `src/render.js`
- Test: `tests/world.test.mjs`

- [ ] Add a world test that `createWorld()` includes an object with id `ridgeGate`, type `regionGate`, label `Ridge Gate`, and region id `ashwoodRidge`.
- [ ] Add the gate object to `OBJECTS` near the road into Ashwood Ridge.
- [ ] Render `regionGate` in `drawWorldObjects` with a signpost/arch marker and hover state.
- [ ] Run `node --test tests\world.test.mjs` and confirm it passes.

### Task 3: Guidebook UI and Gate Interaction

**Files:**
- Modify: `index.html`
- Modify: `src/main.js`
- Modify: `README.md`

- [ ] Add a Guidebook panel with IDs for recommended step, regions, recipes, and hints.
- [ ] Import `getGuidebook` and `getRegionStatus` into `src/main.js`.
- [ ] Update UI rendering to populate the Guidebook section from pure progression data.
- [ ] Update object click behavior so clicking the Ridge Gate reports locked/unlocked status.
- [ ] Update README with Stage 7 features and controls.
- [ ] Run syntax checks for changed JS files.

### Task 4: Verification and Release

**Files:**
- All Stage 7 changes

- [ ] Run `node --test tests\progression.test.mjs tests\world.test.mjs`.
- [ ] Run browser smoke test on a local static server and verify no console/page errors plus Guidebook IDs exist.
- [ ] Commit with message `Add region gates and guidebook`.
- [ ] Push `main` to GitHub.
