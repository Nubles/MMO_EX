import {
  COPPER_ORE_SELL_PRICE,
  IRON_AXE_COST,
  LOG_SELL_PRICE,
  awardMining,
  awardWoodcutting,
  buyIronAxe,
  createProgression,
  getAxeView,
  getChopDuration,
  getMiningView,
  getWoodcuttingView,
  sellAllCopperOre,
  sellAllLogs,
  serializeProgression,
} from "./progression.js";
import { createDefaultPlayer, serializePlayer, setPlayerTarget, updatePlayer } from "./player.js";
import { getCamera, renderGame, resizeCanvas, screenToWorld } from "./render.js";
import {
  CHOP_DURATION_MS,
  INTERACTION_RADIUS,
  MINE_DURATION_MS,
  createWorld,
  depleteResource,
  findNpcAt,
  findResourceAt,
  serializeResources,
  updateResources,
} from "./world.js";
import { loadSave, resetSave, saveGame } from "./storage.js";

const NPC_INTERACTION_RADIUS = 96;

const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
const elements = {
  saveStatus: document.querySelector("#saveStatus"),
  logCount: document.querySelector("#logCount"),
  copperOreCount: document.querySelector("#copperOreCount"),
  coinCount: document.querySelector("#coinCount"),
  woodcuttingLevel: document.querySelector("#woodcuttingLevel"),
  woodcuttingProgress: document.querySelector("#woodcuttingProgress"),
  woodcuttingXp: document.querySelector("#woodcuttingXp"),
  miningLevel: document.querySelector("#miningLevel"),
  miningProgress: document.querySelector("#miningProgress"),
  miningXp: document.querySelector("#miningXp"),
  axeName: document.querySelector("#axeName"),
  axeSpeed: document.querySelector("#axeSpeed"),
  marketStatus: document.querySelector("#marketStatus"),
  sellLogs: document.querySelector("#sellLogs"),
  buyIronAxe: document.querySelector("#buyIronAxe"),
  sellCopperOre: document.querySelector("#sellCopperOre"),
  worldPrompt: document.querySelector("#worldPrompt"),
  chatLog: document.querySelector("#chatLog"),
  resetSave: document.querySelector("#resetSave"),
};

const save = loadSave();
const world = createWorld(save.data?.resources);
const player = createDefaultPlayer(save.data?.player);
const progress = createProgression(save.data);
const input = {
  keys: new Set(),
};

const game = {
  world,
  player,
  progress,
  hover: null,
  activeChop: null,
  pendingResourceId: null,
};

let view = resizeCanvas(canvas);
let camera = getCamera(world, player, view);
let lastFrame = performance.now();
let lastAutoSave = 0;
let saveFlashUntil = 0;

pushChat(save.message);
pushChat("Gather logs or mine copper, then sell materials to the right island trader.");
updateUi();
requestAnimationFrame(tick);

window.addEventListener("resize", () => {
  view = resizeCanvas(canvas);
});

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
    event.preventDefault();
    input.keys.add(key);
  }
});

window.addEventListener("keyup", (event) => {
  input.keys.delete(event.key.toLowerCase());
});

canvas.addEventListener("pointermove", (event) => {
  const point = getWorldPoint(event);
  const resource = findResourceAt(world, point.x, point.y);
  const npc = findNpcAt(world, point.x, point.y);
  game.hover = { point, resource, npc };
  updatePrompt();
});

canvas.addEventListener("pointerleave", () => {
  game.hover = null;
  updatePrompt();
});

canvas.addEventListener("pointerdown", (event) => {
  const point = getWorldPoint(event);
  const resource = findResourceAt(world, point.x, point.y);
  const npc = findNpcAt(world, point.x, point.y);

  if (resource) {
    chooseResource(resource);
    return;
  }

  if (npc) {
    pushChat(`${npc.name}: ${npc.line}`);
    if (npc.id === "merchant") {
      pushChat(`Logs sell for ${LOG_SELL_PRICE} coins each. Iron axe costs ${IRON_AXE_COST} coins.`);
    }
    if (npc.id === "prospector") {
      pushChat(`Copper ore sells for ${COPPER_ORE_SELL_PRICE} coins each.`);
    }
    return;
  }

  game.pendingResourceId = null;
  stopGathering();
  setPlayerTarget(player, point.x, point.y, world);
  updatePrompt();
});

elements.sellLogs.addEventListener("click", () => {
  if (!isNearNpc("merchant")) {
    pushChat("You need to stand near the Timber Buyer to sell logs.");
    return;
  }

  const result = sellAllLogs(progress);
  if (!result.ok) {
    pushChat("You do not have any logs to sell.");
    updateUi();
    return;
  }

  pushChat(`Sold ${result.logsSold} logs for ${result.coinsEarned} coins.`);
  persist("Market trade saved");
  updateUi();
});

