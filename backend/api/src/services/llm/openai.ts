// import { Configuration, OpenAIApi } from 'openai';
import OpenAI from 'openai';
import { LLMConfig, LLMProvider } from './types';
import logger from '../../utils/logger';

export class OpenAIProvider implements LLMProvider {
  private openai: OpenAI;

  constructor(config: LLMConfig) {
    // Initialize OpenAI with the provided configuration
    this.openai = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.apiUrl, // Include if apiUrl is provided
    });
  }

  async generateCompletion(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      logger.debug(`OpenAI Request - System Prompt: ${systemPrompt}`);
      logger.debug(`OpenAI Request - User Prompt: ${userPrompt}`);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Ensure the model name is correct
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
        store: true, // Include if needed based on your requirements
      });

      const message = completion.choices[0].message;
      const content = message?.content?.trim();
      logger.debug(`OpenAI Response: ${content}`);

      return content || '';
    } catch (error: any) {
      logger.error(`OpenAI API call failed: ${error.message}`);
      throw new Error(`OpenAI API call failed: ${error.message}`);
    }
  }
} 