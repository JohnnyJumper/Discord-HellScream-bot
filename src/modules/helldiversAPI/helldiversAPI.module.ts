import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { PrismaModule } from "modules/prisma/prisma.module";
import { NewsAPIService } from "./news.service";
import { PlanetsAPIService } from "./planet.service";

@Module({
	imports: [HttpModule, PrismaModule],
	providers: [PlanetsAPIService, NewsAPIService],
	exports: [PlanetsAPIService, NewsAPIService],
})
export class HellDiversAPIModule {}
