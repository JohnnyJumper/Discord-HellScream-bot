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
	PlanetEventType,
	PlanetStatisticsType,
	PlanetType,
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
					data: { event: { disconnect: true } },
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
