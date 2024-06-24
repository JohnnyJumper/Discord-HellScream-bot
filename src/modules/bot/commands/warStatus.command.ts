import { Command, Handler } from "@discord-nestjs/core";
import { Logger } from "@nestjs/common";
import { CommandInteraction } from "discord.js";
import { WarStatusTask } from "modules/cronJobs/warStatusTask";
import { PlanetDB } from "modules/helldiversAPI/types";
import { WarStatusAPIService } from "modules/helldiversAPI/warStatus.service";
import { OpenAIService } from "modules/openai/openai.service";
import { PromptComposer } from "modules/openai/promptComposer.service";
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
		private readonly promptComposer: PromptComposer,
	) {
		this.logger = new Logger(`Command: ${WarStatusCommand.name}`);
	}

	@Handler()
	async onWarStatusCommand(interaction: CommandInteraction): Promise<void> {
		await interaction.deferReply();
		const { activePlanets, ...warStatus } =
			await this.warStatusService.fetchWarStatus();
		const hint = this.promptComposer.buildWarStatusPrompt(
			warStatus,
			activePlanets,
		);
		const response = await this.botService.getVoicedHintMessage(hint, 600);
		if (response === null) {
			await interaction.followUp("something went wrong ping johnny");
			return;
		}
		await interaction.followUp(response);
	}
}
