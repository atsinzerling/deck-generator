import axios from 'axios';
import { LLMConfig, LLMProvider } from './types';

export class DeepseekProvider implements LLMProvider {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async generateCompletion(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const response = await axios.post(
        this.config.apiUrl,
        {
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Deepseek API call failed: ${error.message}`);
      }
      throw new Error('Deepseek API call failed with unknown error');
    }
  }
} 