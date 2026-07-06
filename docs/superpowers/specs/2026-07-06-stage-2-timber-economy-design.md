# Stage 2 Timber Economy Design

## Goal

Extend MMO-EX from a gathering prototype into a small progression loop: gather logs, sell them for coins, buy a better axe, and feel the upgrade through faster chopping.

## Chosen Direction

Stage 2 focuses on economy and equipment, not a new skill or combat. This is the best next slice because it builds directly on stage 1's woodcutting loop and gives the player a reason to repeat it.

Alternatives considered:

- Mining and smithing: strong long-term fit, but it adds a parallel resource system before the first loop has a use.
- Combat: exciting, but it needs health, enemies, damage, drops, and balancing.
- Timber economy: smallest meaningful expansion with the clearest progression payoff.

## Player Experience

The player can visit the Timber Buyer near the market. When close enough, merchant actions appear in the side panel:

- Sell all logs for coins.
- Buy an iron axe once they have enough coins.

The HUD shows the equipped axe. The starter bronze axe chops at the existing pace. The iron axe chops faster, making the upgrade visible in the core loop.

Chat messages confirm selling, failed purchases, successful purchases, and the faster axe effect.

## Rules

- Logs sell for 4 coins each.
- The iron axe costs 40 coins.
- The bronze axe uses the current chop duration.
- The iron axe reduces chop time by about 35%.
- Buying the iron axe is permanent and persists in local save.
- Once owned, the iron axe is automatically equipped.
- Selling requires at least one log.
- Buying requires enough coins and is blocked if already owned.

## Interface

The right-side panel gains:

- An equipment section with the current axe name and chop speed label.
- A market section that appears when the player is near the Timber Buyer.
- Buttons for selling logs and buying the iron axe.

Controls remain code-native HTML buttons. The game canvas remains the first screen and does not become a menu-driven app.

## Architecture

Update existing modules instead of adding a backend:

- `src/progression.js` owns economy constants, equipment state, selling logs, buying axe upgrades, chop duration lookup, and save serialization.
- `src/main.js` detects merchant proximity, wires market buttons, updates prompts, and uses the equipped axe's chop duration.
- `src/world.js` exposes the merchant NPC id and an interaction helper if needed.
- `index.html` adds equipment and market panel markup.
- `styles.css` adds button and disabled-state styling for the new controls.
- `README.md` documents stage-2 features.

## Save Compatibility

Existing saves without equipment data default to a bronze axe. Inventory and XP should continue to load as before.

## Testing And Verification

Manual browser verification:

- Existing save loads without crashing.
- Gather one log still works.
- Selling zero logs is blocked with a chat message.
- Selling logs converts all logs into coins.
- Buying the iron axe is blocked without enough coins.
- Buying the iron axe succeeds with enough coins.
- Iron axe persists after refresh.
- Iron axe reduces the chop timer.
- Reset save returns to bronze axe, zero logs, zero coins, and level 1.

## Deferred

- Multiple axe tiers.
- Shops with inventory lists.
- Banking.
- Item drag and drop.
- Server-side economy validation.
