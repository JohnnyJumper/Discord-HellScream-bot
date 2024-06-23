import * as assert from "node:assert";
import { InjectDiscordClient } from "@discord-nestjs/core";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client, TextChannel } from "discord.js";
import { OpenAIService } from "modules/openai/openai.service";

@Injectable()
export class BotService {
	private logger: Logger;
	private channel: TextChannel;

	constructor(
		@InjectDiscordClient()
		private client: Client,
		private readonly openai: OpenAIService,
		private readonly config: ConfigService,
	) {
		this.logger = new Logger(BotService.name);

		const channelID = this.config.get<string>("CHANNEL_ID");
		assert(channelID, "CHANNEL_ID env variable is not defined");

		client.on("ready", () => {
			const channel = client.channels.cache.get(channelID) as
				| TextChannel
				| undefined;
			assert(channel, "Channel was not given");
			this.channel = channel;
		});
	}

	async sendMessageBasedOnHint(hint: string) {
		const message = await this.openai.voice({
			hintInput: hint,
		});

		if (message === null) return null;
		return this.channel.send(message);
	}
}
