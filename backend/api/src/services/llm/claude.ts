import axios from 'axios';
import { LLMConfig, LLMProvider } from './types';

export class ClaudeProvider implements LLMProvider {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async generateCompletion(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const response = await axios.post(
        this.config.apiUrl,
        {
          model: 'claude-3-sonnet-20240229',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 4000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
            'Anthropic-Version': '2023-06-01'
          }
        }
      );
      return response.data.content[0].text;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Claude API call failed: ${error.message}`);
      }
      throw new Error('Claude API call failed with unknown error');
    }
  }
} 