# Initial Island Complete Design

## Goal

Finish MMO-EX's first island as a complete static browser RPG slice. The island should feel like a tutorial zone: gather resources, trade, store materials, smelt a starter bar, fight a simple creature, and complete a starter quest.

## Current Foundation

The game already has:

- Top-down canvas world.
- Click-to-move and keyboard movement.
- Woodcutting with logs, XP, respawn, and iron axe upgrade.
- Mining with copper ore, XP, respawn, and Prospector sales.
- Inventory, skills, equipment, chat, local save, and GitHub Pages deployment.

## Completion Scope

### 1. Bank Chest

Add a bank chest near the village. When the player stands near it, the side panel exposes storage actions:

- Deposit all logs, copper ore, and copper bars.
- Withdraw all logs, copper ore, and copper bars.

The bank persists in local save. Existing saves default to an empty bank.

### 2. Copper Smelting

Add a furnace/anvil work area near the market.

Rules:

- 2 copper ore create 1 copper bar.
- Smelting grants 20 Smithing XP.
- Copper bars sell to the Prospector for 14 coins each.
- Smithing appears as a third skill in the side panel.

This intentionally skips tin/bronze complexity. Full smithing chains are deferred.

### 3. Simple Combat

Add passive training slimes in a field.

Rules:

- Player has HP and respawns safely if HP reaches 0.
- Slimes have 10 HP.
- Each attack takes about 1.2 seconds.
- Player deals 2-4 damage.
- Slime deals 0-1 damage back.
- Defeating a slime grants 18 Attack XP and 3 coins.
- Slimes respawn after about 12 seconds.

Combat is local and lightweight. Server-authoritative combat is deferred.

### 4. Starter Quest

Add a quest panel named "First Island Charter".

Objectives:

- Chop 3 logs.
- Mine 3 copper ore.
- Smelt 1 copper bar.
- Sell any material once.
- Defeat 1 slime.

Completion grants 25 coins and marks the charter complete. Quest state persists and the reward is granted only once.

## Interface

Keep the canvas world as the first screen. Extend the right panel with compact sections:

- Bank: deposit/withdraw actions near the bank chest.
- Workshop: smelt action near the furnace/anvil.
- Combat: HP and Attack XP.
- Quest: objective checklist and completion status.

The market remains context-sensitive:

- Timber Buyer: logs and axe upgrade.
- Prospector: copper ore and copper bars.
- Bank chest: storage actions.
- Workshop: smelting action.

## Architecture

Update existing files:

- `src/progression.js`: pure rules for bank state, Smithing, Attack, HP, smelting, copper bar sale, slime rewards, quest progress, and serialization.
- `src/world.js`: add bank chest, furnace/anvil, slime entities, and interaction metadata.
- `src/render.js`: render bank, workshop, slimes, defeated slime state, and combat feedback.
- `src/main.js`: route contextual interactions, update quest state, wire bank/workshop/combat actions, and save progress.
- `index.html`: add UI fields and action buttons.
- `styles.css`: reuse existing compact panel/button styling.
- `tests/progression.test.mjs`: test bank, smelting, combat rewards, and quest completion.
- `README.md`: document initial island completion features.

## Save Compatibility

Existing saves remain valid:

- Missing bank defaults to empty.
- Missing copper bars default to 0.
- Missing Smithing, Attack, and HP state defaults to level 1 / full HP.
- Missing quest state defaults to all objectives incomplete.
- Existing tree and copper rock resource state continues to load.

## Testing

Automated tests:

- Old saves default new fields correctly.
- Bank deposit/withdraw moves items correctly.
- Smelting consumes 2 copper ore, creates 1 copper bar, and grants Smithing XP.
- Copper bar selling grants 14 coins per bar.
- Slime reward grants Attack XP and coins.
- Quest completion detects all objectives and grants reward once.

Browser verification:

- Existing woodcutting and mining still work.
- Bank deposit/withdraw works and persists.
- Smelting works near the workshop and persists.
- Selling copper bars works near the Prospector.
- Slime combat rewards coins/Attack XP and respawns.
- Quest panel updates objectives and completes.
- Reset save returns all new systems to defaults.

## Deferred Beyond Initial Island

- Real multiplayer.
- Login/accounts.
- Item-slot banking UI.
- Tin/bronze/iron smithing chains.
- Equippable crafted weapons.
- Enemy pathfinding and aggressive combat.
- Larger map regions.
- Server-authoritative economy/combat.
