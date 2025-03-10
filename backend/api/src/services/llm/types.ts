export interface LLMConfig {
  apiKey: string;
  apiUrl: string; // Optional for providers like OpenAI that have fixed endpoints
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMProvider {
  generateCompletion(systemPrompt: string, userPrompt: string, model?: string): Promise<string>;
}

export enum LLMModels {
  // OpenAI models
  GPT4O_MINI = 'gpt-4o-mini',
  
  // Gemini models
  GEMINI_15_8B = 'gemini-1.5-8b', // not found for API version v1beta 
  GEMINI_20_FLASH = 'gemini-2.0-flash',
} 