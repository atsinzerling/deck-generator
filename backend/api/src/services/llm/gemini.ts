import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMConfig, LLMProvider, LLMModels } from './types';
import logger from '../../utils/logger';
import { LLMError } from '../../errors/LLMError';

export class GeminiProvider implements LLMProvider {
  private genAI: GoogleGenerativeAI;

  constructor(config: LLMConfig) {
    this.genAI = new GoogleGenerativeAI(config.apiKey);
  }

  async generateCompletion(systemPrompt: string, userPrompt: string, model?: LLMModels): Promise<string> {
    try {
      const useModel = model;
      logger.info(`Using Gemini model: ${useModel}`);
      logger.debug(`Gemini Request - User Prompt: ${userPrompt}`);

      // Create combined prompt with system prompt included
      const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
      
      const genModel = this.genAI.getGenerativeModel({ model: useModel as string });
      
      const result = await genModel.generateContent(combinedPrompt);
      const response = result.response;
      const content = response.text().trim();
      
      logger.debug(`Gemini Response: ${content}`);
      
      if (response.usageMetadata) {
        logger.info(`Token usage - Input: ${response.usageMetadata.promptTokenCount}, Output: ${response.usageMetadata.candidatesTokenCount}, Total: ${response.usageMetadata.totalTokenCount}`);
      }
      
      return content;
    } catch (error: any) {
      throw new LLMError(`Gemini API call failed: ${error.message}`, error);
    }
  }
} 