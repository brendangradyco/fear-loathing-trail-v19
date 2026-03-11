import { describe, expect, it, vi } from "vitest";
import { applyEffects, resolveEventChoice } from "../../src/engine/eventResolver";
import type { GameEvent, GameState } from "../../src/types";
import { Disease, DrugType, Phase, RationType } from "../../src/types";

function makeState(overrides?: Partial<GameState>): GameState {
	return {
		phase: Phase.TRAVEL,
		stopIdx: 2,
		fuel: 80,
		sanity: 70,
		cash: 300,
		supplies: 5,
		disguises: 2,
		laserAmmo: 10,
		meat: 0,
		skills: {
			driving: 70,
			navigation: 60,
			smooth: 50,
			mechanical: 40,
			charisma: 65,
			survival: 35,
		},
		log: [],
		players: { p1: { name: "Duke", alive: true } },
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

describe("applyEffects", () => {
	it("applies positive fuel within bounds", () => {
		const result = applyEffects(makeState({ fuel: 90 }), { fuel: 20 });
		expect(result.fuel).toBe(100); // clamped at 100
	});

	it("applies negative fuel without going below 0", () => {
		const result = applyEffects(makeState({ fuel: 10 }), { fuel: -25 });
		expect(result.fuel).toBe(0);
	});

	it("clamps sanity to 100 max", () => {
		const result = applyEffects(makeState({ sanity: 95 }), { sanity: 20 });
		expect(result.sanity).toBe(100);
	});

	it("clamps sanity to 0 min", () => {
		const result = applyEffects(makeState({ sanity: 10 }), { sanity: -20 });
		expect(result.sanity).toBe(0);
	});

	it("clamps cash to 0 min", () => {
		const result = applyEffects(makeState({ cash: 30 }), { cash: -50 });
		expect(result.cash).toBe(0);
	});

	it("applies multiple effects at once", () => {
		const result = applyEffects(makeState(), { fuel: -10, sanity: 5, cash: -20 });
		expect(result.fuel).toBe(70);
		expect(result.sanity).toBe(75);
		expect(result.cash).toBe(280);
	});

	it("does not mutate the original state", () => {
		const original = makeState();
		const originalFuel = original.fuel;
		applyEffects(original, { fuel: -30 });
		expect(original.fuel).toBe(originalFuel);
	});
});

describe("resolveEventChoice", () => {
	it("returns default text for unknown choice", () => {
		const event: GameEvent = {
			id: "test",
			title: "Test",
			text: "Test event",
			choices: [],
		};
		const result = resolveEventChoice(makeState(), event, "nonexistent");
		expect(result.text).toBe("Nothing happened.");
	});

	it("applies base effects for simple choices", () => {
		const event: GameEvent = {
			id: "feast",
			title: "FEAST",
			text: "Eat!",
			choices: [
				{
					id: "join",
					label: "Join",
					effects: { supplies: 2, sanity: 10 },
					flavor: "Best meal ever.",
				},
			],
		};
		const result = resolveEventChoice(makeState(), event, "join");
		expect(result.newState.supplies).toBe(7);
		expect(result.newState.sanity).toBe(80);
		expect(result.text).toBe("Best meal ever.");
	});

	it("handles conditionalCheck pass (has resource)", () => {
		const event: GameEvent = {
			id: "police",
			title: "POLICE",
			text: "Cop!",
			choices: [
				{
					id: "disguise",
					label: "Use disguise",
					effects: {},
					conditionalCheck: {
						resource: "disguises",
						minRequired: 1,
						consumeAmount: 1,
						passText: "Disguise worked!",
						failEffects: { cash: -100 },
						failText: "No disguise. Fined.",
					},
					flavor: "Disguise used.",
				},
			],
		};
		const result = resolveEventChoice(makeState({ disguises: 2 }), event, "disguise");
		expect(result.newState.disguises).toBe(1);
		expect(result.text).toBe("Disguise worked!");
	});

	it("handles conditionalCheck fail (no resource)", () => {
		const event: GameEvent = {
			id: "police",
			title: "POLICE",
			text: "Cop!",
			choices: [
				{
					id: "disguise",
					label: "Use disguise",
					effects: {},
					conditionalCheck: {
						resource: "disguises",
						minRequired: 1,
						consumeAmount: 1,
						passText: "Disguise worked!",
						failEffects: { cash: -100 },
						failText: "No disguise. Fined.",
					},
					flavor: "Disguise used.",
				},
			],
		};
		const result = resolveEventChoice(makeState({ disguises: 0 }), event, "disguise");
		expect(result.newState.disguises).toBe(0);
		expect(result.newState.cash).toBe(200); // 300 - 100
		expect(result.text).toBe("No disguise. Fined.");
	});

	it("handles skillCheck pass", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.1); // will pass
		const event: GameEvent = {
			id: "border",
			title: "BORDER",
			text: "Agent!",
			choices: [
				{
					id: "improvise",
					label: "Improvise",
					effects: {},
					skillCheck: {
						skill: "charisma",
						threshold: 40,
						passText: "Let through!",
						failEffects: { cash: -80 },
						failText: "Inspection fee.",
					},
					flavor: "Charisma check.",
				},
			],
		};
		const result = resolveEventChoice(makeState(), event, "improvise");
		expect(result.text).toBe("Let through!");
		vi.restoreAllMocks();
	});

	it("handles skillCheck fail", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.99); // will fail
		const event: GameEvent = {
			id: "border",
			title: "BORDER",
			text: "Agent!",
			choices: [
				{
					id: "improvise",
					label: "Improvise",
					effects: {},
					skillCheck: {
						skill: "charisma",
						threshold: 40,
						passText: "Let through!",
						failEffects: { cash: -80 },
						failText: "Inspection fee.",
					},
					flavor: "Charisma check.",
				},
			],
		};
		const result = resolveEventChoice(makeState(), event, "improvise");
		expect(result.text).toBe("Inspection fee.");
		expect(result.newState.cash).toBe(220); // 300 - 80
		vi.restoreAllMocks();
	});

	it("applies passEffects on skill check success when provided", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.1); // will pass
		const event: GameEvent = {
			id: "casino",
			title: "CASINO",
			text: "Gamble!",
			choices: [
				{
					id: "gamble",
					label: "Gamble ($50)",
					effects: { cash: -50 },
					skillCheck: {
						skill: "charisma",
						threshold: 50,
						passEffects: { cash: 170 },
						passText: "You won $120!",
						failText: "Lost $50.",
					},
					flavor: "50/50.",
				},
			],
		};
		const result = resolveEventChoice(makeState({ cash: 300 }), event, "gamble");
		// 300 - 50 (base) + 170 (passEffects) = 420
		expect(result.newState.cash).toBe(420);
		expect(result.text).toBe("You won $120!");
		vi.restoreAllMocks();
	});
});

