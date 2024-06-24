import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { PrismaModule } from "modules/prisma/prisma.module";
import { NewsAPIService } from "./news.service";
import { PlanetsAPIService } from "./planet.service";
import { WarStatusAPIService } from "./warStatus.service";

@Module({
	imports: [HttpModule, PrismaModule],
	providers: [WarStatusAPIService, PlanetsAPIService, NewsAPIService],
	exports: [WarStatusAPIService, PlanetsAPIService, NewsAPIService],
})
export class HellDiversAPIModule {}
