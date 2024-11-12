import { Command, Handler } from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { OpenAIService } from 'modules/openai/openai.service';
import { SteamAPIService } from 'modules/steamapi/steamapi.service';

@Command({
  name: 'trending_games',
  description: 'get some trending games',
})
export class GetTrendingGamesCommand {
  private logger: Logger;

  constructor(
    private readonly steamService: SteamAPIService,
    private readonly openAIService: OpenAIService,
  ) {
    this.logger = new Logger(`Command: ${GetTrendingGamesCommand.name}`);
  }

  @Handler()
  async onContributeCommand(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();
    const channel = interaction.channel;
    const customSystemPrompt =
      'Your job is to describe the currently trending game from steam in three parapgraphs each averaging in 10 words';
    const trendingGames = await this.steamService.fetchUniqueTrending();
    const maxTokens = 250;
    for (const gameData of trendingGames) {
      const hints = [
        `You need to delive the following information:\n ###Trending Game Data\n${JSON.stringify(gameData)}`,
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
      await channel?.send({
        embeds: [embed, ...screenshotsEmbeds],
      });
    }
    await interaction.deleteReply();
  }
}
