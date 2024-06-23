import { DiscordModule } from "@discord-nestjs/core";
import { Module } from "@nestjs/common";
import { HellDiversAPIModule } from "modules/helldiversAPI/helldiversAPI.module";
import { OpenAiModule } from "modules/openai/openai.module";
import { NewsCommand } from "./commands/news/news.command";
@Module({
	imports: [DiscordModule.forFeature(), HellDiversAPIModule, OpenAiModule],
	providers: [NewsCommand],
})
export class BotModule {}
