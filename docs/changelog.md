# Changelog — fear-loathing-trail-v19

Auto-maintained by doc-guard hook. Each commit appends an entry.

---
- `5d5fde3` docs: add v19 React adaptation design spec () — 2026-03-11
- `b30a424` docs: finalize implementation plan with review fixes () — 2026-03-11
- `3205c47` feat: copy v11 React rewrite as foundation for v19 adaptation (.gitignore,biome.json,index.html,manifest.json,package-lock.json) — 2026-03-11
- `b414871` feat: update game loop with disease drain, rations, cooldown resets (src/engine/gameLoop.ts) — 2026-03-11
- `fc5f6fa` feat: add drug economy engine with buy/sell/make/harvest (src/engine/drugEconomy.ts,tests/engine/drugEconomy.test.ts) — 2026-03-11
- `e487e89` feat: add disease and ration engines (src/engine/diseaseEngine.ts,src/engine/rationEngine.ts,tests/engine/diseaseEngine.test.ts,tests/engine/rationEngine.test.ts) — 2026-03-11
- `28a7619` feat: add shank PvP engine (src/engine/shankEngine.ts,tests/engine/shankEngine.test.ts) — 2026-03-11
- `eb187b0` feat: add hustle, busk, and drug deal minigame engines (src/engine/buskGame.ts,src/engine/drugDealGame.ts,src/engine/hustleGame.ts,tests/engine/buskGame.test.ts,tests/engine/drugDealGame.test.ts) — 2026-03-11
- `24200d6` feat: extend game store with drug, disease, ration, and shank state (src/stores/gameStore.ts) — 2026-03-11
- `acb92d3` feat: extend network protocol with shank PvP messages (src/network/messageProtocol.ts,src/network/peerManager.ts,src/stores/networkStore.ts,src/types/index.ts) — 2026-03-11
- `48abc20` feat: add routing for new screens and update region selector (src/App.tsx,src/components/screens/BuskGame.tsx,src/components/screens/DrugDealGame.tsx,src/components/screens/HustleGame.tsx,src/components/screens/LocationSelect.tsx) — 2026-03-11
- `0bfb9b8` feat: extend shop with drug dealing and medicine tabs (src/components/screens/Shop.tsx) — 2026-03-11
- `8d0a81c` feat: extend game map with new actions and disease/drug/ration UI (src/components/game/DiseaseIndicator.tsx,src/components/game/DrugInventory.tsx,src/components/game/RationSelector.tsx,src/components/screens/GameMap.tsx) — 2026-03-11
- `fa101fa` feat: add disease and drug indicators to stats bar (src/components/game/StatsBar.tsx) — 2026-03-11
- `56f1849` feat: update win/death screens for Bogota route (src/components/screens/DeathScreen.tsx,src/components/screens/WinScreen.tsx) — 2026-03-11
- `9bc7123` feat: implement hustle pickpocket minigame screen (src/components/screens/HustleGame.tsx) — 2026-03-11
- `1501f8e` feat: implement busk street performance minigame screen (src/components/screens/BuskGame.tsx) — 2026-03-11
- `121194d` feat: implement drug deal stress minigame screen (src/components/screens/DrugDealGame.tsx) — 2026-03-11
- `b38163a` feat: implement shank alert dodge overlay (src/components/screens/ShankAlert.tsx) — 2026-03-11
- `9fc0089` feat: implement parallax travel cinematic with biome rendering (src/components/screens/TravelCinematic.tsx) — 2026-03-11
- `42edcee` feat: add chiptune audio module with Web Audio API (src/App.tsx,src/audio/chiptune.ts) — 2026-03-11
- `d083307` feat: add pixel art scenes for all 19 v19 events (src/components/game/PixelScene.tsx) — 2026-03-11
- `2963087` feat: add disease event handling to event resolver (src/engine/eventResolver.ts,tests/engine/eventResolver.test.ts) — 2026-03-11
- `7e8a181` chore: update PWA manifest for v19 (public/manifest.json,public/sw.js) — 2026-03-11
- `0edadaf` test: update game loop tests for v19 mechanics (tests/engine/gameLoop.test.ts) — 2026-03-11
