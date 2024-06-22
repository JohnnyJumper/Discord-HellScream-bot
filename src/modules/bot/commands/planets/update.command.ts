import { SlashCommandPipe } from '@discord-nestjs/common';
import { Handler, IA, SubCommand } from '@discord-nestjs/core';

export class PlanetUpdateDto {}

@SubCommand({ name: 'update', description: 'Download planet info from db' })
export class PlanetUpdateSubCommand {
  @Handler()
  onPlanetUpdateCommand(@IA(SlashCommandPipe) dto: PlanetUpdateDto): string {
    return `Success`;
  }
}
