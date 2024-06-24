import { Module } from "@nestjs/common";
import { BotModule } from "modules/bot/bot.module";
import { HellDiversAPIModule } from "modules/helldiversAPI/helldiversAPI.module";
import { NewsTask } from "./newsTask.task";
import { PlanetsTask } from "./planetsTask.task";
import { WarStatusTask } from "./warStatusTask";

@Module({
	imports: [HellDiversAPIModule, BotModule],
	controllers: [],
	providers: [PlanetsTask, NewsTask, WarStatusTask],
	exports: [PlanetsTask, NewsTask, WarStatusTask],
})
export class CronModule {}
