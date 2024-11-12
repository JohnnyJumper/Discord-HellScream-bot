import { Module } from '@nestjs/common';
import { BotModule } from 'modules/bot/bot.module';
import { HellDiversAPIModule } from 'modules/helldiversAPI/helldiversAPI.module';
import { OpenAiModule } from 'modules/openai/openai.module';
import { SteamAPIModule } from 'modules/steamapi/steamapi.module';
import { NewsTask } from './newsTask.task';
import { PlanetsTask } from './planetsTask.task';
import { SteamTrendingGameTask } from './steamTrendingGame.task';
import { WarStatusTask } from './warStatusTask';

@Module({
  imports: [HellDiversAPIModule, BotModule, OpenAiModule, SteamAPIModule],
  controllers: [],
  providers: [PlanetsTask, NewsTask, WarStatusTask, SteamTrendingGameTask],
  exports: [PlanetsTask, NewsTask, WarStatusTask, SteamTrendingGameTask],
})
export class CronModule {}
