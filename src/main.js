import {
  COPPER_BAR_SELL_PRICE,
  COPPER_ORE_SELL_PRICE,
  IRON_AXE_COST,
  LOG_SELL_PRICE,
  OAK_LOG_SELL_PRICE,
  awardMining,
  awardOakWoodcutting,
  awardTinMining,
  awardSlimeDefeat,
  awardWoodcutting,
  buyIronAxe,
  completeQuestIfReady,
  createProgression,
  craftBronzeShield,
  craftCopperSword,
  damagePlayer,
  depositAll,
  getArmorView,
  getAttackView,
  getAxeView,
  getChopDuration,
  getGuidebook,
  getMiningView,
  getRegionStatus,
  getSmithingView,
  getWeaponDamage,
  getWeaponView,
  getWoodcuttingView,
  sellAllCopperBars,
  sellAllCopperOre,
  sellAllLogs,
  sellAllOakLogs,
  serializeProgression,
  smeltBronzeBar,
  smeltCopperBar,
  withdrawAll,
} from "./progression.js";
import { createDefaultPlayer, serializePlayer, setPlayerTarget, updatePlayer } from "./player.js";
import { getCamera, renderGame, resizeCanvas, screenToWorld } from "./render.js";
import {
  ATTACK_DURATION_MS,
  CHOP_DURATION_MS,
  INTERACTION_RADIUS,
  MINE_DURATION_MS,
  createWorld,
  damageSlime,
  depleteResource,
  findNpcAt,
  findObjectAt,
  findResourceAt,
  findSlimeAt,
  serializeResources,
  serializeSlimes,
  updateResources,
  updateSlimes,
} from "./world.js";
import { loadSave, resetSave, saveGame } from "./storage.js";

const NPC_INTERACTION_RADIUS = 96;
const OBJECT_INTERACTION_RADIUS = 92;

const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
const elements = Object.fromEntries([
  "saveStatus", "logCount", "oakLogCount", "copperOreCount", "tinOreCount", "copperBarCount", "bronzeBarCount", "coinCount", "woodcuttingLevel", "woodcuttingProgress", "woodcuttingXp",
  "miningLevel", "miningProgress", "miningXp", "smithingLevel", "smithingProgress", "smithingXp", "attackLevel", "attackProgress", "attackXp",
  "hpValue", "hpFill", "axeName", "axeSpeed", "weaponName", "weaponDamage", "armorName", "armorProtection", "marketStatus", "sellLogs", "sellOakLogs", "buyIronAxe", "sellCopperOre", "sellCopperBars", "smeltCopperBar", "smeltBronzeBar", "craftCopperSword", "craftBronzeShield",
  "depositLogs", "withdrawLogs", "depositOakLogs", "withdrawOakLogs", "depositCopperOre", "withdrawCopperOre", "depositTinOre", "withdrawTinOre", "depositCopperBars", "withdrawCopperBars", "depositBronzeBars", "withdrawBronzeBars",
  "bankLogs", "bankOakLogs", "bankCopperOre", "bankTinOre", "bankCopperBars", "bankBronzeBars", "questLogs", "questOre", "questBar", "questSale", "questSlime", "questStatus", "guideRecommendedTitle", "guideRecommendedDetail", "guideRegions", "guideRecipes", "guideHints", "worldPrompt", "chatLog", "resetSave",
].map((id) => [id, document.querySelector(`#${id}`)]));

const save = loadSave();
const world = createWorld(save.data?.resources, save.data?.slimes);
const player = createDefaultPlayer(save.data?.player);
const progress = createProgression(save.data);
const input = { keys: new Set() };
const game = { world, player, progress, hover: null, activeChop: null, pendingResourceId: null, pendingSlimeId: null };

let view = resizeCanvas(canvas);
let camera = getCamera(world, player, view);
let lastFrame = performance.now();
let lastAutoSave = 0;
let saveFlashUntil = 0;

pushChat(save.message);
pushChat("Complete the First Island Charter: gather, smith, trade, and train.");
updateUi();
requestAnimationFrame(tick);

