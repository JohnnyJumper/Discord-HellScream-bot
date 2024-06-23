import { Handler, SubCommand } from "@discord-nestjs/core";
import type { PlanetsAPIService } from "modules/helldiversAPI/planet.service";

export class PlanetUpdateDto {}

@SubCommand({ name: "update", description: "Download planet info from db" })
export class PlanetsUpdateSubCommand {
	constructor(private readonly planetService: PlanetsAPIService) {}

	@Handler()
	async onPlanetUpdateCommand(): Promise<string> {
		// await this.planetService.getPlanets();
		return "Success";
	}
}
