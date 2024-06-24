import { Command, Handler } from "@discord-nestjs/core";
import { Logger } from "@nestjs/common";
import { CommandInteraction } from "discord.js";
import { WarStatusTask } from "modules/cronJobs/warStatusTask";
import { WarStatusAPIService } from "modules/helldiversAPI/warStatus.service";
import { BotService } from "../bot.service";

@Command({
	name: "war-status",
	description: "What is the current status of the war",
})
export class WarStatusCommand {
	private logger: Logger;

	constructor(
		private readonly botService: BotService,
		private readonly warStatusService: WarStatusAPIService,
	) {
		this.logger = new Logger(`Command: ${WarStatusCommand.name}`);
	}

	@Handler()
	async onWarStatusCommand(interaction: CommandInteraction): Promise<void> {
		await interaction.deferReply();
		const channel = interaction.channel;
		const warStatus = await this.warStatusService.fetchWarStatus();

		const rawHint =
			"You need to deliver the most important information about current war status:\n" +
			`### War Status\n${WarStatusTask.toLLMJson(warStatus)}`;

		await this.botService.sendMessageBasedOnHint(rawHint, channel);
		await interaction.deleteReply();
	}
}
