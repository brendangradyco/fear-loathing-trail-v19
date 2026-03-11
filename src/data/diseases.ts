import { Disease, MedicineType, type DiseaseDef } from "../types";

export const DISEASES: DiseaseDef[] = [
	{ id: Disease.TB, name: "TB", sanityDrain: 8, cure: MedicineType.Antibiotics },
	{ id: Disease.Measles, name: "Measles", sanityDrain: 8, cure: MedicineType.Antibiotics },
	{ id: Disease.BrokenBones, name: "Broken Bone", sanityDrain: 8, cure: MedicineType.Morphine },
	{ id: Disease.AIDS, name: "AIDS", sanityDrain: 8, cure: MedicineType.Antiretrovirals },
	{ id: Disease.Dabs, name: "Mid Dabs", sanityDrain: 8, cure: MedicineType.Naloxone },
	{ id: Disease.Diphtheria, name: "Diphtheria", sanityDrain: 8, cure: MedicineType.Antibiotics },
];
