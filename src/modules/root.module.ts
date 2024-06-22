import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { GatewayIntentBits, Message } from 'discord.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as assert from 'assert';
import { PrismaModule } from 'modules/prisma/prisma.module';
import { BotModule } from './bot/bot.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    HttpModule,
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const token = config.get<string>('DISCORD_BOT_TOKEN');
        const guildId = config.get<string>('GUILD_ID_WITH_COMMANDS');
        assert(token, 'DISCORD_BOT_TOKEN env is not defined');
        assert(guildId, 'GUILD_ID_WITH_COMMANDS env is not defined');

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
  ],
  controllers: [],
  providers: [],
})
export class RootModule {}
