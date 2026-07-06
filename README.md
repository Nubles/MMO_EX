# MMO-EX

MMO-EX is an experiment in building a browser MMO-style game that can run from GitHub Pages. The first slice is a static top-down RPG prototype inspired by early resource-gathering MMO loops.

## Playable Features

- Top-down canvas world with grass, paths, water, a cabin, a market, trees, rocks, slimes, interactable objects, and NPCs.
- Keyboard movement with WASD or arrow keys.
- Click-to-move navigation.
- Click trees to walk over and chop them.
- Woodcutting XP, levels, logs, stumps, and timed tree respawn.
- Timber market: sell logs for coins and buy an iron axe upgrade.
- Copper mining: mine rocks for copper ore and Mining XP.
- Prospector market: sell copper ore or copper bars for coins.
- Bank chest: deposit and withdraw logs, copper ore, and copper bars.
- Furnace workshop: smelt copper ore into copper bars for Smithing XP.
- Training slimes with Attack XP, coin rewards, HP, and respawns.
- First Island Charter quest tying gathering, smithing, trading, and combat into one starter loop.
- Equipment display with faster chopping once the iron axe is owned.
- Chat-style world messages.
- Local browser save for position, inventory, skills, bank, quest progress, resources, and slime timers.
- Reset-save button.

## Controls

- `WASD` or arrow keys: move.
- Mouse click: move to a spot.
- Click a tree: walk to it and chop when close.
- Click an NPC: read their line.
- Stand near the Timber Buyer: use the market buttons to sell logs or buy the iron axe.
- Stand near the Prospector: sell copper ore or copper bars.
- Stand near the Bank chest: deposit or withdraw materials.
- Stand near the Furnace: smelt copper ore into bars.
- Click a training slime: walk over and attack it.

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

- Add a larger map with region exits and distinct biomes.
- Add starter crafting and equipment beyond the iron axe.
- Add sprite assets or generated tile art.
- Add real multiplayer presence through a backend such as Cloudflare Workers, Supabase, Firebase, or another realtime service.
