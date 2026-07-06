import assert from "node:assert/strict";
import test from "node:test";
import * as progression from "../src/progression.js";

test("old saves default to bronze axe equipment", () => {
  assert.equal(typeof progression.getAxeView, "function");

  const state = progression.createProgression({
    inventory: { logs: 2, coins: 8 },
    skills: { woodcuttingXp: 24 },
  });

  const axe = progression.getAxeView(state);
  assert.equal(axe.id, "bronze");
  assert.equal(axe.name, "Bronze axe");
  assert.equal(axe.owned, true);
});

test("selling zero logs is blocked", () => {
  assert.equal(typeof progression.sellAllLogs, "function");

  const state = progression.createProgression();
  const result = progression.sellAllLogs(state);

  assert.equal(result.ok, false);
  assert.equal(result.reason, "no_logs");
  assert.equal(state.inventory.logs, 0);
  assert.equal(state.inventory.coins, 0);
});

test("selling three logs gives twelve coins and clears logs", () => {
  assert.equal(typeof progression.sellAllLogs, "function");

  const state = progression.createProgression({
    inventory: { logs: 3, coins: 5 },
  });
  const result = progression.sellAllLogs(state);

  assert.equal(result.ok, true);
  assert.equal(result.logsSold, 3);
  assert.equal(result.coinsEarned, 12);
  assert.equal(state.inventory.logs, 0);
  assert.equal(state.inventory.coins, 17);
});

test("buying iron axe fails without enough coins", () => {
  assert.equal(typeof progression.buyIronAxe, "function");

  const state = progression.createProgression({
    inventory: { logs: 0, coins: 39 },
  });
  const result = progression.buyIronAxe(state);

  assert.equal(result.ok, false);
  assert.equal(result.reason, "not_enough_coins");
  assert.equal(state.inventory.coins, 39);
  assert.equal(progression.getAxeView(state).id, "bronze");
});

test("buying iron axe succeeds and persists as owned and equipped", () => {
  assert.equal(typeof progression.buyIronAxe, "function");

  const state = progression.createProgression({
    inventory: { logs: 0, coins: 40 },
  });
  const result = progression.buyIronAxe(state);
  const saved = progression.serializeProgression(state);
  const loaded = progression.createProgression(saved);

  assert.equal(result.ok, true);
  assert.equal(result.axe.id, "iron");
  assert.equal(state.inventory.coins, 0);
  assert.deepEqual(saved.equipment.ownedAxes, ["bronze", "iron"]);
  assert.equal(progression.getAxeView(loaded).id, "iron");
});

test("iron axe chops faster than bronze axe", () => {
  assert.equal(typeof progression.getChopDuration, "function");

  const bronze = progression.createProgression();
  const iron = progression.createProgression({
    equipment: { axe: "iron", ownedAxes: ["bronze", "iron"] },
  });

  assert.equal(progression.getChopDuration(bronze, 1700), 1700);
  assert.equal(progression.getChopDuration(iron, 1700), 1105);
});
