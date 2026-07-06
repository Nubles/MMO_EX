# Stage 3 Copper Mining Design

## Goal

Add a second gathering loop to MMO-EX: copper mining. The player should be able to mine copper rocks, gain Mining XP, collect copper ore, and sell ore to a Prospector NPC for coins.

## Chosen Direction

Stage 3 adds Mining rather than combat, banking, or a bigger map. Mining is the best next slice because it reuses the proven resource-node loop while proving the game can support multiple skills, multiple resources, and multiple NPC markets.

Alternatives considered:

- Banking: useful soon, but it is storage infrastructure rather than a new playable loop.
- Combat: important later, but it needs health, enemies, drops, and respawn rules.
- Mining: adds a second RuneScape-like skill with minimal new architecture.

## Player Experience

The player explores the island and finds copper rocks near a small mining camp. Clicking a copper rock works like clicking a tree: the player walks over, mines for a short duration, receives copper ore, gains Mining XP, and the rock becomes depleted until it respawns.

The right-side panel shows copper ore in the inventory and Mining below Woodcutting in the skills list. A Prospector NPC near the rocks buys copper ore. When the player is close to the Prospector, the market panel switches from timber actions to ore actions.

## Rules

- Copper ore sells for 6 coins each.
- Mining a copper rock awards 30 Mining XP and 1 copper ore.
- Copper rocks use the same interaction radius as trees.
- Copper rocks have their own respawn duration of about 14 seconds.
- Stage 3 uses a simple bronze pickaxe implicitly; pickaxe upgrades are deferred.
- Existing saves without copper ore or Mining XP default to zero.
- Existing depleted tree saves continue to load.

## Interface

The existing side panel gains:

- Copper ore count in inventory.
- Mining level and XP progress below Woodcutting.
- Market section that changes based on nearby NPC:
  - Near Timber Buyer: sell logs and buy iron axe.
  - Near Prospector: sell copper ore.
  - Near neither: show travel hint and disable market buttons.

The first screen remains the playable canvas world.

## Architecture

Update existing modules:

- `src/world.js`: Add copper rock layout, resource-specific respawn durations, Prospector NPC, and resource serialization that includes resource type.
- `src/progression.js`: Add copper ore inventory, Mining XP, Mining view, mining reward, ore selling rules, and save serialization.
- `src/render.js`: Render copper rocks and depleted rocks separately from trees.
- `src/main.js`: Generalize resource interaction from chopping-only to gathering by resource type. Add mining action timing, Prospector proximity, ore market handling, and new UI updates.
- `index.html`: Add copper ore and Mining UI elements plus a sell ore market button.
- `styles.css`: Existing action-button styles should cover the new button.
- `tests/progression.test.mjs`: Add tests for save compatibility, mining reward, and ore selling.
- `README.md`: Document Mining stage.

## Testing And Verification

Automated tests:

- Old saves default copper ore and Mining XP to zero.
- Mining award adds 1 copper ore and 30 Mining XP.
- Selling zero copper ore is blocked.
- Selling copper ore converts all ore to coins at 6 coins each.

Browser verification:

- Existing woodcutting loop still works.
- Copper rock click mines ore and awards Mining XP.
- Copper rock depletes and respawns.
- Prospector market sells ore for coins.
- Refresh preserves copper ore, Mining XP, and depleted resource state.
- Reset save returns all stage-3 state to defaults.

## Deferred

- Iron pickaxe and pickaxe upgrade shop.
- Tin, coal, iron, and higher ores.
- Smithing bars and items.
- Banking.
- Mining animations beyond the current active resource pulse.
