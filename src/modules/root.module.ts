import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { GatewayIntentBits } from 'discord.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as assert from 'assert';
import { PrismaModule } from 'modules/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const token = config.get<string>('DISCORD_BOT_TOKEN');
        assert(token, 'DISCORD_BOT_TOKEN is not defined');
        return {
          token,
          discordClientOptions: {
            intents: [GatewayIntentBits.Guilds],
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class RootModule {}
