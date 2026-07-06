const LEVEL_XP = [0, 100, 260, 500, 860, 1380, 2100, 3060, 4300, 5860, 7780];
const WOODCUTTING_REWARD_XP = 24;
export const OAK_WOODCUTTING_REWARD_XP = 45;
export const MINING_REWARD_XP = 30;
export const SMITHING_REWARD_XP = 20;
export const COPPER_SWORD_SMITHING_XP = 30;
export const ATTACK_REWARD_XP = 18;
export const RIDGE_SLIME_ATTACK_REWARD_XP = 35;
export const LOG_SELL_PRICE = 4;
export const OAK_LOG_SELL_PRICE = 10;
export const COPPER_ORE_SELL_PRICE = 6;
export const COPPER_BAR_SELL_PRICE = 14;
export const IRON_AXE_COST = 40;
export const QUEST_REWARD_COINS = 25;
export const MAX_HP = 20;
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
export const WEAPONS = {
  trainingSword: {
    id: "trainingSword",
    name: "Training sword",
    damage: 4,
    damageLabel: "4 damage",
  },
  copperSword: {
    id: "copperSword",
    name: "Copper sword",
    damage: 6,
    damageLabel: "6 damage",
  },
};

const BANK_ITEMS = ["logs", "oakLogs", "copperOre", "copperBars"];
const QUEST_KEYS = ["logs", "ore", "bar", "sale", "slime"];
const SLIME_REWARDS = {
  trainingSlime: { xp: ATTACK_REWARD_XP, coins: 3 },
  ridgeSlime: { xp: RIDGE_SLIME_ATTACK_REWARD_XP, coins: 8 },
};

export function createProgression(saved = {}) {
  saved = saved || {};
  const ownedAxes = normalizeOwnedAxes(saved.equipment?.ownedAxes);
  const savedAxe = saved.equipment?.axe;
  const axe = ownedAxes.includes(savedAxe) ? savedAxe : "bronze";
  const ownedWeapons = normalizeOwnedWeapons(saved.equipment?.ownedWeapons);
  const savedWeapon = saved.equipment?.weapon;
  const weapon = ownedWeapons.includes(savedWeapon) ? savedWeapon : "trainingSword";

  return {
    inventory: {
      logs: readCount(saved.inventory?.logs),
      oakLogs: readCount(saved.inventory?.oakLogs),
      copperOre: readCount(saved.inventory?.copperOre),
      copperBars: readCount(saved.inventory?.copperBars),
      coins: readCount(saved.inventory?.coins),
    },
    bank: {
      logs: readCount(saved.bank?.logs),
      oakLogs: readCount(saved.bank?.oakLogs),
      copperOre: readCount(saved.bank?.copperOre),
      copperBars: readCount(saved.bank?.copperBars),
    },
    skills: {
      woodcuttingXp: readCount(saved.skills?.woodcuttingXp),
      miningXp: readCount(saved.skills?.miningXp),
      smithingXp: readCount(saved.skills?.smithingXp),
      attackXp: readCount(saved.skills?.attackXp),
    },
    combat: {
      hp: clamp(readCount(saved.combat?.hp, MAX_HP), 0, MAX_HP),
      maxHp: MAX_HP,
    },
    quest: normalizeQuest(saved.quest),
    equipment: {
      axe,
      ownedAxes,
      weapon,
      ownedWeapons,
    },
  };
}

export function awardWoodcutting(progress) {
  const beforeLevel = getLevelForXp(progress.skills.woodcuttingXp);
  progress.inventory.logs += 1;
  progress.skills.woodcuttingXp += WOODCUTTING_REWARD_XP;
  recordQuestProgress(progress, "logs");
  const afterLevel = getLevelForXp(progress.skills.woodcuttingXp);

  return {
    item: "logs",
    amount: 1,
    xp: WOODCUTTING_REWARD_XP,
    leveledUp: afterLevel > beforeLevel,
    level: afterLevel,
  };
}

export function awardOakWoodcutting(progress) {
  const beforeLevel = getLevelForXp(progress.skills.woodcuttingXp);
  progress.inventory.oakLogs += 1;
  progress.skills.woodcuttingXp += OAK_WOODCUTTING_REWARD_XP;
  const afterLevel = getLevelForXp(progress.skills.woodcuttingXp);

  return {
    item: "oakLogs",
    amount: 1,
    xp: OAK_WOODCUTTING_REWARD_XP,
    leveledUp: afterLevel > beforeLevel,
    level: afterLevel,
  };
}

