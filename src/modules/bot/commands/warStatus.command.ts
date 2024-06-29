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

		const warStatusHint = this.promptComposer.buildWarStatusPrompt(warStatus);
		const activePlanetsHint =
			this.promptComposer.buildActivePlanetsPrompt(activePlanets);

		const warStatusMessage =
			await this.botService.getVoicedHintMessage(warStatusHint);
		const activePlanetsMessage =
			await this.botService.getVoicedHintMessage(activePlanetsHint);

		await interaction.followUp(`${warStatusMessage}\n${activePlanetsMessage}`);
	}
}
