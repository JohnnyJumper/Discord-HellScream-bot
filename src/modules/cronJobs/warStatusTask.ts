import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { BotService } from "modules/bot/bot.service";
import { DiscordTextChannel } from "modules/bot/types";
import { WarStatusAPIService } from "modules/helldiversAPI/warStatus.service";

@Injectable()
export class WarStatusTask {
	private logger: Logger;

	constructor(
		private readonly botService: BotService,
		private readonly warStatusService: WarStatusAPIService,
	) {
		this.logger = new Logger(`CronJob: ${WarStatusTask.name}`);
	}

	@Cron(CronExpression.EVERY_3_HOURS, {
		disabled: process.env.NODE_ENV === "development",
	})
	async reportWarStatus(channel?: DiscordTextChannel) {
		//todo johnny remove duplicate from warStatusCommand this might change a lot
		const { activePlanets, ...warStatus } =
			await this.warStatusService.fetchWarStatus();

		const planetsPrompt =
			await this.botService.constructActivePlanetsPrompt(activePlanets);

		const rawHint =
			"You need to deliver the most important information about current war status:\n" +
			`### War Status\n${WarStatusTask.toLLMJson(warStatus)}` +
			"### Active Planets\nMake sure to include planet name, biome, and all importand statistics about this planet" +
			`${planetsPrompt}` +
			"\n\n Never imagine numbers, always use the data from provided context especially with numbers";

		await this.botService.sendMessageBasedOnHint(rawHint, channel, 600);
	}

	static toLLMJson(obj: unknown): string {
		return JSON.stringify(obj, (_key, value) =>
			typeof value === "bigint" ? value.toString() : value,
		);
	}
}
