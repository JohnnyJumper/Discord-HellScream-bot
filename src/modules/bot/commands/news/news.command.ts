import { Command, Handler } from "@discord-nestjs/core";
import type { CommandInteraction } from "discord.js";
import type { NewsAPIService } from "modules/helldiversAPI/news.service";

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
			.sort((a, b) => a.published - b.published)
			.slice(0, 4);

		const response = "Maggot here is the fresh news from the frontline:";
		await interaction.followUp(response);
		const channel = interaction.channel;
		for (const news of freshNews) {
			await channel?.send(news.message);
		}

		await channel?.send("Now get your ass to the frontline, helldiver!");
	}
}
