import { Module } from '@nestjs/common';
import { PlanetAPIService } from './planet.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [PlanetAPIService],
  exports: [PlanetAPIService],
})
export class HellDiversAPIModule {}
