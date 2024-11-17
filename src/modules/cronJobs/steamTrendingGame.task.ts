import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmbedBuilder } from 'discord.js';
import { BotService } from 'modules/bot/bot.service';
import { OpenAIService } from 'modules/openai/openai.service';
import { SteamAPIService } from 'modules/steamapi/steamapi.service';
@Injectable()
export class SteamTrendingGameTask {
  private logger: Logger;

  constructor(
    private readonly steamAPIService: SteamAPIService,
    private readonly openAIService: OpenAIService,
    private readonly botService: BotService,
  ) {
    this.logger = new Logger(`CronJob: ${SteamTrendingGameTask.name}`);
  }

  @Cron(CronExpression.EVERY_WEEK, {
    disabled: process.env.NODE_ENV === 'development',
  })
  async fetchTrendingGames() {
    const customSystemPrompt =
      'Your job is to describe the currently trending game from steam in three parapgraphs each averaging in 10 words';
    const trendingGames = await this.steamAPIService.fetchUniqueTrending();
    const maxTokens = 250;
    for (const gameData of trendingGames) {
      const hints = [
        `You need to deliver the following information:\n ###Trending Game Data\n${JSON.stringify(gameData)}`,
        'Make sure to use ** symbol around the word with high emphasys to make them bold',
        'Make sure to use at least 3 and maximum 5 unique emojis in your response',
        'Never use any links in your response',
      ];

      const description = await this.openAIService.voice({
        custom_system_prompt: customSystemPrompt,
        hintInput: hints.join('\n'),
        max_token: maxTokens,
      });
      if (!description) {
        this.logger.error('No description was generated skipping');
        continue;
      }
      const embed = new EmbedBuilder();
      embed.setThumbnail(gameData.header_image);
      embed.setTitle(gameData.name);
      embed.setURL(gameData.steam_link);
      if (gameData.is_free) {
        embed.addFields({
          name: 'Price',
          value: 'Free',
          inline: true,
        });
      } else {
        if (gameData.initial_formatted) {
          embed.addFields({
            name: 'Original price',
            value: gameData.initial_formatted,
            inline: true,
          });
        }

        if (gameData.price_formatted) {
          embed.addFields({
            name: 'Current price',
            value: gameData.price_formatted,
            inline: true,
          });
        }
      }
      embed.setFooter({
        text: `Developers: ${gameData.authors}\nCategories: ${gameData.categories}`,
      });
      embed.setDescription(description);

      const screenshotsEmbeds = gameData.screenshots
        .split(',')
        .map((screenshotUrl) =>
          new EmbedBuilder()
            .setURL(gameData.steam_link)
            .setImage(screenshotUrl),
        );
      await this.botService.gamePropositionChannel.send({
        embeds: [embed, ...screenshotsEmbeds],
      });
    }
  }
}
