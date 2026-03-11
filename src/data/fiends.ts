import { DrugType, type Fiend } from "../types";

export const FIENDS: Fiend[] = [
	{ name: "Dirty Mike", want: DrugType.Weed, mult: 0.9, risk: 0.08, emoji: "🤤" },
	{ name: "El Gordo", want: DrugType.Coke, mult: 1.15, risk: 0.18, emoji: "🤠" },
	{ name: "Tweaker Tim", want: DrugType.Meth, mult: 1.08, risk: 0.14, emoji: "😬" },
	{ name: "Uncle Jimbo", want: DrugType.Shine, mult: 0.95, risk: 0.07, emoji: "🍺" },
	{ name: "Dr. Feelgood", want: DrugType.Pills, mult: 1.2, risk: 0.22, emoji: "👨‍⚕️" },
	{ name: "Smokey Ray", want: DrugType.Weed, mult: 1.0, risk: 0.10, emoji: "😎" },
	{ name: "The Colonel", want: DrugType.Coke, mult: 1.35, risk: 0.28, emoji: "🎩" },
	{ name: "Marisol", want: DrugType.Meth, mult: 0.95, risk: 0.11, emoji: "💅" },
];
