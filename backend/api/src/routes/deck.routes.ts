import { Router } from 'express';
import { DeckController } from '../controllers/deck.controller';

export function setupDeckRoutes(controller: DeckController): Router {
  const router = Router();

  // LLM generation endpoints
  router.post('/generate', controller.generateDeck.bind(controller));
  router.post('/refine', controller.refineDeck.bind(controller));

  // CRUD endpoints
  router.get('/', controller.getAllDecks.bind(controller));
  router.get('/:deckId/wordpairs', controller.getDeckWordpairs.bind(controller));
  router.post('/', controller.createDeck.bind(controller));
  router.put('/:deckId', controller.updateDeck.bind(controller));
  router.delete('/:deckId', controller.deleteDeck.bind(controller));

  return router;
} 