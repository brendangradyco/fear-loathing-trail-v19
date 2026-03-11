import { Disease, MedicineType, type MedicineItem, type ShopItem } from "../types";

export const DRUG_SHOP: ShopItem[] = [
	{
		id: "ether",
		name: "Ether",
		desc: "+20 sanity, wild drive",
		price: 60,
		effects: { sanity: 20 },
	},
	{
		id: "mescaline",
		name: "Mescaline",
		desc: "+15 sanity, see things",
		price: 40,
		effects: { sanity: 15 },
	},
	{
		id: "adren",
		name: "Adrenochrome",
		desc: "+30 sanity, dangerous",
		price: 120,
		effects: { sanity: 30 },
		sideEffect: { chance: 0.3, effects: { sanity: -20 } },
	},
	{
		id: "amyls",
		name: "Amyl Nitrate",
		desc: "+10 sanity instant",
		price: 25,
		effects: { sanity: 10 },
	},
	{
		id: "grass",
		name: "Grass",
		desc: "Chill out +8 sanity",
		price: 20,
		effects: { sanity: 8 },
	},
];

export const SUPPLY_SHOP: ShopItem[] = [
	{
		id: "fuel",
		name: "Fuel (full tank)",
		desc: "Fill tank to 100",
		price: 80,
		effects: {},
		setEffects: { fuel: 100 },
	},
	{
		id: "supplies",
		name: "Supplies (+3)",
		desc: "Food & water for road",
		price: 45,
		effects: { supplies: 3 },
	},
	{
		id: "disguise",
		name: "Disguise Kit",
		desc: "Evade one police stop",
		price: 70,
		effects: { disguises: 1 },
	},
	{
		id: "laser",
		name: "Laser Cells",
		desc: "+10 laser ammo for hunt",
		price: 30,
		effects: { laserAmmo: 10 },
	},
	{
		id: "repair",
		name: "Car Repair",
		desc: "Full fuel + sanity +15",
		price: 100,
		effects: { sanity: 15 },
		setEffects: { fuel: 100 },
	},
];

export const MEDICINE_SHOP: MedicineItem[] = [
	{ id: MedicineType.Antibiotics, name: "Antibiotics", desc: "Cures TB, measles, diphtheria", price: 80, cures: [Disease.TB, Disease.Measles, Disease.Diphtheria], sanityBonus: 0 },
	{ id: MedicineType.Morphine, name: "Morphine", desc: "Cures broken bones, +20 sanity", price: 60, cures: [Disease.BrokenBones], sanityBonus: 20 },
	{ id: MedicineType.Antiretrovirals, name: "Antiretrovirals", desc: "Cures AIDS", price: 150, cures: [Disease.AIDS], sanityBonus: 0 },
	{ id: MedicineType.Naloxone, name: "Naloxone", desc: "Reverses dab overdose, +15 sanity", price: 45, cures: [Disease.Dabs], sanityBonus: 15 },
];
