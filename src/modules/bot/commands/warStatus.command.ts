import { Command, Handler } from "@discord-nestjs/core";
import { Logger } from "@nestjs/common";
import { CommandInteraction } from "discord.js";
import { WarStatusTask } from "modules/cronJobs/warStatusTask";
import { PlanetDB } from "modules/helldiversAPI/types";
import { WarStatusAPIService } from "modules/helldiversAPI/warStatus.service";
import { OpenAIService } from "modules/openai/openai.service";
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
		//todo johnny remove duplicate from warStatusTask this might change a lot
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
		await interaction.deleteReply();
	}
}
