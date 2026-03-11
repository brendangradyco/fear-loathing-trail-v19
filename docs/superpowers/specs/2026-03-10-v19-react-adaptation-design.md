# Fear & Loathing Trail v19: React Adaptation Design

**Date**: 2026-03-10
**Status**: Approved
**Author**: pyserf (via Claude Code)

## Overview

Adapt the modern React rewrite (originally built for v11) to encompass all v19 features, then push directly to main on `brendangradyco/fear-loathing-trail-v19`. The v19 monolith (173KB `index.html`) is replaced entirely by a Vite + React 19 + TypeScript application.

## Source Material

- **React rewrite base**: `brendangradyco/fear-loathing-trail-v11` PR #1 (branch `modern-rewrite`, SHA `81f416c`)
- **v19 monolith**: `brendangradyco/fear-loathing-trail-v19` main branch (173KB `index.html`)
- **Delivery**: Direct push to main on v19 repo. No PR. No preserved original.

## Tech Stack (unchanged from v11 rewrite)

| Technology | Version | Purpose |
|---|---|---|
| React | ^19 | UI framework |
| TypeScript | ^5.9 | Type safety |
| Vite | ^7 | Build tool |
| Zustand | ^5 | State management |
| PeerJS | ^1.5.2 | WebRTC P2P multiplayer |
| Tailwind CSS | ^4 | Styling |
| Vitest | ^4 | Testing |
| Biome | ^2 | Linting/formatting |

## Architecture

Same layered architecture as the v11 rewrite:

```
src/
  data/        # Typed game constants (declarative)
  engine/      # Pure game logic functions (no DOM, no side effects)
  stores/      # Zustand stores (bridge engine to UI)
  components/  # React components (screens, game UI, social)
  network/     # PeerJS wrapper + WebRTC media
  audio/       # Web Audio API chiptune + SFX (NEW)
  types/       # TypeScript types and enums
  styles/      # Tailwind CSS-first @theme config, animations
  utils/       # Small helpers
```

## Feature Delta: v11 → v19

### New Game Systems

1. **Route change**: Las Vegas → Bogota (11 stops, 5,000 miles) replacing Las Vegas → Anchorage
2. **Drug economy**: Buy/make/sell drugs with 5 drug types, 8 NPC fiends, cooking/growing/stilling with deferred harvest for grow/still
3. **Disease system**: 6 diseases (TB, measles, broken bones, AIDS, dabs, diphtheria) with -8 sanity/stop drain, curable via medicine
4. **Ration system**: 4 tiers (tiny_tim, normal, fat, cholesterol_daddy) affecting supply consumption and morale
5. **Shank PvP**: One attempt per stop, 2-second dodge window, steal resources on success, stun on failure
6. **Chiptune audio**: Web Audio API square-wave synthesis (~2.4s melody loop) + SFX (toast, alert sounds)

### New Minigames (3)

7. **Hustle (pickpocket)**: Slider timing game, green zone scales with smooth skill
8. **Busk (street performance)**: Simon Says with 4 pads, pattern grows each round
9. **Drug Deal**: Canvas stress meter with "STAY COOL" button mechanic

### New Visuals

10. **Travel cinematics**: Parallax biome-specific animations between stops (~230 lines of canvas logic with 5 layers, entity spawning, mini-map overlay)
11. **Easter egg entities**: UFO, Bigfoot, Godzilla spawns during travel
12. **Extended pixel art**: New SVG scenes for new events and minigames

### Updated Systems

13. **Events expanded**: 19 event types (up from 12): bats, lizard, attorney, river, cards, busker, adrenochrome, police, breakdown, casino, tuberculosis, measles, broken_bones, aids, mid_dabs, wolves, diphtheria, border, feast
14. **Travel mechanics**: 3 micro-events per segment (at 25/50/75%) instead of single 40% chance
15. **Shop expanded**: Medicine shop (3rd tab) with antibiotics, morphine, antiretrovirals, naloxone
16. **Network protocol**: New message types for SHANK_ALERT, SHANK_DODGE

### Carried Over Unchanged

