import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { BotService } from "modules/bot/bot.service";
import { WarStatusType } from "modules/helldiversAPI/types";
import { WarStatusAPIService } from "modules/helldiversAPI/warStatus.service";
import { PrismaService } from "modules/prisma/prisma.service";

@Injectable()
export class WarStatusTask {
	private logger: Logger;

	constructor(
		private readonly prisma: PrismaService,
		private readonly botService: BotService,
		private readonly warStatusService: WarStatusAPIService,
	) {
		this.logger = new Logger(`CronJob: ${WarStatusTask.name}`);
	}

	@Cron(CronExpression.EVERY_3_HOURS, {
		disabled: process.env.NODE_ENV === "development",
	})
	async fetchWarStatus() {
		const warStatus = await this.warStatusService.fetchWarStatus();
		const updatedData = await this.prisma.createOrUpdateWarStatus(warStatus);
		const exposedWarStatistics = this.exposeWarStatistics(updatedData);
		const hint = `You need to deliver the most important information about current war status:\n### War Status\n${this.toJson(
			exposedWarStatistics,
		)})}`;
		return this.botService.sendMessageBasedOnHint(hint);
	}

	private exposeWarStatistics({
		statistics,
		factions,
		impactMultiplier,
		..._warstatus
	}: WarStatusType) {
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

	private toJson(obj: unknown): string {
		return JSON.stringify(obj, (_key, value) =>
			typeof value === "bigint" ? value.toString() : value,
		);
	}
}
