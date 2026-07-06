# Stage 6: Bronze Smithing Design

Date: 2026-07-06

## Goal

Add the first deeper smithing branch after Ashwood Ridge by introducing tin ore, bronze bars, and a basic defensive item. The player should now have a reason to combine resources from multiple areas and feel combat improve through gear, not only through weapon damage.

## Player-Facing Features

- Tin rocks appear in Ashwood Ridge as a new Mining target.
- Mining tin grants tin ore and Mining XP.
- The furnace can smelt 1 copper ore + 1 tin ore into 1 bronze bar.
- The furnace can craft a bronze shield from bronze bars and oak logs.
- The bronze shield is equipped automatically once crafted.
- The equipment panel shows the active defensive item and protection value.
- Combat damage against the player is reduced by equipped protection.
- Tin ore and bronze bars can be deposited and withdrawn from the bank.

## Rules

- Tin rocks use the same mining timing and respawn cadence as copper rocks.
- Bronze bars require mixed ore so copper remains useful after copper swords.
- Bronze shield recipe: 2 bronze bars + 1 oak log.
- Bronze shield can be crafted once and grants Smithing XP.
- Protection reduces incoming player damage by 1, with damage never dropping below 0.
- Old saves safely default to 0 tin ore, 0 bronze bars, cloth clothing, and 0 protection.

## Boundaries

- This stage stays single-player and static-host friendly.
- No new backend, accounts, chat, or realtime presence yet.
- No full armor slots yet; this stage introduces one defensive equipment track that can grow later.

## Next Follow-Up Options

- Region gates and destination requirements.
- Iron ore and iron gear.
- Enemy accuracy or defense rolls.
- Crafting guidebook with known recipes and requirements.