window.addEventListener("resize", () => { view = resizeCanvas(canvas); });
window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
    event.preventDefault();
    input.keys.add(key);
  }
});
window.addEventListener("keyup", (event) => input.keys.delete(event.key.toLowerCase()));

canvas.addEventListener("pointermove", (event) => {
  const point = getWorldPoint(event);
  game.hover = {
    point,
    resource: findResourceAt(world, point.x, point.y),
    npc: findNpcAt(world, point.x, point.y),
    object: findObjectAt(world, point.x, point.y),
    slime: findSlimeAt(world, point.x, point.y),
  };
  updatePrompt();
});
canvas.addEventListener("pointerleave", () => { game.hover = null; updatePrompt(); });
canvas.addEventListener("pointerdown", (event) => {
  const point = getWorldPoint(event);
  const resource = findResourceAt(world, point.x, point.y);
  const slime = findSlimeAt(world, point.x, point.y);
  const object = findObjectAt(world, point.x, point.y);
  const npc = findNpcAt(world, point.x, point.y);

  if (resource) return chooseResource(resource);
  if (slime) return chooseSlime(slime);
  if (object) return interactWithObject(object);
  if (npc) return talkToNpc(npc);

  game.pendingResourceId = null;
  game.pendingSlimeId = null;
  stopAction();
  setPlayerTarget(player, point.x, point.y, world);
  updatePrompt();
});

wireButton("sellLogs", () => tradeNear("merchant", () => sellAllLogs(progress), (r) => `Sold ${r.logsSold} logs for ${r.coinsEarned} coins.`, "You do not have any logs to sell."));
wireButton("sellOakLogs", () => tradeNear("merchant", () => sellAllOakLogs(progress), (r) => `Sold ${r.logsSold} oak logs for ${r.coinsEarned} coins.`, "You do not have any oak logs to sell."));
wireButton("sellCopperOre", () => tradeNear("prospector", () => sellAllCopperOre(progress), (r) => `Sold ${r.oreSold} copper ore for ${r.coinsEarned} coins.`, "You do not have any copper ore to sell."));
wireButton("sellCopperBars", () => tradeNear("prospector", () => sellAllCopperBars(progress), (r) => `Sold ${r.barsSold} copper bars for ${r.coinsEarned} coins.`, "You do not have any copper bars to sell."));
wireButton("buyIronAxe", buyAxe);
wireButton("smeltCopperBar", smeltCopperAtWorkshop);
wireButton("smeltBronzeBar", smeltBronzeAtWorkshop);
wireButton("craftCopperSword", craftSwordAtWorkshop);
wireButton("craftBronzeShield", craftShieldAtWorkshop);
wireButton("depositLogs", () => bankAction("bank", () => depositAll(progress, "logs"), "Deposited logs."));
wireButton("withdrawLogs", () => bankAction("bank", () => withdrawAll(progress, "logs"), "Withdrew logs."));
wireButton("depositOakLogs", () => bankAction("bank", () => depositAll(progress, "oakLogs"), "Deposited oak logs."));
wireButton("withdrawOakLogs", () => bankAction("bank", () => withdrawAll(progress, "oakLogs"), "Withdrew oak logs."));
wireButton("depositCopperOre", () => bankAction("bank", () => depositAll(progress, "copperOre"), "Deposited copper ore."));
wireButton("withdrawCopperOre", () => bankAction("bank", () => withdrawAll(progress, "copperOre"), "Withdrew copper ore."));
wireButton("depositTinOre", () => bankAction("bank", () => depositAll(progress, "tinOre"), "Deposited tin ore."));
wireButton("withdrawTinOre", () => bankAction("bank", () => withdrawAll(progress, "tinOre"), "Withdrew tin ore."));
wireButton("depositCopperBars", () => bankAction("bank", () => depositAll(progress, "copperBars"), "Deposited copper bars."));
wireButton("withdrawCopperBars", () => bankAction("bank", () => withdrawAll(progress, "copperBars"), "Withdrew copper bars."));
wireButton("depositBronzeBars", () => bankAction("bank", () => depositAll(progress, "bronzeBars"), "Deposited bronze bars."));
wireButton("withdrawBronzeBars", () => bankAction("bank", () => withdrawAll(progress, "bronzeBars"), "Withdrew bronze bars."));
elements.resetSave.addEventListener("click", () => { resetSave(); window.location.reload(); });

