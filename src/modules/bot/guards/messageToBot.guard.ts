import * as assert from "node:assert";
import { CanActivate, ExecutionContext, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MessageMentions } from "discord.js";

export class MessageToBotGuard implements CanActivate {
	private botId: string;

	constructor(@Inject(ConfigService) private config: ConfigService) {
		const botId = this.config.get<string>("BOT_ID");
		assert(botId, "BOT_ID env is not defined");
		this.botId = botId;
	}

	canActivate(context: ExecutionContext): boolean {
		const message = context.getArgByIndex(0);
		const mentions = message.mentions as MessageMentions<true>;
		return Array.from(mentions.users.keys()).some(
			(user) => user === this.botId,
		);
	}
}
