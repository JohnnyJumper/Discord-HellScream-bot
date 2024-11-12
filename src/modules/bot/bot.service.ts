import * as assert from 'node:assert';
import { InjectDiscordClient } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, TextChannel } from 'discord.js';
import { OpenAIService } from 'modules/openai/openai.service';
import { DiscordTextChannel } from './types';

@Injectable()
export class BotService {
  private logger: Logger;
  public helldiverChannel: TextChannel;
  public gamePropositionChannel: TextChannel;

  constructor(
    @InjectDiscordClient()
    private client: Client,
    private readonly openai: OpenAIService,
    private readonly config: ConfigService,
  ) {
    this.logger = new Logger(BotService.name);

    const helldiverChannelID = this.config.get<string>('CHANNEL_ID');
    assert(helldiverChannelID, 'CHANNEL_ID env variable is not defined');

    const gamePropositionChannelID = this.config.get<string>(
      'GAME_PROPOSITION_CHANNEL_ID',
    );
    assert(
      gamePropositionChannelID,
      'GAME_PROPOSITION_CHANNEL_ID env variable is not defined',
    );

    this.client.on('ready', () => {
      const helldiversChannel = this.client.channels.cache.get(
        helldiverChannelID,
      ) as TextChannel | undefined;
      assert(helldiversChannel, 'Helldivers Channel was not provided');
      this.helldiverChannel = helldiversChannel;

      const gamePropositionChannel = this.client.channels.cache.get(
        gamePropositionChannelID,
      ) as TextChannel | undefined;
      assert(
        gamePropositionChannel,
        'Game proposition channel was not provided',
      );
      this.gamePropositionChannel = gamePropositionChannel;
    });
  }

  async sendRawMessageToChannel(
    message: string,
    channel?: DiscordTextChannel | null,
  ) {
    if (channel) {
      return channel.send(message);
    }
    return this.helldiverChannel.send(message);
  }

  async getVoicedUserMessage(
    input: string,
    max_token?: number,
    custom_system_prompt?: string,
  ) {
    return this.openai.voice({
      userInput: input,
      max_token,
      custom_system_prompt,
    });
  }

  async getVoicedHintMessage(
    hint: string,
    max_token?: number,
    custom_system_prompt?: string,
  ) {
    return this.openai.voice({
      hintInput: hint,
      max_token,
      custom_system_prompt,
    });
  }

  async sendUserReply(
    userInput: string,
    channel?: DiscordTextChannel | null,
    custom_system_prompt?: string,
  ) {
    const message = await this.openai.voice({
      userInput,
      custom_system_prompt,
    });
    if (message === null) return null;
    if (channel) {
      return channel.send(message);
    }
    return this.helldiverChannel.send(message);
  }

  async sendMessageBasedOnHint(
    hint: string,
    channel?: DiscordTextChannel | null,
    max_token?: number,
    custom_system_prompt?: string,
  ) {
    const message = await this.openai.voice({
      hintInput: hint,
      max_token,
      custom_system_prompt,
    });

    if (message === null) return null;
    if (channel) {
      return channel.send(message);
    }
    return this.helldiverChannel.send(message);
  }
}
