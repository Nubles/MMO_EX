export const TILE_SIZE = 48;
export const WORLD_WIDTH = 56;
export const WORLD_HEIGHT = 34;
export const TREE_RESPAWN_MS = 18000;
export const COPPER_ROCK_RESPAWN_MS = 14000;
export const SLIME_RESPAWN_MS = 12000;
export const CHOP_DURATION_MS = 1700;
export const MINE_DURATION_MS = 1900;
export const ATTACK_DURATION_MS = 1200;
export const INTERACTION_RADIUS = 72;

const TREE_LAYOUT = [[8,6],[10,5],[12,7],[15,5],[18,7],[22,6],[26,8],[30,6],[34,9],[7,13],[12,15],[17,13],[24,14],[31,15],[36,13],[9,22],[14,24],[21,23],[28,24],[35,22]];
const OAK_TREE_LAYOUT = [[44,8],[47,7],[50,9],[45,14],[49,15],[52,13]];
const COPPER_ROCK_LAYOUT = [[4,18],[5,20],[7,19],[8,21],[10,20],[6,23],[11,23]];
const TIN_ROCK_LAYOUT = [[44,18],[47,19],[50,18],[46,23],[52,23]];
const SLIME_LAYOUT = [[32,20],[34,21],[36,20],[33,23]];
const RIDGE_SLIME_LAYOUT = [[45,20],[49,22],[52,19]];

const NPCS = [
  { id: "guide", name: "Island Guide", x: 20.5 * TILE_SIZE, y: 15.5 * TILE_SIZE, line: "Complete the island charter: gather, smith, trade, and train." },
  { id: "merchant", name: "Timber Buyer", x: 25.5 * TILE_SIZE, y: 17.5 * TILE_SIZE, line: "I buy logs and sell better axes. Stand nearby and use the market panel." },
  { id: "prospector", name: "Prospector", x: 7.5 * TILE_SIZE, y: 18.5 * TILE_SIZE, line: "Copper ore and bars have a good shine. Bring them here and I will pay." },
  { id: "ridgeScout", name: "Ridge Scout", x: 42.5 * TILE_SIZE, y: 16.5 * TILE_SIZE, line: "Ashwood Ridge is rougher ground. Oak trees and sturdy slimes wait east of here." },
];

const OBJECTS = [
  { id: "bank", type: "bank", label: "Bank chest", x: 17.5 * TILE_SIZE, y: 15.5 * TILE_SIZE, radius: 34 },
  { id: "workshop", type: "workshop", label: "Furnace", x: 29.5 * TILE_SIZE, y: 14.5 * TILE_SIZE, radius: 36 },
];

export function createWorld(savedResources = [], savedSlimes = []) {
  const savedById = new Map((savedResources || []).map((resource) => [resource.id, resource]));
  const savedSlimeById = new Map((savedSlimes || []).map((slime) => [slime.id, slime]));
  const resources = [
    ...TREE_LAYOUT.map(([tileX, tileY], index) => createResource("tree", tileX, tileY, index, savedById)),
    ...OAK_TREE_LAYOUT.map(([tileX, tileY], index) => createResource("oakTree", tileX, tileY, index, savedById)),
    ...COPPER_ROCK_LAYOUT.map(([tileX, tileY], index) => createResource("copperRock", tileX, tileY, index, savedById)),
    ...TIN_ROCK_LAYOUT.map(([tileX, tileY], index) => createResource("tinRock", tileX, tileY, index, savedById)),
  ];
  const slimes = [
    ...SLIME_LAYOUT.map(([tileX, tileY], index) => createSlime("trainingSlime", tileX, tileY, index, savedSlimeById)),
    ...RIDGE_SLIME_LAYOUT.map(([tileX, tileY], index) => createSlime("ridgeSlime", tileX, tileY, index, savedSlimeById)),
  ];

  return { width: WORLD_WIDTH, height: WORLD_HEIGHT, tileSize: TILE_SIZE, resources, npcs: NPCS, objects: OBJECTS, slimes };
}

export function serializeResources(resources) {
  return resources.map((resource) => ({ id: resource.id, type: resource.type, depleted: resource.depleted, depletedUntil: resource.depletedUntil }));
}

export function serializeSlimes(slimes) {
  return slimes.map((slime) => ({ id: slime.id, hp: slime.hp, defeated: slime.defeated, respawnAt: slime.respawnAt }));
}

export function tileAt(tileX, tileY) {
  if (tileX < 0 || tileY < 0 || tileX >= WORLD_WIDTH || tileY >= WORLD_HEIGHT) return "void";
  if (tileY >= 30 || tileX >= 54 || (tileX >= 34 && tileY >= 28)) return "water";
  if (tileX >= 18 && tileX <= 23 && tileY >= 10 && tileY <= 13) return "cabin";
  if (tileX >= 25 && tileX <= 29 && tileY >= 16 && tileY <= 18) return "market";
  if (tileX >= 42 && tileX <= 53 && tileY >= 6 && tileY <= 24) return isRidgePath(tileX, tileY) ? "path" : "ridge";
  if ((tileX >= 3 && tileX <= 12 && tileY >= 18 && tileY <= 23) || (tileX >= 31 && tileX <= 37 && tileY >= 20 && tileY <= 24) || tileY === 16 || tileX === 20 || (tileY === 9 && tileX >= 5 && tileX <= 35) || (tileY === 16 && tileX >= 35 && tileX <= 44)) return "path";
  if ((tileX + tileY) % 11 === 0) return "flowers";
  return "grass";
}

