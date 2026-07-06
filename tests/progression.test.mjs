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

// Stage 3 mining rules
test("old saves default copper ore and Mining XP to zero", () => {
  const state = progression.createProgression({
    inventory: { logs: 2, coins: 8 },
    skills: { woodcuttingXp: 24 },
  });

  assert.equal(state.inventory.copperOre, 0);
  assert.equal(state.skills.miningXp, 0);
});

test("mining reward adds copper ore and Mining XP", () => {
  assert.equal(typeof progression.awardMining, "function");

  const state = progression.createProgression();
  const result = progression.awardMining(state);

  assert.equal(result.item, "copperOre");
  assert.equal(result.amount, 1);
  assert.equal(result.xp, 30);
  assert.equal(state.inventory.copperOre, 1);
  assert.equal(state.skills.miningXp, 30);
});

test("Mining view exposes level and next XP", () => {
  assert.equal(typeof progression.getMiningView, "function");

  const state = progression.createProgression({
    inventory: { copperOre: 0 },
    skills: { miningXp: 30 },
  });
  const mining = progression.getMiningView(state);

  assert.equal(mining.level, 1);
  assert.equal(mining.xp, 30);
  assert.equal(mining.nextLevelXp, 100);
  assert.equal(mining.progressToNext, 0.3);
});

test("selling zero copper ore is blocked", () => {
  assert.equal(typeof progression.sellAllCopperOre, "function");

  const state = progression.createProgression();
  const result = progression.sellAllCopperOre(state);

  assert.equal(result.ok, false);
  assert.equal(result.reason, "no_copper_ore");
  assert.equal(state.inventory.coins, 0);
});

test("selling four copper ore gives twenty four coins and clears ore", () => {
  assert.equal(typeof progression.sellAllCopperOre, "function");

  const state = progression.createProgression({
    inventory: { copperOre: 4, coins: 3 },
  });
  const result = progression.sellAllCopperOre(state);

  assert.equal(result.ok, true);
  assert.equal(result.oreSold, 4);
  assert.equal(result.coinsEarned, 24);
  assert.equal(state.inventory.copperOre, 0);
  assert.equal(state.inventory.coins, 27);
});

// Initial island completion rules
test("old saves default bank, bars, combat, smithing, and quest state", () => {
  const state = progression.createProgression({
    inventory: { logs: 1, copperOre: 2, coins: 3 },
    skills: { woodcuttingXp: 4, miningXp: 5 },
  });

  assert.equal(state.inventory.copperBars, 0);
  assert.deepEqual(state.bank, { logs: 0, oakLogs: 0, copperOre: 0, tinOre: 0, copperBars: 0, bronzeBars: 0 });
  assert.equal(state.skills.smithingXp, 0);
  assert.equal(state.skills.attackXp, 0);
  assert.equal(state.combat.hp, 20);
  assert.equal(state.quest.completed, false);
});

test("bank deposit and withdraw moves all of an item", () => {
  assert.equal(typeof progression.depositAll, "function");
  assert.equal(typeof progression.withdrawAll, "function");

  const state = progression.createProgression({
    inventory: { logs: 4, copperOre: 3, copperBars: 2, coins: 0 },
  });

  assert.deepEqual(progression.depositAll(state, "logs"), { ok: true, item: "logs", amount: 4 });
  assert.equal(state.inventory.logs, 0);
  assert.equal(state.bank.logs, 4);
  assert.deepEqual(progression.withdrawAll(state, "logs"), { ok: true, item: "logs", amount: 4 });
  assert.equal(state.inventory.logs, 4);
  assert.equal(state.bank.logs, 0);
});

test("smelting copper bar consumes ore and grants Smithing XP", () => {
  assert.equal(typeof progression.smeltCopperBar, "function");

  const state = progression.createProgression({ inventory: { copperOre: 2 } });
  const result = progression.smeltCopperBar(state);

  assert.equal(result.ok, true);
  assert.equal(result.barsCreated, 1);
  assert.equal(result.xp, 20);
  assert.equal(state.inventory.copperOre, 0);
  assert.equal(state.inventory.copperBars, 1);
  assert.equal(state.skills.smithingXp, 20);
});

