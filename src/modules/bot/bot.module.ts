import { DiscordModule } from "@discord-nestjs/core";
import { Module } from "@nestjs/common";
import { HellDiversAPIModule } from "modules/helldiversAPI/helldiversAPI.module";
import { NewsCommand } from "./commands/news/news.command";
import { PlanetsCommand } from "./commands/planets/planets.command";
import { PlanetsUpdateSubCommand } from "./commands/planets/update.command";

@Module({
	imports: [DiscordModule.forFeature(), HellDiversAPIModule],
	providers: [NewsCommand, PlanetsCommand, PlanetsUpdateSubCommand],
})
export class BotModule {}
