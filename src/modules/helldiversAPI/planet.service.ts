import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import {
  BiomeType,
  HazardType,
  PlanetEventType,
  PlanetStatisticsType,
  PlanetType,
} from './types';
import { PrismaService } from 'modules/prisma/prisma.service';
import { PrismaTransaction } from 'modules/prisma/types';
import { Biome, PlanetEvent, PlanetStatistics } from '@prisma/client';

@Injectable()
export class PlanetAPIService {
  private readonly logger: Logger;

  private readonly baseurl = 'https://api.helldivers2.dev/api/v1';

  constructor(
    private readonly http: HttpService,
    private readonly prisma: PrismaService,
  ) {
    this.logger = new Logger(PlanetAPIService.name);
  }

  async getPlanets() {
    const url = new URL(`${this.baseurl}/planets`);
    const { data, status } = await firstValueFrom(
      this.http.get<PlanetType[]>(url.href).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error);
          throw new Error('Failed to fetch planet information');
        }),
      ),
    );

    let planetCreated = 0;
    await this.prisma.$transaction(async (prisma) => {
      this.logger.log('Nuking the current table');
      await prisma.planet.deleteMany({});

      this.logger.log(`Received ${data.length} planets`);
      for (const planet of data) {
        this.logger.log(`Creating ${planetCreated + 1} planet`);
        this.logger.log('Creating planet biome');
        const biome = await this.createBiome(prisma, planet.biome);
        this.logger.log('Creating planet event');
        const event = await this.createEvent(prisma, planet.event);
        this.logger.log('Creating planet statistics');
        const statistics = await this.createStatistics(
          prisma,
          planet.statistics,
        );
        this.logger.log('Creating planet');
        const createdPlanet = await this.createPlanet(
          prisma,
          planet,
          biome,
          statistics,
          event,
        );
        this.logger.log('Creating hazards');
        await this.createHazards(prisma, createdPlanet.id, planet.hazards);
        planetCreated += 1;
      }
    });
    this.logger.log(`Created ${planetCreated}  planets`);
  }

  private async createBiome(prisma: PrismaTransaction, biome: BiomeType) {
    return prisma.biome.create({
      data: {
        name: biome.name,
        description: biome.description,
      },
    });
  }

  private async createEvent(
    prisma: PrismaTransaction,
    event?: PlanetEventType,
  ): Promise<PlanetEvent | null> {
    if (!event) return null;

    return prisma.planetEvent.create({
      data: {
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

  private async createStatistics(
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

  private async createPlanet(
    prisma: PrismaTransaction,
    planet: PlanetType,
    biome: Biome,
    statistics: PlanetStatistics,
    event: PlanetEvent | null,
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
        eventId: event ? event.id : null,
        statisticsId: statistics.id,
      },
    });
  }

  private async createHazards(
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
}
