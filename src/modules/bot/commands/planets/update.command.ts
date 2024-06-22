import { SlashCommandPipe } from '@discord-nestjs/common';
import { Handler, IA, SubCommand } from '@discord-nestjs/core';
import { PlanetAPIService } from 'modules/helldiversAPI/planet.service';

export class PlanetUpdateDto {}

@SubCommand({ name: 'update', description: 'Download planet info from db' })
export class PlanetUpdateSubCommand {
  constructor(private readonly planetService: PlanetAPIService) {}

  @Handler()
  async onPlanetUpdateCommand(
    @IA(SlashCommandPipe) dto: PlanetUpdateDto,
  ): Promise<string> {
    await this.planetService.getPlanets();
    return `Success`;
  }
}
