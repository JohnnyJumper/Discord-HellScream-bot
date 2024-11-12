import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SteamAPIService } from './steamapi.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [SteamAPIService],
  exports: [SteamAPIService],
})
export class SteamAPIModule {}
