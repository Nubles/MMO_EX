export const TILE_SIZE = 48;
export const WORLD_WIDTH = 42;
export const WORLD_HEIGHT = 30;
export const TREE_RESPAWN_MS = 18000;
export const COPPER_ROCK_RESPAWN_MS = 14000;
export const CHOP_DURATION_MS = 1700;
export const MINE_DURATION_MS = 1900;
export const INTERACTION_RADIUS = 72;

const TREE_LAYOUT = [
  [8, 6],
  [10, 5],
  [12, 7],
  [15, 5],
  [18, 7],
  [22, 6],
  [26, 8],
  [30, 6],
  [34, 9],
  [7, 13],
  [12, 15],
  [17, 13],
  [24, 14],
  [31, 15],
  [36, 13],
  [9, 22],
  [14, 24],
  [21, 23],
  [28, 24],
  [35, 22],
];

const COPPER_ROCK_LAYOUT = [
  [4, 18],
  [5, 20],
  [7, 19],
  [8, 21],
  [10, 20],
  [6, 23],
  [11, 23],
];

const NPCS = [
  {
    id: "guide",
    name: "Island Guide",
    x: 20.5 * TILE_SIZE,
    y: 15.5 * TILE_SIZE,
    line: "Chop trees, mine copper, and make this island useful.",
  },
  {
    id: "merchant",
    name: "Timber Buyer",
    x: 25.5 * TILE_SIZE,
    y: 17.5 * TILE_SIZE,
    line: "I buy logs and sell better axes. Stand nearby and use the market panel.",
  },
  {
    id: "prospector",
    name: "Prospector",
    x: 7.5 * TILE_SIZE,
    y: 18.5 * TILE_SIZE,
    line: "Copper ore has a good shine. Mine it, bring it here, and I will pay.",
  },
];

export function createWorld(savedResources = []) {
  const savedById = new Map((savedResources || []).map((resource) => [resource.id, resource]));
  const resources = [
    ...TREE_LAYOUT.map(([tileX, tileY], index) => createResource("tree", tileX, tileY, index, savedById)),
    ...COPPER_ROCK_LAYOUT.map(([tileX, tileY], index) => createResource("copperRock", tileX, tileY, index, savedById)),
  ];

  return {
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    tileSize: TILE_SIZE,
    resources,
    npcs: NPCS,
  };
}

export function serializeResources(resources) {
  return resources.map((resource) => ({
    id: resource.id,
    type: resource.type,
    depleted: resource.depleted,
    depletedUntil: resource.depletedUntil,
  }));
}

export function tileAt(tileX, tileY) {
  if (tileX < 0 || tileY < 0 || tileX >= WORLD_WIDTH || tileY >= WORLD_HEIGHT) {
    return "void";
  }

  if (tileY >= 26 || tileX >= 39 || (tileX >= 34 && tileY >= 24)) {
    return "water";
  }

  if (tileX >= 18 && tileX <= 23 && tileY >= 10 && tileY <= 13) {
    return "cabin";
  }

  if (tileX >= 25 && tileX <= 29 && tileY >= 16 && tileY <= 18) {
    return "market";
  }

  if ((tileX >= 3 && tileX <= 12 && tileY >= 18 && tileY <= 23) || tileY === 16 || tileX === 20 || (tileY === 9 && tileX >= 5 && tileX <= 35)) {
    return "path";
  }

  if ((tileX + tileY) % 11 === 0) {
    return "flowers";
  }

  return "grass";
}

export function isBlockedTile(tileType) {
  return tileType === "void" || tileType === "water" || tileType === "cabin" || tileType === "market";
}

export function worldToTile(x, y) {
  return {
    tileX: Math.floor(x / TILE_SIZE),
    tileY: Math.floor(y / TILE_SIZE),
  };
}

export function isBlockedAt(world, x, y, radius = 12) {
  const points = [
    [x - radius, y - radius],
    [x + radius, y - radius],
    [x - radius, y + radius],
    [x + radius, y + radius],
  ];

  return points.some(([pointX, pointY]) => {
    const { tileX, tileY } = worldToTile(pointX, pointY);
    return isBlockedTile(tileAt(tileX, tileY));
  });
}

export function clampToWorld(world, x, y, radius = 12) {
  const maxX = world.width * world.tileSize - radius;
  const maxY = world.height * world.tileSize - radius;
  return {
    x: Math.max(radius, Math.min(maxX, x)),
    y: Math.max(radius, Math.min(maxY, y)),
  };
}

export function updateResources(world, now) {
  for (const resource of world.resources) {
    if (resource.depleted && resource.depletedUntil <= now) {
      resource.depleted = false;
      resource.depletedUntil = 0;
    }
  }
}

export function depleteResource(resource, now) {
  resource.depleted = true;
  resource.depletedUntil = now + getResourceRespawnMs(resource);
}

export function findResourceAt(world, x, y) {
  return world.resources.find((resource) => {
    const distance = Math.hypot(resource.x - x, resource.y - y);
    return distance <= resource.radius + 16;
  });
}

export function findNearbyResource(world, player, maxDistance = INTERACTION_RADIUS) {
  let nearest = null;
  let nearestDistance = Infinity;

  for (const resource of world.resources) {
    if (resource.depleted) {
      continue;
    }

    const distance = Math.hypot(resource.x - player.x, resource.y - player.y);
    if (distance < nearestDistance && distance <= maxDistance) {
      nearest = resource;
      nearestDistance = distance;
    }
  }

  return nearest;
}

export function findNpcAt(world, x, y) {
  return world.npcs.find((npc) => Math.hypot(npc.x - x, npc.y - y) <= 28);
}

export function getWorldBounds(world) {
  return {
    width: world.width * world.tileSize,
    height: world.height * world.tileSize,
  };
}

function createResource(type, tileX, tileY, index, savedById) {
  const id = type === "tree" ? `tree-${index + 1}` : `copper-rock-${index + 1}`;
  const saved = savedById.get(id);
  const label = type === "tree" ? "Tree" : "Copper rock";
  return {
    id,
    type,
    label,
    tileX,
    tileY,
    x: (tileX + 0.5) * TILE_SIZE,
    y: (tileY + 0.5) * TILE_SIZE,
    radius: type === "tree" ? 23 : 25,
    depleted: Boolean(saved?.depleted),
    depletedUntil: Number(saved?.depletedUntil) || 0,
  };
}

function getResourceRespawnMs(resource) {
  return resource.type === "copperRock" ? COPPER_ROCK_RESPAWN_MS : TREE_RESPAWN_MS;
}
