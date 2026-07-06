# MMO-EX

MMO-EX is an experiment in building a browser MMO-style game that can run from GitHub Pages. The first slice is a static top-down RPG prototype inspired by early resource-gathering MMO loops.

## Playable Features

- Top-down canvas world with grass, paths, water, a cabin, a market, trees, and NPCs.
- Keyboard movement with WASD or arrow keys.
- Click-to-move navigation.
- Click trees to walk over and chop them.
- Woodcutting XP, levels, logs, stumps, and timed tree respawn.
- Timber market: sell logs for coins and buy an iron axe upgrade.
- Copper mining: mine rocks for copper ore and Mining XP.
- Prospector market: sell copper ore for coins.
- Equipment display with faster chopping once the iron axe is owned.
- Chat-style world messages.
- Local browser save for position, inventory, XP, and resource timers.
- Reset-save button.

## Controls

- `WASD` or arrow keys: move.
- Mouse click: move to a spot.
- Click a tree: walk to it and chop when close.
- Click an NPC: read their line.
- Stand near the Timber Buyer: use the market buttons to sell logs or buy the iron axe.
- Stand near the Prospector: sell copper ore.

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

- Add banking and storage for gathered materials.
- Add smithing so copper ore can become bars and starter equipment.
- Add a larger map with region exits.
- Add basic combat and loot.
- Add sprite assets or generated tile art.
- Add real multiplayer presence through a backend such as Cloudflare Workers, Supabase, Firebase, or another realtime service.


