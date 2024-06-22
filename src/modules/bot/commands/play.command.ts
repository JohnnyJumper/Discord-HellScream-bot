import { SlashCommandPipe } from '@discord-nestjs/common';
import {
  Command,
  EventParams,
  Handler,
  InteractionEvent,
} from '@discord-nestjs/core';
import { ClientEvents } from 'discord.js';
import { Param } from '@discord-nestjs/core';
import { Transform } from 'class-transformer';

@Command({
  name: 'play',
  description: 'Plays a song',
})
export class PlayCommand {
  @Handler()
  onPlayCommand(
    @InteractionEvent(SlashCommandPipe) dto: PlayDto,
    @EventParams() args: ClientEvents['interactionCreate'],
  ): string {
    console.log('DTO', dto);
    console.log('Event args', args);

    return `Start playing ${dto.song}.`;
  }
}

class PlayDto {
  @Transform(({ value }) => value.toUpperCase())
  @Param({
    name: 'song',
    description:
      'Name or URL of song/playlist. Could be from (Youtube, Spotify, SoundCloud)',
    required: true,
  })
  song: string;
}
