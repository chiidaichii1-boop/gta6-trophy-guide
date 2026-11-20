# Leonida Trophy Guide — GTA VI (PS5)

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/chiidaichii1-boop/gta6-trophy-guide/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/chiidaichii1-boop/gta6-trophy-guide/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI — an entry for the [make.fun GTA 6 trophy guide bounty](https://make.fun/c/gta6-trophy-guide-01).

## What it is

- **Every trophy** with its official name, description and grade as PlayStation publishes them (via PSNProfiles, TrueTrophies and Exophase), plus a guide in our own words, steps, when it can be done, and the sources behind each fact.
- **A tracker**: tick trophies off; progress is saved in the browser (localStorage) and can be exported to a file and imported back.
- **Filters** by kind (story, missable, collectibles, activities, side quests, robbery, 100% checklist, misc, online) and by grade, plus search.
- **A spoiler setting** that hides the names and descriptions of story trophies until they are earned.
- **A roadmap to the platinum** in three steps (~200 hours, difficulty 4/10), with the one possibly missable trophy — Positive Mental Attitude — flagged up front.
- **Fully offline**: static files only, no network requests at run time.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. Or serve `app/` with any static file server.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored library.

## Sources

Guide facts come from PowerPyx's GTA 6 Trophy Guide & Roadmap, Sixshore's trophy list, GTA Zone and Output Lag, with the official list cross-checked on PSNProfiles, TrueTrophies and Exophase. Each trophy's guide cites its sources beside it. Two methods are still unconfirmed by the guide writers (Bad Luck, I Guess and Ten Pin) and are marked as such in the guide.

Unofficial fan guide. Grand Theft Auto and GTA are trademarks of Rockstar Games; this guide uses no Rockstar logo, artwork or game screenshots.

## License

MIT — see [LICENSE](LICENSE).
