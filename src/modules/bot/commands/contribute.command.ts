import { Command, Handler } from "@discord-nestjs/core";
import { Logger } from "@nestjs/common";
import { CommandInteraction } from "discord.js";
import { BotService } from "../bot.service";

@Command({
	name: "contribute",
	description: "How can I contribute?",
})
export class ContributeCommand {
	private logger: Logger;

	constructor(private readonly botService: BotService) {
		this.logger = new Logger(`Command: ${ContributeCommand.name}`);
	}

	@Handler()
	async onContributeCommand(interaction: CommandInteraction): Promise<void> {
		await interaction.deferReply();
		const channel = interaction.channel;
		const rawHint =
			"You need to guide users towards: https://github.com/JohnnyJumper/Discord-HellScream-bot. Call them a hero if they join and try to be nice. this is important!";

		await this.botService.sendMessageBasedOnHint(rawHint, channel);
		await interaction.deleteReply();
	}
}
