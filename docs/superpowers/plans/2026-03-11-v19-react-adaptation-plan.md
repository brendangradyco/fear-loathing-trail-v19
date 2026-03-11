# Fear & Loathing Trail v19 React Adaptation — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the v19 monolith with a modern React/TypeScript application that preserves all v19 gameplay.

**Architecture:** Incremental extension of the v11 React rewrite (Vite + React 19 + TypeScript + Zustand + Tailwind v4). Copy v11's codebase into v19 repo, then add all v19 features: new route, drug economy, diseases, rations, 3 new minigames, travel cinematics, chiptune audio, shank PvP, and 19 events.

**Tech Stack:** Vite 7, React 19, TypeScript 5.9, Zustand 5, PeerJS 1.5.2, Tailwind CSS 4, Vitest 4, Biome 2

**Spec:** `docs/superpowers/specs/2026-03-10-v19-react-adaptation-design.md`

**Source repos:**
- v11 React rewrite: `~/git/fear-loathing-trail-v11/` (branch `modern-rewrite`)
- v19 monolith: `~/git/fear-loathing-trail-v19/` (branch `main`)

---

## File Structure

### Files to CREATE (new for v19):
- `src/data/drugs.ts` — Drug catalog (5 drugs with buy/sell/make/yield)
- `src/data/fiends.ts` — 8 NPC dealers
- `src/data/diseases.ts` — 6 diseases with cures
- `src/data/rations.ts` — 4 ration tiers
- `src/data/biomes.ts` — 5 biome visual configs for travel cinematics
- `src/engine/drugEconomy.ts` — Buy/sell/make/harvest pure functions
- `src/engine/diseaseEngine.ts` — Disease drain/contract/cure
- `src/engine/rationEngine.ts` — Ration consumption
- `src/engine/shankEngine.ts` — PvP shank mechanics
- `src/engine/hustleGame.ts` — Pickpocket slider logic
- `src/engine/buskGame.ts` — Simon Says logic
- `src/engine/drugDealGame.ts` — Stress meter logic
- `src/audio/chiptune.ts` — Web Audio API music + SFX
- `src/components/screens/TravelCinematic.tsx` — Parallax travel animation
- `src/components/screens/HustleGame.tsx` — Pickpocket minigame screen
- `src/components/screens/BuskGame.tsx` — Simon Says screen
- `src/components/screens/DrugDealGame.tsx` — Drug deal stress game screen
- `src/components/game/DiseaseIndicator.tsx` — Disease status display
- `src/components/game/DrugInventory.tsx` — Drug stash display
- `src/components/game/RationSelector.tsx` — Ration tier selector
- `src/components/game/ShankAlert.tsx` — Dodge overlay
- `tests/engine/drugEconomy.test.ts`
- `tests/engine/diseaseEngine.test.ts`
- `tests/engine/rationEngine.test.ts`
- `tests/engine/shankEngine.test.ts`
- `tests/engine/hustleGame.test.ts`
- `tests/engine/buskGame.test.ts`
- `tests/engine/drugDealGame.test.ts`

### Files to MODIFY (existing v11 files updated for v19):
- `src/types/index.ts` — New enums, extended GameState interface
- `src/data/trailStops.ts` — Replace route (Anchorage → Bogota)
- `src/data/events.ts` — Replace with all 19 v19 events
- `src/data/shops.ts` — Add MEDICINE_SHOP
- `src/data/constants.ts` — Update version, peer prefix, storage keys
- `src/data/skills.ts` — Keep existing, no changes needed
- `src/engine/gameLoop.ts` — Add disease drain, ration consumption, 3 micro-events
- `src/engine/eventResolver.ts` — Add disease event handling
- `src/stores/gameStore.ts` — Add drug/disease/ration/shank state + actions
- `src/stores/networkStore.ts` — Add shank messages
- `src/network/messageProtocol.ts` — Add SHANK_ALERT, SHANK_DODGE
- `src/network/peerManager.ts` — Update room prefix
- `src/components/screens/CharCreate.tsx` — Update region selector (southwest/northwest only)
- `src/components/screens/Shop.tsx` — Add medicine tab + drug dealing UI
- `src/components/screens/GameMap.tsx` — Add new action buttons
- `src/components/screens/WinScreen.tsx` — Update for Bogota
- `src/components/screens/DeathScreen.tsx` — Update messages
- `src/components/game/StatsBar.tsx` — Add disease/drug indicators
- `src/components/game/PixelScene.tsx` — Add art for new events
- `src/App.tsx` — Add new screen routing
- `tests/engine/gameLoop.test.ts` — Update for new mechanics

### Files to COPY unchanged from v11:
- All config files: `package.json`, `tsconfig*.json`, `vite.config.ts`, `biome.json`, `index.html`
- `src/main.tsx`, `src/vite-env.d.ts`, `src/test-setup.ts`
- `src/styles/globals.css`
- `src/engine/hunting.ts`, `src/engine/skillCheck.ts`
- `src/stores/playerStore.ts`
- `src/network/index.ts`, `src/network/mediaManager.ts`
- `src/utils/clamp.ts`, `src/utils/geo.ts`, `src/utils/storage.ts`
- `src/data/quirks.ts`
- `src/components/screens/Lobby.tsx`, `src/components/screens/LocationSelect.tsx`, `src/components/screens/SkillReview.tsx`, `src/components/screens/HuntGame.tsx`
- `src/components/game/EventModal.tsx`, `src/components/game/GameLog.tsx`, `src/components/game/TrailMap.tsx`
- `src/components/shared/Avatar.tsx`, `src/components/shared/Toast.tsx`
- `src/components/social/ChatPanel.tsx`, `src/components/social/PlayerList.tsx`, `src/components/social/VideoOverlay.tsx`
- `tests/engine/eventResolver.test.ts`, `tests/engine/skillCheck.test.ts`
- `public/icon-192.png`, `public/icon-512.png`, `public/manifest.json`, `public/sw.js`
- `docs/` directory

---

## Chunk 1: Foundation

### Task 1: Copy v11 React Rewrite into v19 Repo

**Files:**
- Copy: entire `src/`, `tests/`, `public/`, `docs/` from v11 `modern-rewrite` branch
- Copy: config files (`package.json`, `tsconfig*.json`, `vite.config.ts`, `biome.json`, `index.html`)
- Remove: `index.original.html` (not needed)
- Keep: `vercel.json` from v19 (already configured for Vercel deployment)

- [ ] **Step 1: Remove v19 monolith files**

```bash
cd ~/git/fear-loathing-trail-v19
git rm index.html manifest.json sw.js
# Keep vercel.json
```

- [ ] **Step 2: Copy v11 React rewrite into v19**

```bash
# Copy all source from v11 modern-rewrite branch
cp -r ~/git/fear-loathing-trail-v11/src .
cp -r ~/git/fear-loathing-trail-v11/tests .
cp -r ~/git/fear-loathing-trail-v11/public .
cp -r ~/git/fear-loathing-trail-v11/docs .
cp ~/git/fear-loathing-trail-v11/package.json .
cp ~/git/fear-loathing-trail-v11/package-lock.json .
cp ~/git/fear-loathing-trail-v11/tsconfig.json .
cp ~/git/fear-loathing-trail-v11/tsconfig.app.json .
cp ~/git/fear-loathing-trail-v11/tsconfig.node.json .
cp ~/git/fear-loathing-trail-v11/vite.config.ts .
cp ~/git/fear-loathing-trail-v11/biome.json .
cp ~/git/fear-loathing-trail-v11/index.html .
cp ~/git/fear-loathing-trail-v11/.gitignore .
# Do NOT copy index.original.html
```

- [ ] **Step 3: Update package.json name and version**

Change `"name"` to `"fear-loathing-trail-v19"` and `"version"` to `"19.0.0"`.

- [ ] **Step 4: Install dependencies and verify build**

```bash
cd ~/git/fear-loathing-trail-v19
npm install
npm run build
```

Expected: Build succeeds with zero errors.

- [ ] **Step 5: Run existing tests**

```bash
npm test
```

Expected: 36/36 tests pass.

