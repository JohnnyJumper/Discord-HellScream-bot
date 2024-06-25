import {
	Injectable,
	Logger,
	type OnModuleDestroy,
	type OnModuleInit,
} from "@nestjs/common";
import {
	Biome,
	PlanetEvent,
	PlanetStatistics,
	PrismaClient,
} from "@prisma/client";
import {
	BiomeType,
	HazardType,
	PlanetDB,
	PlanetEventType,
	PlanetStatisticsType,
	PlanetType,
	WarStatusType,
} from "modules/helldiversAPI/types";
import { PrismaTransaction } from "./types";

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	private logger: Logger;

	constructor() {
		super();
		this.logger = new Logger(PrismaService.name);
	}

	async onModuleInit() {
		await this.$connect();
	}

	async onModuleDestroy() {
		await this.$disconnect();
	}

	async findActivePlanets(): Promise<PlanetDB[]> {
		return this.planet.findMany({
			where: {
				event: {
					isNot: null,
				},
			},
			include: {
				hazards: true,
				statistics: true,
				event: true,
				biome: true,
			},
		}) as Promise<PlanetDB[]>;
	}

	async createOrUpdateWarStatus(warStatus: WarStatusType) {
		return this.$transaction(async (prisma) => {
			const { statistics, ...status } = warStatus;
			const currentStatus = await prisma.currentWarStatus.findFirst({});

			if (!currentStatus) {
				return this.createWarStatus(prisma, statistics, status);
			}

			await prisma.currentWarStatistics.update({
				where: {
					id: currentStatus.statisticsId,
				},
				data: {
					accuracy: statistics.accuracy,
					automatonKills: statistics.automatonKills,
					terminidKills: statistics.terminidKills,
					illuminateKills: statistics.illuminateKills,
					bulletsFired: statistics.bulletsFired,
					bulletsHit: statistics.bulletsHit,
					deaths: statistics.deaths,
					friendlies: statistics.friendlies,
					missionsLost: statistics.missionsLost,
					missionSuccessRate: statistics.missionSuccessRate,
					missionsWon: statistics.missionsWon,
					missionTime: statistics.missionTime,
					playerCount: statistics.playerCount,
					revives: statistics.revives,
					timePlayed: statistics.timePlayed,
				},
			});

			return await prisma.currentWarStatus.update({
				where: {
					id: currentStatus.id,
				},
				data: {
					clientVersion: currentStatus.clientVersion,
					ended: currentStatus.ended,
					factions: currentStatus.factions,
					impactMultiplier: currentStatus.impactMultiplier,
					now: currentStatus.now,
					started: currentStatus.started,
				},
				include: {
					statistics: true,
				},
			});
		});
	}

	async createWarStatus(
		prisma: PrismaTransaction,
		statistics: WarStatusType["statistics"],
		status: Omit<WarStatusType, "statistics">,
	) {
		const currentStatistics = await prisma.currentWarStatistics.create({
			data: {
				accuracy: statistics.accuracy,
				automatonKills: statistics.automatonKills,
				terminidKills: statistics.terminidKills,
				illuminateKills: statistics.illuminateKills,
				bulletsFired: statistics.bulletsFired,
				bulletsHit: statistics.bulletsHit,
				deaths: statistics.deaths,
				friendlies: statistics.friendlies,
				missionsLost: statistics.missionsLost,
				missionsWon: statistics.missionsWon,
				missionSuccessRate: statistics.missionSuccessRate,
				missionTime: statistics.missionTime,
				playerCount: statistics.playerCount,
				revives: statistics.revives,
				timePlayed: statistics.timePlayed,
			},
		});

		return prisma.currentWarStatus.create({
			data: {
				clientVersion: status.clientVersion,
				ended: status.ended,
				now: status.now,
				impactMultiplier: status.impactMultiplier,
				started: status.started,
				factions: status.factions,
				statisticsId: currentStatistics.id,
			},
			include: {
				statistics: true,
			},
		});
	}

	/**
	 *
	 * This function compares the planetData provided to the record in database by looking on currentOwner property
	 * it returns an array with exactly 2 elements. The first element is boolean whether the planet status changed or not
	 * the second element is an array of strings where first element is what the owner was and the second element is current status
	 * Blame past johnny :p
	 * @param planetData
	 * @returns
	 */
	async didPlanetStatusChanged(
		planetData: PlanetType,
	): Promise<[boolean, [string, string] | []]> {
		const existingRecord = await this.planet.findFirst({
			where: {
				index: planetData.index,
			},
			include: {
				biome: true,
				event: true,
				hazards: true,
				_count: true,
			},
		});
		if (!existingRecord) return [true, ["unknown", planetData.currentOwner]];
		if (planetData.currentOwner === existingRecord.currentOwner)
			return [false, []];
		return [true, [existingRecord.currentOwner, planetData.currentOwner]];
	}

	async updateOrCreatePlanet(planetData: PlanetType) {
		const existingRecord = await this.planet.findFirst({
			where: {
				index: planetData.index,
			},
			include: {
				biome: true,
				hazards: true,
				statistics: true,
				event: true,
			},
		});

		if (!existingRecord) {
			return this.createPlanet(planetData);
		}

		// otherwise we want to update the planet
		await this.$transaction(async (prisma) => {
			// update the base stats of a planet
			await prisma.planet.update({
				where: {
					id: existingRecord.id,
				},
				data: {
					health: planetData.health,
					maxHealth: planetData.maxHealth,
					name: planetData.name,
					initialOwner: planetData.initialOwner,
					currentOwner: planetData.currentOwner,
					regenPerSecond: planetData.regenPerSecond,
					attacking: planetData.attacking,
					sector: planetData.sector,
					waypoints: planetData.waypoints,
					disabled: planetData.disabled,
					hash: planetData.hash,
				},
			});

			await this.updateOrCreatePlanetEvent(
				prisma,
				existingRecord.index,
				planetData.event,
			);

			await this.updateStatistics(
				prisma,
				existingRecord.statisticsId,
				planetData.statistics,
			);
		});
	}

	async createPlanet(planetData: PlanetType) {
		this.logger.log("Creating planet in db");

		return this.$transaction(async (prisma) => {
			const biome = await this.createBiome(prisma, planetData.biome);
			const statistics = await this.createStatistics(
				prisma,
				planetData.statistics,
			);
			const createdPlanet = await this.createPlanetRecord(
				prisma,
				planetData,
				biome,
				statistics,
			);
			const event = await this.createEvent(
				prisma,
				createdPlanet.index,
				planetData.event,
			);

			if (event !== null) {
				await prisma.planet.update({
					where: {
						id: createdPlanet.id,
					},
					data: {
						event: {
							connect: {
								id: event.id,
							},
						},
					},
				});
			}

			await this.createHazards(prisma, createdPlanet.id, planetData.hazards);
		});
	}

	async createBiome(prisma: PrismaTransaction, biome: BiomeType) {
		return prisma.biome.create({
			data: {
				name: biome.name,
				description: biome.description,
			},
		});
	}

	async createEvent(
		prisma: PrismaTransaction,
		planetIndex: bigint,
		event?: PlanetEventType,
	): Promise<PlanetEvent | null> {
		if (!event) return null;

		return prisma.planetEvent.create({
			data: {
				planetIndex,
				campaignId: event.campaignId,
				endTime: event.endTime,
				eventType: event.eventType,
				faction: event.faction,
				health: event.health,
				maxHealth: event.maxHealth,
				startTime: event.startTime,
				jointOperationIds: event.jointOperationIds,
			},
		});
	}

	async createStatistics(
		prisma: PrismaTransaction,
		statistics: PlanetStatisticsType,
	) {
		return prisma.planetStatistics.create({
			data: {
				missionsWon: statistics.missionsWon,
				missionsLost: statistics.missionsLost,
				missionTime: statistics.missionTime,
				terminidKills: statistics.terminidKills,
				automatonKills: statistics.automatonKills,
				illuminateKills: statistics.illuminateKills,
				bulletsFired: statistics.bulletsFired,
				bulletsHit: statistics.bulletsHit,
				timePlayed: statistics.timePlayed,
				deaths: statistics.deaths,
				revives: statistics.revives,
				friendlies: statistics.friendlies,
				missionSuccessRate: statistics.missionSuccessRate,
				accuracy: statistics.accuracy,
				playerCount: statistics.playerCount,
			},
		});
	}

	async createPlanetRecord(
		prisma: PrismaTransaction,
		planet: PlanetType,
		biome: Biome,
		statistics: PlanetStatistics,
	) {
		return prisma.planet.create({
			data: {
				index: planet.index,
				currentOwner: planet.currentOwner,
				disabled: planet.disabled,
				hash: planet.hash,
				health: planet.health,
				initialOwner: planet.initialOwner,
				maxHealth: planet.maxHealth,
				name: planet.name,
				regenPerSecond: planet.regenPerSecond,
				sector: planet.sector,
				attacking: planet.attacking,
				waypoints: planet.waypoints,
				biomeId: biome.id,
				statisticsId: statistics.id,
			},
		});
	}

	async createHazards(
		prisma: PrismaTransaction,
		planetId: number,
		hazards: HazardType[],
	) {
		return prisma.hazard.createMany({
			data: hazards.map((rawHazard) => ({
				name: rawHazard.name,
				description: rawHazard.description,
				planetId: planetId,
			})),
		});
	}

	async updateStatistics(
		prisma: PrismaTransaction,
		statisticsId: number,
		statistics: PlanetStatisticsType,
	) {
		await prisma.planetStatistics.update({
			where: {
				id: statisticsId,
			},
			data: {
				accuracy: statistics.accuracy,
				automatonKills: statistics.automatonKills,
				terminidKills: statistics.terminidKills,
				illuminateKills: statistics.illuminateKills,
				bulletsFired: statistics.bulletsFired,
				bulletsHit: statistics.bulletsHit,
				friendlies: statistics.friendlies,
				deaths: statistics.deaths,
				missionsLost: statistics.missionsLost,
				missionsWon: statistics.missionsWon,
				missionSuccessRate: statistics.missionSuccessRate,
				missionTime: statistics.missionTime,
				playerCount: statistics.playerCount,
				revives: statistics.revives,
				timePlayed: statistics.timePlayed,
			},
		});
	}

	async updateOrCreatePlanetEvent(
		prisma: PrismaTransaction,
		planetIndex: bigint,
		event?: PlanetEventType,
	) {
		// if no current event remove the event if any in db
		if (!event) {
			// Find the existing event associated with the planet
			const existingEvent = await prisma.planetEvent.findUnique({
				where: { planetIndex: planetIndex },
			});

			if (existingEvent) {
				// Delete the PlanetEvent first
				await prisma.planetEvent.delete({
					where: { planetIndex: planetIndex },
				});
				// Disconnect the event from the Planet
				await prisma.planet.update({
					where: { index: planetIndex },
					data: { event: undefined },
				});
			}

			return;
		}
		// if there are planetData and it is different then update the event?
		await prisma.planetEvent.upsert({
			where: {
				planetIndex: planetIndex,
			},
			update: {
				eventType: event.eventType,
				faction: event.faction,
				health: event.health,
				maxHealth: event.maxHealth,
				startTime: event.startTime,
				endTime: event.endTime,
				campaignId: event.campaignId,
				jointOperationIds: event.jointOperationIds,
			},
			create: {
				planetIndex: planetIndex,
				eventType: event.eventType,
				faction: event.faction,
				health: event.health,
				maxHealth: event.maxHealth,
				startTime: event.startTime,
				endTime: event.endTime,
				campaignId: event.campaignId,
				jointOperationIds: event.jointOperationIds,
			},
		});
	}
}
