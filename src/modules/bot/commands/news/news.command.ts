import { Command, Handler } from "@discord-nestjs/core";
import { type CommandInteraction, SlashCommandBuilder } from "discord.js";
import { NewsAPIService } from "modules/helldiversAPI/news.service";

@Command({
	name: "news",
	description: "Get fresh news from frontline",
	include: [],
})
export class NewsCommand {
	constructor(private readonly newsService: NewsAPIService) {}

	@Handler()
	async onNewsCommand(interaction: CommandInteraction): Promise<void> {
		await interaction.deferReply();

		const news = await this.newsService.fetchAndStoreNews();
		const freshNews = news
			.sort((a, b) => b.published - a.published)
			.slice(0, 3);

		const response = "*Maggot* here is the fresh news from the frontline:\n";
		await interaction.followUp(response);
		const channel = interaction.channel;

		for (const news of freshNews) {
			const response = `\n${this.formatMessage(news.message)}\n`;
			await channel?.send(response);
		}

		await channel?.send("Now get your ass to the frontline, helldiver!");
	}

	private formatMessage(message: string): string {
		const lines = message.split("\n");
		const title = `**${lines[0].replaceAll("<i=1>", "*").replaceAll("</i>", "*")}**`;
		const body =
			lines[1] === ""
				? lines[2].replaceAll("<i=1>", "*").replaceAll("</i>", "*")
				: lines[1].replaceAll("<i=1>", "*").replaceAll("</i>", "*");

		const formated = `${title}\n${body}`;

		return formated;
	}
}