function tick(now) {
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  updateResources(world, now);
  updateSlimes(world, now);
  updatePlayer(player, input, world, dt);
  updatePending(now);
  updateAction(now);
  updateUi(now);
  view = resizeCanvas(canvas);
  camera = renderGame(ctx, game, view);
  if (now - lastAutoSave > 5000) { persist("Autosaved"); lastAutoSave = now; }
  requestAnimationFrame(tick);
}

function chooseResource(resource) {
  if (resource.depleted) { pushChat(`${resource.label} is depleted. It will recover soon.`); return; }
  if (Math.hypot(resource.x - player.x, resource.y - player.y) <= INTERACTION_RADIUS) return startGathering(resource);
  game.pendingResourceId = resource.id;
  game.pendingSlimeId = null;
  stopAction();
  setPlayerTarget(player, resource.x, resource.y + 34, world);
  pushChat(`Walking to the ${resource.label.toLowerCase()}.`);
}

function chooseSlime(slime) {
  if (Math.hypot(slime.x - player.x, slime.y - player.y) <= INTERACTION_RADIUS) return startAttack(slime);
  game.pendingSlimeId = slime.id;
  game.pendingResourceId = null;
  stopAction();
  setPlayerTarget(player, slime.x, slime.y + 28, world);
  pushChat(`Walking to the ${slime.label.toLowerCase()}.`);
}

function updatePending(now) {
  if (!game.activeChop && game.pendingResourceId) {
    const resource = world.resources.find((item) => item.id === game.pendingResourceId);
    if (!resource || resource.depleted) game.pendingResourceId = null;
    else if (Math.hypot(resource.x - player.x, resource.y - player.y) <= INTERACTION_RADIUS) { game.pendingResourceId = null; startGathering(resource, now); }
  }
  if (!game.activeChop && game.pendingSlimeId) {
    const slime = world.slimes.find((item) => item.id === game.pendingSlimeId);
    if (!slime || slime.defeated) game.pendingSlimeId = null;
    else if (Math.hypot(slime.x - player.x, slime.y - player.y) <= INTERACTION_RADIUS) { game.pendingSlimeId = null; startAttack(slime, now); }
  }
}

function startGathering(resource, now = performance.now()) {
  game.activeChop = { resourceId: resource.id, startedAt: now, endsAt: now + getGatherDuration(resource) };
  player.target = null;
  const message = resource.type === "copperRock"
    ? "You swing your pickaxe at the copper rock."
    : resource.type === "tinRock"
      ? "You swing your pickaxe at the tin rock."
      : resource.type === "oakTree"
        ? `You swing your ${getAxeView(progress).name.toLowerCase()} at the oak tree.`
        : `You swing your ${getAxeView(progress).name.toLowerCase()} at the tree.`;
  pushChat(message);
}

function startAttack(slime, now = performance.now()) {
  game.activeChop = { slimeId: slime.id, startedAt: now, endsAt: now + ATTACK_DURATION_MS };
  player.target = null;
  pushChat(`You attack the ${slime.label.toLowerCase()}.`);
}

function updateAction(now) {
  if (!game.activeChop) return;
  if (game.activeChop.resourceId) return updateGathering(now);
  if (game.activeChop.slimeId) return updateAttack(now);
}

function updateGathering(now) {
  const resource = world.resources.find((item) => item.id === game.activeChop.resourceId);
  if (!resource || resource.depleted) return stopAction();
  if (Math.hypot(resource.x - player.x, resource.y - player.y) > INTERACTION_RADIUS + 18) { pushChat("You step too far away and stop gathering."); return stopAction(); }
  if (now < game.activeChop.endsAt) return;
  depleteResource(resource, now);
  const reward = getGatherReward(resource);
  pushChat(getGatherMessage(resource, reward));
  maybeCompleteQuest();
  stopAction();
  persist("Progress saved");
}

