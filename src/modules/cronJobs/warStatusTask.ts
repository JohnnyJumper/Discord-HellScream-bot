import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { BotService } from "modules/bot/bot.service";
import { DiscordTextChannel } from "modules/bot/types";
import { WarStatusAPIService } from "modules/helldiversAPI/warStatus.service";
import { PromptComposer } from "modules/openai/promptComposer.service";

@Injectable()
export class WarStatusTask {
	private logger: Logger;

	constructor(
		private readonly botService: BotService,
		private readonly warStatusService: WarStatusAPIService,
		private readonly promptComposer: PromptComposer,
	) {
		this.logger = new Logger(`CronJob: ${WarStatusTask.name}`);
	}

	@Cron(CronExpression.EVERY_5_HOURS, {
		disabled: process.env.NODE_ENV === "development",
	})
	async reportWarStatus(channel?: DiscordTextChannel) {
		const { activePlanets, ...warStatus } =
			await this.warStatusService.fetchWarStatus();

		const hint = this.promptComposer.buildWarStatusPrompt(
			warStatus,
			activePlanets,
		);

		await this.botService.sendMessageBasedOnHint(hint, channel, 600);
	}
}
