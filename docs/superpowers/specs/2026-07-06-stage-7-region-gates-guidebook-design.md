# Stage 7: Region Gates and Guidebook Design

Date: 2026-07-06

## Goal

Make MMO-EX feel more like a guided MMO starting zone by adding named regions, a visible Ashwood Ridge gate, and a guidebook that explains current goals, unlocks, recipes, and resource locations.

## Player-Facing Features

- The world has named regions: First Island, Ashwood Ridge, and Iron Hollow as a locked future destination.
- A Ridge Gate marker sits on the road between the village and Ashwood Ridge.
- Clicking the gate before the First Island Charter is complete explains the unlock requirement.
- Clicking the gate after the charter is complete confirms Ashwood Ridge is open.
- The side panel gains a Guidebook section with the recommended next step, region status, known recipes, and resource hints.
- The guidebook updates from current progression state without adding a backend or new save format.

## Rules

- First Island is always unlocked.
- Ashwood Ridge unlocks when the First Island Charter is complete.
- Iron Hollow appears as locked and coming soon.
- The guidebook recommendation follows the earliest useful next step:
  - Finish the charter if it is incomplete.
  - Explore Ashwood Ridge after the charter is complete.
  - Craft a copper sword before the player owns it.
  - Craft a bronze shield before the player owns it.
  - Prepare for future iron expeditions once starter gear is complete.
- This stage uses a soft gate: movement is not blocked, but the gate communicates requirements and progression.

## Boundaries

- No multiplayer backend.
- No new combat tier or iron resources yet.
- No hard collision barrier for the region gate in this slice.
- No modal windows; the guidebook stays in the existing side panel style.

## Test Coverage

- Region status returns the correct lock/unlock state for old and completed saves.
- Guidebook recommendation changes as quest and equipment state changes.
- Recipe and hint lists include the current known starter recipes and locations.
- World creation includes the Ridge Gate object.
- Browser smoke test verifies the guidebook controls render and the page has no runtime errors.
