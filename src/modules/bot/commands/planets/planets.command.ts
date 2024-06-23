import { Command } from "@discord-nestjs/core";
import { PlanetsUpdateSubCommand } from "./update.command";

@Command({
	name: "planets",
	description:
		"any information about planets can be accessed using this command",
	include: [PlanetsUpdateSubCommand],
})
export class PlanetsCommand {}
