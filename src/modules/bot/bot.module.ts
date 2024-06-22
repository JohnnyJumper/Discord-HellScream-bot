import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { PlanetsCommand } from './commands/planets/planets.command';
import { PlanetUpdateSubCommand } from './commands/planets/update.command';
import { HellDiversAPIModule } from 'modules/helldiversAPI/helldiversAPI.module';

@Module({
  imports: [DiscordModule.forFeature(), HellDiversAPIModule],
  providers: [PlanetsCommand, PlanetUpdateSubCommand],
})
export class BotModule {}