- [ ] **Step 6: Commit foundation**

```bash
git add -A
git commit -m "feat: copy v11 React rewrite as foundation for v19 adaptation"
```

---

## Chunk 2: Types & Data Layer

### Task 2: Extend Type System

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add new enums**

Add after existing enums:

```ts
export enum DrugType {
	Weed = "weed",
	Coke = "coke",
	Meth = "meth",
	Shine = "shine",
	Pills = "pills",
}

export enum Disease {
	TB = "tb",
	Measles = "measles",
	BrokenBones = "broken",
	AIDS = "aids",
	Dabs = "dabs",
	Diphtheria = "diptheria", // matches v19 monolith typo
}

export enum RationType {
	TinyTim = "tiny_tim",
	Normal = "normal",
	Fat = "fat",
	CholesterolDaddy = "cholesterol",
}

export enum Biome {
	Desert = "desert",
	Jungle = "jungle",
	Mountain = "mountain",
	Coast = "coast",
	City = "city",
}

export enum MedicineType {
	Antibiotics = "antibiotics",
	Morphine = "morphine",
	Antiretrovirals = "antiretrovirals",
	Naloxone = "naloxone",
}
```

- [ ] **Step 2: Add new interfaces**

```ts
export interface DrugDef {
	id: DrugType;
	name: string;
	emoji: string;
	buy: number;
	sell: number;
	makeType: "grow" | "cook" | "lab" | "still" | null;
	yield: [number, number];
	cost: number;
	desc: string;
}

export interface Fiend {
	name: string;
	want: DrugType;
	mult: number;
	risk: number;
	emoji: string;
}

export interface DiseaseDef {
	id: Disease;
	name: string;
	sanityDrain: number;
	cure: MedicineType;
}

export interface RationDef {
	id: RationType;
	name: string;
	label: string;
	supplyCost: number;
	sanityBonus: number;
	color: string;
}

export interface DrugStatus {
	weedReadyAt: number; // stop index, -1 = not growing
	shineReadyAt: number; // stop index, -1 = not stilling
}

export interface MedicineItem {
	id: MedicineType;
	name: string;
	desc: string;
	price: number;
	cures: Disease[];
	sanityBonus: number;
}
```

- [ ] **Step 3: Extend GameState interface**

Add these fields to the existing `GameState` interface:

```ts
// Drug economy
drugInventory: Record<DrugType, number>;
drugStatus: DrugStatus;
// Diseases
diseases: Disease[];
// Rations
rationTier: RationType;
// Shank PvP
shankCooldown: boolean;
shankStunned: boolean;
// Minigame cooldowns (per-stop)
hustleDone: boolean;
buskDone: boolean;
methCookUsed: boolean;
cokeCookUsed: boolean;
```

- [ ] **Step 4: Add new Screen values**

Add to the `Screen` type/enum: `"travel"`, `"hustle"`, `"busk"`, `"drugdeal"`.

- [ ] **Step 5: Add new message types**

