export enum Phase {
	TRAVEL = "travel",
	EVENT = "event",
	SHOP = "shop",
	HUNT = "hunt",
	DEAD = "dead",
	WIN = "win",
}

export enum Region {
	SOUTHWEST = "southwest",
	NORTHWEST = "northwest",
	MOUNTAIN = "mountain",
	PLAINS = "plains",
	DEFAULT = "default",
}

export type Sex = "male" | "female" | "other";
export type Age = "young" | "adult" | "middle" | "old";

export interface SkillSet {
	driving: number;
	navigation: number;
	smooth: number;
	mechanical: number;
	charisma: number;
	survival: number;
}

export type SkillName = keyof SkillSet;

export interface Quirk {
	id: string;
	icon: string;
	label: string;
}

export interface TrailStop {
	id: string;
	name: string;
	emoji: string;
	lat: number;
	lon: number;
	dist: number;
	desc: string;
}

export interface EventEffect {
	fuel?: number;
	sanity?: number;
	cash?: number;
	supplies?: number;
	disguises?: number;
	laserAmmo?: number;
	meat?: number;
	diseaseAdd?: Disease;
}

export interface SkillCheck {
	skill: SkillName;
	threshold: number;
	passEffects?: EventEffect;
	failEffects?: EventEffect;
	passText: string;
	failText: string;
}

export interface ConditionalCheck {
	resource: "disguises" | "cash" | "supplies" | "laserAmmo";
	minRequired: number;
	consumeAmount: number;
	passText: string;
	failEffects: EventEffect;
	failText: string;
}

export interface EventChoice {
	id: string;
	label: string;
	effects: EventEffect;
	skillCheck?: SkillCheck;
	conditionalCheck?: ConditionalCheck;
	flavor: string;
}

export interface GameEvent {
	id: string;
	title: string;
	text: string;
	choices: EventChoice[];
}

export interface ShopItem {
	id: string;
	name: string;
	desc: string;
	price: number;
	effects: EventEffect;
	setEffects?: EventEffect;
	sideEffect?: { chance: number; effects: EventEffect };
}

export interface LogEntry {
	txt: string;
	bad: boolean;
	good: boolean;
}

export interface PlayerData {
	name: string;
	sex: Sex;
	age: Age;
	quirks: string[];
	skills: SkillSet;
	region: Region;
}

export interface GameState {
	phase: Phase;
	stopIdx: number;
	fuel: number;
	sanity: number;
	cash: number;
	supplies: number;
	disguises: number;
	laserAmmo: number;
	meat: number;
	skills: SkillSet;
	log: LogEntry[];
	players: Record<string, { name: string; alive: boolean }>;
	// Drug economy
	drugInventory: Record<DrugType, number>;
	drugStatus: DrugStatus;
	// Diseases
	diseases: Disease[];
	// Rations
	rationTier: RationType;
	// Shank PvP
	shankCooldown: boolean;
	shankStunned: boolean;
	// Minigame cooldowns (per-stop)
	hustleDone: boolean;
	buskDone: boolean;
	methCookUsed: boolean;
	cokeCookUsed: boolean;
}

export type Screen =
	| "loading"
	| "char"
	| "location"
	| "skills"
	| "lobby"
	| "shop"
	| "map"
	| "hunt"
	| "dead"
	| "win"
	| "travel"
	| "hustle"
	| "busk"
	| "drugdeal";

export type MessageType =
	| { type: "HELLO"; pid: string; player: PlayerData }
	| { type: "WELCOME"; players: Record<string, PlayerData>; game?: GameState }
	| { type: "PLAYER_JOINED"; pid: string; player: PlayerData }
	| { type: "PLAYER_LEFT"; pid: string }
	| { type: "MEET"; peerId: string }
	| { type: "GAME_STATE"; game: GameState }
	| { type: "CHAT"; text: string; sender: string; senderName: string }
	| { type: "CHAT_SYS"; text: string }
	| { type: "SHANK_ALERT"; from: string; fromName: string; targetPid: string }
	| { type: "SHANK_DODGE"; targetPid: string };

export enum DrugType {
	Weed = "weed",
	Coke = "coke",
	Meth = "meth",
	Shine = "shine",
	Pills = "pills",
}

export enum Disease {
	TB = "tb",
	Measles = "measles",
	BrokenBones = "broken",
	AIDS = "aids",
	Dabs = "dabs",
	Diphtheria = "diptheria", // matches v19 monolith typo intentionally
}

export enum RationType {
	TinyTim = "tiny_tim",
	Normal = "normal",
	Fat = "fat",
	CholesterolDaddy = "cholesterol",
}

export enum Biome {
	Desert = "desert",
	Jungle = "jungle",
	Mountain = "mountain",
	Coast = "coast",
	City = "city",
}

export enum MedicineType {
	Antibiotics = "antibiotics",
	Morphine = "morphine",
	Antiretrovirals = "antiretrovirals",
	Naloxone = "naloxone",
}

export interface DrugDef {
	id: DrugType;
	name: string;
	emoji: string;
	buy: number;
	sell: number;
	makeType: "grow" | "cook" | "lab" | "still" | null;
	yield: [number, number];
	cost: number;
	desc: string;
}

export interface Fiend {
	name: string;
	want: DrugType;
	mult: number;
	risk: number;
	emoji: string;
}

export interface DiseaseDef {
	id: Disease;
	name: string;
	sanityDrain: number;
	cure: MedicineType;
}

export interface RationDef {
	id: RationType;
	name: string;
	label: string;
	supplyCost: number;
	sanityBonus: number;
	color: string;
}

export interface DrugStatus {
	weedReadyAt: number; // stop index, -1 = not growing
	shineReadyAt: number; // stop index, -1 = not stilling
}

export interface MedicineItem {
	id: MedicineType;
	name: string;
	desc: string;
	price: number;
	cures: Disease[];
	sanityBonus: number;
}
