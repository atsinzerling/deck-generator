export interface LLMConfig {
  apiKey: string;
  apiUrl: string; // Optional for providers like OpenAI that have fixed endpoints
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMProvider {
  generateCompletion(systemPrompt: string, userPrompt: string): Promise<string>;
} 