import { afterEach, describe, expect, it, vi } from "vitest";
import { DRUG_CATALOG } from "../../src/data/drugs";
import { FIENDS } from "../../src/data/fiends";
import {
	buyDrug,
	cookDrug,
	harvestDrug,
	sellDrug,
	startGrow,
	startStill,
} from "../../src/engine/drugEconomy";
import type { GameState } from "../../src/types";
import { DrugType, Phase, RationType } from "../../src/types";

const weedDef = DRUG_CATALOG.find((d) => d.id === DrugType.Weed)!;
const cokeDef = DRUG_CATALOG.find((d) => d.id === DrugType.Coke)!;
const methDef = DRUG_CATALOG.find((d) => d.id === DrugType.Meth)!;
const shineDef = DRUG_CATALOG.find((d) => d.id === DrugType.Shine)!;
const dirtyMike = FIENDS.find((f) => f.name === "Dirty Mike")!; // risk 0.08
const elGordo = FIENDS.find((f) => f.name === "El Gordo")!; // risk 0.18
const colonel = FIENDS.find((f) => f.name === "The Colonel")!; // risk 0.28

function makeState(overrides: Partial<GameState> = {}): GameState {
	return {
		phase: Phase.TRAVEL,
		stopIdx: 5,
		fuel: 80,
		sanity: 80,
		cash: 500,
		supplies: 5,
		disguises: 2,
		laserAmmo: 10,
		meat: 0,
		skills: { driving: 50, navigation: 50, smooth: 50, mechanical: 50, charisma: 50, survival: 50 },
		log: [],
		players: {},
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
		...overrides,
	};
}

afterEach(() => {
	vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// buyDrug
// ---------------------------------------------------------------------------
describe("buyDrug", () => {
	it("deducts cash and adds drugs when player can afford it", () => {
		const state = makeState({ cash: 1000, stopIdx: 5 });
		// At stopIdx 5, modifier is { buy: 1.0, sell: 0.85 }
		// weed.buy = 20, modifier.buy = 1.0, so cost = 20 * 1 = 20 per unit
		const result = buyDrug(state, weedDef, 3);
		expect(result.cash).toBe(1000 - 20 * 3);
		expect(result.drugInventory.weed).toBe(3);
	});

	it("returns state unchanged when player cannot afford the purchase", () => {
		const state = makeState({ cash: 10 });
		const result = buyDrug(state, cokeDef, 1);
		// coke.buy = 95, at stopIdx 5 modifier.buy = 1.0 → cost = 95
		expect(result).toBe(state); // same reference
	});

	it("adds to existing drug inventory (not replace)", () => {
		const state = makeState({ cash: 1000, drugInventory: { weed: 5, coke: 0, meth: 0, shine: 0, pills: 0 } });
		const result = buyDrug(state, weedDef, 2);
		expect(result.drugInventory.weed).toBe(7);
	});

	it("does not mutate original state", () => {
		const state = makeState({ cash: 1000 });
		const orig = state.cash;
		const origWeed = state.drugInventory.weed;
		buyDrug(state, weedDef, 2);
		expect(state.cash).toBe(orig);
		expect(state.drugInventory.weed).toBe(origWeed);
	});
});

// ---------------------------------------------------------------------------
// sellDrug
// ---------------------------------------------------------------------------
describe("sellDrug", () => {
	it("returns earnings and deducts drug inventory on successful sale", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.5); // above risk 0.08, so no bust
		const state = makeState({ drugInventory: { weed: 5, coke: 0, meth: 0, shine: 0, pills: 0 }, stopIdx: 5 });
		const { newState, busted, earnings } = sellDrug(state, weedDef, 3, dirtyMike);
		// weed.sell = 55, modifier.sell at stopIdx 5 = 0.85, fiend.mult = 0.9
		// pricePerUnit = floor(55 * 0.85 * 0.9) = floor(42.075) = 42
		expect(busted).toBe(false);
		expect(earnings).toBe(42 * 3);
		expect(newState.cash).toBe(500 + 42 * 3);
		expect(newState.drugInventory.weed).toBe(2);
	});

	it("applies fiend multiplier to sale price", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.5); // no bust, col risk = 0.28
		const state = makeState({ drugInventory: { weed: 0, coke: 5, meth: 0, shine: 0, pills: 0 }, stopIdx: 5 });
		const { earnings } = sellDrug(state, cokeDef, 1, colonel);
		// coke.sell = 270, modifier.sell = 0.85, colonel.mult = 1.35
		// price = floor(270 * 0.85 * 1.35) = floor(309.42) = 309
		expect(earnings).toBe(309);
	});

	it("busts when random < fiend.risk: loses inventory and pays fine", () => {
		// First Math.random for bust check returns 0.01 (< 0.28 colonel risk)
		// Second Math.random for fine: floor(80 + 0.01 * 120) = floor(81.2) = 81
		vi.spyOn(Math, "random")
			.mockReturnValueOnce(0.01) // bust check
			.mockReturnValueOnce(0.01); // fine variance
		const state = makeState({
			cash: 500,
			sanity: 80,
			drugInventory: { weed: 0, coke: 3, meth: 0, shine: 0, pills: 0 },
			stopIdx: 5,
		});
		const { newState, busted, earnings } = sellDrug(state, cokeDef, 3, colonel);
		expect(busted).toBe(true);
		expect(earnings).toBe(0);
		expect(newState.drugInventory.coke).toBe(0);
		// fine = 80 + floor(0.01 * 120) = 80 + 1 = 81
		expect(newState.cash).toBe(Math.max(0, 500 - 81));
		expect(newState.sanity).toBe(65); // 80 - 15
	});

	it("does not sell more than available inventory", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.5);
		const state = makeState({ drugInventory: { weed: 2, coke: 0, meth: 0, shine: 0, pills: 0 }, stopIdx: 5 });
		const { newState, earnings } = sellDrug(state, weedDef, 10, dirtyMike);
		// Can only sell 2
		expect(newState.drugInventory.weed).toBe(0);
		expect(earnings).toBeGreaterThan(0);
	});

	it("returns unchanged state when inventory is 0", () => {
		const state = makeState({ drugInventory: { weed: 0, coke: 0, meth: 0, shine: 0, pills: 0 } });
		const { newState, busted, earnings } = sellDrug(state, weedDef, 5, dirtyMike);
		expect(newState).toBe(state);
		expect(busted).toBe(false);
		expect(earnings).toBe(0);
	});

	it("does not mutate original state on success", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.5);
		const state = makeState({ drugInventory: { weed: 5, coke: 0, meth: 0, shine: 0, pills: 0 }, cash: 500 });
		const origCash = state.cash;
		const origWeed = state.drugInventory.weed;
		sellDrug(state, weedDef, 2, dirtyMike);
		expect(state.cash).toBe(origCash);
		expect(state.drugInventory.weed).toBe(origWeed);
	});
});

