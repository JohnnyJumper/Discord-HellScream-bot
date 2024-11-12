import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { PromptComposer } from './promptComposer.service';

type OpenAIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

//todo enhance the robustness of the service to allow different system prompts in a better way
@Injectable()
export class OpenAIService {
  constructor(
    private readonly openai: OpenAI,
    private readonly promptComposer: PromptComposer,
  ) {}

  async voice({
    userInput,
    hintInput,
    max_token,
    custom_system_prompt,
  }: {
    userInput?: string;
    hintInput?: string;
    max_token?: number;
    custom_system_prompt?: string;
  }): Promise<string | null> {
    if (!userInput && !hintInput) return null;

    const prompts: OpenAIMessage[] = [];
    if (custom_system_prompt) {
      prompts.push({
        role: 'system',
        content: custom_system_prompt,
      });
    } else {
      prompts.push(this.buildSystemPrompt());
    }

    if (hintInput) {
      prompts.push(this.buildHintPrompt(hintInput));
    }

    if (userInput) {
      prompts.push(this.buildUserPrompt(userInput));
    }

    const completion = await this.openai.chat.completions.create({
      messages: [...prompts],
      model: 'gpt-4o',
      max_tokens: max_token ?? 200,
      n: 1,
    });

    return completion.choices[0].message.content;
  }

  private buildUserPrompt(prompt: string): OpenAIMessage {
    return {
      role: 'user',
      content: prompt,
    };
  }

  private buildHintPrompt(hint: string): OpenAIMessage {
    return {
      role: 'assistant',
      content: `You need to provide the folowing information to the user: ${hint}`,
    };
  }

  private buildSystemPrompt(): OpenAIMessage {
    const systemPrompt = this.promptComposer.buildSystemPrompt();
    return {
      role: 'system',
      content: systemPrompt,
    };
  }
}
