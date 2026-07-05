import { TILE_SIZE, tileAt } from "./world.js";

const TILE_COLORS = {
  grass: ["#496b35", "#3f5e2f"],
  flowers: ["#526f38", "#456331"],
  path: ["#8b7144", "#756039"],
  water: ["#254f65", "#1f4054"],
  cabin: ["#654326", "#53351e"],
  market: ["#6b5634", "#57442a"],
  void: ["#121712", "#121712"],
};

export function resizeCanvas(canvas) {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const rect = canvas.getBoundingClientRect();
  const width = Math.floor(rect.width * dpr);
  const height = Math.floor(rect.height * dpr);

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  return {
    dpr,
    cssWidth: rect.width,
    cssHeight: rect.height,
    width,
    height,
  };
}

export function screenToWorld(screenX, screenY, camera, dpr = 1) {
  return {
    x: screenX * dpr + camera.x,
    y: screenY * dpr + camera.y,
  };
}

export function getCamera(world, player, view) {
  const worldWidth = world.width * world.tileSize * view.dpr;
  const worldHeight = world.height * world.tileSize * view.dpr;
  const playerX = player.x * view.dpr;
  const playerY = player.y * view.dpr;

  return {
    x: clamp(playerX - view.width * 0.5, 0, Math.max(0, worldWidth - view.width)),
    y: clamp(playerY - view.height * 0.5, 0, Math.max(0, worldHeight - view.height)),
  };
}

export function renderGame(ctx, game, view) {
  const { world, player, hover, activeChop } = game;
  const camera = getCamera(world, player, view);

  ctx.save();
  ctx.clearRect(0, 0, view.width, view.height);
  ctx.scale(view.dpr, view.dpr);
  ctx.translate(-camera.x / view.dpr, -camera.y / view.dpr);

  drawTerrain(ctx, world);
  drawMapDetails(ctx, world);
  drawResources(ctx, world, hover?.resource, activeChop);
  drawNpcs(ctx, world);
  drawTarget(ctx, player);
  drawPlayer(ctx, player, performance.now());

  ctx.restore();

  drawVignette(ctx, view);

  return camera;
}

function drawTerrain(ctx, world) {
  for (let tileY = 0; tileY < world.height; tileY += 1) {
    for (let tileX = 0; tileX < world.width; tileX += 1) {
      const type = tileAt(tileX, tileY);
      const [base, alternate] = TILE_COLORS[type] || TILE_COLORS.grass;
      const x = tileX * TILE_SIZE;
      const y = tileY * TILE_SIZE;

      ctx.fillStyle = (tileX + tileY) % 2 === 0 ? base : alternate;
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

      if (type === "path") {
        ctx.fillStyle = "rgba(255, 235, 174, 0.06)";
        ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
      }

      if (type === "flowers") {
        drawFlowers(ctx, x, y);
      }

      if (type === "water") {
        drawWater(ctx, x, y, tileX, tileY);
      }
    }
  }
}

function drawMapDetails(ctx, world) {
  drawBuilding(ctx, 18 * TILE_SIZE, 10 * TILE_SIZE, 6 * TILE_SIZE, 4 * TILE_SIZE, "Guild Cabin");
  drawMarket(ctx, 25 * TILE_SIZE, 16 * TILE_SIZE, 5 * TILE_SIZE, 3 * TILE_SIZE);

  ctx.strokeStyle = "rgba(36, 47, 28, 0.42)";
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, world.width * TILE_SIZE, world.height * TILE_SIZE);
}

function drawResources(ctx, world, hoveredResource, activeChop) {
  for (const resource of world.resources) {
    const isHovered = hoveredResource?.id === resource.id;
    const isActive = activeChop?.resourceId === resource.id;

    if (resource.depleted) {
      drawStump(ctx, resource.x, resource.y, isHovered);
    } else {
      drawTree(ctx, resource.x, resource.y, isHovered, isActive);
    }
  }
}

function drawNpcs(ctx, world) {
  for (const npc of world.npcs) {
    drawShadow(ctx, npc.x, npc.y + 14, 18, 7);
    ctx.fillStyle = "#583f76";
    roundedRect(ctx, npc.x - 12, npc.y - 22, 24, 34, 8);
    ctx.fill();
    ctx.fillStyle = "#e9c99d";
    circle(ctx, npc.x, npc.y - 27, 10);
    ctx.fill();
    ctx.fillStyle = "#fff4d2";
    ctx.font = "700 12px ui-sans-serif, system-ui";
    ctx.textAlign = "center";
    ctx.fillText(npc.name, npc.x, npc.y - 43);
  }
}

