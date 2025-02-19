import { CustomError } from './CustomError';

export class LLMError extends CustomError {
  public cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message, 500);
    this.cause = cause;
  }
}