test("selling copper bars grants coins and clears bars", () => {
  assert.equal(typeof progression.sellAllCopperBars, "function");

  const state = progression.createProgression({ inventory: { copperBars: 2, coins: 5 } });
  const result = progression.sellAllCopperBars(state);

  assert.equal(result.ok, true);
  assert.equal(result.barsSold, 2);
  assert.equal(result.coinsEarned, 28);
  assert.equal(state.inventory.copperBars, 0);
  assert.equal(state.inventory.coins, 33);
});

test("slime defeat grants Attack XP and coins", () => {
  assert.equal(typeof progression.awardSlimeDefeat, "function");

  const state = progression.createProgression();
  const result = progression.awardSlimeDefeat(state);

  assert.equal(result.ok, true);
  assert.equal(result.xp, 18);
  assert.equal(result.coins, 3);
  assert.equal(state.skills.attackXp, 18);
  assert.equal(state.inventory.coins, 3);
});

test("quest completion grants reward once", () => {
  assert.equal(typeof progression.recordQuestProgress, "function");
  assert.equal(typeof progression.completeQuestIfReady, "function");

  const state = progression.createProgression();
  for (const key of ["logs", "ore", "bar", "sale", "slime"]) {
    progression.recordQuestProgress(state, key);
  }

  const first = progression.completeQuestIfReady(state);
  const second = progression.completeQuestIfReady(state);

  assert.equal(first.ok, true);
  assert.equal(first.coins, 25);
  assert.equal(second.ok, false);
  assert.equal(second.reason, "already_completed");
  assert.equal(state.inventory.coins, 25);
  assert.equal(state.quest.completed, true);
});

// Ashwood Ridge rules
test("old saves default oak logs and weapon state", () => {
  const state = progression.createProgression({
    inventory: { logs: 1, copperOre: 2, copperBars: 1, coins: 3 },
    equipment: { axe: "iron", ownedAxes: ["bronze", "iron"] },
  });

  assert.equal(state.inventory.oakLogs, 0);
  assert.equal(state.bank.oakLogs, 0);
  assert.equal(progression.getWeaponView(state).id, "trainingSword");
  assert.equal(progression.getWeaponDamage(state), 4);
});

test("oak woodcutting reward adds oak logs and higher Woodcutting XP", () => {
  assert.equal(typeof progression.awardOakWoodcutting, "function");

  const state = progression.createProgression();
  const result = progression.awardOakWoodcutting(state);

  assert.equal(result.item, "oakLogs");
  assert.equal(result.amount, 1);
  assert.equal(result.xp, 45);
  assert.equal(state.inventory.oakLogs, 1);
  assert.equal(state.skills.woodcuttingXp, 45);
});

test("selling oak logs grants ten coins each and clears oak logs", () => {
  assert.equal(typeof progression.sellAllOakLogs, "function");

  const state = progression.createProgression({ inventory: { oakLogs: 3, coins: 2 } });
  const result = progression.sellAllOakLogs(state);

  assert.equal(result.ok, true);
  assert.equal(result.logsSold, 3);
  assert.equal(result.coinsEarned, 30);
  assert.equal(state.inventory.oakLogs, 0);
  assert.equal(state.inventory.coins, 32);
});

test("crafting copper sword consumes bars and oak logs, grants Smithing XP, and persists", () => {
  assert.equal(typeof progression.craftCopperSword, "function");

  const state = progression.createProgression({ inventory: { copperBars: 2, oakLogs: 1 } });
  const result = progression.craftCopperSword(state);
  const saved = progression.serializeProgression(state);
  const loaded = progression.createProgression(saved);

  assert.equal(result.ok, true);
  assert.equal(result.weapon.id, "copperSword");
  assert.equal(state.inventory.copperBars, 0);
  assert.equal(state.inventory.oakLogs, 0);
  assert.equal(state.skills.smithingXp, 30);
  assert.equal(progression.getWeaponView(loaded).id, "copperSword");
  assert.equal(progression.getWeaponDamage(loaded), 6);
});

test("crafting copper sword blocks missing materials and duplicate ownership", () => {
  const missing = progression.createProgression({ inventory: { copperBars: 1, oakLogs: 0 } });
  const crafted = progression.createProgression({ inventory: { copperBars: 3, oakLogs: 2 } });

  const missingResult = progression.craftCopperSword(missing);
  const firstCraft = progression.craftCopperSword(crafted);
  const secondCraft = progression.craftCopperSword(crafted);

  assert.equal(missingResult.ok, false);
  assert.equal(missingResult.reason, "missing_materials");
  assert.equal(firstCraft.ok, true);
  assert.equal(secondCraft.ok, false);
  assert.equal(secondCraft.reason, "already_owned");
});

