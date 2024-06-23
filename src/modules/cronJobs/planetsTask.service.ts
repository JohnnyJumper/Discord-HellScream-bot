import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PlanetsAPIService } from "modules/helldiversAPI/planet.service";
import { PrismaService } from "modules/prisma/prisma.service";

@Injectable()
export class PlanetsTask {
	private logger: Logger;

	constructor(
		private readonly prisma: PrismaService,
		private readonly planetService: PlanetsAPIService,
	) {
		this.logger = new Logger(`CronJob: ${PlanetsTask.name}`);
	}

	@Cron(CronExpression.EVERY_10_SECONDS, {
		disabled: process.env.NODE_ENV === "development",
	})
	async fetchPlanets() {
		const planetsData = await this.planetService.fetchPlanetsData();
		this.logger.log(`Fetched ${planetsData.length} planets`);
		let createdOrUpdated = 0;
		for (const planetData of planetsData) {
			await this.prisma.updateOrCreatePlanet(planetData);
			createdOrUpdated += 1;
		}
		this.logger.log(`Updated ${createdOrUpdated} planets`);
	}
}