export function awardMining(progress) {
  const beforeLevel = getLevelForXp(progress.skills.miningXp);
  progress.inventory.copperOre += 1;
  progress.skills.miningXp += MINING_REWARD_XP;
  recordQuestProgress(progress, "ore");
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

export function getSmithingView(progress) {
  return getSkillView(progress.skills.smithingXp);
}

export function getAttackView(progress) {
  return getSkillView(progress.skills.attackXp);
}

export function getAxeView(progress) {
  const axe = AXES[progress.equipment?.axe] || AXES.bronze;
  return {
    ...axe,
    owned: progress.equipment?.ownedAxes?.includes(axe.id) || axe.id === "bronze",
  };
}

export function getWeaponView(progress) {
  const weapon = WEAPONS[progress.equipment?.weapon] || WEAPONS.trainingSword;
  return {
    ...weapon,
    owned: progress.equipment?.ownedWeapons?.includes(weapon.id) || weapon.id === "trainingSword",
  };
}

export function getWeaponDamage(progress) {
  return getWeaponView(progress).damage;
}

export function getChopDuration(progress, baseDuration) {
  const axe = getAxeView(progress);
  return Math.round(baseDuration * axe.chopMultiplier);
}

export function depositAll(progress, item) {
  if (!BANK_ITEMS.includes(item)) {
    return { ok: false, reason: "invalid_item" };
  }
  const amount = progress.inventory[item];
  if (amount <= 0) {
    return { ok: false, reason: "none_to_deposit", item };
  }
  progress.inventory[item] = 0;
  progress.bank[item] += amount;
  return { ok: true, item, amount };
}

export function withdrawAll(progress, item) {
  if (!BANK_ITEMS.includes(item)) {
    return { ok: false, reason: "invalid_item" };
  }
  const amount = progress.bank[item];
  if (amount <= 0) {
    return { ok: false, reason: "none_to_withdraw", item };
  }
  progress.bank[item] = 0;
  progress.inventory[item] += amount;
  return { ok: true, item, amount };
}

export function smeltCopperBar(progress) {
  if (progress.inventory.copperOre < 2) {
    return { ok: false, reason: "not_enough_ore", needed: 2 - progress.inventory.copperOre };
  }

  const beforeLevel = getLevelForXp(progress.skills.smithingXp);
  progress.inventory.copperOre -= 2;
  progress.inventory.copperBars += 1;
  progress.skills.smithingXp += SMITHING_REWARD_XP;
  recordQuestProgress(progress, "bar");
  const afterLevel = getLevelForXp(progress.skills.smithingXp);

  return {
    ok: true,
    barsCreated: 1,
    xp: SMITHING_REWARD_XP,
    leveledUp: afterLevel > beforeLevel,
    level: afterLevel,
  };
}

export function craftCopperSword(progress) {
  if (progress.equipment.ownedWeapons.includes("copperSword")) {
    return { ok: false, reason: "already_owned", weapon: WEAPONS.copperSword };
  }
  const missing = {
    copperBars: Math.max(0, 2 - progress.inventory.copperBars),
    oakLogs: Math.max(0, 1 - progress.inventory.oakLogs),
  };
  if (missing.copperBars > 0 || missing.oakLogs > 0) {
    return { ok: false, reason: "missing_materials", missing };
  }

  const beforeLevel = getLevelForXp(progress.skills.smithingXp);
  progress.inventory.copperBars -= 2;
  progress.inventory.oakLogs -= 1;
  progress.skills.smithingXp += COPPER_SWORD_SMITHING_XP;
  progress.equipment.ownedWeapons.push("copperSword");
  progress.equipment.weapon = "copperSword";
  const afterLevel = getLevelForXp(progress.skills.smithingXp);

  return {
    ok: true,
    weapon: WEAPONS.copperSword,
    xp: COPPER_SWORD_SMITHING_XP,
    leveledUp: afterLevel > beforeLevel,
    level: afterLevel,
  };
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
  recordQuestProgress(progress, "sale");

  return {
    ok: true,
    logsSold: logs,
    coinsEarned,
  };
}

export function sellAllOakLogs(progress) {
  const logs = progress.inventory.oakLogs;
  if (logs <= 0) {
    return {
      ok: false,
      reason: "no_oak_logs",
    };
  }

  const coinsEarned = logs * OAK_LOG_SELL_PRICE;
  progress.inventory.oakLogs = 0;
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
  recordQuestProgress(progress, "sale");

  return {
    ok: true,
    oreSold: ore,
    coinsEarned,
  };
}

export function sellAllCopperBars(progress) {
  const bars = progress.inventory.copperBars;
  if (bars <= 0) {
    return {
      ok: false,
      reason: "no_copper_bars",
    };
  }

  const coinsEarned = bars * COPPER_BAR_SELL_PRICE;
  progress.inventory.copperBars = 0;
  progress.inventory.coins += coinsEarned;
  recordQuestProgress(progress, "sale");

  return {
    ok: true,
    barsSold: bars,
    coinsEarned,
  };
}

export function awardSlimeDefeat(progress, rewardType = "trainingSlime") {
  const reward = SLIME_REWARDS[rewardType] || SLIME_REWARDS.trainingSlime;
  const beforeLevel = getLevelForXp(progress.skills.attackXp);
  progress.skills.attackXp += reward.xp;
  progress.inventory.coins += reward.coins;
  if (rewardType === "trainingSlime") {
    recordQuestProgress(progress, "slime");
  }
  const afterLevel = getLevelForXp(progress.skills.attackXp);

  return {
    ok: true,
    xp: reward.xp,
    coins: reward.coins,
    leveledUp: afterLevel > beforeLevel,
    level: afterLevel,
  };
}

export function resetHp(progress) {
  progress.combat.hp = progress.combat.maxHp;
}

export function damagePlayer(progress, amount) {
  progress.combat.hp = clamp(progress.combat.hp - amount, 0, progress.combat.maxHp);
  if (progress.combat.hp <= 0) {
    resetHp(progress);
    return { knockedOut: true, hp: progress.combat.hp };
  }
  return { knockedOut: false, hp: progress.combat.hp };
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

export function recordQuestProgress(progress, key) {
  if (!QUEST_KEYS.includes(key)) {
    return { ok: false, reason: "unknown_objective" };
  }
  progress.quest.objectives[key] = true;
  return { ok: true, key };
}

export function completeQuestIfReady(progress) {
  if (progress.quest.completed) {
    return { ok: false, reason: "already_completed" };
  }

  const ready = QUEST_KEYS.every((key) => progress.quest.objectives[key]);
  if (!ready) {
    return { ok: false, reason: "not_ready" };
  }

  progress.quest.completed = true;
  progress.inventory.coins += QUEST_REWARD_COINS;
  return { ok: true, coins: QUEST_REWARD_COINS };
}

export function serializeProgression(progress) {
  return {
    inventory: {
      logs: progress.inventory.logs,
      oakLogs: progress.inventory.oakLogs,
      copperOre: progress.inventory.copperOre,
      copperBars: progress.inventory.copperBars,
      coins: progress.inventory.coins,
    },
    bank: {
      logs: progress.bank.logs,
      oakLogs: progress.bank.oakLogs,
      copperOre: progress.bank.copperOre,
      copperBars: progress.bank.copperBars,
    },
    skills: {
      woodcuttingXp: progress.skills.woodcuttingXp,
      miningXp: progress.skills.miningXp,
      smithingXp: progress.skills.smithingXp,
      attackXp: progress.skills.attackXp,
    },
    combat: {
      hp: progress.combat.hp,
    },
    quest: {
      completed: progress.quest.completed,
      objectives: { ...progress.quest.objectives },
    },
    equipment: {
      axe: progress.equipment.axe,
      ownedAxes: [...progress.equipment.ownedAxes],
      weapon: progress.equipment.weapon,
      ownedWeapons: [...progress.equipment.ownedWeapons],
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

function normalizeOwnedWeapons(savedWeapons) {
  const saved = Array.isArray(savedWeapons) ? savedWeapons : [];
  return [...new Set(["trainingSword", ...saved.filter((weapon) => WEAPONS[weapon])])];
}

function normalizeQuest(savedQuest = {}) {
  const savedObjectives = savedQuest?.objectives || {};
  return {
    completed: Boolean(savedQuest?.completed),
    objectives: Object.fromEntries(QUEST_KEYS.map((key) => [key, Boolean(savedObjectives[key])])),
  };
}

function readCount(value, fallback = 0) {
  return Math.max(0, Number(value) || fallback);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