elements.buyIronAxe.addEventListener("click", () => {
  if (!isNearNpc("merchant")) {
    pushChat("You need to stand near the Timber Buyer to buy tools.");
    return;
  }

  const result = buyIronAxe(progress);
  if (result.ok) {
    pushChat("You bought and equipped an iron axe. Chopping is faster now.");
    persist("Equipment saved");
    updateUi();
    return;
  }

  if (result.reason === "already_owned") {
    pushChat("You already own the iron axe.");
  } else {
    pushChat(`You need ${result.needed} more coins for the iron axe.`);
  }
  updateUi();
});

elements.sellCopperOre.addEventListener("click", () => {
  if (!isNearNpc("prospector")) {
    pushChat("You need to stand near the Prospector to sell copper ore.");
    return;
  }

  const result = sellAllCopperOre(progress);
  if (!result.ok) {
    pushChat("You do not have any copper ore to sell.");
    updateUi();
    return;
  }

  pushChat(`Sold ${result.oreSold} copper ore for ${result.coinsEarned} coins.`);
  persist("Ore trade saved");
  updateUi();
});

elements.resetSave.addEventListener("click", () => {
  resetSave();
  window.location.reload();
});

function tick(now) {
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;

  updateResources(world, now);
  updatePlayer(player, input, world, dt);
  updatePendingResource(now);
  updateGathering(now);
  updateUi(now);

  view = resizeCanvas(canvas);
  camera = renderGame(ctx, game, view);

  if (now - lastAutoSave > 5000) {
    persist("Autosaved");
    lastAutoSave = now;
  }

  requestAnimationFrame(tick);
}

function chooseResource(resource) {
  if (resource.depleted) {
    pushChat(`${resource.label} is depleted. It will recover soon.`);
    return;
  }

  const distance = Math.hypot(resource.x - player.x, resource.y - player.y);
  if (distance <= INTERACTION_RADIUS) {
    startGathering(resource);
    return;
  }

  game.pendingResourceId = resource.id;
  stopGathering();
  setPlayerTarget(player, resource.x, resource.y + 34, world);
  pushChat(`Walking to the ${resource.label.toLowerCase()}.`);
}

function updatePendingResource(now) {
  if (!game.pendingResourceId || game.activeChop) {
    return;
  }

  const resource = world.resources.find((item) => item.id === game.pendingResourceId);
  if (!resource || resource.depleted) {
    game.pendingResourceId = null;
    return;
  }

  const distance = Math.hypot(resource.x - player.x, resource.y - player.y);
  if (distance <= INTERACTION_RADIUS) {
    game.pendingResourceId = null;
    startGathering(resource, now);
  }
}

function startGathering(resource, now = performance.now()) {
  if (resource.depleted) {
    return;
  }

  game.activeChop = {
    resourceId: resource.id,
    startedAt: now,
    endsAt: now + getGatherDuration(resource),
  };
  player.target = null;
  pushChat(getStartGatherMessage(resource));
  updatePrompt();
}

function updateGathering(now) {
  if (!game.activeChop) {
    return;
  }

  const resource = world.resources.find((item) => item.id === game.activeChop.resourceId);
  if (!resource || resource.depleted) {
    stopGathering();
    return;
  }

  const distance = Math.hypot(resource.x - player.x, resource.y - player.y);
  if (distance > INTERACTION_RADIUS + 18) {
    pushChat("You step too far away and stop gathering.");
    stopGathering();
    return;
  }

  if (now >= game.activeChop.endsAt) {
    depleteResource(resource, now);
    const reward = resource.type === "copperRock" ? awardMining(progress) : awardWoodcutting(progress);
    pushChat(getRewardMessage(resource, reward));
    if (reward.leveledUp) {
      const skill = resource.type === "copperRock" ? "Mining" : "Woodcutting";
      pushChat(`${skill} level ${reward.level}. Nice.`);
    }
    stopGathering();
    persist("Progress saved");
  }
}

function stopGathering() {
  game.activeChop = null;
  updatePrompt();
}

function getGatherDuration(resource) {
  return resource.type === "copperRock" ? MINE_DURATION_MS : getChopDuration(progress, CHOP_DURATION_MS);
}

function getStartGatherMessage(resource) {
  if (resource.type === "copperRock") {
    return "You swing your pickaxe at the copper rock.";
  }

  return `You swing your ${getAxeView(progress).name.toLowerCase()} at the tree.`;
}

