import * as assert from "node:assert";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { OpenAIService } from "./openai.service";

@Module({
	imports: [ConfigModule],
	providers: [
		{
			provide: OpenAI,
			useFactory: (config: ConfigService) => {
				const apiKey = config.get<string>("OPENAI_API_KEY");
				assert(apiKey, "OPENAI_API_KEY env is not defined");
				return new OpenAI({
					apiKey,
				});
			},
			inject: [ConfigService],
		},
		OpenAIService,
	],
	exports: [OpenAIService],
})
export class OpenAiModule {}
