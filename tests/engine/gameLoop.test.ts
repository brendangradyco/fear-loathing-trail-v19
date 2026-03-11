import { describe, expect, it, vi } from "vitest";
import { CFG } from "../../src/data/constants";
import { checkDeath, checkWin, createNewGame, rest, travel } from "../../src/engine/gameLoop";
import { Disease, RationType, type SkillSet } from "../../src/types";
import { Phase } from "../../src/types";

const testSkills: SkillSet = {
	driving: 60,
	navigation: 55,
	smooth: 50,
	mechanical: 45,
	charisma: 50,
	survival: 40,
};

describe("createNewGame", () => {
	it("creates a game with correct starting values", () => {
		const game = createNewGame(testSkills, "player1", "Duke");

		expect(game.phase).toBe(Phase.TRAVEL);
		expect(game.stopIdx).toBe(0);
		expect(game.fuel).toBe(CFG.STARTING_FUEL);
		expect(game.sanity).toBe(CFG.STARTING_SANITY);
		expect(game.cash).toBe(CFG.STARTING_CASH);
		expect(game.supplies).toBe(CFG.STARTING_SUPPLIES);
		expect(game.disguises).toBe(CFG.STARTING_DISGUISES);
		expect(game.laserAmmo).toBe(CFG.STARTING_LASER_AMMO);
		expect(game.meat).toBe(0);
		expect(game.log).toEqual([]);
	});

	it("sets skills from the provided skill set", () => {
		const game = createNewGame(testSkills, "player1", "Duke");
		expect(game.skills).toEqual(testSkills);
	});

	it("adds the player to the players record", () => {
		const game = createNewGame(testSkills, "p42", "Gonzo");
		expect(game.players.p42).toEqual({ name: "Gonzo", alive: true });
	});

	it("starts with an empty log", () => {
		const game = createNewGame(testSkills, "p1", "Duke");
		expect(game.log).toHaveLength(0);
	});
});

describe("rest", () => {
	it("increases sanity by REST_SANITY_GAIN", () => {
		const game = createNewGame(testSkills, "p1", "Duke");
		game.sanity = 50;
		const rested = rest(game);
		expect(rested.sanity).toBe(50 + CFG.REST_SANITY_GAIN);
	});

	it("decreases fuel by REST_FUEL_COST", () => {
		const game = createNewGame(testSkills, "p1", "Duke");
		game.fuel = 80;
		const rested = rest(game);
		expect(rested.fuel).toBe(80 - CFG.REST_FUEL_COST);
	});

	it("clamps sanity to 100 max", () => {
		const game = createNewGame(testSkills, "p1", "Duke");
		game.sanity = 95;
		const rested = rest(game);
		expect(rested.sanity).toBe(100);
	});

	it("clamps fuel to 0 min", () => {
		const game = createNewGame(testSkills, "p1", "Duke");
		game.fuel = 3;
		const rested = rest(game);
		expect(rested.fuel).toBe(0);
	});

	it("does not mutate the original state", () => {
		const game = createNewGame(testSkills, "p1", "Duke");
		game.sanity = 60;
		game.fuel = 80;
		const rested = rest(game);
		expect(game.sanity).toBe(60);
		expect(game.fuel).toBe(80);
		expect(rested.sanity).toBe(75);
		expect(rested.fuel).toBe(75);
	});
});

describe("checkDeath", () => {
	it("returns 'fuel' when fuel is 0", () => {
		const game = createNewGame(testSkills, "p1", "Duke");
		game.fuel = 0;
		expect(checkDeath(game)).toBe("fuel");
	});

	it("returns 'sanity' when sanity is 0", () => {
		const game = createNewGame(testSkills, "p1", "Duke");
		game.sanity = 0;
		expect(checkDeath(game)).toBe("sanity");
	});

	it("returns null when both fuel and sanity are positive", () => {
		const game = createNewGame(testSkills, "p1", "Duke");
		expect(checkDeath(game)).toBeNull();
	});

	it("returns 'fuel' first when both are 0 (fuel checked first)", () => {
		const game = createNewGame(testSkills, "p1", "Duke");
		game.fuel = 0;
		game.sanity = 0;
		expect(checkDeath(game)).toBe("fuel");
	});

	it("returns null at fuel=1, sanity=1", () => {
		const game = createNewGame(testSkills, "p1", "Duke");
		game.fuel = 1;
		game.sanity = 1;
		expect(checkDeath(game)).toBeNull();
	});
});