function updateAttack(now) {
  const slime = world.slimes.find((item) => item.id === game.activeChop.slimeId);
  if (!slime || slime.defeated) return stopAction();
  if (Math.hypot(slime.x - player.x, slime.y - player.y) > INTERACTION_RADIUS + 18) { pushChat("You step too far away from the slime."); return stopAction(); }
  if (now < game.activeChop.endsAt) return;
  const hit = damageSlime(slime, getWeaponDamage(progress), now);
  if (hit.defeated) {
    const reward = awardSlimeDefeat(progress, slime.rewardType);
    pushChat(`Slime defeated. +${reward.xp} Attack XP and ${reward.coins} coins.`);
    maybeCompleteQuest();
    persist("Combat saved");
    return stopAction();
  }
  const damage = Math.random() < 0.5 ? 1 : 0;
  const result = damagePlayer(progress, damage);
  pushChat(`You hit the slime. It has ${slime.hp}/${slime.maxHp} HP left.`);
  if (result.knockedOut) pushChat("You were knocked down and woke up safely in the village.");
  stopAction();
  persist("Combat saved");
}

function stopAction() { game.activeChop = null; updatePrompt(); }
function getGatherDuration(resource) { return resource.type === "copperRock" || resource.type === "tinRock" ? MINE_DURATION_MS : getChopDuration(progress, CHOP_DURATION_MS); }
function getGatherReward(resource) {
  if (resource.type === "copperRock") return awardMining(progress);
  if (resource.type === "tinRock") return awardTinMining(progress);
  if (resource.type === "oakTree") return awardOakWoodcutting(progress);
  return awardWoodcutting(progress);
}
function getGatherMessage(resource, reward) {
  if (resource.type === "copperRock") return `You mine copper ore. +${reward.xp} Mining XP.`;
  if (resource.type === "tinRock") return `You mine tin ore. +${reward.xp} Mining XP.`;
  if (resource.type === "oakTree") return `You get an oak log. +${reward.xp} Woodcutting XP.`;
  return `You get some logs. +${reward.xp} Woodcutting XP.`;
}
function getWorldPoint(event) { const rect = canvas.getBoundingClientRect(); return screenToWorld(event.clientX - rect.left, event.clientY - rect.top, camera, view.dpr); }

function tradeNear(npcId, action, successText, failText) {
  if (!isNearNpc(npcId)) { pushChat("Stand near the right trader first."); return; }
  const result = action();
  if (!result.ok) { pushChat(failText); updateUi(); return; }
  pushChat(successText(result));
  maybeCompleteQuest();
  persist("Trade saved");
  updateUi();
}

function buyAxe() {
  if (!isNearNpc("merchant")) { pushChat("Stand near the Timber Buyer first."); return; }
  const result = buyIronAxe(progress);
  if (result.ok) { pushChat("You bought and equipped an iron axe."); persist("Equipment saved"); updateUi(); return; }
  pushChat(result.reason === "already_owned" ? "You already own the iron axe." : `You need ${result.needed} more coins for the iron axe.`);
}

function smeltCopperAtWorkshop() {
  if (!isNearObject("workshop")) { pushChat("Stand near the furnace to smelt copper."); return; }
  const result = smeltCopperBar(progress);
  if (!result.ok) { pushChat("You need 2 copper ore to smelt a copper bar."); updateUi(); return; }
  pushChat("Smelted 1 copper bar. +20 Smithing XP.");
  maybeCompleteQuest();
  persist("Smithing saved");
  updateUi();
}

function smeltBronzeAtWorkshop() {
  if (!isNearObject("workshop")) { pushChat("Stand near the furnace to smelt bronze."); return; }
  const result = smeltBronzeBar(progress);
  if (!result.ok) { pushChat("You need 1 copper ore and 1 tin ore to smelt a bronze bar."); updateUi(); return; }
  pushChat("Smelted 1 bronze bar. +" + result.xp + " Smithing XP.");
  persist("Smithing saved");
  updateUi();
}

