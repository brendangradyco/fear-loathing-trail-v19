import { RationType, type RationDef } from "../types";

export const RATIONS: RationDef[] = [
	{ id: RationType.TinyTim, name: "tiny_tim", label: "Tiny Tim (saves supplies)", supplyCost: 0, sanityBonus: -5, color: "#00aaff" },
	{ id: RationType.Normal, name: "normal", label: "Normal", supplyCost: 1, sanityBonus: 0, color: "var(--orange)" },
	{ id: RationType.Fat, name: "fat", label: "Fat & Happy", supplyCost: 2, sanityBonus: 5, color: "#ff9900" },
	{ id: RationType.CholesterolDaddy, name: "cholesterol", label: "Cholesterol Daddy (costs extra)", supplyCost: 3, sanityBonus: 10, color: "var(--red)" },
];
