import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BotService } from 'modules/bot/bot.service';
import { SteamAPIService } from 'modules/steamapi/steamapi.service';

@Injectable()
export class SteamTrendingGameTask {
  private logger: Logger;

  constructor(
    private readonly steamAPIService: SteamAPIService,
    private readonly botService: BotService,
  ) {
    this.logger = new Logger(`CronJob: ${SteamTrendingGameTask.name}`);
  }

  @Cron(CronExpression.EVERY_WEEK, {
    disabled: process.env.NODE_ENV === 'development',
  })
  async fetchTrendingGames() {
    console.log('fetchingTrendingGames started');
    const customSystemPrompt =
      'Your job is to describe the currently trending game from steam using very appealing gamer language';
    const trendingGames = await this.steamAPIService.fetchUniqueTrending();
    for (const gameData of trendingGames) {
      const hint = `You need to delive the following information:\n ###Trendning Game Data\n${JSON.stringify(gameData)}`;
      await this.botService.sendMessageBasedOnHint(
        hint,
        this.botService.gamePropositionChannel,
        undefined,
        customSystemPrompt,
      );
    }
  }
}
