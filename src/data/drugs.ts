import { DrugType, type DrugDef } from "../types";

export const DRUG_CATALOG: DrugDef[] = [
	{ id: DrugType.Weed, name: "Weed", emoji: "🌿", buy: 20, sell: 55, makeType: "grow", yield: [4, 8], cost: 0, desc: "Bales of it. For the long road." },
	{ id: DrugType.Coke, name: "Cocaine", emoji: "🤍", buy: 95, sell: 270, makeType: "cook", yield: [2, 4], cost: 50, desc: "Colombian grade. Handle with care." },
	{ id: DrugType.Meth, name: "Crystal", emoji: "💎", buy: 60, sell: 185, makeType: "lab", yield: [2, 4], cost: 40, desc: "Two-headed chemistry. Smells like victory." },
	{ id: DrugType.Shine, name: "Moonshine", emoji: "🫙", buy: 22, sell: 60, makeType: "still", yield: [5, 10], cost: 0, desc: "100-proof rocket fuel. Grandma's recipe." },
	{ id: DrugType.Pills, name: "Pills", emoji: "💊", buy: 14, sell: 38, makeType: null, yield: [0, 0], cost: 0, desc: "Unspecified. All flavors. All shapes." },
];

export function getDrugPriceModifier(stopIdx: number): { buy: number; sell: number } {
	if (stopIdx <= 2) return { buy: 1.3, sell: 0.65 };
	if (stopIdx <= 5) return { buy: 1.0, sell: 0.85 };
	if (stopIdx <= 8) return { buy: 0.85, sell: 1.0 };
	return { buy: 0.70, sell: 1.35 };
}
