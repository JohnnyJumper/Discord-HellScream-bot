import { Module } from "@nestjs/common";
import { HellDiversAPIModule } from "modules/helldiversAPI/helldiversAPI.module";
import { RefetchPlanets } from "./refetchPlanets.service";

@Module({
	imports: [HellDiversAPIModule],
	controllers: [],
	providers: [RefetchPlanets],
	exports: [RefetchPlanets],
})
export class CronModule {}
