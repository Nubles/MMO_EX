# Stage 6: Bronze Smithing Implementation Plan

Date: 2026-07-06

## Scope

Implement tin mining, bronze smelting, bronze shield crafting, defensive equipment, UI wiring, rendering, and documentation updates.

## Steps

1. Add progression tests for old-save defaults, tin mining rewards, bronze bar smelting, bronze shield crafting, duplicate/missing-material blocking, and damage reduction.
2. Add world tests for tin rocks and stable saved resource ids.
3. Update progression state with tin ore, bronze bars, defensive equipment, and serialization.
4. Add tin rocks to the world and render them with their own visual treatment.
5. Wire the UI: inventory, bank, equipment, furnace actions, buttons, status text, and prompts.
6. Update README with the new playable loop.
7. Run JS syntax checks, Node tests, and a browser smoke test for the new furnace actions.