export function isBlockedTile(tileType) {
  return tileType === "void" || tileType === "water" || tileType === "cabin" || tileType === "market";
}

export function worldToTile(x, y) {
  return { tileX: Math.floor(x / TILE_SIZE), tileY: Math.floor(y / TILE_SIZE) };
}

export function isBlockedAt(world, x, y, radius = 12) {
  const points = [[x - radius, y - radius], [x + radius, y - radius], [x - radius, y + radius], [x + radius, y + radius]];
  return points.some(([pointX, pointY]) => {
    const { tileX, tileY } = worldToTile(pointX, pointY);
    return isBlockedTile(tileAt(tileX, tileY));
  });
}

export function clampToWorld(world, x, y, radius = 12) {
  const maxX = world.width * world.tileSize - radius;
  const maxY = world.height * world.tileSize - radius;
  return { x: Math.max(radius, Math.min(maxX, x)), y: Math.max(radius, Math.min(maxY, y)) };
}

export function updateResources(world, now) {
  for (const resource of world.resources) {
    if (resource.depleted && resource.depletedUntil <= now) {
      resource.depleted = false;
      resource.depletedUntil = 0;
    }
  }
}

export function updateSlimes(world, now) {
  for (const slime of world.slimes) {
    if (slime.defeated && slime.respawnAt <= now) {
      slime.defeated = false;
      slime.hp = slime.maxHp;
      slime.respawnAt = 0;
    }
  }
}

export function depleteResource(resource, now) {
  resource.depleted = true;
  const respawnMs = resource.type === "copperRock" || resource.type === "tinRock" ? COPPER_ROCK_RESPAWN_MS : TREE_RESPAWN_MS;
  resource.depletedUntil = now + respawnMs;
}

export function damageSlime(slime, amount, now) {
  if (slime.defeated) return { defeated: true, hp: 0 };
  slime.hp = Math.max(0, slime.hp - amount);
  if (slime.hp <= 0) {
    slime.defeated = true;
    slime.respawnAt = now + SLIME_RESPAWN_MS;
    return { defeated: true, hp: 0 };
  }
  return { defeated: false, hp: slime.hp };
}

export function findResourceAt(world, x, y) {
  return world.resources.find((resource) => Math.hypot(resource.x - x, resource.y - y) <= resource.radius + 16);
}

export function findObjectAt(world, x, y) {
  return world.objects.find((object) => Math.hypot(object.x - x, object.y - y) <= object.radius);
}

export function findSlimeAt(world, x, y) {
  return world.slimes.find((slime) => !slime.defeated && Math.hypot(slime.x - x, slime.y - y) <= slime.radius + 12);
}

export function findNpcAt(world, x, y) {
  return world.npcs.find((npc) => Math.hypot(npc.x - x, npc.y - y) <= 28);
}

export function getWorldBounds(world) {
  return { width: world.width * world.tileSize, height: world.height * world.tileSize };
}

function createResource(type, tileX, tileY, index, savedById) {
  const id = getResourceId(type, index);
  const saved = savedById.get(id);
  return {
    id,
    type,
    label: getResourceLabel(type),
    tileX,
    tileY,
    x: (tileX + 0.5) * TILE_SIZE,
    y: (tileY + 0.5) * TILE_SIZE,
    radius: type === "copperRock" || type === "tinRock" ? 25 : 23,
    depleted: Boolean(saved?.depleted),
    depletedUntil: Number(saved?.depletedUntil) || 0,
  };
}

function createSlime(type, tileX, tileY, index, savedById) {
  const ridge = type === "ridgeSlime";
  const id = ridge ? `ridge-slime-${index + 1}` : `slime-${index + 1}`;
  const saved = savedById.get(id);
  const defeated = Boolean(saved?.defeated);
  const maxHp = ridge ? 16 : 10;
  return {
    id,
    type,
    rewardType: type,
    label: ridge ? "Ridge slime" : "Training slime",
    tileX,
    tileY,
    x: (tileX + 0.5) * TILE_SIZE,
    y: (tileY + 0.5) * TILE_SIZE,
    radius: ridge ? 23 : 20,
    maxHp,
    hp: defeated ? 0 : Math.max(1, Math.min(maxHp, Number(saved?.hp) || maxHp)),
    defeated,
    respawnAt: Number(saved?.respawnAt) || 0,
  };
}

function getResourceId(type, index) {
  if (type === "tree") return `tree-${index + 1}`;
  if (type === "oakTree") return `oak-tree-${index + 1}`;
  if (type === "tinRock") return `tin-rock-${index + 1}`;
  return `copper-rock-${index + 1}`;
}

function getResourceLabel(type) {
  if (type === "tree") return "Tree";
  if (type === "oakTree") return "Oak tree";
  if (type === "tinRock") return "Tin rock";
  return "Copper rock";
}

function isRidgePath(tileX, tileY) {
  return tileY === 16 || tileX === 48 || (tileY === 24 && tileX >= 42 && tileX <= 53);
}
