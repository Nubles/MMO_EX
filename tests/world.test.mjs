import assert from "node:assert/strict";
import test from "node:test";
import { createWorld, serializeSlimes } from "../src/world.js";

test("world includes Ashwood Ridge oak trees and ridge slimes", () => {
  const world = createWorld();
  const oakTrees = world.resources.filter((resource) => resource.type === "oakTree");
  const ridgeSlimes = world.slimes.filter((slime) => slime.type === "ridgeSlime");

  assert.equal(oakTrees.length, 6);
  assert.equal(oakTrees[0].label, "Oak tree");
  assert.equal(ridgeSlimes.length, 3);
  assert.equal(ridgeSlimes[0].maxHp, 16);
  assert.equal(ridgeSlimes[0].rewardType, "ridgeSlime");
});

test("saved ridge slime state restores by id", () => {
  const world = createWorld([], [{ id: "ridge-slime-1", hp: 4, defeated: false, respawnAt: 0 }]);
  const ridge = world.slimes.find((slime) => slime.id === "ridge-slime-1");
  const saved = serializeSlimes(world.slimes).find((slime) => slime.id === "ridge-slime-1");

  assert.equal(ridge.hp, 4);
  assert.equal(ridge.maxHp, 16);
  assert.deepEqual(saved, { id: "ridge-slime-1", hp: 4, defeated: false, respawnAt: 0 });
});
test("world includes tin rocks for bronze smithing", () => {
  const world = createWorld();
  const tinRocks = world.resources.filter((resource) => resource.type === "tinRock");

  assert.equal(tinRocks.length, 5);
  assert.equal(tinRocks[0].label, "Tin rock");
  assert.match(tinRocks[0].id, /^tin-rock-/);
});