describe("disease event resolution", () => {
	it("TB event push through: adds TB to diseases", () => {
		const event: GameEvent = {
			id: "tuberculosis",
			title: "BLOOD IN THE HANDKERCHIEF",
			text: "You've been coughing.",
			choices: [
				{
					id: "tb_push",
					label: "Push through",
					effects: { sanity: -10, diseaseAdd: Disease.TB },
					flavor: "TB acquired.",
				},
			],
		};
		const result = resolveEventChoice(makeState(), event, "tb_push");
		expect(result.newState.diseases).toContain(Disease.TB);
		expect(result.newState.sanity).toBe(60); // 70 - 10
	});

	it("measles event ignore: adds measles to diseases", () => {
		const event: GameEvent = {
			id: "measles",
			title: "SPOTS",
			text: "Your skin is doing something unsettling.",
			choices: [
				{
					id: "measles_ignore",
					label: "Ignore it",
					effects: { diseaseAdd: Disease.Measles },
					flavor: "Measles acquired.",
				},
			],
		};
		const result = resolveEventChoice(makeState(), event, "measles_ignore");
		expect(result.newState.diseases).toContain(Disease.Measles);
	});

	it("broken bones clinic with enough cash: no disease, cash deducted", () => {
		const event: GameEvent = {
			id: "broken_bones",
			title: "THAT SOUND WAS YOUR RIB",
			text: "The rib situation is not minor.",
			choices: [
				{
					id: "broken_clinic",
					label: "Find a clinic ($200)",
					effects: {},
					conditionalCheck: {
						resource: "cash",
						minRequired: 200,
						consumeAmount: 200,
						passText: "Clinic patches you up. $200.",
						failEffects: { diseaseAdd: Disease.BrokenBones },
						failText: "Broke. Untreated fracture acquired.",
					},
					flavor: "$200 or broken bones.",
				},
			],
		};
		const result = resolveEventChoice(makeState({ cash: 300 }), event, "broken_clinic");
		expect(result.newState.diseases).not.toContain(Disease.BrokenBones);
		expect(result.newState.cash).toBe(100); // 300 - 200
		expect(result.text).toBe("Clinic patches you up. $200.");
	});

	it("broken bones clinic without cash: adds broken bones disease", () => {
		const event: GameEvent = {
			id: "broken_bones",
			title: "THAT SOUND WAS YOUR RIB",
			text: "The rib situation is not minor.",
			choices: [
				{
					id: "broken_clinic",
					label: "Find a clinic ($200)",
					effects: {},
					conditionalCheck: {
						resource: "cash",
						minRequired: 200,
						consumeAmount: 200,
						passText: "Clinic patches you up. $200.",
						failEffects: { diseaseAdd: Disease.BrokenBones },
						failText: "Broke. Untreated fracture acquired.",
					},
					flavor: "$200 or broken bones.",
				},
			],
		};
		const result = resolveEventChoice(makeState({ cash: 50 }), event, "broken_clinic");
		expect(result.newState.diseases).toContain(Disease.BrokenBones);
		expect(result.text).toBe("Broke. Untreated fracture acquired.");
	});

	it("disease not added if already present (dedup from contractDisease)", () => {
		const event: GameEvent = {
			id: "tuberculosis",
			title: "BLOOD IN THE HANDKERCHIEF",
			text: "Again.",
			choices: [
				{
					id: "tb_push",
					label: "Push through",
					effects: { diseaseAdd: Disease.TB },
					flavor: "TB again.",
				},
			],
		};
		const result = resolveEventChoice(makeState({ diseases: [Disease.TB] }), event, "tb_push");
		expect(result.newState.diseases.filter((d) => d === Disease.TB)).toHaveLength(1);
	});
});
