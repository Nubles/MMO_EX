# Browser MMO First Slice Design

## Goal

Create the first playable version of MMO-EX: a static, browser-hosted top-down RPG prototype inspired by early MMO loops. It should run on GitHub Pages without a backend and prove that the project can grow toward a RuneScape-like browser MMO.

## First Slice

The first version is a single-player MMO-feel prototype. The player explores a small village map, moves with keyboard or click-to-move, chops trees, collects logs, gains Woodcutting XP, and sees progress through HUD panels and chat-style system messages.

Real multiplayer is intentionally deferred. GitHub Pages can host the client, but persistent multiplayer needs a server or managed realtime backend later.

## Core Experience

- Top-down 2D world rendered on canvas.
- Tile-based map with grass, paths, water, buildings, trees, stumps, and interactable objects.
- Player avatar with smooth movement and a camera that follows the player.
- Keyboard movement with WASD or arrow keys.
- Click-to-move for mouse play.
- Trees as resource nodes. When the player is close enough, clicking a tree starts chopping.
- Chopping awards logs and Woodcutting XP, then converts the tree into a stump for a short respawn period.
- Inventory panel shows log count and coin count.
- Skills panel shows Woodcutting level, XP, and next-level progress.
- Chat panel logs tutorial hints, gathering results, level-ups, and world flavor.
- Local browser save stores player position, inventory, XP, and depleted tree timers.

## Interface

The first screen is the playable game, not a marketing page. The layout has:

- Full-viewport canvas world.
- Top HUD for title, save status, and basic controls.
- Right-side panel for inventory and skills.
- Bottom-left chat panel.
- Small interaction prompt near the player or selected object.

The visual style should be readable, warm, and game-like without depending on external art assets. Code-native canvas drawing is acceptable for this foundation: trees, buildings, water, player, paths, and effects should be simple but polished.

## Architecture

Use plain static web files:

- `index.html` for the shell and HUD markup.
- `styles.css` for layout, panels, typography, and responsive behavior.
- `src/main.js` as the browser entry point.
- `src/world.js` for map, resources, collisions, and objects.
- `src/player.js` for player state and movement.
- `src/progression.js` for XP, levels, and inventory changes.
- `src/storage.js` for local save/load/reset.
- `src/render.js` for canvas rendering.

No build step is required. This keeps GitHub Pages simple and avoids dependency install risk.

## Data Flow

The main loop updates input, movement, interactions, resource respawns, and UI state, then renders the world. Game state lives in memory and is periodically saved to localStorage after meaningful changes.

Resource nodes are data objects with position, type, depleted state, and respawn timestamp. The progression module receives successful gather events and returns inventory and XP changes.

## Error Handling

If a saved game is missing, invalid, or from an incompatible version, the app starts with default state and posts a chat message. Reset save should be available from the UI. Canvas resize should preserve playability across desktop and smaller screens.

## Testing And Verification

Manual verification is sufficient for this first static prototype:

- Open `index.html` locally and confirm the game loads.
- Move with keyboard.
- Click to move.
- Chop trees only when nearby.
- Gain logs and Woodcutting XP.
- See stumps respawn into trees.
- Refresh and confirm progress persists.
- Reset save and confirm default state returns.
- Confirm the app works from a static file path and through a local HTTP server.

## Deferred

- Real multiplayer and presence.
- Account login.
- Server-authoritative state.
- Combat.
- Banking, trading, and economy.
- Multiple maps.
- Generated or hand-authored sprite sheets.
- Mobile-specific touch controls beyond basic click/tap movement.