function craftSwordAtWorkshop() {
  if (!isNearObject("workshop")) { pushChat("Stand near the furnace to craft a copper sword."); return; }
  const result = craftCopperSword(progress);
  if (!result.ok) {
    pushChat(result.reason === "already_owned" ? "You already own the copper sword." : "You need 2 copper bars and 1 oak log for a copper sword.");
    updateUi();
    return;
  }
  pushChat("Crafted and equipped a " + result.weapon.name + ". +" + result.xp + " Smithing XP.");
  persist("Weapon saved");
  updateUi();
}

function craftShieldAtWorkshop() {
  if (!isNearObject("workshop")) { pushChat("Stand near the furnace to craft a bronze shield."); return; }
  const result = craftBronzeShield(progress);
  if (!result.ok) {
    pushChat(result.reason === "already_owned" ? "You already own the bronze shield." : "You need 2 bronze bars and 1 oak log for a bronze shield.");
    updateUi();
    return;
  }
  pushChat("Crafted and equipped a " + result.armor.name + ". +" + result.xp + " Smithing XP.");
  persist("Armor saved");
  updateUi();
}

function bankAction(objectId, action, successText) {
  if (!isNearObject(objectId)) { pushChat("Stand near the bank chest first."); return; }
  const result = action();
  pushChat(result.ok ? `${successText} (${result.amount})` : "Nothing to move.");
  persist("Bank saved");
  updateUi();
}

function interactWithObject(object) {
  if (object.type === "regionGate") {
    const region = getRegionStatus(progress).find((item) => item.id === object.regionId);
    if (!region?.unlocked) {
      pushChat(object.label + ": " + (region?.requirement || "This path is locked."));
      return;
    }
    pushChat(object.label + ": " + region.name + " is open. The ridge road is yours.");
    return;
  }
  pushChat(`${object.label}: stand nearby to use its panel actions.`);
}

function talkToNpc(npc) {
  pushChat(`${npc.name}: ${npc.line}`);
  if (npc.id === "merchant") pushChat(`Logs sell for ${LOG_SELL_PRICE}; oak logs sell for ${OAK_LOG_SELL_PRICE}. Iron axe costs ${IRON_AXE_COST} coins.`);
  if (npc.id === "prospector") pushChat(`Copper ore sells for ${COPPER_ORE_SELL_PRICE}; bars sell for ${COPPER_BAR_SELL_PRICE}.`);
}

function maybeCompleteQuest() {
  const result = completeQuestIfReady(progress);
  if (result.ok) pushChat(`First Island Charter complete. +${result.coins} coins.`);
}

function updateUi(now = performance.now()) {
  elements.logCount.textContent = progress.inventory.logs;
  elements.oakLogCount.textContent = progress.inventory.oakLogs;
  elements.copperOreCount.textContent = progress.inventory.copperOre;
  elements.tinOreCount.textContent = progress.inventory.tinOre;
  elements.copperBarCount.textContent = progress.inventory.copperBars;
  elements.bronzeBarCount.textContent = progress.inventory.bronzeBars;
  elements.coinCount.textContent = progress.inventory.coins;
  updateSkill("woodcutting", getWoodcuttingView(progress));
  updateSkill("mining", getMiningView(progress));
  updateSkill("smithing", getSmithingView(progress));
  updateSkill("attack", getAttackView(progress));
  elements.hpValue.textContent = `${progress.combat.hp} / ${progress.combat.maxHp}`;
  elements.hpFill.style.width = `${Math.round((progress.combat.hp / progress.combat.maxHp) * 100)}%`;
  const axe = getAxeView(progress);
  elements.axeName.textContent = axe.name;
  elements.axeSpeed.textContent = axe.speedLabel;
  const weapon = getWeaponView(progress);
  elements.weaponName.textContent = weapon.name;
  elements.weaponDamage.textContent = weapon.damageLabel;
  const armor = getArmorView(progress);
  elements.armorName.textContent = armor.name;
  elements.armorProtection.textContent = armor.protectionLabel;
  elements.bankLogs.textContent = progress.bank.logs;
  elements.bankOakLogs.textContent = progress.bank.oakLogs;
  elements.bankCopperOre.textContent = progress.bank.copperOre;
  elements.bankTinOre.textContent = progress.bank.tinOre;
  elements.bankCopperBars.textContent = progress.bank.copperBars;
  elements.bankBronzeBars.textContent = progress.bank.bronzeBars;
  updateQuestUi();
  updateGuidebookUi();
  updateActionUi();
  elements.saveStatus.textContent = now < saveFlashUntil ? "Progress saved locally" : "Local browser save";
  updatePrompt();
}

