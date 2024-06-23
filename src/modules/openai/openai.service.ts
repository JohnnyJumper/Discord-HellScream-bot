import { Injectable } from "@nestjs/common";
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
	}: {
		userInput?: string;
		hintInput?: string;
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
			max_tokens: 200,
			n: 1,
		});

		return completion.choices[0].message.content;
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
				"You should never imagine that there are new updates out." +
				"All your message should be not longer than 100 words",
		};
	}
}
