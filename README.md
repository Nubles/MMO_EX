# MMO-EX

MMO-EX is an experiment in building a browser MMO-style game that can run from GitHub Pages. The first slice is a static top-down RPG prototype inspired by early resource-gathering MMO loops.

## Playable Features

- Top-down canvas world with grass, paths, water, a cabin, a market, Ashwood Ridge, trees, rocks, slimes, interactable objects, region gates, and NPCs.
- Keyboard movement with WASD or arrow keys.
- Click-to-move navigation.
- Click trees to walk over and chop them.
- Woodcutting XP, levels, logs, stumps, and timed tree respawn.
- Timber market: sell logs for coins and buy an iron axe upgrade.
- Copper and tin mining: mine rocks for ore and Mining XP.
- Prospector market: sell copper ore or copper bars for coins.
- Bank chest: deposit and withdraw logs, oak logs, ores, and bars.
- Furnace workshop: smelt copper bars, smelt bronze bars, craft a copper sword, and craft a bronze shield.
- Training slimes and tougher ridge slimes with Attack XP, coin rewards, HP, and respawns.
- First Island Charter quest tying gathering, smithing, trading, and combat into one starter loop.
- Guidebook panel with recommended next step, region unlocks, known recipes, and resource hints.
- Ridge Gate marker that explains Ashwood Ridge access requirements.
- Ashwood Ridge: oak trees, oak logs, tin rocks, ridge slimes, and copper/bronze crafting upgrades.
- Equipment display with faster chopping, weapon damage, and armor protection.
- Chat-style world messages.
- Local browser save for position, inventory, skills, bank, equipment, quest progress, resources, and slime timers.
- Reset-save button.

## Controls

- `WASD` or arrow keys: move.
- Mouse click: move to a spot.
- Click a tree: walk to it and chop when close.
- Click an NPC: read their line.
- Click the Ridge Gate: check whether Ashwood Ridge is unlocked.
- Stand near the Timber Buyer: use the market buttons to sell logs, sell oak logs, or buy the iron axe.
- Stand near the Prospector: sell copper ore or copper bars.
- Stand near the Bank chest: deposit or withdraw materials.
- Stand near the Furnace: smelt copper ore into copper bars, smelt copper plus tin into bronze bars, craft a copper sword, or craft a bronze shield from 2 bronze bars and 1 oak log.
- Click a slime: walk over and attack it. Ridge slimes are tougher and pay better rewards; armor reduces incoming damage.

## Run Locally

Because the app uses JavaScript modules, run it through a static web server:

```powershell
python -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/
```

## Deploy

The repository includes a GitHub Actions workflow at `.github/workflows/pages.yml`. In GitHub, enable Pages with **GitHub Actions** as the source, then push to `main`.

## Roadmap

Next strong steps:

- Add hard-gated named destinations and travel transitions.
- Add iron ore, iron gear, and deeper crafting recipes.
- Add sprite assets or generated tile art.
- Add real multiplayer presence through a backend such as Cloudflare Workers, Supabase, Firebase, or another realtime service.