// ---------------------------------------------------------------------------
// startGrow
// ---------------------------------------------------------------------------
describe("startGrow", () => {
	it("sets weedReadyAt to stopIdx + 2", () => {
		const state = makeState({ stopIdx: 3 });
		const result = startGrow(state);
		expect(result.drugStatus.weedReadyAt).toBe(5);
	});

	it("returns state unchanged if grow is already in progress", () => {
		const state = makeState({ stopIdx: 3, drugStatus: { weedReadyAt: 4, shineReadyAt: -1 } });
		const result = startGrow(state);
		expect(result).toBe(state);
	});

	it("does not mutate original state", () => {
		const state = makeState({ stopIdx: 2 });
		startGrow(state);
		expect(state.drugStatus.weedReadyAt).toBe(-1);
	});
});

// ---------------------------------------------------------------------------
// startStill
// ---------------------------------------------------------------------------
describe("startStill", () => {
	it("sets shineReadyAt to stopIdx + 1", () => {
		const state = makeState({ stopIdx: 4 });
		const result = startStill(state);
		expect(result.drugStatus.shineReadyAt).toBe(5);
	});

	it("returns state unchanged if still is already in progress", () => {
		const state = makeState({ stopIdx: 4, drugStatus: { weedReadyAt: -1, shineReadyAt: 5 } });
		const result = startStill(state);
		expect(result).toBe(state);
	});

	it("does not mutate original state", () => {
		const state = makeState({ stopIdx: 2 });
		startStill(state);
		expect(state.drugStatus.shineReadyAt).toBe(-1);
	});
});

// ---------------------------------------------------------------------------
// harvestDrug
// ---------------------------------------------------------------------------
describe("harvestDrug (weed)", () => {
	it("yields weed when stopIdx >= weedReadyAt", () => {
		vi.spyOn(Math, "random").mockReturnValue(0); // yield = 4 + floor(0 * 5) = 4
		const state = makeState({ stopIdx: 5, drugStatus: { weedReadyAt: 5, shineReadyAt: -1 } });
		const result = harvestDrug(state, DrugType.Weed);
		expect(result.drugInventory.weed).toBe(4);
		expect(result.drugStatus.weedReadyAt).toBe(-1);
	});

	it("yields max weed when random is near 1", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.99); // floor(0.99 * 5) = 4, so yield = 8
		const state = makeState({ stopIdx: 5, drugStatus: { weedReadyAt: 3, shineReadyAt: -1 } });
		const result = harvestDrug(state, DrugType.Weed);
		expect(result.drugInventory.weed).toBe(8);
	});

	it("returns state unchanged if not yet ready", () => {
		const state = makeState({ stopIdx: 2, drugStatus: { weedReadyAt: 5, shineReadyAt: -1 } });
		const result = harvestDrug(state, DrugType.Weed);
		expect(result).toBe(state);
	});

	it("returns state unchanged if weedReadyAt is -1", () => {
		const state = makeState({ stopIdx: 5, drugStatus: { weedReadyAt: -1, shineReadyAt: -1 } });
		const result = harvestDrug(state, DrugType.Weed);
		expect(result).toBe(state);
	});

	it("does not mutate original state", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const state = makeState({ stopIdx: 5, drugStatus: { weedReadyAt: 5, shineReadyAt: -1 } });
		const origWeed = state.drugInventory.weed;
		harvestDrug(state, DrugType.Weed);
		expect(state.drugInventory.weed).toBe(origWeed);
	});
});

