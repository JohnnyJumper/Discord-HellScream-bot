import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { PlanetsCommand } from './commands/planets/planets.command';
import { PlanetUpdateSubCommand } from './commands/planets/update.command';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [PlanetsCommand, PlanetUpdateSubCommand],
})
export class BotModule {}
