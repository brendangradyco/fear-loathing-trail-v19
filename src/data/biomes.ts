import { Biome } from "../types";

export interface BiomeConfig {
	id: Biome;
	bgGradient: [string, string];
	groundColor: string;
	roadColor: string;
	entities: string[];
	easterEggs: string[];
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
