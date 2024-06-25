import { Injectable, Logger } from "@nestjs/common";
import {
	ExposedWarStatistics,
	PlanetDB,
	PlanetStatisticsTypeExposed,
} from "modules/helldiversAPI/types";

@Injectable()
export class PromptComposer {
	private logger: Logger;

	constructor() {
		this.logger = new Logger(PromptComposer.name);
	}

	buildSystemPrompt(): string {
		return (
			'You are a general of an army. Your name is "Hellscream". You are outraged and super loud.' +
			'In most of your messages, you are going to refer to users as "Boot, Princess, Slacker, Turd, Maggot" or similar.' +
			"Your job is to agitate your users to play Helldivers by providing them with different news and orders." +
			"You should never imagine that there are new updates. All your messages should be no longer than 200 words"
		);
	}

	buildPlanetStatusChangePrompt(
		statusedChangedPlanets: {
			index: number;
			from: string;
			to: string;
			name: string;
		}[],
	): string | null {
		const promptLines = ["### Planet Status Report"];

		if (statusedChangedPlanets.length === 0) {
			return null;
		}
		statusedChangedPlanets.map((planet) => {
			const statusPrompt = planet.to === "Humans" ? "Good Job!" : "Bad Job!";
			const promptLine =
				`Planet **${planet.name}** status has changed.` +
				`It used to belong to **${planet.from}** and now is under **${planet.to}** controll.` +
				statusPrompt;

			promptLines.push(promptLine);
		});

		return promptLines.join("\n");
	}

	buildWarStatusPrompt(
		warStatus: ExposedWarStatistics,
		activePlanets: (Omit<PlanetDB, "statistics"> & {
			statistics: PlanetStatisticsTypeExposed;
		})[],
	): string {
		const planetsPrompt = this.buildActivePlanetsPrompt(activePlanets);
		return (
			"You need to deliver the most important information about current war status:\n" +
			`### War Status\n${this.toLLMJson(warStatus)}\n` +
			`${planetsPrompt}` +
			"\n\n Never imagine numbers, always use the data from provided context especially with numbers"
		);
	}

	buildActivePlanetsPrompt(
		activePlanets: (Omit<PlanetDB, "statistics"> & {
			statistics: PlanetStatisticsTypeExposed;
		})[],
	): string {
		const planetsPromptChunks: string[] = [
			"### Active Planets",
			"You should alway tell about planet name, biome and hazards.",
		];

		for (const planet of activePlanets) {
			const planetStatistics = planet.statistics;
			const planetHazards = planet.hazards;
			const prompt =
				`## Planet name ${planet.name} with following biome: ${planet.biome.description}.\n` +
				`${this.toLLMJson({ ...planetStatistics, planetHazards })}`;
			planetsPromptChunks.push(prompt);
		}

		return planetsPromptChunks.join("\n");
	}

	toLLMJson(obj: unknown): string {
		return JSON.stringify(obj, (_key, value) =>
			typeof value === "bigint" ? value.toString() : value,
		);
	}
}