test("ridge slime defeat grants stronger Attack XP and coins", () => {
  const state = progression.createProgression();
  const result = progression.awardSlimeDefeat(state, "ridgeSlime");

  assert.equal(result.ok, true);
  assert.equal(result.xp, 35);
  assert.equal(result.coins, 8);
  assert.equal(state.skills.attackXp, 35);
  assert.equal(state.inventory.coins, 8);
});

// Stage 6 bronze smithing rules
test("old saves default tin, bronze bars, and defensive equipment", () => {
  const state = progression.createProgression({
    inventory: { logs: 1, copperOre: 2, copperBars: 1, coins: 3 },
    equipment: { weapon: "copperSword", ownedWeapons: ["trainingSword", "copperSword"] },
  });

  assert.equal(state.inventory.tinOre, 0);
  assert.equal(state.inventory.bronzeBars, 0);
  assert.equal(state.bank.tinOre, 0);
  assert.equal(state.bank.bronzeBars, 0);
  assert.equal(progression.getArmorView(state).id, "clothTunic");
  assert.equal(progression.getDamageReduction(state), 0);
});

test("tin mining reward adds tin ore and Mining XP", () => {
  assert.equal(typeof progression.awardTinMining, "function");

  const state = progression.createProgression();
  const result = progression.awardTinMining(state);

  assert.equal(result.item, "tinOre");
  assert.equal(result.amount, 1);
  assert.equal(result.xp, 28);
  assert.equal(state.inventory.tinOre, 1);
  assert.equal(state.skills.miningXp, 28);
});

test("smelting bronze bar consumes copper and tin and grants Smithing XP", () => {
  assert.equal(typeof progression.smeltBronzeBar, "function");

  const state = progression.createProgression({ inventory: { copperOre: 1, tinOre: 1 } });
  const result = progression.smeltBronzeBar(state);

  assert.equal(result.ok, true);
  assert.equal(result.barsCreated, 1);
  assert.equal(result.xp, 24);
  assert.equal(state.inventory.copperOre, 0);
  assert.equal(state.inventory.tinOre, 0);
  assert.equal(state.inventory.bronzeBars, 1);
  assert.equal(state.skills.smithingXp, 24);
});

test("crafting bronze shield consumes bronze bars and oak logs, grants Smithing XP, and persists", () => {
  assert.equal(typeof progression.craftBronzeShield, "function");

  const state = progression.createProgression({ inventory: { bronzeBars: 2, oakLogs: 1 } });
  const result = progression.craftBronzeShield(state);
  const saved = progression.serializeProgression(state);
  const loaded = progression.createProgression(saved);

  assert.equal(result.ok, true);
  assert.equal(result.armor.id, "bronzeShield");
  assert.equal(state.inventory.bronzeBars, 0);
  assert.equal(state.inventory.oakLogs, 0);
  assert.equal(state.skills.smithingXp, 40);
  assert.equal(progression.getArmorView(loaded).id, "bronzeShield");
  assert.equal(progression.getDamageReduction(loaded), 1);
});

test("bronze shield blocks missing materials and duplicate ownership", () => {
  const missing = progression.createProgression({ inventory: { bronzeBars: 1, oakLogs: 0 } });
  const crafted = progression.createProgression({ inventory: { bronzeBars: 3, oakLogs: 2 } });

  const missingResult = progression.craftBronzeShield(missing);
  const firstCraft = progression.craftBronzeShield(crafted);
  const secondCraft = progression.craftBronzeShield(crafted);

  assert.equal(missingResult.ok, false);
  assert.equal(missingResult.reason, "missing_materials");
  assert.equal(firstCraft.ok, true);
  assert.equal(secondCraft.ok, false);
  assert.equal(secondCraft.reason, "already_owned");
});

test("bronze shield reduces incoming player damage", () => {
  const state = progression.createProgression({
    equipment: { armor: "bronzeShield", ownedArmor: ["clothTunic", "bronzeShield"] },
  });

  const result = progression.damagePlayer(state, 3);

  assert.equal(result.knockedOut, false);
  assert.equal(result.damageTaken, 2);
  assert.equal(state.combat.hp, 18);
});
