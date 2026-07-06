const LEVEL_XP = [0, 100, 260, 500, 860, 1380, 2100, 3060, 4300, 5860, 7780];
const WOODCUTTING_REWARD_XP = 24;
export const MINING_REWARD_XP = 30;
export const LOG_SELL_PRICE = 4;
export const COPPER_ORE_SELL_PRICE = 6;
export const IRON_AXE_COST = 40;
export const AXES = {
  bronze: {
    id: "bronze",
    name: "Bronze axe",
    speedLabel: "Standard chop speed",
    chopMultiplier: 1,
  },
  iron: {
    id: "iron",
    name: "Iron axe",
    speedLabel: "35% faster chopping",
    chopMultiplier: 0.65,
  },
};

export function createProgression(saved = {}) {
  saved = saved || {};
  const ownedAxes = normalizeOwnedAxes(saved.equipment?.ownedAxes);
  const savedAxe = saved.equipment?.axe;
  const axe = ownedAxes.includes(savedAxe) ? savedAxe : "bronze";

  return {
    inventory: {
      logs: Math.max(0, Number(saved.inventory?.logs) || 0),
      copperOre: Math.max(0, Number(saved.inventory?.copperOre) || 0),
      coins: Math.max(0, Number(saved.inventory?.coins) || 0),
    },
    skills: {
      woodcuttingXp: Math.max(0, Number(saved.skills?.woodcuttingXp) || 0),
      miningXp: Math.max(0, Number(saved.skills?.miningXp) || 0),
    },
    equipment: {
      axe,
      ownedAxes,
    },
  };
}

export function awardWoodcutting(progress) {
  const beforeLevel = getLevelForXp(progress.skills.woodcuttingXp);
  progress.inventory.logs += 1;
  progress.skills.woodcuttingXp += WOODCUTTING_REWARD_XP;
  const afterLevel = getLevelForXp(progress.skills.woodcuttingXp);

  return {
    item: "logs",
    amount: 1,
    xp: WOODCUTTING_REWARD_XP,
    leveledUp: afterLevel > beforeLevel,
    level: afterLevel,
  };
}

export function awardMining(progress) {
  const beforeLevel = getLevelForXp(progress.skills.miningXp);
  progress.inventory.copperOre += 1;
  progress.skills.miningXp += MINING_REWARD_XP;
  const afterLevel = getLevelForXp(progress.skills.miningXp);

  return {
    item: "copperOre",
    amount: 1,
    xp: MINING_REWARD_XP,
    leveledUp: afterLevel > beforeLevel,
    level: afterLevel,
  };
}

export function getWoodcuttingView(progress) {
  return getSkillView(progress.skills.woodcuttingXp);
}

export function getMiningView(progress) {
  return getSkillView(progress.skills.miningXp);
}

export function getAxeView(progress) {
  const axe = AXES[progress.equipment?.axe] || AXES.bronze;
  return {
    ...axe,
    owned: progress.equipment?.ownedAxes?.includes(axe.id) || axe.id === "bronze",
  };
}

export function getChopDuration(progress, baseDuration) {
  const axe = getAxeView(progress);
  return Math.round(baseDuration * axe.chopMultiplier);
}

export function sellAllLogs(progress) {
  const logs = progress.inventory.logs;
  if (logs <= 0) {
    return {
      ok: false,
      reason: "no_logs",
    };
  }

  const coinsEarned = logs * LOG_SELL_PRICE;
  progress.inventory.logs = 0;
  progress.inventory.coins += coinsEarned;

  return {
    ok: true,
    logsSold: logs,
    coinsEarned,
  };
}

export function sellAllCopperOre(progress) {
  const ore = progress.inventory.copperOre;
  if (ore <= 0) {
    return {
      ok: false,
      reason: "no_copper_ore",
    };
  }

  const coinsEarned = ore * COPPER_ORE_SELL_PRICE;
  progress.inventory.copperOre = 0;
  progress.inventory.coins += coinsEarned;

  return {
    ok: true,
    oreSold: ore,
    coinsEarned,
  };
}

export function buyIronAxe(progress) {
  if (progress.equipment.ownedAxes.includes("iron")) {
    return {
      ok: false,
      reason: "already_owned",
      axe: AXES.iron,
    };
  }

  if (progress.inventory.coins < IRON_AXE_COST) {
    return {
      ok: false,
      reason: "not_enough_coins",
      needed: IRON_AXE_COST - progress.inventory.coins,
    };
  }

  progress.inventory.coins -= IRON_AXE_COST;
  progress.equipment.ownedAxes.push("iron");
  progress.equipment.axe = "iron";

  return {
    ok: true,
    axe: AXES.iron,
  };
}

export function serializeProgression(progress) {
  return {
    inventory: {
      logs: progress.inventory.logs,
      copperOre: progress.inventory.copperOre,
      coins: progress.inventory.coins,
    },
    skills: {
      woodcuttingXp: progress.skills.woodcuttingXp,
      miningXp: progress.skills.miningXp,
    },
    equipment: {
      axe: progress.equipment.axe,
      ownedAxes: [...progress.equipment.ownedAxes],
    },
  };
}

function getSkillView(xp) {
  const level = getLevelForXp(xp);
  const currentLevelXp = getXpForLevel(level);
  const nextLevelXp = getXpForLevel(level + 1);
  const span = Math.max(1, nextLevelXp - currentLevelXp);
  const progressToNext = Math.min(1, Math.max(0, (xp - currentLevelXp) / span));

  return {
    level,
    xp,
    nextLevelXp,
    currentLevelXp,
    progressToNext,
  };
}

function getLevelForXp(xp) {
  for (let level = LEVEL_XP.length; level >= 1; level -= 1) {
    if (xp >= getXpForLevel(level)) {
      return level;
    }
  }

  return 1;
}

function getXpForLevel(level) {
  if (level <= LEVEL_XP.length) {
    return LEVEL_XP[level - 1];
  }

  const extra = level - LEVEL_XP.length;
  return LEVEL_XP[LEVEL_XP.length - 1] + extra * extra * 900;
}

function normalizeOwnedAxes(savedAxes) {
  const saved = Array.isArray(savedAxes) ? savedAxes : [];
  return [...new Set(["bronze", ...saved.filter((axe) => AXES[axe])])];
}
