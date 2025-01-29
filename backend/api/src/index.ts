import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import 'express-async-errors';
import { closeDB } from './db';
import { DeckService } from './services/deck.service';
import { DeckController } from './controllers/deck.controller';
import { setupDeckRoutes } from './routes/deck.routes';
import { OpenAIProvider } from './services/llm/openai';
import { LLMConfig } from './services/llm/types';
import logger from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { requestLogger } from './middleware/requestLogger';

dotenv.config();

async function main() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  const deckService = new DeckService();

  const llmConfig: LLMConfig = {
    apiKey: process.env.OPENAI_API_KEY!,
    apiUrl: process.env.OPENAI_API_URL!
  };
  const llmProvider = new OpenAIProvider(llmConfig);

  const deckController = new DeckController(deckService, llmProvider);
  app.use('/api/decks', setupDeckRoutes(deckController));

  app.use(notFoundHandler);

  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

// Add these handlers
process.on('SIGINT', async () => {
    logger.info('Received SIGINT. Cleaning up...');
    await closeDB();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM. Cleaning up...');
    await closeDB();
    process.exit(0);
});

// Update the error handler in main()
main().catch(async (error) => {
    logger.error('Failed to start server', error);
    await closeDB();
    process.exit(1);
}); 