17. **Hunt minigame**: `HuntGame.tsx` and `src/engine/hunting.ts` carry over from v11 rewrite without modification
18. **Character creation**: `playerStore.ts` carries over unchanged — same name/sex/age/quirks/skills flow

---

## Detailed Design

### 1. Data Layer

#### `src/data/trailStops.ts` — REPLACE
New 11-stop route with biome metadata (biomes match v19's `_getBiome()` index mapping):
- Las Vegas (desert) → Phoenix (desert) → El Paso (desert) → Mexico City (jungle) → Oaxaca (jungle) → Guatemala City (mountain) → Managua (jungle) → San Jose (jungle) → Panama City (coast) → Medellin (city) → Bogota (city)
- Each stop: `{ id, name, emoji, lat, lon, dist, desc, biome }`
- Note: `lon` (not `lng`) for consistency with v11 type. `biome` is the new field.

#### `src/data/events.ts` — REPLACE
All 19 events from v19. Each event: `{ id, title, description, art, choices: [{ text, effects?, conditionalCheck?, skillCheck? }] }`

Event list: bats, lizard, attorney, river, cards, busker, adrenochrome, police, breakdown, casino, tuberculosis, measles, broken_bones, aids, mid_dabs, wolves, diphtheria, border, feast.

#### `src/data/drugs.ts` — NEW
```ts
type DrugDef = {
  id: DrugType; name: string; buy: number; sell: number;
  makeable: 'grow' | 'cook' | 'lab' | 'still' | false;
  yield: [min: number, max: number]; cookCost: number;
}
```
5 drugs:
- Weed ($20/$55, grow, free, yield 3-6)
- Coke ($95/$270, cook, cost $50, yield 2-4)
- Meth ($60/$185, lab, cost $40, yield 2-5)
- Shine ($22/$60, still, free, yield 4-8)
- Pills ($14/$38, not makeable)

Note: `grow` has deferred harvest (+2 stops). `still` has deferred harvest (+1 stop, collect next stop). `cook` and `lab` are instant.
Note: The monolith's `yield` data fields and actual harvest functions use different ranges. Use the harvest function values as source of truth (player-facing behavior): weed harvest = 4-8, moonshine harvest = 5-10, coke cook = 2-4, meth lab = 2-5.

#### `src/data/fiends.ts` — NEW
8 NPCs: `{ name, preferredDrug, buyMultiplier (0.9-1.35), risk (0.07-0.28) }`

#### `src/data/diseases.ts` — NEW
6 diseases: `{ id, name, sanityDrain: 8, cure: MedicineType }`

#### `src/data/rations.ts` — NEW
4 tiers: `{ id, name, supplyCost, sanityBonus, description }`

#### `src/data/biomes.ts` — NEW
Biome visual configs for travel cinematics: `{ id, bgColors, layers: ParallaxLayer[], entities: EntityDef[] }`
5 biomes: desert (cacti, tumbleweeds), jungle (vines, parrots), mountain (snow, peaks), coast (palms, waves), city (buildings, signs)
Easter egg entities defined here: UFO (green saucer + beam), Bigfoot (brown silhouette, red eyes), Godzilla (green + fire breath)

#### `src/data/shops.ts` — EXTEND
Add `MEDICINE_SHOP` array: antibiotics, morphine, antiretrovirals, naloxone with prices and cure targets.

#### `src/data/constants.ts` — UPDATE
Update starting values, event frequency (3 per segment), fuel costs per v19 balancing.

### 2. Type System

#### `src/types/index.ts` — EXTEND

New enums:
```ts
enum DrugType { Weed, Coke, Meth, Shine, Pills }
enum Disease { TB, Measles, BrokenBones, AIDS, Dabs, Diphtheria }
enum RationType { TinyTim, Normal, Fat, CholesterolDaddy }
enum Biome { Desert, Jungle, Mountain, Coast, City }
enum MedicineType { Antibiotics, Morphine, Antiretrovirals, Naloxone }
```

Extended interfaces:
```ts
interface GameState {
  // ... existing fields ...
  drugInventory: Record<DrugType, number>;
  diseases: Disease[];
  rationTier: RationType;
  shankCooldown: boolean;
  shankStunned: boolean; // can't act until next stop after failed shank
  hustleDone: boolean;
  buskDone: boolean;
  methCookUsed: boolean; // separate per-stop cooldowns
  cokeCookUsed: boolean;
  drugStatus: {
    weedReadyAt: number; // stop index when weed harvest is ready (-1 = not growing)
    shineReadyAt: number; // stop index when moonshine is ready (-1 = not stilling)
  };
}
```

New network message types added to discriminated union.

Updated `Region` enum: v19 UI only offers `southwest` and `northwest` in the region selector (simplified from v11's 5 options). Keep the enum flexible but default UI to these two.

### 3. Engine Layer (Pure Functions)

#### `src/engine/gameLoop.ts` — UPDATE
- `travel()`: Fire 3 micro-events per segment (at 25/50/75%). Apply disease drain. Apply ration consumption. Reset per-stop cooldowns (shank, shankStunned, hustle, busk, methCookUsed, cokeCookUsed).
- `createNewGame()`: Initialize drug inventory (all zero), empty diseases, default ration tier, drugStatus with -1 values.

#### `src/engine/drugEconomy.ts` — NEW
- `buyDrug(state, type, qty)` → new state with cash deducted, drugs added
- `sellDrug(state, type, qty, fiend)` → { newState, busted: boolean, earnings }
  - Sell price = base sell × fiend.buyMultiplier
  - Bust check = `Math.random() < fiend.risk`
- `startGrow(state)` → new state with `weedReadyAt` set to current stop + 2
- `startStill(state)` → new state with `shineReadyAt` set to current stop + 1 (collect next stop)
- `harvestDrug(state, type)` → new state with yield added (only if current stop >= readyAt)
- `cookDrug(state, type)` → new state with yield added, cook cost deducted (instant for cook/lab)
- All pure, all return new state objects

#### `src/engine/diseaseEngine.ts` — NEW
- `applyDiseaseDrain(state)` → new state with -8 sanity per active disease
- `contractDisease(state, disease)` → new state with disease added
- `cureDisease(state, disease)` → new state with disease removed

#### `src/engine/rationEngine.ts` — NEW
- `consumeRations(state)` → new state with supplies deducted and sanity bonus applied per tier

#### `src/engine/shankEngine.ts` — NEW
- `attemptShank(attackerState, targetState)` → { outcome: 'success' | 'dodged' | 'failure', attackerResult, targetResult }
- 45% base success. Target has 2-second dodge window.
- **Success** (not dodged, 45% roll passes): steal $60-199 (`60 + Math.floor(Math.random() * 140)`) + supplies from target
- **Dodged** (target dodges in time): attacker loses 15 sanity, no stun, no skill penalty
- **Failure** (not dodged, 45% roll fails): attacker loses 20-39 sanity (`20 + Math.floor(Math.random() * 20)`), -25 to random skill, `shankStunned = true` (can't take actions until next stop)

#### `src/engine/hustleGame.ts` — NEW
- `createHustleState(smoothSkill)` → initial slider state with zone width = 10 + skill * 0.28, marker speed 2.8-5.8 px/frame
- `updateMarker(state, dt)` → new position (bounces at edges)
- `checkHit(state)` → { success, reward } ($60-180 success, -$20-50 fail)

#### `src/engine/buskGame.ts` — NEW
- `generateSequence(round)` → color array (4 colors, length = round number)
- `checkInput(sequence, input)` → { correct, complete }
- `calculateTips(roundsCompleted)` → cash reward

#### `src/engine/drugDealGame.ts` — NEW
- `createDealState()` → { stress, bustThreshold }
- `tickStress(state)` → new state with stress incremented
- `stayCool(state)` → new state with stress reduced
- `checkBust(state)` → boolean

### 4. Zustand Stores

#### `src/stores/playerStore.ts` — CARRY OVER
Unchanged from v11 rewrite. Handles character creation (name, sex, age, quirks, region), skill generation with region-based modifiers, reroll system. Persists to localStorage.

#### `src/stores/gameStore.ts` — EXTEND
- Add drug/disease/ration/shank state fields per GameState interface above
- Add actions: `buyDrug`, `sellDrug`, `startGrow`, `startStill`, `harvestDrug`, `cookDrug`, `setRation`, `contractDisease`, `cureDisease`, `applyDiseaseTick`
- Update `travel` action for new mechanics (3 events, disease drain, ration consumption, cooldown resets)
- Update persistence schema (localStorage key: `flt19_game`)

#### `src/stores/networkStore.ts` — EXTEND
- Add `shankAlert: { from: string; timestamp: number } | null` state
- Add message types: `SHANK_ALERT`, `SHANK_DODGE`
- Add actions: `sendShank`, `handleShankAlert`, `sendDodge`
- Note: Shank resolution is local (no SHANK_RESULT message). Outcomes broadcast via CHAT message.

### 5. Components

#### New Screens (`src/components/screens/`)

**`TravelCinematic.tsx`** — Full-screen parallax animation during travel. This is a substantial component (~200+ lines):
- Canvas-based with 5 parallax layers at different scroll speeds
- Biome-specific rendering: cacti/tumbleweeds (desert), vines/parrots (jungle), snow/peaks (mountain), palms/waves (coast), buildings/signs (city)
- Animated car sprite (pixel art, Metal Slug X style)
- Entity spawning system with position/velocity
- Easter egg entities: UFO (green saucer + beam, rare), Bigfoot (brown silhouette, red eyes, rare), Godzilla (green creature + fire breath, very rare)
- Mini-map overlay showing route progress
- Auto-advances to micro-event (if triggered) or next stop after animation completes
- Separate from `TrailMap.tsx` (which shows the route overview in GameMap)

**`HustleGame.tsx`** — Pickpocket minigame.
- Horizontal slider bar with bouncing marker (speed 2.8-5.8 px/frame)
- Green "success" zone, width = 10 + smooth_skill * 0.28
- Tap/click to stop marker
- Pixel art scene of street hustle
- Once per stop

**`BuskGame.tsx`** — Simon Says performance minigame.
- 4 colored pads (Simon Says style)
- Pattern plays with visual/audio cues, player repeats
- Sequence grows by 1 each round
- Tips accumulate per successful round
- Once per stop

**`DrugDealGame.tsx`** — Stress meter dealing game.
- Canvas-based stress bar that fills up over time
- "STAY COOL" button reduces stress on press
- Bust if stress exceeds threshold
- Success completes the deal at negotiated price

#### Extended Screens

**`Shop.tsx`** — Major extension. 3 tabs: Supplies, Drugs, Medicine. Drug tab includes:
- Buy panel: purchase drugs from shop at base price
- Make panel: grow weed (deferred), still moonshine (deferred), cook coke (instant), lab meth (instant)
- Grow/still status display with stop countdown
- Sell panel: fiend selector showing name, preferred drug, risk level, buy multiplier
- Per-stop cooldowns displayed (methCookUsed, cokeCookUsed)

**`GameMap.tsx`** — Extended action panel:
- Existing: Travel, Rest, Shop, Hunt
- New: Hustle, Busk, Deal (once per stop, disabled when done or stunned)
- New: Shank button (multiplayer only, once per stop)
- New: Ration selector (4 tiers)
- New: Disease indicators in stats area

#### New Game Components (`src/components/game/`)

**`DiseaseIndicator.tsx`** — Disease icons with tooltip showing name and drain rate.

**`DrugInventory.tsx`** — Compact drug stash display showing quantities of each drug type.

**`ShankAlert.tsx`** — Full-screen overlay with 2-second dodge timer. Large "DODGE!" button. Auto-resolves if timer expires.

**`RationSelector.tsx`** — 4-tier radio selector with supply cost/benefit display.

#### Extended Components

**`PixelScene.tsx`** — Add SVG pixel art for all new events (river, busker, disease events) and minigame intro scenes. Maintain Metal Slug X aesthetic. This is the largest component and will grow significantly.

**`StatsBar.tsx`** — Add disease count badge, drug stash summary indicator.

### 6. Audio (`src/audio/`)

**`chiptune.ts`** — NEW
- Web Audio API OscillatorNode (square wave)
- 20-note melody sequence at tempo 0.12s/note (~2.4s loop)
- Play/pause/mute controls
- Auto-start on first user interaction (browser autoplay policy compliance)
- SFX functions: `playToast()`, `playAlert()` for game feedback sounds

### 7. Network Protocol Updates

Add to discriminated union in `messageProtocol.ts`:
```ts
| { type: 'SHANK_ALERT'; from: string; timestamp: number }
| { type: 'SHANK_DODGE'; from: string; timestamp: number }
```

Note: No `SHANK_RESULT` message — shank outcomes are resolved locally by the attacker and broadcast via `CHAT` system message.

Update `peerManager.ts` room prefix from `flt3room` to `flt19room`.

### 8. PWA Migration

- Copy `sw.js` to `public/sw.js` (Vite serves `public/` as static assets)
- Update `manifest.json` in `public/` with correct paths for Vite build output
- Service worker registration in `src/main.tsx` (already exists from v11 rewrite)
- v19's `sw.js` uses `OffscreenCanvas` for dynamic icon generation — preserve this pattern
- `vercel.json` carries over for deployment headers/rewrites

### 9. Testing Strategy

Extend existing test suite (~36 tests from v11) with:
- Drug economy tests: buy/sell/make, deferred harvest (grow/still), instant cook (cook/lab), bust probability, fiend multipliers
- Disease engine tests: drain stacking, contract, cure, multiple concurrent diseases
- Ration engine tests: all 4 tiers, supply deduction, sanity bonus
- Shank engine tests: success/fail outcomes, resource transfer amounts ($60-199), failure penalty (20-39 sanity), stun flag
- Hustle game tests: hit detection, zone scaling by skill, reward ranges
- Busk game tests: sequence validation, growing sequences, tip calculation
- Drug deal game tests: stress mechanics, bust threshold, stay cool reduction
- Updated gameLoop tests: 3 events per segment, disease drain integration, ration consumption, cooldown resets

Target: ~80+ tests total.

### 10. Build & Deploy

- `npm install && npm run build` — zero errors
- `npm test` — all tests passing
- Deploy: Vercel auto-deploys from main (v19 already has `vercel.json`)

## Implementation Order

1. **Foundation**: Copy v11 rewrite structure into v19 repo, update configs (package.json, tsconfig, vite.config, biome.json)
2. **Data layer**: All new/updated data files (trailStops, events, drugs, fiends, diseases, rations, biomes, shops, constants)
3. **Types**: Extended type system with all new enums and interfaces
4. **Engine**: All pure function modules (testable immediately)
5. **Tests**: Write tests alongside engine modules
6. **Stores**: Extended Zustand stores with new state and actions
7. **Components - core**: Updated screens (route change in TrailMap, events, extended shop with medicine + drug dealing)
8. **Components - minigames**: 3 new minigame screens (Hustle, Busk, DrugDeal)
9. **Components - travel**: Travel cinematic system with parallax and easter eggs
10. **Components - PvP**: Shank alert/dodge overlay
11. **Audio**: Chiptune module with melody loop + SFX
12. **Pixel art**: New SVG scenes for all new content (19 events + minigames + biomes)
13. **Network**: Extended protocol (SHANK_ALERT, SHANK_DODGE) + room prefix update
14. **PWA**: Service worker and manifest migration
15. **Integration**: Full playthrough testing, build verification
16. **Push**: Direct to main on v19 repo

## Success Criteria

- All v19 game features work in the React app
- Route is Las Vegas → Bogota with correct stops/distances/biomes
- All 4 minigames functional (hunt + hustle + busk + drug deal)
- Drug economy: buy/make(cook/lab/grow/still)/sell with fiend NPCs, deferred harvest for grow/still
- Disease system with cures via medicine shop
- Ration system with 4 tiers
- Multiplayer shank PvP with dodge + stun mechanics
- Travel cinematics with biome parallax + easter egg entities
- Chiptune audio with melody loop + SFX
- 80+ passing tests
- Zero TypeScript errors
- Pixel art in Metal Slug X style for all 19 events + minigames + biomes
- PWA manifest and service worker
- Clean Vercel deployment
