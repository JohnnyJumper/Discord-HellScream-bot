import * as assert from "node:assert";
import { DiscordModule } from "@discord-nestjs/core";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GatewayIntentBits } from "discord.js";
import { PrismaModule } from "modules/prisma/prisma.module";
import { BotModule } from "./bot/bot.module";
import { OpenAiModule } from "./openai/openai.module";

@Module({
	imports: [
		PrismaModule,
		HttpModule,
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		DiscordModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (config: ConfigService) => {
				const token = config.get<string>("DISCORD_BOT_TOKEN");
				const guildId = config.get<string>("GUILD_ID_WITH_COMMANDS");
				assert(token, "DISCORD_BOT_TOKEN env is not defined");
				assert(guildId, "GUILD_ID_WITH_COMMANDS env is not defined");

				return {
					token,
					discordClientOptions: {
						intents: [
							GatewayIntentBits.Guilds,
							GatewayIntentBits.GuildMessages,
							GatewayIntentBits.MessageContent,
						],
					},
					registerCommandOptions: [
						{
							forGuild: guildId,
							removeCommandsBefore: true,
						},
					],
					failOnLogin: true,
				};
			},
			inject: [ConfigService],
		}),
		BotModule,
		OpenAiModule,
	],
	controllers: [],
	providers: [],
})
export class RootModule {}
