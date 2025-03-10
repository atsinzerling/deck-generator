// import { Configuration, OpenAIApi } from 'openai';
import OpenAI from 'openai';
import { LLMConfig, LLMProvider, LLMModels } from './types';
import logger from '../../utils/logger';
import { LLMError } from '../../errors/LLMError';

export class OpenAIProvider implements LLMProvider {
  private openai: OpenAI;

  constructor(config: LLMConfig) {
    // Initialize OpenAI with the provided configuration
    this.openai = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.apiUrl,
    });
  }

  async generateCompletion(systemPrompt: string, userPrompt: string, model?: LLMModels): Promise<string> {
    try {
      // logger.debug(`OpenAI Request - System Prompt: ${systemPrompt}`);
      logger.debug(`OpenAI Request - User Prompt: ${userPrompt}`);
      const useModel = model;
      
      logger.info(`Using OpenAI model: ${useModel}`);

      const completion = await this.openai.chat.completions.create({
        model: useModel as string,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 8000,
        store: false,
      });

      const message = completion.choices[0].message;
      const content = message?.content?.trim();
      logger.debug(`OpenAI Response: ${content}`);
      
      if (completion.usage) {
        logger.info(`Token usage - Input: ${completion.usage.prompt_tokens}, Output: ${completion.usage.completion_tokens}, Total: ${completion.usage.total_tokens}`);
      }

      return content || '';
    } catch (error: any) {
      throw new LLMError(`OpenAI API call failed: ${error.message}`, error);
    }
  }
} 