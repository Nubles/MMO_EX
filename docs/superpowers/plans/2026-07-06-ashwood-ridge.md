# Ashwood Ridge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Ashwood Ridge as the first post-charter region with oak logs, ridge slimes, and copper sword crafting.

**Architecture:** Extend the existing pure progression rules first, then world data, then browser UI. The save format remains backward compatible by defaulting missing fields in `createProgression` and `createWorld`.

**Tech Stack:** Static HTML/CSS, canvas rendering, ES modules, Node's built-in test runner, GitHub Pages.

---

## File Map

- `tests/progression.test.mjs`: add behavior-first tests for oak logs, weapon defaults, copper sword crafting, and ridge slime rewards.
- `tests/world.test.mjs`: add world creation tests for oak trees and ridge slimes.
- `src/progression.js`: add oak logs, weapons, copper sword crafting, oak sales, and typed slime rewards.
- `src/world.js`: expand map dimensions, add ridge terrain, oak trees, and ridge slimes.
- `src/main.js`: wire oak gathering, oak sales, copper sword crafting, weapon damage, and new save fields.
- `src/render.js`: draw oak trees and ridge slimes distinctly.
- `index.html`: add oak log inventory/bank fields, weapon display, and new action buttons.
- `styles.css`: adjust action grid if needed.
- `README.md`: document Ashwood Ridge features and controls.

## Tasks

### Task 1: Progression Rules

- [ ] Write failing tests for old-save defaults, oak gathering, oak selling, copper sword crafting, weapon damage, and ridge slime rewards.
- [ ] Run `node --test tests\progression.test.mjs` and confirm the new tests fail because the rules do not exist yet.
- [ ] Implement the minimal progression changes in `src/progression.js`.
- [ ] Run `node --test tests\progression.test.mjs` and confirm all progression tests pass.

### Task 2: World Data

- [ ] Write failing tests in `tests/world.test.mjs` for oak trees and ridge slimes.
- [ ] Run `node --test tests\world.test.mjs` and confirm failure.
- [ ] Implement map expansion, ridge terrain, oak resources, and typed slimes in `src/world.js`.
- [ ] Run `node --test tests\world.test.mjs` and confirm pass.

### Task 3: UI And Rendering

- [ ] Update `index.html` to show oak logs, weapon, damage, Sell Oak Logs, and Craft Copper Sword.
- [ ] Update `src/main.js` to wire new progression and world behavior.
- [ ] Update `src/render.js` to draw oak trees and ridge slimes distinctly.
- [ ] Update `README.md` for the new stage.
- [ ] Run `node --check` on all changed JS modules.

### Task 4: Verification And Publish

- [ ] Run all Node tests.
- [ ] Run a local browser smoke test for app load, oak sale, and copper sword crafting.
- [ ] Commit the docs and implementation in sensible commits.
- [ ] Push to `main`.
