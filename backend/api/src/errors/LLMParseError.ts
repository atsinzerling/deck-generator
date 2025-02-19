import { LLMError } from './LLMError';

export class LLMParseError extends LLMError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}