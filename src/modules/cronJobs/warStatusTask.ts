import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { BotService } from "modules/bot/bot.service";
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

		const hint = `You need to deliver the most important information about current war status:\n### War Status\n${JSON.stringify(
			updatedData,
			(key, value) => (typeof value === "bigint" ? value.toString() : value), // return everything else unchanged
		)}`;
		return this.botService.sendMessageBasedOnHint(hint);
	}
}
