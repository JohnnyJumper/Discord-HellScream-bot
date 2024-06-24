import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import type { AxiosError } from "axios";
import { WarStatusTask } from "modules/cronJobs/warStatusTask";
import { PrismaService } from "modules/prisma/prisma.service";
import { catchError, firstValueFrom } from "rxjs";
import type {
	ExposedWarStatistics,
	PlanetDB,
	PlanetStatisticsTypeExposed,
	WarStatusType,
} from "./types";
@Injectable()
export class WarStatusAPIService {
	private readonly logger: Logger;

	private readonly baseurl = "https://api.helldivers2.dev/api/v1";

	constructor(
		private readonly http: HttpService,
		private readonly prisma: PrismaService,
	) {
		this.logger = new Logger(WarStatusAPIService.name);
	}

	private async _fetchWarStatus() {
		const url = new URL(`${this.baseurl}/war`);
		const { data } = await firstValueFrom(
			this.http.get<WarStatusType>(url.href).pipe(
				catchError((error: AxiosError) => {
					this.logger.error(error);
					throw new Error("Failed to fetch planet information");
				}),
			),
		);

		return data;
	}

	async fetchWarStatus() {
		const warStatus = await this._fetchWarStatus();
		const updatedData = await this.prisma.createOrUpdateWarStatus(warStatus);
		const exposedWarStatistics = this.exposeWarStatistics(updatedData);

		const activeRawPlanets = await this.prisma.findActivePlanets();
		const activePlanets = this.excludeFieldsFromStatistics(activeRawPlanets);

		return {
			...exposedWarStatistics,
			activePlanets,
		};
	}

	private excludeFieldsFromStatistics(planets: PlanetDB[]): (Omit<
		PlanetDB,
		"statistics"
	> & {
		statistics: PlanetStatisticsTypeExposed;
	})[] {
		return planets.map((planet) => {
			const { revives, friendlies, ...filteredStatistics } = planet.statistics;
			return {
				...planet,
				statistics: filteredStatistics,
			};
		});
	}

	private exposeWarStatistics({
		statistics,
		factions,
		impactMultiplier,
		..._warstatus
	}: WarStatusType): ExposedWarStatistics {
		const totalKills =
			statistics.automatonKills +
			statistics.terminidKills +
			statistics.illuminateKills;

		const averageAccuracy =
			(Number(statistics.bulletsFired) / Number(statistics.bulletsHit)) * 100; // in percent

		return {
			factions,
			impactMultiplier: impactMultiplier,
			totalKills: totalKills,
			automatonKills: statistics.automatonKills,
			terminidKills: statistics.terminidKills,
			illuminateKills: statistics.illuminateKills,
			averageAccuracy: `${averageAccuracy}%`,
			bulletsFired: statistics.bulletsFired,
			bulletsHit: statistics.bulletsHit,
			missionSuccessRate: statistics.missionSuccessRate,
		};
	}
}
