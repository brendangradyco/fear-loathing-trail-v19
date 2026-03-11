import type { GameState, SkillSet } from "../types";
import { clamp } from "../utils/clamp";

export type ShankOutcome = "success" | "dodged" | "failure";

export interface ShankResult {
	outcome: ShankOutcome;
	attackerState: GameState;
	stolenCash: number;
	stolenSupplies: number;
}

export function attemptShank(attackerState: GameState, dodged: boolean): ShankResult {
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
			attackerState: { ...attackerState, shankCooldown: true },
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