function updateSkill(prefix, skill) {
  elements[`${prefix}Level`].textContent = skill.level;
  elements[`${prefix}Progress`].style.width = `${Math.round(skill.progressToNext * 100)}%`;
  elements[`${prefix}Xp`].textContent = `${skill.xp} / ${skill.nextLevelXp} XP`;
}

function updateQuestUi() {
  const map = { questLogs: "logs", questOre: "ore", questBar: "bar", questSale: "sale", questSlime: "slime" };
  for (const [id, key] of Object.entries(map)) elements[id].classList.toggle("complete", progress.quest.objectives[key]);
  elements.questStatus.textContent = progress.quest.completed ? "Charter Complete" : "Charter in progress.";
}

function updateGuidebookUi() {
  const guidebook = getGuidebook(progress);
  elements.guideRecommendedTitle.textContent = guidebook.recommended.title;
  elements.guideRecommendedDetail.textContent = guidebook.recommended.detail;
  renderGuideList(elements.guideRegions, guidebook.regions, (region) => `${region.name}: ${region.status}`);
  renderGuideList(elements.guideRecipes, guidebook.recipes, (recipe) => `${recipe.name}: ${recipe.ingredients} at ${recipe.station}`);
  renderGuideList(elements.guideHints, guidebook.hints, (hint) => `${hint.label}: ${hint.location}`);
}

function renderGuideList(element, items, getText) {
  element.replaceChildren(...items.map((item) => {
    const row = document.createElement("li");
    row.textContent = getText(item);
    if (item.unlocked) row.classList.add("complete");
    if (item.status === "Coming soon") row.classList.add("locked");
    return row;
  }));
}