describe("harvestDrug (shine)", () => {
	it("yields shine when stopIdx >= shineReadyAt", () => {
		vi.spyOn(Math, "random").mockReturnValue(0); // yield = 5 + floor(0 * 6) = 5
		const state = makeState({ stopIdx: 5, drugStatus: { weedReadyAt: -1, shineReadyAt: 5 } });
		const result = harvestDrug(state, DrugType.Shine);
		expect(result.drugInventory.shine).toBe(5);
		expect(result.drugStatus.shineReadyAt).toBe(-1);
	});

	it("yields max shine when random is near 1", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.99); // floor(0.99 * 6) = 5, so yield = 10
		const state = makeState({ stopIdx: 5, drugStatus: { weedReadyAt: -1, shineReadyAt: 3 } });
		const result = harvestDrug(state, DrugType.Shine);
		expect(result.drugInventory.shine).toBe(10);
	});

	it("returns state unchanged if shine not yet ready", () => {
		const state = makeState({ stopIdx: 2, drugStatus: { weedReadyAt: -1, shineReadyAt: 5 } });
		const result = harvestDrug(state, DrugType.Shine);
		expect(result).toBe(state);
	});

	it("returns state unchanged if shineReadyAt is -1", () => {
		const state = makeState({ stopIdx: 5, drugStatus: { weedReadyAt: -1, shineReadyAt: -1 } });
		const result = harvestDrug(state, DrugType.Shine);
		expect(result).toBe(state);
	});
});

// ---------------------------------------------------------------------------
// cookDrug
// ---------------------------------------------------------------------------
describe("cookDrug (meth)", () => {
	it("deducts $40, yields 2-4 meth, sets methCookUsed", () => {
		vi.spyOn(Math, "random").mockReturnValue(0); // yield = 2 + floor(0 * 3) = 2
		const state = makeState({ cash: 200 });
		const result = cookDrug(state, DrugType.Meth);
		expect(result.cash).toBe(160);
		expect(result.drugInventory.meth).toBe(2);
		expect(result.methCookUsed).toBe(true);
	});

	it("yields max meth when random is near 1", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.99); // floor(0.99 * 3) = 2, yield = 4
		const state = makeState({ cash: 200 });
		const result = cookDrug(state, DrugType.Meth);
		expect(result.drugInventory.meth).toBe(4);
	});

	it("returns state unchanged if methCookUsed is already true", () => {
		const state = makeState({ cash: 200, methCookUsed: true });
		const result = cookDrug(state, DrugType.Meth);
		expect(result).toBe(state);
	});

	it("returns state unchanged if insufficient cash for meth", () => {
		const state = makeState({ cash: 30 });
		const result = cookDrug(state, DrugType.Meth);
		expect(result).toBe(state);
	});

	it("does not mutate original state", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const state = makeState({ cash: 200 });
		cookDrug(state, DrugType.Meth);
		expect(state.cash).toBe(200);
		expect(state.methCookUsed).toBe(false);
	});
});

describe("cookDrug (coke)", () => {
	it("deducts $50, yields 2-4 coke, sets cokeCookUsed", () => {
		vi.spyOn(Math, "random").mockReturnValue(0); // yield = 2
		const state = makeState({ cash: 200 });
		const result = cookDrug(state, DrugType.Coke);
		expect(result.cash).toBe(150);
		expect(result.drugInventory.coke).toBe(2);
		expect(result.cokeCookUsed).toBe(true);
	});

	it("returns state unchanged if cokeCookUsed is already true", () => {
		const state = makeState({ cash: 200, cokeCookUsed: true });
		const result = cookDrug(state, DrugType.Coke);
		expect(result).toBe(state);
	});

	it("returns state unchanged if insufficient cash for coke", () => {
		const state = makeState({ cash: 40 });
		const result = cookDrug(state, DrugType.Coke);
		expect(result).toBe(state);
	});
});