function drawTarget(ctx, player) {
  if (!player.target) {
    return;
  }

  ctx.strokeStyle = "rgba(229, 184, 92, 0.82)";
  ctx.lineWidth = 2;
  circle(ctx, player.target.x, player.target.y, 12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(player.target.x - 18, player.target.y);
  ctx.lineTo(player.target.x + 18, player.target.y);
  ctx.moveTo(player.target.x, player.target.y - 18);
  ctx.lineTo(player.target.x, player.target.y + 18);
  ctx.stroke();
}

function drawPlayer(ctx, player, now) {
  const bob = player.moving ? Math.sin(now / 110) * 2 : 0;

  drawShadow(ctx, player.x, player.y + 17, 17, 7);
  ctx.fillStyle = "#476fb3";
  roundedRect(ctx, player.x - 12, player.y - 22 + bob, 24, 34, 8);
  ctx.fill();

  ctx.fillStyle = "#e7bb8a";
  circle(ctx, player.x, player.y - 28 + bob, 11);
  ctx.fill();

  ctx.fillStyle = "#2a241f";
  const eyeY = player.y - 30 + bob;
  if (player.facing === "left") {
    fillCircle(ctx, player.x - 5, eyeY, 2);
  } else if (player.facing === "right") {
    fillCircle(ctx, player.x + 5, eyeY, 2);
  } else {
    fillCircle(ctx, player.x - 4, eyeY, 2);
    fillCircle(ctx, player.x + 4, eyeY, 2);
  }
  ctx.fill();

  ctx.fillStyle = "#c98f35";
  roundedRect(ctx, player.x + 8, player.y - 10 + bob, 5, 20, 2);
  ctx.fill();
}

function drawTree(ctx, x, y, isHovered, isActive) {
  drawShadow(ctx, x, y + 16, 27, 11);

  ctx.fillStyle = "#6d4726";
  roundedRect(ctx, x - 8, y - 5, 16, 32, 4);
  ctx.fill();

  const pulse = isActive ? 4 + Math.sin(performance.now() / 90) * 2 : 0;
  ctx.fillStyle = isHovered ? "#5fa64f" : "#487f3d";
  fillCircle(ctx, x - 14, y - 25, 24 + pulse);
  fillCircle(ctx, x + 11, y - 28, 25 + pulse);
  fillCircle(ctx, x, y - 45, 24 + pulse);
  ctx.fill();

  ctx.fillStyle = "rgba(174, 222, 117, 0.35)";
  fillCircle(ctx, x - 8, y - 50, 8);
  fillCircle(ctx, x + 14, y - 34, 7);
  ctx.fill();

  if (isHovered || isActive) {
    ctx.strokeStyle = isActive ? "#ffd87b" : "rgba(255, 244, 210, 0.75)";
    ctx.lineWidth = 2;
    circle(ctx, x, y - 28, 36 + pulse);
    ctx.stroke();
  }
}

function drawStump(ctx, x, y, isHovered) {
  drawShadow(ctx, x, y + 12, 20, 8);
  ctx.fillStyle = isHovered ? "#9c6d39" : "#75512d";
  roundedRect(ctx, x - 14, y - 10, 28, 22, 7);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 232, 178, 0.3)";
  ctx.lineWidth = 2;
  circle(ctx, x, y - 1, 8);
  ctx.stroke();
}

function drawBuilding(ctx, x, y, width, height, label) {
  ctx.fillStyle = "#5a3924";
  ctx.fillRect(x + 12, y + 22, width - 24, height - 24);
  ctx.fillStyle = "#3a251a";
  ctx.beginPath();
  ctx.moveTo(x, y + 36);
  ctx.lineTo(x + width * 0.5, y);
  ctx.lineTo(x + width, y + 36);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#251913";
  ctx.fillRect(x + width * 0.45, y + height - 46, 28, 46);
  ctx.fillStyle = "#f6d27d";
  ctx.font = "700 12px ui-sans-serif, system-ui";
  ctx.textAlign = "center";
  ctx.fillText(label, x + width * 0.5, y + height + 18);
}

function drawMarket(ctx, x, y, width, height) {
  ctx.fillStyle = "#5a3924";
  ctx.fillRect(x + 8, y + 30, width - 16, height - 30);
  ctx.fillStyle = "#b9473b";
  ctx.fillRect(x, y + 12, width, 22);
  ctx.fillStyle = "#f0d187";
  for (let stripe = 0; stripe < 5; stripe += 1) {
    ctx.fillRect(x + stripe * (width / 5), y + 12, width / 10, 22);
  }
  ctx.fillStyle = "#f6d27d";
  ctx.font = "700 12px ui-sans-serif, system-ui";
  ctx.textAlign = "center";
  ctx.fillText("Market", x + width * 0.5, y + height + 18);
}

function drawFlowers(ctx, x, y) {
  ctx.fillStyle = "rgba(236, 196, 88, 0.58)";
  fillCircle(ctx, x + 13, y + 15, 2);
  fillCircle(ctx, x + 34, y + 29, 2);
  ctx.fillStyle = "rgba(220, 139, 126, 0.58)";
  fillCircle(ctx, x + 24, y + 36, 2);
  ctx.fill();
}

function drawWater(ctx, x, y, tileX, tileY) {
  ctx.strokeStyle = "rgba(158, 216, 222, 0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 7, y + 14 + ((tileX + tileY) % 2) * 4);
  ctx.quadraticCurveTo(x + 22, y + 7, x + 39, y + 14);
  ctx.stroke();
}

function drawShadow(ctx, x, y, width, height) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawVignette(ctx, view) {
  const gradient = ctx.createRadialGradient(
    view.width * 0.5,
    view.height * 0.5,
    view.width * 0.2,
    view.width * 0.5,
    view.height * 0.5,
    view.width * 0.75,
  );
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.24)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, view.width, view.height);
}

function circle(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
}

function fillCircle(ctx, x, y, radius) {
  circle(ctx, x, y, radius);
  ctx.fill();
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

