import { awardWoodcutting, createProgression, getWoodcuttingView, serializeProgression } from "./progression.js";
import { createDefaultPlayer, serializePlayer, setPlayerTarget, updatePlayer } from "./player.js";
import { getCamera, renderGame, resizeCanvas, screenToWorld } from "./render.js";
import {
  CHOP_DURATION_MS,
  INTERACTION_RADIUS,
  createWorld,
  depleteResource,
  findNpcAt,
  findResourceAt,
  serializeResources,
  updateResources,
} from "./world.js";
import { loadSave, resetSave, saveGame } from "./storage.js";

const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
const elements = {
  saveStatus: document.querySelector("#saveStatus"),
  logCount: document.querySelector("#logCount"),
  coinCount: document.querySelector("#coinCount"),
  woodcuttingLevel: document.querySelector("#woodcuttingLevel"),
  woodcuttingProgress: document.querySelector("#woodcuttingProgress"),
  woodcuttingXp: document.querySelector("#woodcuttingXp"),
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
pushChat("Click a tree, walk close, and chop it for logs and Woodcutting XP.");
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
    return;
  }

  game.pendingResourceId = null;
  stopChopping();
  setPlayerTarget(player, point.x, point.y, world);
  updatePrompt();
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
  updateChopping(now);
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
    pushChat("That tree is only a stump right now. It will regrow soon.");
    return;
  }

  const distance = Math.hypot(resource.x - player.x, resource.y - player.y);
  if (distance <= INTERACTION_RADIUS) {
    startChopping(resource);
    return;
  }

  game.pendingResourceId = resource.id;
  stopChopping();
  setPlayerTarget(player, resource.x, resource.y + 34, world);
  pushChat("Walking to the tree.");
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
    startChopping(resource, now);
  }
}

function startChopping(resource, now = performance.now()) {
  if (resource.depleted) {
    return;
  }

  game.activeChop = {
    resourceId: resource.id,
    startedAt: now,
    endsAt: now + CHOP_DURATION_MS,
  };
  player.target = null;
  pushChat("You swing your axe at the tree.");
  updatePrompt();
}

function updateChopping(now) {
  if (!game.activeChop) {
    return;
  }

  const resource = world.resources.find((item) => item.id === game.activeChop.resourceId);
  if (!resource || resource.depleted) {
    stopChopping();
    return;
  }

  const distance = Math.hypot(resource.x - player.x, resource.y - player.y);
  if (distance > INTERACTION_RADIUS + 18) {
    pushChat("You step too far away and stop chopping.");
    stopChopping();
    return;
  }

  if (now >= game.activeChop.endsAt) {
    depleteResource(resource, now);
    const reward = awardWoodcutting(progress);
    pushChat(`You get some logs. +${reward.xp} Woodcutting XP.`);
    if (reward.leveledUp) {
      pushChat(`Woodcutting level ${reward.level}. Nice.`);
    }
    stopChopping();
    persist("Progress saved");
  }
}

function stopChopping() {
  game.activeChop = null;
  updatePrompt();
}

function getWorldPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return screenToWorld(event.clientX - rect.left, event.clientY - rect.top, camera, view.dpr);
}

function updateUi(now = performance.now()) {
  elements.logCount.textContent = progress.inventory.logs;
  elements.coinCount.textContent = progress.inventory.coins;

  const woodcutting = getWoodcuttingView(progress);
  elements.woodcuttingLevel.textContent = woodcutting.level;
  elements.woodcuttingProgress.style.width = `${Math.round(woodcutting.progressToNext * 100)}%`;
  elements.woodcuttingXp.textContent = `${woodcutting.xp} / ${woodcutting.nextLevelXp} XP`;

  if (now < saveFlashUntil) {
    elements.saveStatus.textContent = "Progress saved locally";
  } else {
    elements.saveStatus.textContent = "Local browser save";
  }

  updatePrompt();
}

function updatePrompt() {
  if (game.activeChop) {
    elements.worldPrompt.textContent = "Chopping tree...";
    return;
  }

  if (game.hover?.resource) {
    const resource = game.hover.resource;
    elements.worldPrompt.textContent = resource.depleted
      ? "A stump. This tree will respawn shortly."
      : "Tree: click to walk over and chop.";
    return;
  }

  if (game.hover?.npc) {
    elements.worldPrompt.textContent = `${game.hover.npc.name}: click to talk.`;
    return;
  }

  elements.worldPrompt.textContent = "Explore the island. Click trees to gather logs.";
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
