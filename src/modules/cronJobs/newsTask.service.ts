import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { News } from "@prisma/client";
import { BotService } from "modules/bot/bot.service";
import { NewsAPIService } from "modules/helldiversAPI/news.service";

@Injectable()
export class NewsTask {
	private logger: Logger;

	constructor(
		private readonly newsService: NewsAPIService,
		private readonly botService: BotService,
	) {
		this.logger = new Logger(`CronJob: ${NewsTask.name}`);
	}

	@Cron(CronExpression.EVERY_30_MINUTES, {
		disabled: process.env.NODE_ENV === "development",
	})
	async fetchNews() {
		const allNews = await this.newsService.fetchNews();
		const freshNews: News[] = [];
		for (const news of allNews) {
			const storedRecord = await this.newsService.storeNewsIfNew(news);
			if (storedRecord !== null) {
				freshNews.push(storedRecord);
			}
		}
		this.logger.log(`Got fresh ${freshNews.length} news`);
		for (const fresh of freshNews) {
			const formatedNews = this.formatMessage(fresh.message);
			const hint = `You need to deliver the following news:\n ###\n${formatedNews}`;
			await this.botService.sendMessageBasedOnHint(hint);
		}
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
