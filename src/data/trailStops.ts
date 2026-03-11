import type { Biome } from "../types";

export interface TrailStop {
	id: string;
	name: string;
	emoji: string;
	lat: number;
	lon: number;
	dist: number;
	desc: string;
	biome: Biome;
}

export const TRAIL_STOPS: TrailStop[] = [
	{ id: "start", name: "Las Vegas, NV", emoji: "🎰", lat: 36.17, lon: -115.14, dist: 0, desc: "Where the dream died and the ether began.", biome: "desert" as Biome },
	{ id: "phoenix", name: "Phoenix, AZ", emoji: "🌵", lat: 33.45, lon: -112.07, dist: 345, desc: "345 miles of desert psychosis before the border.", biome: "desert" as Biome },
	{ id: "elpaso", name: "El Paso, TX", emoji: "🤠", lat: 31.76, lon: -106.49, dist: 880, desc: "The Rio Grande. The sweat is real. The border is close.", biome: "desert" as Biome },
	{ id: "mexico", name: "Mexico City, MX", emoji: "🌮", lat: 19.43, lon: -99.13, dist: 1665, desc: "7,350 feet of altitude and a million ways to disappear.", biome: "jungle" as Biome },
	{ id: "oaxaca", name: "Oaxaca, MX", emoji: "🏺", lat: 17.07, lon: -96.72, dist: 2145, desc: "Mezcal country. Everything here tastes like smoke and regret.", biome: "jungle" as Biome },
	{ id: "guatemala", name: "Guatemala City, GT", emoji: "☕", lat: 14.63, lon: -90.51, dist: 2740, desc: "The coffee is strong. The paranoia is stronger.", biome: "mountain" as Biome },
	{ id: "managua", name: "Managua, NI", emoji: "🌋", lat: 12.13, lon: -86.28, dist: 3215, desc: "Volcanoes on every side. One of them might be you.", biome: "jungle" as Biome },
	{ id: "sanjose", name: "San José, CR", emoji: "🦜", lat: 9.93, lon: -84.09, dist: 3630, desc: "Rainforest and rain. The birds here know things about you.", biome: "jungle" as Biome },
	{ id: "panama", name: "Panama City, PA", emoji: "🚢", lat: 8.99, lon: -79.52, dist: 4050, desc: "They shipped the car by boat. You crossed on nerve alone.", biome: "coast" as Biome },
	{ id: "medellin", name: "Medellín, CO", emoji: "💐", lat: 6.24, lon: -75.57, dist: 4585, desc: "The city of eternal spring. Everyone smiles too much.", biome: "city" as Biome },
	{ id: "bogota", name: "Bogotá, Colombia", emoji: "🏁", lat: 4.71, lon: -74.07, dist: 5000, desc: "THE END. Colombia receives you. The bats followed the whole way.", biome: "city" as Biome },
];
