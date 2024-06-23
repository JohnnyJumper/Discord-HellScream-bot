import { Module } from "@nestjs/common";
import { BotModule } from "modules/bot/bot.module";
import { HellDiversAPIModule } from "modules/helldiversAPI/helldiversAPI.module";
import { NewsTask } from "./newsTask.service";
import { PlanetsTask } from "./planetsTask.service";

@Module({
	imports: [HellDiversAPIModule, BotModule],
	controllers: [],
	providers: [PlanetsTask, NewsTask],
	exports: [PlanetsTask, NewsTask],
})
export class CronModule {}
