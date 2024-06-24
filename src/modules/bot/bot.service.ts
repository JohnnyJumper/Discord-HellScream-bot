import * as assert from "node:assert";
import { InjectDiscordClient } from "@discord-nestjs/core";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
	Client,
	GuildTextBasedChannel,
	TextBasedChannel,
	TextChannel,
} from "discord.js";
import { OpenAIService } from "modules/openai/openai.service";
import { DiscordTextChannel } from "./types";

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

		this.client.on("ready", () => {
			const channel = this.client.channels.cache.get(channelID) as
				| TextChannel
				| undefined;
			assert(channel, "Channel was not given");
			this.channel = channel;
		});
	}

	async sendUserReply(userInput: string, channel?: DiscordTextChannel | null) {
		const message = await this.openai.voice({
			userInput,
		});
		if (message === null) return null;
		if (channel) {
			return channel.send(message);
		}
		return this.channel.send(message);
	}

	async sendMessageBasedOnHint(
		hint: string,
		channel?: DiscordTextChannel | null,
	) {
		const message = await this.openai.voice({
			hintInput: hint,
		});

		if (message === null) return null;
		if (channel) {
			return channel.send(message);
		}
		return this.channel.send(message);
	}
}