Add to the `MessageType` enum: `SHANK_ALERT = "SHANK_ALERT"` and `SHANK_DODGE = "SHANK_DODGE"`.

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: Errors in files that reference GameState (expected — we haven't updated them yet). No errors in types/index.ts itself.

- [ ] **Step 7: Commit types**

```bash
git add src/types/index.ts
git commit -m "feat: extend type system with drug, disease, ration, shank, and minigame types"
```

---

### Task 3: Replace Trail Stops & Constants

**Files:**
- Modify: `src/data/trailStops.ts`
- Modify: `src/data/constants.ts`

- [ ] **Step 1: Replace trail stops**

Replace entire contents of `src/data/trailStops.ts`:

```ts
import type { Biome } from "../types";

export interface TrailStop {
	id: string;
	name: string;
	emoji: string;
	lat: number;
	lon: number;
	dist: number;
	desc: string;
	biome: Biome;
}

export const TRAIL_STOPS: TrailStop[] = [
	{ id: "start", name: "Las Vegas, NV", emoji: "🎰", lat: 36.17, lon: -115.14, dist: 0, desc: "Where the dream died and the ether began.", biome: "desert" as Biome },
	{ id: "phoenix", name: "Phoenix, AZ", emoji: "🌵", lat: 33.45, lon: -112.07, dist: 345, desc: "345 miles of desert psychosis before the border.", biome: "desert" as Biome },
	{ id: "elpaso", name: "El Paso, TX", emoji: "🤠", lat: 31.76, lon: -106.49, dist: 880, desc: "The Rio Grande. The sweat is real. The border is close.", biome: "desert" as Biome },
	{ id: "mexico", name: "Mexico City, MX", emoji: "🌮", lat: 19.43, lon: -99.13, dist: 1665, desc: "7,350 feet of altitude and a million ways to disappear.", biome: "jungle" as Biome },
	{ id: "oaxaca", name: "Oaxaca, MX", emoji: "🏺", lat: 17.07, lon: -96.72, dist: 2145, desc: "Mezcal country. Everything here tastes like smoke and regret.", biome: "jungle" as Biome },
	{ id: "guatemala", name: "Guatemala City, GT", emoji: "☕", lat: 14.63, lon: -90.51, dist: 2740, desc: "The coffee is strong. The paranoia is stronger.", biome: "mountain" as Biome },
	{ id: "managua", name: "Managua, NI", emoji: "🌋", lat: 12.13, lon: -86.28, dist: 3215, desc: "Volcanoes on every side. One of them might be you.", biome: "jungle" as Biome },
	{ id: "sanjose", name: "San Jos\u00e9, CR", emoji: "🦜", lat: 9.93, lon: -84.09, dist: 3630, desc: "Rainforest and rain. The birds here know things about you.", biome: "jungle" as Biome },
	{ id: "panama", name: "Panama City, PA", emoji: "🚢", lat: 8.99, lon: -79.52, dist: 4050, desc: "They shipped the car by boat. You crossed on nerve alone.", biome: "coast" as Biome },
	{ id: "medellin", name: "Medell\u00edn, CO", emoji: "💐", lat: 6.24, lon: -75.57, dist: 4585, desc: "The city of eternal spring. Everyone smiles too much.", biome: "city" as Biome },
	{ id: "bogota", name: "Bogot\u00e1, Colombia", emoji: "🏁", lat: 4.71, lon: -74.07, dist: 5000, desc: "THE END. Colombia receives you. The bats followed the whole way.", biome: "city" as Biome },
];
```

- [ ] **Step 2: Update constants**

In `src/data/constants.ts`, update:

```ts
export const CFG = {
	VERSION: "v19",
	PEER_PREFIX: "flt19room",
	MIN_ROOM_CODE: 6,
	MAX_PLAYERS: 6,
	REROLLS: 3,
	STORE_KEY: "flt19_player",
	GAME_KEY: "flt19_game",
	STARTING_FUEL: 100,
	STARTING_SANITY: 100,
	STARTING_CASH: 350,
	STARTING_SUPPLIES: 5,
	STARTING_DISGUISES: 2,
	STARTING_LASER_AMMO: 10,
	REST_SANITY_GAIN: 15,
	REST_FUEL_COST: 5,
	FUEL_PER_LEG_MIN: 20,
	FUEL_PER_LEG_MAX: 34,
	EVENT_THRESHOLDS: [0.25, 0.5, 0.75] as const,
	LOG_MAX: 50,
	DISEASE_SANITY_DRAIN: 8,
} as const;
```

Also keep `SKILL_LABELS` export unchanged.

- [ ] **Step 3: Commit**

```bash
git add src/data/trailStops.ts src/data/constants.ts
git commit -m "feat: replace route with Las Vegas to Bogota, update constants for v19"
```

---

### Task 4: Replace Events with All 19 v19 Events

**Files:**
- Modify: `src/data/events.ts`

- [ ] **Step 1: Replace events.ts**

Replace the entire events array with all 19 v19 events. Each event needs: `id`, `title`, `text`, `choices` with `id`, `label`, `flavor`, and optional `effects`, `conditionalCheck`, `skillCheck`, `customFn` fields.

Key events to implement with exact v19 values:
- `bats`: floor it (fuel -15) vs embrace (sanity -10, miles +20)
- `lizard`: check in (sanity -15) vs camp (fuel +5, sanity +5)
- `attorney`: pick up (cash +200) vs gun it (sanity -5)
- `river`: ford (fuel -30, 35% disaster: additional fuel -40, sanity -20) vs pay guide ($150, or fuel -30 sanity -10 if broke)
- `cards`: play $75 (smooth skill check, win $100-299) vs drive on
- `busker`: play for tips (cash +$20-59, fuel -5) vs keep moving
- `adrenochrome`: take (sanity -25, miles +40) vs throw out (sanity +5)
- `police`: disguise (consume 1 or pay $100) vs smooth talk (skill check, fail: $150)
- `breakdown`: fix (fuel -20, mechanical check, fail: additional fuel -30) vs drive through (50/50, fail: fuel -50 sanity -10)
- `casino`: gamble $50 (50/50, win: +$120) vs drive on (sanity +3)
- `tuberculosis`: push through (add TB, sanity -10) vs rest (fuel -10, sanity +5)
- `measles`: ignore (add measles) vs pull over (sanity -5)
- `broken_bones`: set it (add broken, sanity -15) vs clinic ($200 or add broken)
- `aids`: accept (add AIDS) vs retest ($80 or add AIDS)
- `mid_dabs`: embrace (add dabs, sanity -20) vs pull over (sanity -8)
- `wolves`: honk (70% clear, 30%: supplies -1 sanity -8) vs offer supplies (supplies -1)
- `diphtheria`: power through (add diphtheria) vs find medicine ($120 or add diphtheria)
- `border`: improvise (charisma check, fail: $80) vs truth (sanity +5)
- `feast`: join (supplies +2, sanity +10) vs keep moving (sanity -5)

For disease events, add a `customFn` callback pattern that adds diseases to the state. The event resolver needs to support this — use a `diseaseAdd` field on the choice effect.

- [ ] **Step 2: Verify events compile**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/data/events.ts
git commit -m "feat: replace events with all 19 v19 event definitions"
```

---

### Task 5: New Data Files (Drugs, Fiends, Diseases, Rations, Biomes, Medicine)

**Files:**
- Create: `src/data/drugs.ts`
- Create: `src/data/fiends.ts`
- Create: `src/data/diseases.ts`
- Create: `src/data/rations.ts`
- Create: `src/data/biomes.ts`
- Modify: `src/data/shops.ts`

- [ ] **Step 1: Create drugs.ts**

```ts
import { DrugType, type DrugDef } from "../types";

export const DRUG_CATALOG: DrugDef[] = [
	{ id: DrugType.Weed, name: "Weed", emoji: "🌿", buy: 20, sell: 55, makeType: "grow", yield: [4, 8], cost: 0, desc: "Bales of it. For the long road." },
	{ id: DrugType.Coke, name: "Cocaine", emoji: "🤍", buy: 95, sell: 270, makeType: "cook", yield: [2, 4], cost: 50, desc: "Colombian grade. Handle with care." },
	{ id: DrugType.Meth, name: "Crystal", emoji: "💎", buy: 60, sell: 185, makeType: "lab", yield: [2, 4], cost: 40, desc: "Two-headed chemistry. Smells like victory." }, // monolith cook fn: 2+Math.floor(Math.random()*3) = 2-4
	{ id: DrugType.Shine, name: "Moonshine", emoji: "🫙", buy: 22, sell: 60, makeType: "still", yield: [5, 10], cost: 0, desc: "100-proof rocket fuel. Grandma's recipe." },
	{ id: DrugType.Pills, name: "Pills", emoji: "💊", buy: 14, sell: 38, makeType: null, yield: [0, 0], cost: 0, desc: "Unspecified. All flavors. All shapes." },
];

/** Drug price modifier by stop index region */
export function getDrugPriceModifier(stopIdx: number): { buy: number; sell: number } {
	if (stopIdx <= 2) return { buy: 1.3, sell: 0.65 };
	if (stopIdx <= 5) return { buy: 1.0, sell: 0.85 };
	if (stopIdx <= 8) return { buy: 0.85, sell: 1.0 };
	return { buy: 0.70, sell: 1.35 };
}
```

Note: `yield` values use the monolith's actual harvest function values (not the data definition values).

- [ ] **Step 2: Create fiends.ts**

```ts
import { DrugType, type Fiend } from "../types";

export const FIENDS: Fiend[] = [
	{ name: "Dirty Mike", want: DrugType.Weed, mult: 0.9, risk: 0.08, emoji: "🤤" },
	{ name: "El Gordo", want: DrugType.Coke, mult: 1.15, risk: 0.18, emoji: "🤠" },
	{ name: "Tweaker Tim", want: DrugType.Meth, mult: 1.08, risk: 0.14, emoji: "😬" },
	{ name: "Uncle Jimbo", want: DrugType.Shine, mult: 0.95, risk: 0.07, emoji: "🍺" },
	{ name: "Dr. Feelgood", want: DrugType.Pills, mult: 1.2, risk: 0.22, emoji: "👨\u200d⚕\ufe0f" },
	{ name: "Smokey Ray", want: DrugType.Weed, mult: 1.0, risk: 0.10, emoji: "😎" },
	{ name: "The Colonel", want: DrugType.Coke, mult: 1.35, risk: 0.28, emoji: "🎩" },
	{ name: "Marisol", want: DrugType.Meth, mult: 0.95, risk: 0.11, emoji: "💅" },
];
```

- [ ] **Step 3: Create diseases.ts**

```ts
import { Disease, MedicineType, type DiseaseDef } from "../types";

export const DISEASES: DiseaseDef[] = [
	{ id: Disease.TB, name: "TB", sanityDrain: 8, cure: MedicineType.Antibiotics },
	{ id: Disease.Measles, name: "Measles", sanityDrain: 8, cure: MedicineType.Antibiotics },
	{ id: Disease.BrokenBones, name: "Broken Bone", sanityDrain: 8, cure: MedicineType.Morphine },
	{ id: Disease.AIDS, name: "AIDS", sanityDrain: 8, cure: MedicineType.Antiretrovirals },
	{ id: Disease.Dabs, name: "Mid Dabs", sanityDrain: 8, cure: MedicineType.Naloxone },
	{ id: Disease.Diphtheria, name: "Diphtheria", sanityDrain: 8, cure: MedicineType.Antibiotics },
];

export const DISEASE_NAMES: Record<string, string> = {
	tb: "TB",
	measles: "Measles",
	broken: "Broken Bone",
	aids: "AIDS",
	dabs: "Mid Dabs",
	diptheria: "Diphtheria",
	dysentery: "Dysentery",
};
```

- [ ] **Step 4: Create rations.ts**

```ts
import { RationType, type RationDef } from "../types";

export const RATIONS: RationDef[] = [
	{ id: RationType.TinyTim, name: "tiny_tim", label: "Tiny Tim (saves supplies)", supplyCost: 0, sanityBonus: -5, color: "#00aaff" },
	{ id: RationType.Normal, name: "normal", label: "Normal", supplyCost: 1, sanityBonus: 0, color: "var(--orange)" },
	{ id: RationType.Fat, name: "fat", label: "Fat & Happy", supplyCost: 2, sanityBonus: 5, color: "#ff9900" },
	{ id: RationType.CholesterolDaddy, name: "cholesterol", label: "Cholesterol Daddy (costs extra)", supplyCost: 3, sanityBonus: 10, color: "var(--red)" },
];
```

- [ ] **Step 5: Create biomes.ts**

```ts
import { Biome } from "../types";

export interface BiomeConfig {
	id: Biome;
	bgGradient: [string, string];
	groundColor: string;
	roadColor: string;
	entities: string[]; // entity types that can spawn
	easterEggs: string[]; // rare spawns
}

export const BIOME_CONFIGS: Record<Biome, BiomeConfig> = {
	[Biome.Desert]: {
		id: Biome.Desert,
		bgGradient: ["#1a0a00", "#2a1a0a"],
		groundColor: "#c4a35a",
		roadColor: "#333",
		entities: ["cactus", "tumbleweed", "rock"],
		easterEggs: ["ufo"],
	},
	[Biome.Jungle]: {
		id: Biome.Jungle,
		bgGradient: ["#001a00", "#0a2a0a"],
		groundColor: "#2d5a2d",
		roadColor: "#3a3a2a",
		entities: ["palm", "vine", "parrot"],
		easterEggs: ["bigfoot"],
	},
	[Biome.Mountain]: {
		id: Biome.Mountain,
		bgGradient: ["#0a0a1a", "#1a1a2a"],
		groundColor: "#5a5a6a",
		roadColor: "#444",
		entities: ["pine", "boulder", "snow"],
		easterEggs: ["bigfoot"],
	},
	[Biome.Coast]: {
		id: Biome.Coast,
		bgGradient: ["#001a2a", "#0a2a3a"],
		groundColor: "#c4b07a",
		roadColor: "#444",
		entities: ["palm", "wave", "seagull"],
		easterEggs: ["godzilla"],
	},
	[Biome.City]: {
		id: Biome.City,
		bgGradient: ["#0a0a0a", "#1a1a1a"],
		groundColor: "#3a3a3a",
		roadColor: "#555",
		entities: ["building", "sign", "car"],
		easterEggs: ["ufo"],
	},
};
```

- [ ] **Step 6: Extend shops.ts with MEDICINE_SHOP**

Add to existing `src/data/shops.ts`:

```ts
import { Disease, MedicineType, type MedicineItem } from "../types";

export const MEDICINE_SHOP: MedicineItem[] = [
	{ id: MedicineType.Antibiotics, name: "Antibiotics", desc: "Cures TB, measles, diphtheria", price: 80, cures: [Disease.TB, Disease.Measles, Disease.Diphtheria], sanityBonus: 0 },
	{ id: MedicineType.Morphine, name: "Morphine", desc: "Cures broken bones, +20 sanity", price: 60, cures: [Disease.BrokenBones], sanityBonus: 20 },
	{ id: MedicineType.Antiretrovirals, name: "Antiretrovirals", desc: "Cures AIDS", price: 150, cures: [Disease.AIDS], sanityBonus: 0 },
	{ id: MedicineType.Naloxone, name: "Naloxone", desc: "Reverses dab overdose, +15 sanity", price: 45, cures: [Disease.Dabs], sanityBonus: 15 },
];
```

- [ ] **Step 7: Commit all data files**

```bash
git add src/data/drugs.ts src/data/fiends.ts src/data/diseases.ts src/data/rations.ts src/data/biomes.ts src/data/shops.ts
git commit -m "feat: add drug catalog, fiends, diseases, rations, biomes, and medicine shop data"
```

---

## Chunk 3: Engine Layer

### Task 6: Update Game Loop

**Files:**
- Modify: `src/engine/gameLoop.ts`

- [ ] **Step 1: Update createNewGame to initialize new state fields**

Add to the returned state object:

```ts
drugInventory: { weed: 0, coke: 0, meth: 0, shine: 0, pills: 0 },
drugStatus: { weedReadyAt: -1, shineReadyAt: -1 },
diseases: [],
rationTier: RationType.Normal,
shankCooldown: false,
shankStunned: false,
hustleDone: false,
buskDone: false,
methCookUsed: false,
cokeCookUsed: false,
```

- [ ] **Step 2: Update travel() for disease drain + ration consumption**

After advancing the stop index:
1. Consume rations: deduct `rationDef.supplyCost` from supplies, apply `rationDef.sanityBonus` to sanity
2. Apply disease drain: `-8 sanity` per disease in `state.diseases` array
3. Reset per-stop cooldowns: `shankCooldown = false`, `shankStunned = false`, `hustleDone = false`, `buskDone = false`, `methCookUsed = false`, `cokeCookUsed = false`
4. Clamp fuel and sanity to [0, 100]

- [ ] **Step 3: Update travel() event triggering**

Instead of single 40% event chance, fire events at 3 thresholds: 25%, 50%, 75% through the leg. Return an array of up to 3 events (randomly selected from the events pool).

- [ ] **Step 4: Update checkWin for new route**

Last stop index is now 10 (11 stops, 0-indexed). Update: `return state.stopIdx >= TRAIL_STOPS.length - 1`.

- [ ] **Step 5: Commit**

```bash
git add src/engine/gameLoop.ts
git commit -m "feat: update game loop with disease drain, rations, 3 micro-events per leg"
```

---

### Task 7: Drug Economy Engine

**Files:**
- Create: `src/engine/drugEconomy.ts`
- Create: `tests/engine/drugEconomy.test.ts`

- [ ] **Step 1: Write failing tests**

Test cases for `drugEconomy.test.ts`:
- `buyDrug` deducts cash and adds drugs
- `buyDrug` with insufficient cash does nothing
- `sellDrug` to fiend returns earnings with multiplier
- `sellDrug` bust chance based on fiend risk
- `startGrow` sets `weedReadyAt` to `stopIdx + 2`
- `startStill` sets `shineReadyAt` to `stopIdx + 1`
- `harvestDrug` weed: only works when `stopIdx >= weedReadyAt`, yields 4-8
- `harvestDrug` shine: only works when `stopIdx >= shineReadyAt`, yields 5-10
- `cookDrug` meth: deducts $40, yields 2-4, sets `methCookUsed = true`
- `cookDrug` coke: deducts $50, yields 2-4, sets `cokeCookUsed = true`
- `cookDrug` respects per-stop cooldowns
- Immutability: all functions return new state objects

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/engine/drugEconomy.test.ts
```

- [ ] **Step 3: Implement drugEconomy.ts**

```ts
import type { DrugDef, Fiend, GameState } from "../types";
import { DrugType } from "../types";
import { getDrugPriceModifier } from "../data/drugs";
import { clamp } from "../utils/clamp";

export function buyDrug(state: GameState, drug: DrugDef, qty: number): GameState {
	const modifier = getDrugPriceModifier(state.stopIdx);
	const totalCost = Math.floor(drug.buy * modifier.buy) * qty;
	if (state.cash < totalCost) return state;
	return {
		...state,
		cash: state.cash - totalCost,
		drugInventory: {
			...state.drugInventory,
			[drug.id]: state.drugInventory[drug.id] + qty,
		},
	};
}

export function sellDrug(
	state: GameState,
	drug: DrugDef,
	qty: number,
	fiend: Fiend,
): { newState: GameState; busted: boolean; earnings: number } {
	const actualQty = Math.min(qty, state.drugInventory[drug.id]);
	if (actualQty <= 0) return { newState: state, busted: false, earnings: 0 };

	const modifier = getDrugPriceModifier(state.stopIdx);
	const pricePerUnit = Math.floor(drug.sell * modifier.sell * fiend.mult);
	const earnings = pricePerUnit * actualQty;
	// NOTE: This bust is the quick-sell bust check (fiend risk %).
	// The Drug Deal MINIGAME has its own separate bust mechanic (heat meter).
	// They are independent: sellDrug bust = random check, minigame bust = skill-based.
	const busted = Math.random() < fiend.risk;

	if (busted) {
		const fine = 80 + Math.floor(Math.random() * 120);
		return {
			newState: {
				...state,
				drugInventory: { ...state.drugInventory, [drug.id]: 0 },
				cash: Math.max(0, state.cash - fine),
				sanity: clamp(state.sanity - 15, 0, 100),
			},
			busted: true,
			earnings: 0,
		};
	}

	return {
		newState: {
			...state,
			drugInventory: {
				...state.drugInventory,
				[drug.id]: state.drugInventory[drug.id] - actualQty,
			},
			cash: state.cash + earnings,
		},
		busted: false,
		earnings,
	};
}

export function startGrow(state: GameState): GameState {
	if (state.drugStatus.weedReadyAt >= 0) return state; // already growing
	return {
		...state,
		drugStatus: { ...state.drugStatus, weedReadyAt: state.stopIdx + 2 },
	};
}

export function startStill(state: GameState): GameState {
	if (state.drugStatus.shineReadyAt >= 0) return state; // already stilling
	return {
		...state,
		drugStatus: { ...state.drugStatus, shineReadyAt: state.stopIdx + 1 },
	};
}

export function harvestDrug(state: GameState, type: DrugType.Weed | DrugType.Shine): GameState {
	if (type === DrugType.Weed) {
		if (state.drugStatus.weedReadyAt < 0 || state.stopIdx < state.drugStatus.weedReadyAt) return state;
		const yield_ = 4 + Math.floor(Math.random() * 5); // 4-8
		return {
			...state,
			drugInventory: { ...state.drugInventory, weed: state.drugInventory.weed + yield_ },
			drugStatus: { ...state.drugStatus, weedReadyAt: -1 },
		};
	}
	// Shine
	if (state.drugStatus.shineReadyAt < 0 || state.stopIdx < state.drugStatus.shineReadyAt) return state;
	const yield_ = 5 + Math.floor(Math.random() * 6); // 5-10
	return {
		...state,
		drugInventory: { ...state.drugInventory, shine: state.drugInventory.shine + yield_ },
		drugStatus: { ...state.drugStatus, shineReadyAt: -1 },
	};
}

export function cookDrug(state: GameState, type: DrugType.Meth | DrugType.Coke): GameState {
	if (type === DrugType.Meth) {
		if (state.methCookUsed) return state;
		if (state.cash < 40) return state;
		const yield_ = 2 + Math.floor(Math.random() * 3); // 2-4
		return {
			...state,
			cash: state.cash - 40,
			drugInventory: { ...state.drugInventory, meth: state.drugInventory.meth + yield_ },
			methCookUsed: true,
		};
	}
	// Coke
	if (state.cokeCookUsed) return state;
	if (state.cash < 50) return state;
	const yield_ = 2 + Math.floor(Math.random() * 3); // 2-4
	return {
		...state,
		cash: state.cash - 50,
		drugInventory: { ...state.drugInventory, coke: state.drugInventory.coke + yield_ },
		cokeCookUsed: true,
	};
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run tests/engine/drugEconomy.test.ts
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/engine/drugEconomy.ts tests/engine/drugEconomy.test.ts
git commit -m "feat: add drug economy engine with buy/sell/make/harvest"
```

---

### Task 8: Disease & Ration Engines

**Files:**
- Create: `src/engine/diseaseEngine.ts`
- Create: `src/engine/rationEngine.ts`
- Create: `tests/engine/diseaseEngine.test.ts`
- Create: `tests/engine/rationEngine.test.ts`

- [ ] **Step 1: Write failing tests for diseaseEngine**

Test cases:
- `applyDiseaseDrain` with 0 diseases: no change
- `applyDiseaseDrain` with 1 disease: -8 sanity
- `applyDiseaseDrain` with 3 diseases: -24 sanity
- `applyDiseaseDrain` clamps sanity to 0
- `contractDisease`: adds disease to array
- `contractDisease`: does not add duplicate
- `cureDisease`: removes disease from array
- `cureDisease`: no-op if disease not present
- Immutability checks

- [ ] **Step 2: Implement diseaseEngine.ts**

```ts
import type { GameState } from "../types";
import { type Disease } from "../types";
import { CFG } from "../data/constants";
import { clamp } from "../utils/clamp";

export function applyDiseaseDrain(state: GameState): GameState {
	if (state.diseases.length === 0) return state;
	const drain = state.diseases.length * CFG.DISEASE_SANITY_DRAIN;
	return {
		...state,
		sanity: clamp(state.sanity - drain, 0, 100),
	};
}

export function contractDisease(state: GameState, disease: Disease): GameState {
	if (state.diseases.includes(disease)) return state;
	return {
		...state,
		diseases: [...state.diseases, disease],
	};
}

export function cureDisease(state: GameState, disease: Disease): GameState {
	if (!state.diseases.includes(disease)) return state;
	return {
		...state,
		diseases: state.diseases.filter((d) => d !== disease),
	};
}
```

- [ ] **Step 3: Write failing tests for rationEngine**

Test cases:
- TinyTim: 0 supplies consumed, -5 sanity
- Normal: 1 supply consumed, 0 sanity
- Fat: 2 supplies consumed, +5 sanity
- CholesterolDaddy: 3 supplies consumed, +10 sanity
- Supplies don't go below 0
- Sanity clamped to [0, 100]
- Immutability

- [ ] **Step 4: Implement rationEngine.ts**

```ts
import type { GameState } from "../types";
import { RATIONS } from "../data/rations";
import { clamp } from "../utils/clamp";

export function consumeRations(state: GameState): GameState {
	const ration = RATIONS.find((r) => r.id === state.rationTier);
	if (!ration) return state;
	return {
		...state,
		supplies: Math.max(0, state.supplies - ration.supplyCost),
		sanity: clamp(state.sanity + ration.sanityBonus, 0, 100),
	};
}
```

- [ ] **Step 5: Run all tests**

```bash
npx vitest run tests/engine/diseaseEngine.test.ts tests/engine/rationEngine.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/engine/diseaseEngine.ts src/engine/rationEngine.ts tests/engine/diseaseEngine.test.ts tests/engine/rationEngine.test.ts
git commit -m "feat: add disease and ration engines"
```

---

### Task 9: Shank PvP Engine

**Files:**
- Create: `src/engine/shankEngine.ts`
- Create: `tests/engine/shankEngine.test.ts`

- [ ] **Step 1: Write failing tests**

Test cases:
- Success case (45% roll): steals $60-199 + 1 supply from target
- Dodged case: attacker loses 15 sanity, no stun
- Failure case: attacker loses 20-39 sanity, -25 to random skill (min 5), stun = true
- Shank cooldown prevents repeat
- Stun prevents actions
- Immutability

- [ ] **Step 2: Implement shankEngine.ts**

```ts
import type { GameState, SkillSet } from "../types";
import { clamp } from "../utils/clamp";

export type ShankOutcome = "success" | "dodged" | "failure";

export interface ShankResult {
	outcome: ShankOutcome;
	attackerState: GameState;
	stolenCash: number;
	stolenSupplies: number;
}

export function attemptShank(
	attackerState: GameState,
	dodged: boolean,
): ShankResult {
	if (dodged) {
		return {
			outcome: "dodged",
			attackerState: {
				...attackerState,
				sanity: clamp(attackerState.sanity - 15, 0, 100),
				shankCooldown: true,
			},
			stolenCash: 0,
			stolenSupplies: 0,
		};
	}

	const success = Math.random() < 0.45;

	if (success) {
		const stolenCash = 60 + Math.floor(Math.random() * 140); // 60-199
		return {
			outcome: "success",
			attackerState: {
				...attackerState,
				shankCooldown: true,
			},
			stolenCash,
			stolenSupplies: 1,
		};
	}

	// Failure
	const sanityPenalty = 20 + Math.floor(Math.random() * 20); // 20-39
	const skillKeys = Object.keys(attackerState.skills) as (keyof SkillSet)[];
	const randomSkill = skillKeys[Math.floor(Math.random() * skillKeys.length)]!;
	const newSkills = { ...attackerState.skills };
	newSkills[randomSkill] = Math.max(5, (newSkills[randomSkill] || 30) - 25);

	return {
		outcome: "failure",
		attackerState: {
			...attackerState,
			sanity: clamp(attackerState.sanity - sanityPenalty, 0, 100),
			skills: newSkills,
			shankCooldown: true,
			shankStunned: true,
		},
		stolenCash: 0,
		stolenSupplies: 0,
	};
}
```

- [ ] **Step 3: Run tests, verify pass**
- [ ] **Step 4: Commit**

```bash
git add src/engine/shankEngine.ts tests/engine/shankEngine.test.ts
git commit -m "feat: add shank PvP engine with success/dodge/failure outcomes"
```

---

### Task 10: Minigame Engines (Hustle, Busk, Drug Deal)

**Files:**
- Create: `src/engine/hustleGame.ts`
- Create: `src/engine/buskGame.ts`
- Create: `src/engine/drugDealGame.ts`
- Create: `tests/engine/hustleGame.test.ts`
- Create: `tests/engine/buskGame.test.ts`
- Create: `tests/engine/drugDealGame.test.ts`

- [ ] **Step 1: Implement hustleGame.ts**

Slider timing game logic:
- `createHustleState(smoothSkill)`: marker at position 0, speed 2.8, zone width = `10 + skill * 0.28`, zone center = 50
- `updateMarker(state)`: move marker by speed, bounce at 0/100, randomize speed on bounce (2 + random * 3)
- `checkHit(state)`: returns `{ success, reward }` — success if marker within zone, reward $60-179 success, penalty $20-49 fail

- [ ] **Step 2: Write tests for hustleGame**

Test: zone width scales with skill, marker bounces, hit detection within zone, miss detection outside zone.

- [ ] **Step 3: Implement buskGame.ts**

Simon Says logic:
- `generateSequence(round)`: array of `round` random integers 0-3 (4 pads)
- `checkInput(sequence, input)`: returns `{ correct, complete }` — correct if input matches sequence so far, complete if full sequence matched
- `calculateReward(round)`: win at round 4 = `$100 + sanity +5`; fail = `max(5, round * 8 - 10)`; bail = `round * 8`

- [ ] **Step 4: Write tests for buskGame**
- [ ] **Step 5: Implement drugDealGame.ts**

Stress meter logic:
- `createDealState(fiendRisk)`: heat = 0, bustThreshold = 100, riseRate range [0.55, 0.90], sirenChance = fiendRisk * 2
- `tickHeat(state)`: heat += riseRate + random variation. Every 120 ticks, chance of siren spike (+15)
- `stayCool(state)`: heat -= 22
- `checkBust(state)`: returns heat >= 100
- `DEAL_DURATION = 480` frames

- [ ] **Step 6: Write tests for drugDealGame**
- [ ] **Step 7: Run all minigame tests**

```bash
npx vitest run tests/engine/hustleGame.test.ts tests/engine/buskGame.test.ts tests/engine/drugDealGame.test.ts
```

- [ ] **Step 8: Commit**

```bash
git add src/engine/hustleGame.ts src/engine/buskGame.ts src/engine/drugDealGame.ts tests/engine/hustleGame.test.ts tests/engine/buskGame.test.ts tests/engine/drugDealGame.test.ts
git commit -m "feat: add hustle, busk, and drug deal minigame engines"
```

---

## Chunk 4: Stores & Network

### Task 11: Extend Game Store

**Files:**
- Modify: `src/stores/gameStore.ts`

- [ ] **Step 1: Add new state fields to initial state**

Add all new `GameState` fields to the store's initial state and the `createNewGame` call.

- [ ] **Step 2: Add drug economy actions**

Actions: `buyDrug`, `sellDrug`, `startGrow`, `startStill`, `harvestDrug`, `cookDrug` — each calls the corresponding engine function and updates state.

- [ ] **Step 3: Add disease actions**

Actions: `contractDisease`, `cureDisease`, `buyMedicine` (calls `cureDisease` for matching diseases + applies sanity bonus).

- [ ] **Step 4: Add ration action**

Action: `setRation(tier)` — updates `rationTier` in state.

- [ ] **Step 5: Update travel action**

After advancing stop: call `consumeRations()`, `applyDiseaseDrain()`, reset per-stop cooldowns. Trigger up to 3 micro-events.

- [ ] **Step 6: Update persistence**

Update localStorage key to `flt19_game`. Ensure new fields serialize/deserialize correctly.

- [ ] **Step 7: Commit**

```bash
git add src/stores/gameStore.ts
git commit -m "feat: extend game store with drug, disease, ration, and shank state"
```

---

### Task 12: Extend Network Store & Protocol

**Files:**
- Modify: `src/stores/networkStore.ts`
- Modify: `src/network/messageProtocol.ts`
- Modify: `src/network/peerManager.ts`

- [ ] **Step 1: Add SHANK_ALERT and SHANK_DODGE to message protocol**

Add to the discriminated union in `messageProtocol.ts`:

```ts
| { type: "SHANK_ALERT"; from: string; fromName: string; targetPid: string }
| { type: "SHANK_DODGE"; targetPid: string }
```

- [ ] **Step 2: Update room prefix in peerManager**

Change `PEER_PREFIX` usage from `flt3room` to `flt19room`.

- [ ] **Step 3: Add shank state to networkStore**

Add: `shankAlert: { from: string; fromName: string; timestamp: number } | null`

Actions: `receiveShankAlert(from, fromName)`, `clearShankAlert()`, `sendShankDodge()`.

- [ ] **Step 4: Handle shank messages in peerManager**

In the message handler, add cases for `SHANK_ALERT` (show dodge overlay) and `SHANK_DODGE` (resolve as dodged).

- [ ] **Step 5: Commit**

```bash
git add src/stores/networkStore.ts src/network/messageProtocol.ts src/network/peerManager.ts
git commit -m "feat: extend network protocol with shank PvP messages"
```

---

## Chunk 5: UI Components — Core Updates

### Task 13: Update App.tsx Routing

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add new screen states**

Add to screen state: `"travel"`, `"hustle"`, `"busk"`, `"drugdeal"`.

- [ ] **Step 2: Import and render new screen components**

Add imports for `TravelCinematic`, `HustleGame`, `BuskGame`, `DrugDealGame`.

Add cases to the screen router switch.

- [ ] **Step 3: Import and render ShankAlert overlay**

ShankAlert renders as a fixed overlay on top of all screens when `networkStore.shankAlert` is non-null.

- [ ] **Step 4: Import and initialize chiptune**

Import `Chiptune` from `src/audio/chiptune.ts`. Start on first user interaction.

- [ ] **Step 5: Update CharCreate.tsx region selector**

v19 only uses two regions: southwest and northwest. Update the region selector in `CharCreate.tsx` to show only these two options (v11 had four regions). This matches the v19 monolith's `getRegionOptions()` which returns `["southwest", "northwest"]`.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/components/screens/CharCreate.tsx
git commit -m "feat: add routing for travel, hustle, busk, drugdeal screens and update region selector"
```

---

### Task 14: Extend Shop Screen

**Files:**
- Modify: `src/components/screens/Shop.tsx`

- [ ] **Step 1: Add tab system**

3 tabs: Supplies, Drugs/Dealing, Medicine. Use `useState<"supplies" | "drugs" | "medicine">`.

- [ ] **Step 2: Drug dealing tab**

Sub-sections:
- **Buy drugs**: list DRUG_CATALOG with buy prices (modified by stop index)
- **Make drugs**: buttons for grow/still (with readyAt countdown), cook/lab (with cooldown indicator)
- **Sell drugs**: fiend selector showing name, emoji, preferred drug, risk level. Sell button triggers drug deal minigame.

- [ ] **Step 3: Medicine tab**

List MEDICINE_SHOP items. Each shows price, cures, and whether user currently has a curable disease (highlighted). Buy button deducts cash and calls `cureDisease` for matching diseases.

- [ ] **Step 4: Commit**

```bash
git add src/components/screens/Shop.tsx
git commit -m "feat: extend shop with drug dealing and medicine tabs"
```

---

### Task 15: Extend GameMap Screen

**Files:**
- Modify: `src/components/screens/GameMap.tsx`
- Create: `src/components/game/DiseaseIndicator.tsx`
- Create: `src/components/game/DrugInventory.tsx`
- Create: `src/components/game/RationSelector.tsx`

- [ ] **Step 1: Create DiseaseIndicator component**

Shows active diseases as colored badges with tooltip. Red warning color.

- [ ] **Step 2: Create DrugInventory component**

Compact display: drug emoji + count for each non-zero drug.

- [ ] **Step 3: Create RationSelector component**

4 radio buttons with labels, supply cost, and morale effect. Updates `gameStore.setRation()`.

- [ ] **Step 4: Extend GameMap action panel**

Add buttons:
- **Hustle** (disabled if `hustleDone` or `shankStunned` or `cash < 30`)
- **Busk** (disabled if `buskDone` or `shankStunned`)
- **Deal** (disabled if `shankStunned` or no drugs to sell)
- **Shank** (multiplayer only, disabled if `shankCooldown`)

Each button navigates to its respective screen.

- [ ] **Step 5: Add disease and drug displays to the stats area**

Render `DiseaseIndicator` and `DrugInventory` in the map screen.

- [ ] **Step 6: Add ration selector**

Render `RationSelector` in a collapsible section.

- [ ] **Step 7: Commit**

```bash
git add src/components/screens/GameMap.tsx src/components/game/DiseaseIndicator.tsx src/components/game/DrugInventory.tsx src/components/game/RationSelector.tsx
git commit -m "feat: extend game map with hustle, busk, deal, shank actions and disease/drug/ration UI"
```

---

### Task 16: Extend StatsBar

**Files:**
- Modify: `src/components/game/StatsBar.tsx`

- [ ] **Step 1: Add disease count badge**

If diseases > 0, show a red badge with count and skull icon.

- [ ] **Step 2: Add drug stash indicator**

If total drugs > 0, show a pill icon with total count.

- [ ] **Step 3: Commit**

```bash
git add src/components/game/StatsBar.tsx
git commit -m "feat: add disease and drug indicators to stats bar"
```

---

### Task 17: Update Win/Death Screens for Bogota Route

**Files:**
- Modify: `src/components/screens/WinScreen.tsx`
- Modify: `src/components/screens/DeathScreen.tsx`

- [ ] **Step 1: Update WinScreen**

Change "ANCHORAGE!" to "BOGOTA!" and update the illustration to a Colombian-themed scene (city lights, mountains, coffee). Update description text to match v19: "You made it to Colombia. The bats followed the whole way."

- [ ] **Step 2: Update DeathScreen messages**

Fuel death: "Ran out of fuel. The Great Red Shark dies in the desert." (same)
Sanity death: "Your mind shattered... The bats won." (match v19)

- [ ] **Step 3: Commit**

```bash
git add src/components/screens/WinScreen.tsx src/components/screens/DeathScreen.tsx
git commit -m "feat: update win/death screens for Bogota route"
```

---

## Chunk 6: Minigame & Travel Screens

### Task 18: Hustle Minigame Screen

**Files:**
- Create: `src/components/screens/HustleGame.tsx`

- [ ] **Step 1: Build HustleGame component**

Canvas-based slider game:
- Horizontal bar (320px wide)
- Green zone positioned at center, width = `10 + smooth_skill * 0.28`
- Red marker bouncing left/right at speed 2.8-5.8
- Tap/click to stop marker
- Success: `$60-179` reward, failure: `$20-49` penalty
- Mark `hustleDone = true` in store after completion
- Navigate back to GameMap after result

Style: dark background, neon colors, pixel art pickpocket scene.

- [ ] **Step 2: Commit**

```bash
git add src/components/screens/HustleGame.tsx
git commit -m "feat: add hustle (pickpocket) minigame screen"
```

---

### Task 19: Busk Minigame Screen

**Files:**
- Create: `src/components/screens/BuskGame.tsx`

- [ ] **Step 1: Build BuskGame component**

Simon Says game:
- 4 colored pads in 2x2 grid: red, green, blue, yellow
- Sequence plays (450ms on, 250ms gap between notes)
- Player repeats by tapping pads
- Sequence grows by 1 each round up to 4 rounds
- Win at round 4: `$100 + sanity +5`
- Fail (wrong pad): `max(5, round * 8 - 10)` cash
- Bail button: `round * 8` cash
- 700ms delay between rounds
- Mark `buskDone = true` after completion

Style: dark stage backdrop, neon pad colors, pixel art busker scene.

- [ ] **Step 2: Commit**

```bash
git add src/components/screens/BuskGame.tsx
git commit -m "feat: add busk (street performance) minigame screen"
```

---

### Task 20: Drug Deal Minigame Screen

**Files:**
- Create: `src/components/screens/DrugDealGame.tsx`

- [ ] **Step 1: Build DrugDealGame component**

Canvas-based stress meter:
- Vertical heat bar filling up (red gradient)
- Heat rises at 0.55-0.90 per frame
- Every 120 frames: siren spike chance = `fiend.risk * 2`, adds +15 heat
- "STAY COOL" button reduces heat by 22
- Duration: 480 frames (~8 seconds at 60fps)
- Bust (heat >= 100): fine $80-199, lose all of that drug type, sanity -15
- Success (survive 480 frames): complete sale at negotiated price
- Navigate back to GameMap after result

Style: dark alley backdrop, pulsing red heat bar, pixel art deal scene.

- [ ] **Step 2: Commit**

```bash
git add src/components/screens/DrugDealGame.tsx
git commit -m "feat: add drug deal stress minigame screen"
```

---

### Task 21: Shank Alert Overlay

**Files:**
- Create: `src/components/game/ShankAlert.tsx`

- [ ] **Step 1: Build ShankAlert component**

Full-screen overlay:
- "INCOMING SHANK!" header with attacker name
- 2-second countdown timer (visual bar draining)
- Large "DODGE!" button
- Auto-resolves if timer expires (treated as not dodged)
- On dodge: sends `SHANK_DODGE` message via peerManager
- On timeout: no message sent (attacker resolves locally)

Style: red pulsing border, dark semi-transparent overlay, shaking animation.

- [ ] **Step 2: Commit**

```bash
git add src/components/game/ShankAlert.tsx
git commit -m "feat: add shank alert dodge overlay"
```

---

### Task 22: Travel Cinematic Screen

**Files:**
- Create: `src/components/screens/TravelCinematic.tsx`

- [ ] **Step 1: Build TravelCinematic component**

This is the largest new component (~200+ lines). Canvas-based parallax animation:

**Parallax layers** (5 layers at different speeds):
1. Sky/background (slowest)
2. Far mountains/terrain
3. Mid-ground objects (biome-specific)
4. Road with dashes
5. Foreground objects (fastest)

**Biome rendering** using `BIOME_CONFIGS`:
- Desert: cacti, tumbleweeds, orange/brown palette
- Jungle: vines, palm trees, green palette
- Mountain: pine trees, snow caps, blue/grey palette
- Coast: palm trees, waves, teal palette
- City: buildings, signs, grey palette

**Animated car sprite**: pixel art red car moving along road.

**Entity spawning**: Every 55 frames, spawn entities (cars, trucks, people). Types have different speeds (cars: 4.5-7.5, trucks: 3, people: 1.5).

**Easter eggs** (rare spawns):
- UFO: green saucer with beam, speed 2
- Bigfoot: brown silhouette with red eyes, speed 1.5
- Godzilla: green creature with fire breath, speed 1.5

**Mini-map overlay**: small trail progress indicator in corner.

**Auto-advance**: After ~3-5 seconds of animation, transition to micro-event (if triggered) or next stop.

- [ ] **Step 2: Integrate with travel flow**

When travel action is triggered in GameMap, navigate to TravelCinematic first. After animation completes, check for events (show EventModal) or return to GameMap.

- [ ] **Step 3: Commit**

```bash
git add src/components/screens/TravelCinematic.tsx
git commit -m "feat: add parallax travel cinematic with biome-specific rendering and easter eggs"
```

---

## Chunk 7: Audio, Pixel Art, Event System Updates

### Task 23: Chiptune Audio Module

**Files:**
- Create: `src/audio/chiptune.ts`

- [ ] **Step 1: Implement chiptune module**

```ts
const MELODY = [392,440,494,523,587,659,784,880,784,659,523,440,523,587,659,523,440,392,440,523];
const BASS = [196,196,220,261,294,330,392,440,392,330,261,220,261,294,330,261,220,196,220,261];
const TEMPO = 0.12; // seconds per note

let audioCtx: AudioContext | null = null;
let playing = false;
let muted = false;
let loopTimer: number | null = null;

export function initAudio(): void {
	if (audioCtx) return;
	audioCtx = new AudioContext();
}

export function playLoop(): void {
	if (!audioCtx || playing || muted) return;
	playing = true;
	scheduleLoop();
}

function scheduleLoop(): void {
	if (!audioCtx || !playing) return;
	const now = audioCtx.currentTime;

	for (let i = 0; i < MELODY.length; i++) {
		const t = now + i * TEMPO;
		// Melody
		const mOsc = audioCtx.createOscillator();
		const mGain = audioCtx.createGain();
		mOsc.type = "square";
		mOsc.frequency.value = MELODY[i]!;
		mGain.gain.setValueAtTime(0.12, t);
		mGain.gain.exponentialRampToValueAtTime(0.001, t + TEMPO * 0.85);
		mOsc.connect(mGain).connect(audioCtx.destination);
		mOsc.start(t);
		mOsc.stop(t + TEMPO);

		// Bass
		const bOsc = audioCtx.createOscillator();
		const bGain = audioCtx.createGain();
		bOsc.type = "square";
		bOsc.frequency.value = BASS[i]!;
		bGain.gain.setValueAtTime(0.07, t);
		bGain.gain.exponentialRampToValueAtTime(0.001, t + TEMPO * 0.9);
		bOsc.connect(bGain).connect(audioCtx.destination);
		bOsc.start(t);
		bOsc.stop(t + TEMPO);
	}

	const loopDuration = MELODY.length * TEMPO * 1000;
	loopTimer = window.setTimeout(scheduleLoop, loopDuration - 50);
}

export function stopLoop(): void {
	playing = false;
	if (loopTimer) clearTimeout(loopTimer);
}

export function toggleMute(): boolean {
	muted = !muted;
	if (muted) stopLoop();
	else playLoop();
	return muted;
}

export function playSfx(freq: number, duration: number): void {
	if (!audioCtx || muted) return;
	const osc = audioCtx.createOscillator();
	const gain = audioCtx.createGain();
	osc.type = "square";
	osc.frequency.value = freq;
	gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
	gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
	osc.connect(gain).connect(audioCtx.destination);
	osc.start();
	osc.stop(audioCtx.currentTime + duration);
}

export function playToast(): void { playSfx(880, 0.1); }
export function playAlert(): void { playSfx(440, 0.3); }
```

- [ ] **Step 2: Commit**

```bash
mkdir -p src/audio
git add src/audio/chiptune.ts
git commit -m "feat: add chiptune audio module with Web Audio API melody loop and SFX"
```

---

### Task 24: Extend PixelScene with New Event Art

**Files:**
- Modify: `src/components/game/PixelScene.tsx`

- [ ] **Step 1: Add SVG pixel art for new events**

Add to `EVENT_SCENES` record — new scenes for:
- `river` — raging river with bridge, horse guide
- `busker` — street performer with guitar
- `tuberculosis` — sick figure coughing
- `measles` — spotted face
- `broken_bones` — car hitting pothole
- `aids` — clinic with test results
- `mid_dabs` — smoking scene
- `diphtheria` — throat/medical scene
- `feast` — barbecue with locals
- `cards` — card game table
- `lizard` — hotel clerk with shifting scales
- `attorney` — large Samoan man on roadside
- `adrenochrome` — mysterious vial on car seat

All in Metal Slug X pixel art style — blocky SVG shapes, limited palette, character at max 2 colors.

- [ ] **Step 2: Update existing scenes**

Ensure `bats`, `police`, `breakdown`, `casino`, `wolves`, `border` scenes match the v19 event descriptions (some may need minor updates).

- [ ] **Step 3: Commit**

```bash
git add src/components/game/PixelScene.tsx
git commit -m "feat: add pixel art scenes for all 19 v19 events"
```

---

### Task 25: Update Event Resolver for Disease Events

**Files:**
- Modify: `src/engine/eventResolver.ts`

- [ ] **Step 1: Add disease handling to resolveEventChoice**

When an event choice has a `diseaseAdd` field, call `contractDisease` on the state. This handles all 6 disease events.

Add to the choice resolution logic:

```ts
if (choice.diseaseAdd) {
	newState = contractDisease(newState, choice.diseaseAdd);
}
```

- [ ] **Step 2: Handle cash-conditional disease events**

Events like `broken_bones` and `aids` have "pay or get sick" logic. The `conditionalCheck` pattern already handles this — cash check pass = pay, fail = add disease.

- [ ] **Step 3: Update existing tests**

Add test cases for disease event resolution.

- [ ] **Step 4: Commit**

```bash
git add src/engine/eventResolver.ts tests/engine/eventResolver.test.ts
git commit -m "feat: add disease event handling to event resolver"
```

---

## Chunk 8: PWA, Integration & Push

### Task 26: PWA Migration

**Files:**
- Verify: `public/sw.js`, `public/manifest.json`
- Modify: `src/main.tsx` (if needed)

- [ ] **Step 1: Verify service worker works with Vite build**

The `public/sw.js` is copied as-is to the build output. Verify the cache name and paths are correct.

- [ ] **Step 2: Update manifest.json**

Ensure `start_url`, `name`, `short_name` reflect v19.

- [ ] **Step 3: Commit if changes made**

---

### Task 27: Update Game Loop Tests

**Files:**
- Modify: `tests/engine/gameLoop.test.ts`

- [ ] **Step 1: Update checkWin test for new route length**

Change `game.stopIdx = 11` to `game.stopIdx = 10` (11 stops, last index = 10).

- [ ] **Step 2: Add tests for disease drain in travel**

Test that traveling applies -8 sanity per disease.

- [ ] **Step 3: Add tests for ration consumption in travel**

Test that traveling deducts supplies per ration tier.

- [ ] **Step 4: Add tests for cooldown resets**

Test that per-stop cooldowns reset after travel.

- [ ] **Step 5: Run full test suite**

```bash
npm test
```

Expected: 80+ tests passing, zero failures.

- [ ] **Step 6: Commit**

```bash
git add tests/engine/gameLoop.test.ts
git commit -m "test: update game loop tests for v19 mechanics"
```

---

### Task 28: Full Build Verification & Push

**Files:** All

- [ ] **Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: Zero errors.

- [ ] **Step 2: Run Biome lint/format**

```bash
npx biome check --write .
```

- [ ] **Step 3: Run full test suite**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 4: Production build**

```bash
npm run build
```

Expected: Build succeeds, output in `dist/`.

- [ ] **Step 5: Commit any final fixes**

```bash
git add -A
git commit -m "chore: lint, format, and verify production build"
```

- [ ] **Step 6: Push to main**

```bash
git push origin main
```

- [ ] **Step 7: Verify Vercel deployment**

Check that the Vercel deployment triggers and succeeds from the push.

---

## Dependency Graph

```
Task 1 (Foundation)
  ├── Task 2 (Types)
  ├── Task 3 (Trail Stops + Constants)
  ├── Task 4 (Events)
  └── Task 5 (New Data Files)
       ├── Task 6 (Game Loop Update)
       ├── Task 7 (Drug Economy Engine)
       ├── Task 8 (Disease & Ration Engines)
       ├── Task 9 (Shank Engine)
       └── Task 10 (Minigame Engines)
            ├── Task 11 (Game Store)
            ├── Task 12 (Network Store & Protocol)
            ├── Task 25 (Event Resolver Update)
            └── Task 27 (Game Loop Tests)
                 ├── Task 13 (App Routing)
                 ├── Task 14 (Shop Extension)
                 ├── Task 15 (GameMap Extension)
                 ├── Task 16 (StatsBar Extension)
                 ├── Task 17 (Win/Death Screens)
                 ├── Task 18 (Hustle Screen)
                 ├── Task 19 (Busk Screen)
                 ├── Task 20 (Drug Deal Screen)
                 ├── Task 21 (Shank Alert)
                 ├── Task 22 (Travel Cinematic)
                 ├── Task 23 (Chiptune Audio)
                 ├── Task 24 (Pixel Art Extension)
                 └── Task 26 (PWA Migration)
                      └── Task 28 (Build & Push)
```

### Parallelizable groups:
- **Group A** (after Task 1): Tasks 2, 3, 4, 5
- **Group B** (after Group A): Tasks 6, 7, 8, 9, 10
- **Group C** (after Group B): Tasks 11, 12, 25, 27
- **Group D** (after Group C): Tasks 13-24, 26
- **Final**: Task 28
