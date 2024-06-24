import { Injectable } from "@nestjs/common";
import { WarStatusTask } from "modules/cronJobs/warStatusTask";
import {
	PlanetDB,
	PlanetStatisticsTypeExposed,
} from "modules/helldiversAPI/types";
import OpenAI from "openai";

type OpenAIMessage = {
	role: "system" | "user" | "assistant";
	content: string;
};

@Injectable()
export class OpenAIService {
	constructor(private readonly openai: OpenAI) {}

	async voice({
		userInput,
		hintInput,
		max_token,
	}: {
		userInput?: string;
		hintInput?: string;
		max_token?: number;
	}): Promise<string | null> {
		if (!userInput && !hintInput) return null;

		const prompts: OpenAIMessage[] = [this.buildSystemPrompt()];
		if (hintInput) {
			prompts.push(this.buildHintPrompt(hintInput));
		}

		if (userInput) {
			prompts.push(this.buildUserPrompt(userInput));
		}

		const completion = await this.openai.chat.completions.create({
			messages: [...prompts],
			model: "gpt-4o",
			max_tokens: max_token ?? 200,
			n: 1,
		});

		return completion.choices[0].message.content;
	}

	constructActivePlanetsPrompt(
		activePlanets: (Omit<PlanetDB, "statistics"> & {
			statistics: PlanetStatisticsTypeExposed;
		})[],
	) {
		const planetsPromptChunks: string[] = ["### Active Planets"];

		for (const planet of activePlanets) {
			const planetStatistics = planet.statistics;
			const prompt =
				`## Planet name ${planet.name} with following biome: ${planet.biome.description}.\n` +
				"# Planet Statistics: " +
				// todo(johnny) move this into some utility
				`${this.toLLMJson(planetStatistics)}`;
			planetsPromptChunks.push(prompt);
		}

		return planetsPromptChunks.join("\n");
	}

	toLLMJson(obj: unknown): string {
		return JSON.stringify(obj, (_key, value) =>
			typeof value === "bigint" ? value.toString() : value,
		);
	}

	private buildUserPrompt(prompt: string): OpenAIMessage {
		return {
			role: "user",
			content: prompt,
		};
	}

	private buildHintPrompt(hint: string): OpenAIMessage {
		return {
			role: "assistant",
			content: `You need to provide the folowing information to the user: ${hint}`,
		};
	}

	private buildSystemPrompt(): OpenAIMessage {
		return {
			role: "system",
			content:
				'You are a general of an army. Your name is "Hellscream". You are outraged and super loud.' +
				'In most of your messages, you are going to refer to users as "Boot, Princess, Slacker, Turd, Maggot" or similar.' +
				"Your job is to agitate your users to play Helldivers by providing them with different news and orders." +
				"You should never imagine that there are new updates. All your messages should be no longer than 100 words",
		};
	}
}
