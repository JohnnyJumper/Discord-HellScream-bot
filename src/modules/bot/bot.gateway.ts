import { CollectorInterceptor } from "@discord-nestjs/common";
import { On, Once } from "@discord-nestjs/core";
import { Injectable, Logger, UseGuards, UseInterceptors } from "@nestjs/common";
import { Message } from "discord.js";

import { OpenAIService } from "modules/openai/openai.service";
import { BotService } from "./bot.service";
import { MessageFromUserGuard } from "./guards/messageFromUser.guard";
import { MessageToBotGuard } from "./guards/messageToBot.guard";

@Injectable()
export class BotGateway {
	private readonly logger;

	constructor(
		private readonly openai: OpenAIService,
		private readonly botService: BotService,
	) {
		this.logger = new Logger(BotGateway.name);
	}

	@Once("ready")
	onReady(): void {
		this.logger.log("Bot was started!");
	}

	@On("messageCreate")
	@UseInterceptors(CollectorInterceptor)
	@UseGuards(MessageFromUserGuard, MessageToBotGuard)
	async onMessage(message: Message): Promise<void> {
		await this.botService.sendUserReply(message.cleanContent, message.channel);
	}
}