describe("checkWin", () => {
	it("returns false when not at the last stop", () => {
		const game = createNewGame(testSkills, "p1", "Duke");
		game.stopIdx = 5;
		expect(checkWin(game)).toBe(false);
	});

	it("returns true when at the last stop (index 10)", () => {
		const game = createNewGame(testSkills, "p1", "Duke");
		game.stopIdx = 10; // TRAIL_STOPS has 11 entries, last index = 10
		expect(checkWin(game)).toBe(true);
	});

	it("returns false at index 9 (one before last)", () => {
		const game = createNewGame(testSkills, "p1", "Duke");
		game.stopIdx = 9;
		expect(checkWin(game)).toBe(false);
	});
});

describe("travel: disease drain", () => {
	// Mock Math.random to return max fuel cost and no event trigger
	// FUEL_PER_LEG_MIN=20, MAX=34, random*15 floor. mock 0 => cost=20
	it("travel with 1 disease: sanity decreases by 8 (DISEASE_SANITY_DRAIN)", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const game = createNewGame(testSkills, "p1", "Duke");
		game.sanity = 80;
		game.diseases = [Disease.TB];
		// Normal ration: supplyCost=1, sanityBonus=0
		// diseaseDrain = 1 * 8 = 8
		// sanityAfterRation = 80 + 0 = 80
		// sanityAfterDiseases = 80 - 8 = 72
		const { state } = travel(game);
		expect(state.sanity).toBe(72);
		vi.restoreAllMocks();
	});

	it("travel with 3 diseases: sanity decreases by 24", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const game = createNewGame(testSkills, "p1", "Duke");
		game.sanity = 80;
		game.diseases = [Disease.TB, Disease.Measles, Disease.BrokenBones];
		// diseaseDrain = 3 * 8 = 24
		// sanityAfterRation = 80 + 0 = 80
		// sanityAfterDiseases = 80 - 24 = 56
		const { state } = travel(game);
		expect(state.sanity).toBe(56);
		vi.restoreAllMocks();
	});

	it("travel with 0 diseases: no extra sanity loss from diseases", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const game = createNewGame(testSkills, "p1", "Duke");
		game.sanity = 80;
		game.diseases = [];
		// diseaseDrain = 0
		// sanityAfterRation = 80 + 0 = 80 (Normal ration sanityBonus=0)
		const { state } = travel(game);
		expect(state.sanity).toBe(80);
		vi.restoreAllMocks();
	});
});

describe("travel: ration consumption", () => {
	it("travel with Normal ration: 1 supply consumed", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const game = createNewGame(testSkills, "p1", "Duke");
		game.supplies = 5;
		game.rationTier = RationType.Normal; // supplyCost=1
		const { state } = travel(game);
		expect(state.supplies).toBe(4);
		vi.restoreAllMocks();
	});

	it("travel with TinyTim: 0 supplies consumed, sanity -5", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const game = createNewGame(testSkills, "p1", "Duke");
		game.supplies = 5;
		game.sanity = 80;
		game.rationTier = RationType.TinyTim; // supplyCost=0, sanityBonus=-5
		const { state } = travel(game);
		expect(state.supplies).toBe(5);
		expect(state.sanity).toBe(75); // 80 + (-5)
		vi.restoreAllMocks();
	});

	it("travel with CholesterolDaddy: 3 supplies consumed, sanity +10", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const game = createNewGame(testSkills, "p1", "Duke");
		game.supplies = 5;
		game.sanity = 70;
		game.rationTier = RationType.CholesterolDaddy; // supplyCost=3, sanityBonus=10
		const { state } = travel(game);
		expect(state.supplies).toBe(2);
		expect(state.sanity).toBe(80); // 70 + 10
		vi.restoreAllMocks();
	});
});

describe("travel: cooldown resets", () => {
	it("after travel: hustleDone, buskDone, methCookUsed, cokeCookUsed all reset to false", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const game = createNewGame(testSkills, "p1", "Duke");
		game.hustleDone = true;
		game.buskDone = true;
		game.methCookUsed = true;
		game.cokeCookUsed = true;
		const { state } = travel(game);
		expect(state.hustleDone).toBe(false);
		expect(state.buskDone).toBe(false);
		expect(state.methCookUsed).toBe(false);
		expect(state.cokeCookUsed).toBe(false);
		vi.restoreAllMocks();
	});
});
