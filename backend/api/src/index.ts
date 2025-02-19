import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import 'express-async-errors';
import { closeDB } from './drizzle/client';
import logger from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { requestLogger } from './middleware/requestLogger';
import { responseLogger } from './middleware/responseLogger';
// NEW: Import tsoa generated routes and swagger UI
import { RegisterRoutes } from './routes/routes';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

dotenv.config();

async function main() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);
  app.use(responseLogger);
  // Register TSOA-generated routes under '/api'
  const apiRouter = express.Router();
  RegisterRoutes(apiRouter);
  app.use('/api', apiRouter);

  // Serve Swagger UI at /docs (Swagger JSON still available at /swagger.json)
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

// Add SIGINT & SIGTERM handlers for graceful shutdown
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