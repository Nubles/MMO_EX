import { clampToWorld, isBlockedAt, TILE_SIZE } from "./world.js";

export function createDefaultPlayer(savedPlayer = {}) {
  return {
    x: Number(savedPlayer.x) || 20.5 * TILE_SIZE,
    y: Number(savedPlayer.y) || 20.5 * TILE_SIZE,
    radius: 14,
    speed: 190,
    facing: savedPlayer.facing || "down",
    target: savedPlayer.target || null,
    moving: false,
  };
}

export function updatePlayer(player, input, world, dt) {
  const keyboardVector = getKeyboardVector(input.keys);
  let moveX = keyboardVector.x;
  let moveY = keyboardVector.y;

  if (moveX !== 0 || moveY !== 0) {
    player.target = null;
  } else if (player.target) {
    const dx = player.target.x - player.x;
    const dy = player.target.y - player.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 5) {
      player.target = null;
    } else {
      moveX = dx / distance;
      moveY = dy / distance;
    }
  }

  const length = Math.hypot(moveX, moveY) || 1;
  const normalizedX = moveX / length;
  const normalizedY = moveY / length;
  const distance = player.speed * dt;
  const beforeX = player.x;
  const beforeY = player.y;

  if (moveX !== 0 || moveY !== 0) {
    moveWithCollision(player, world, normalizedX * distance, normalizedY * distance);
    updateFacing(player, normalizedX, normalizedY);
  }

  player.moving = Math.hypot(player.x - beforeX, player.y - beforeY) > 0.1;

  if (player.target && !player.moving) {
    player.target = null;
  }
}

export function setPlayerTarget(player, x, y, world) {
  const clamped = clampToWorld(world, x, y, player.radius);
  if (!isBlockedAt(world, clamped.x, clamped.y, player.radius)) {
    player.target = clamped;
  }
}

export function serializePlayer(player) {
  return {
    x: Math.round(player.x),
    y: Math.round(player.y),
    facing: player.facing,
  };
}

function getKeyboardVector(keys) {
  const left = keys.has("arrowleft") || keys.has("a");
  const right = keys.has("arrowright") || keys.has("d");
  const up = keys.has("arrowup") || keys.has("w");
  const down = keys.has("arrowdown") || keys.has("s");

  return {
    x: Number(right) - Number(left),
    y: Number(down) - Number(up),
  };
}

function moveWithCollision(player, world, dx, dy) {
  const nextX = player.x + dx;
  if (!isBlockedAt(world, nextX, player.y, player.radius)) {
    player.x = nextX;
  }

  const nextY = player.y + dy;
  if (!isBlockedAt(world, player.x, nextY, player.radius)) {
    player.y = nextY;
  }

  const clamped = clampToWorld(world, player.x, player.y, player.radius);
  player.x = clamped.x;
  player.y = clamped.y;
}

function updateFacing(player, x, y) {
  if (Math.abs(x) > Math.abs(y)) {
    player.facing = x > 0 ? "right" : "left";
  } else {
    player.facing = y > 0 ? "down" : "up";
  }
}
