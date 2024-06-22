import { Command } from '@discord-nestjs/core';
import { PlanetUpdateSubCommand } from './update.command';

@Command({
  name: 'planets',
  description:
    'any information about planets can be accessed using this command',
  include: [PlanetUpdateSubCommand],
})
export class PlanetsCommand {}
