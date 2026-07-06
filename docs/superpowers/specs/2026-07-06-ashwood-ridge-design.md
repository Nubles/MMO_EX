# Ashwood Ridge Design

## Goal

Stage 5 expands MMO-EX from a starter island loop into a small second-region experience. The player should feel that the world can grow outward: after completing the First Island Charter, they can head east into Ashwood Ridge, gather a new wood tier, fight tougher local slimes, and craft a first combat upgrade.

## Chosen Approach

I considered three possible next slices:

1. **Realtime multiplayer presence**: exciting, but it needs backend decisions and would distract from the core game loop.
2. **A larger map with regional progression**: best fit now because it proves the browser-only game can grow while staying static and deployable on GitHub Pages.
3. **A visual asset pass**: useful later, but it does not add much gameplay depth.

The recommended slice is the larger map with regional progression. It keeps the architecture simple and gives players a concrete next step after the charter.

## Player Experience

Ashwood Ridge is an eastern highland area connected by the existing path network. The first charter remains the onboarding goal. The ridge content is visible enough to invite exploration, but its stronger rewards and tougher enemies communicate that it is the next stage.

New player-facing additions:

- Oak trees in the ridge, yielding oak logs and more Woodcutting XP than regular logs.
- Ridge slimes with more HP and better Attack/coin rewards than training slimes.
- Copper sword crafting at the existing furnace, consuming copper bars and oak logs.
- Equipment display gains a weapon line and damage label.
- Bank supports oak logs.
- Market supports selling oak logs.

## Rules

Oak trees:

- Resource type: `oakTree`
- Inventory item: `oakLogs`
- Reward: 1 oak log and 45 Woodcutting XP
- Respawn: same timer family as trees unless a later stage needs tier-specific timing
- Sale value: 10 coins per oak log

Copper sword:

- Requires 2 copper bars and 1 oak log
- Grants 30 Smithing XP
- Adds and equips `copperSword`
- If already owned, crafting is blocked
- Weapon damage changes combat from 4 to 6

Ridge slime:

- Resource/enemy type: `ridgeSlime`
- HP: 16
- Reward: 35 Attack XP and 8 coins
- Respawn: uses the existing slime respawn timer

## Data And Persistence

Existing saves must keep loading safely. Missing new fields default to:

- `inventory.oakLogs = 0`
- `bank.oakLogs = 0`
- `equipment.weapon = "trainingSword"`
- `equipment.ownedWeapons = ["trainingSword"]`

Serialization must persist oak logs, banked oak logs, weapon state, and ridge slime state through the existing save object.

## UI Changes

The side panel stays compact and scannable:

- Inventory adds Oak Logs.
- Bank adds Oak Logs.
- Equipment adds Weapon and Damage.
- Actions add Sell Oak Logs and Craft Copper Sword.

The existing action panel remains location-sensitive:

- Sell Oak Logs works near the Timber Buyer.
- Craft Copper Sword works near the Furnace.

## World Changes

The map expands eastward into a ridge field. Rendering should reuse the current canvas style with a new terrain tile color for ridge ground and visual treatment for oak trees and ridge slimes. The implementation should avoid image dependencies for now so GitHub Pages deployment remains simple.

## Testing

Progression tests cover:

- Old save defaults for oak logs and weapons.
- Oak log reward and XP.
- Oak log sale value.
- Copper sword craft success, failure without materials, and already-owned blocking.
- Copper sword damage view.
- Ridge slime reward values.

World tests cover:

- Creating the world includes oak trees and ridge slimes.
- Saved ridge slime state restores correctly.

Browser smoke testing should verify:

- The app loads without console errors.
- A seeded player near the furnace can craft the copper sword and sees weapon/damage update.
- A seeded player near the Timber Buyer can sell oak logs.
