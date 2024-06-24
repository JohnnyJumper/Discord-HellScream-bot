import { Prisma } from "@prisma/client";

export type PlanetType = {
	index: number;
	name: string;
	sector: string;
	biome: BiomeType;
	hazards: HazardType[];
	hash: number;
	position: {
		x: number;
		y: number;
	};
	waypoints: number[];
	maxHealth: number;
	health: number;
	disabled: boolean;
	initialOwner: string;
	currentOwner: string;
	regenPerSecond: number;
	event?: PlanetEventType;
	statistics: PlanetStatisticsType;
	attacking: number[];
};

export type PlanetDB = Prisma.PlanetGetPayload<{
	include: {
		biome: true;
		statistics: true;
		event: true;
		hazards: true;
	};
}>;

export type BiomeType = {
	name: string;
	description: string;
};

export type HazardType = {
	name: string;
	description: string;
};

export type PlanetEventType = {
	eventType: number;
	faction: string;
	health: number;
	maxHealth: number;
	startTime: Date;
	endTime: Date;
	campaignId: number;
	jointOperationIds: number[];
};

export type PlanetStatisticsType = {
	missionsWon: bigint;
	missionsLost: bigint;
	missionTime: bigint;
	terminidKills: bigint;
	automatonKills: bigint;
	illuminateKills: bigint;
	bulletsFired: bigint;
	bulletsHit: bigint;
	timePlayed: bigint;
	deaths: bigint;
	revives: bigint;
	friendlies: bigint;
	missionSuccessRate: bigint;
	accuracy: bigint;
	playerCount: bigint;
};

export type PlanetStatisticsTypeExposed = Omit<
	PlanetStatisticsType,
	"revives" | "friendlies" | "id"
>;

export type NewsType = {
	id: number;
	/** unix time in seconds */
	published: number;
	type: number;
	message: string;
};

export type WarStatusType = {
	started: Date;
	ended: Date;
	now: Date;
	clientVersion: string;
	factions: ("Humans" | "Terminids" | "Automaton" | "Illuminate" | string)[];
	impactMultiplier: number;
	statistics: {
		missionsWon: bigint;
		missionsLost: bigint;
		missionTime: bigint;
		terminidKills: bigint;
		automatonKills: bigint;
		illuminateKills: bigint;
		bulletsFired: bigint;
		bulletsHit: bigint;
		timePlayed: bigint;
		deaths: bigint;
		revives: bigint;
		friendlies: bigint;
		missionSuccessRate: bigint;
		accuracy: bigint;
		playerCount: bigint;
	};
};