function updateActionUi() {
  const nearMerchant = isNearNpc("merchant");
  const nearProspector = isNearNpc("prospector");
  const nearBank = isNearObject("bank");
  const nearWorkshop = isNearObject("workshop");
  const ownsIron = progress.equipment.ownedAxes.includes("iron");
  const ownsCopperSword = progress.equipment.ownedWeapons.includes("copperSword");
  const ownsBronzeShield = progress.equipment.ownedArmor.includes("bronzeShield");
  elements.sellLogs.disabled = !nearMerchant || progress.inventory.logs <= 0;
  elements.sellOakLogs.disabled = !nearMerchant || progress.inventory.oakLogs <= 0;
  elements.buyIronAxe.disabled = !nearMerchant || ownsIron || progress.inventory.coins < IRON_AXE_COST;
  elements.sellCopperOre.disabled = !nearProspector || progress.inventory.copperOre <= 0;
  elements.sellCopperBars.disabled = !nearProspector || progress.inventory.copperBars <= 0;
  elements.smeltCopperBar.disabled = !nearWorkshop || progress.inventory.copperOre < 2;
  elements.smeltBronzeBar.disabled = !nearWorkshop || progress.inventory.copperOre < 1 || progress.inventory.tinOre < 1;
  elements.craftCopperSword.disabled = !nearWorkshop || ownsCopperSword || progress.inventory.copperBars < 2 || progress.inventory.oakLogs < 1;
  elements.craftBronzeShield.disabled = !nearWorkshop || ownsBronzeShield || progress.inventory.bronzeBars < 2 || progress.inventory.oakLogs < 1;
  for (const [id, item, source] of [["depositLogs","logs","inventory"],["withdrawLogs","logs","bank"],["depositOakLogs","oakLogs","inventory"],["withdrawOakLogs","oakLogs","bank"],["depositCopperOre","copperOre","inventory"],["withdrawCopperOre","copperOre","bank"],["depositTinOre","tinOre","inventory"],["withdrawTinOre","tinOre","bank"],["depositCopperBars","copperBars","inventory"],["withdrawCopperBars","copperBars","bank"],["depositBronzeBars","bronzeBars","inventory"],["withdrawBronzeBars","bronzeBars","bank"]]) {
    elements[id].disabled = !nearBank || progress[source][item] <= 0;
  }
  if (nearBank) elements.marketStatus.textContent = "Bank chest nearby. Deposit or withdraw materials.";
  else if (nearWorkshop) elements.marketStatus.textContent = ownsBronzeShield ? "Furnace nearby. Bronze shield owned." : "Furnace nearby. Smelt copper or bronze, then craft weapons and shields.";
  else if (nearProspector) elements.marketStatus.textContent = `Prospector nearby. Ore ${COPPER_ORE_SELL_PRICE} coins, bars ${COPPER_BAR_SELL_PRICE} coins.`;
  else if (nearMerchant) elements.marketStatus.textContent = ownsIron ? `Iron axe owned. Logs sell for ${LOG_SELL_PRICE}; oak logs ${OAK_LOG_SELL_PRICE}.` : `Logs sell for ${LOG_SELL_PRICE}, oak logs ${OAK_LOG_SELL_PRICE}. Iron axe costs ${IRON_AXE_COST} coins.`;
  else elements.marketStatus.textContent = "Visit a trader, bank, or workshop.";
}

function updatePrompt() {
  if (game.activeChop?.slimeId) { elements.worldPrompt.textContent = "Fighting slime..."; return; }
  if (game.activeChop?.resourceId) { const r = world.resources.find((item) => item.id === game.activeChop.resourceId); elements.worldPrompt.textContent = r?.type === "copperRock" ? "Mining copper..." : r?.type === "tinRock" ? "Mining tin..." : r?.type === "oakTree" ? "Chopping oak..." : "Chopping tree..."; return; }
  if (game.hover?.slime) { elements.worldPrompt.textContent = "Training slime: click to attack."; return; }
  if (game.hover?.object) { elements.worldPrompt.textContent = game.hover.object.type === "regionGate" ? `${game.hover.object.label}: click to check region access.` : `${game.hover.object.label}: stand nearby to use actions.`; return; }
  if (game.hover?.resource) { elements.worldPrompt.textContent = game.hover.resource.depleted ? `${game.hover.resource.label} is depleted.` : `${game.hover.resource.label}: click to gather.`; return; }
  if (game.hover?.npc) { elements.worldPrompt.textContent = `${game.hover.npc.name}: click to talk.`; return; }
  elements.worldPrompt.textContent = "Finish the charter, then push east into Ashwood Ridge.";
}

function isNearNpc(id) { const npc = world.npcs.find((item) => item.id === id); return Boolean(npc && Math.hypot(npc.x - player.x, npc.y - player.y) <= NPC_INTERACTION_RADIUS); }
function isNearObject(id) { const object = world.objects.find((item) => item.id === id); return Boolean(object && Math.hypot(object.x - player.x, object.y - player.y) <= OBJECT_INTERACTION_RADIUS); }
function wireButton(id, handler) { elements[id].addEventListener("click", handler); }
function pushChat(message) { const item = document.createElement("li"); item.textContent = message; elements.chatLog.append(item); while (elements.chatLog.children.length > 8) elements.chatLog.firstElementChild.remove(); elements.chatLog.scrollTop = elements.chatLog.scrollHeight; }
function persist(label) { saveGame({ player: serializePlayer(player), ...serializeProgression(progress), resources: serializeResources(world.resources), slimes: serializeSlimes(world.slimes) }); saveFlashUntil = performance.now() + 1300; elements.saveStatus.textContent = label; }