function getRewardMessage(resource, reward) {
  if (resource.type === "copperRock") {
    return `You mine copper ore. +${reward.xp} Mining XP.`;
  }

  return `You get some logs. +${reward.xp} Woodcutting XP.`;
}

function getWorldPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return screenToWorld(event.clientX - rect.left, event.clientY - rect.top, camera, view.dpr);
}

function updateUi(now = performance.now()) {
  elements.logCount.textContent = progress.inventory.logs;
  elements.copperOreCount.textContent = progress.inventory.copperOre;
  elements.coinCount.textContent = progress.inventory.coins;

  const woodcutting = getWoodcuttingView(progress);
  elements.woodcuttingLevel.textContent = woodcutting.level;
  elements.woodcuttingProgress.style.width = `${Math.round(woodcutting.progressToNext * 100)}%`;
  elements.woodcuttingXp.textContent = `${woodcutting.xp} / ${woodcutting.nextLevelXp} XP`;

  const mining = getMiningView(progress);
  elements.miningLevel.textContent = mining.level;
  elements.miningProgress.style.width = `${Math.round(mining.progressToNext * 100)}%`;
  elements.miningXp.textContent = `${mining.xp} / ${mining.nextLevelXp} XP`;

  const axe = getAxeView(progress);
  elements.axeName.textContent = axe.name;
  elements.axeSpeed.textContent = axe.speedLabel;

  updateMarketUi();

  if (now < saveFlashUntil) {
    elements.saveStatus.textContent = "Progress saved locally";
  } else {
    elements.saveStatus.textContent = "Local browser save";
  }

  updatePrompt();
}

function updateMarketUi() {
  const nearMerchant = isNearNpc("merchant");
  const nearProspector = isNearNpc("prospector");
  const ownsIron = progress.equipment.ownedAxes.includes("iron");

  elements.sellLogs.disabled = !nearMerchant || progress.inventory.logs <= 0;
  elements.buyIronAxe.disabled = !nearMerchant || ownsIron || progress.inventory.coins < IRON_AXE_COST;
  elements.sellCopperOre.disabled = !nearProspector || progress.inventory.copperOre <= 0;

  if (nearProspector) {
    elements.marketStatus.textContent = `Prospector nearby. Copper ore sells for ${COPPER_ORE_SELL_PRICE} coins each.`;
    return;
  }

  if (nearMerchant) {
    elements.marketStatus.textContent = ownsIron
      ? `Iron axe owned. Logs sell for ${LOG_SELL_PRICE} coins each.`
      : `Logs sell for ${LOG_SELL_PRICE} coins. Iron axe costs ${IRON_AXE_COST} coins.`;
    return;
  }

  elements.marketStatus.textContent = "Visit the Timber Buyer or Prospector to trade.";
}

function updatePrompt() {
  if (game.activeChop) {
    const resource = world.resources.find((item) => item.id === game.activeChop.resourceId);
    elements.worldPrompt.textContent = resource?.type === "copperRock" ? "Mining copper..." : "Chopping tree...";
    return;
  }

  if (game.hover?.resource) {
    const resource = game.hover.resource;
    elements.worldPrompt.textContent = resource.depleted
      ? `${resource.label} is depleted and will respawn shortly.`
      : `${resource.label}: click to walk over and gather.`;
    return;
  }

  if (game.hover?.npc) {
    elements.worldPrompt.textContent = `${game.hover.npc.name}: click to talk.`;
    return;
  }

  if (isNearNpc("prospector")) {
    elements.worldPrompt.textContent = "Prospector nearby. Use the market panel to sell copper ore.";
    return;
  }

  if (isNearNpc("merchant")) {
    elements.worldPrompt.textContent = "Timber Buyer nearby. Use the market panel to trade.";
    return;
  }

  elements.worldPrompt.textContent = "Gather logs or mine copper, then sell materials to traders.";
}

function isNearNpc(id) {
  const npc = world.npcs.find((item) => item.id === id);
  return Boolean(npc && Math.hypot(npc.x - player.x, npc.y - player.y) <= NPC_INTERACTION_RADIUS);
}

function pushChat(message) {
  const item = document.createElement("li");
  item.textContent = message;
  elements.chatLog.append(item);

  while (elements.chatLog.children.length > 8) {
    elements.chatLog.firstElementChild.remove();
  }

  elements.chatLog.scrollTop = elements.chatLog.scrollHeight;
}

function persist(label) {
  saveGame({
    player: serializePlayer(player),
    ...serializeProgression(progress),
    resources: serializeResources(world.resources),
  });
  saveFlashUntil = performance.now() + 1300;
  elements.saveStatus.textContent = label;
}
