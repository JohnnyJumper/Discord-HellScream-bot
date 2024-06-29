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

	buildWarStatusPrompt(warStatus: ExposedWarStatistics): string {
		const warStatusPromptChunks: string[] = [
			"You need to summarize the most important information about the current war status on the frontline.",
			"Never image any numbers. You need to deliver the summarization of the status in 700 characters max!",
			"Make sure to deliver the information in separate paragraphs.",
			"IT IS VERY IMPORTANT THAT YOU WILL NOT ADDRESS USERS IN ANY WAY AT THE END OF YOUR RESPONSE",
			"YOU WILL NOT GIVE USERS COMMANDS AT THE END AND WILL JUST PROVIDE THE SUMMARIZATION ONLY!",
			"### War Status",
			this.toLLMJson(warStatus),
		];

		return warStatusPromptChunks.join("\n");
	}

	buildActivePlanetsPrompt(
		activePlanets: (Omit<PlanetDB, "statistics"> & {
			statistics: PlanetStatisticsTypeExposed;
		})[],
	): string {
		const planetsPromptChunks: string[] = [
			"Could you summarize the most important information about the current active planets on the frontline?",
			"Never image any numbers. Could you deliver the summarization of the status in 700 characters max?",
			"Please make sure the planet name is bolded with ** on both side and always include information about hazards",
			"Could you make sure to deliver the information in separate paragraphs?",
			"Make sure not to address users in any way at the begining of your response!",
			"### Active Planets",
		];

		for (const planet of activePlanets) {
			planetsPromptChunks.push(this.toLLMJson(planet));
		}

		return planetsPromptChunks.join("\n");
	}

	toLLMJson(obj: unknown): string {
		return JSON.stringify(obj, (_key, value) =>
			typeof value === "bigint" ? value.toString() : value,
		);
	}
}
