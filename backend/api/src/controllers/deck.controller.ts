import { Request, Response } from 'express';
import { DeckService } from '../services/deck.service';
import { LLMProvider } from '../services/llm/types';
import { GENERATE_SYSTEM_PROMPT, REFINE_SYSTEM_PROMPT } from '../config/prompts';
import { GenerateDeckResponse, RefineDeckResponse } from '../types/api';
import { BadRequestError, NotFoundError, InternalServerError } from '../errors';
import logger from '../utils/logger';
import { parseLlmResponse } from '../utils/llm';

export class DeckController {
  constructor(
    private deckService: DeckService,
    private llmProvider: LLMProvider
  ) {}


  async generateDeck(req: Request, res: Response) {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        throw new BadRequestError('Prompt is required');
      }
      logger.info(`Generating deck with prompt: ${prompt}`);
      
      const llmPrompt = `Generate a deck for the following user prompt: ${prompt}`;
      logger.debug(`LLM Prompt: ${llmPrompt}`); // Detailed prompt

      const result = await this.llmProvider.generateCompletion(
        GENERATE_SYSTEM_PROMPT,
        llmPrompt
      );
      const deck : GenerateDeckResponse = parseLlmResponse(result);
      
      logger.info(`Deck generated successfully: ${deck.name}`);
      logger.debug(`LLM Response: ${result}`); // Detailed response
      
      res.json(deck);
    } catch (error) {
      logger.error(`Error in generateDeck: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async refineDeck(req: Request, res: Response) {
    try {
      const { prompt, history, current_deck } = req.body;
      if (!prompt || !history || !current_deck) {
        throw new BadRequestError('Prompt, history, and current_deck are required');
      }
      logger.info(`Refining deck ID: ${current_deck.id} with prompt: ${prompt}`);
      
      const userPrompt = `Refine given deck given this data, conversation history and user refinement request. Current deck: ${JSON.stringify(current_deck)}\n\nConversation history: ${JSON.stringify(history)}\n\nRefinement request: ${prompt}`;
      logger.debug(`LLM Refinement Prompt: ${userPrompt}`); // Detailed prompt

      const result = await this.llmProvider.generateCompletion(REFINE_SYSTEM_PROMPT, userPrompt);
      const refinedDeck : RefineDeckResponse = JSON.parse(result);
      
      logger.info(`Deck refined successfully: ${refinedDeck.name}`);
      logger.debug(`LLM Refinement Response: ${result}`); // Detailed response
      
      res.json(refinedDeck);
    } catch (error) {
      logger.error(`Error in refineDeck: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // CRUD operations
  async getAllDecks(req: Request, res: Response) {
    try {
      logger.info('Fetching all decks');
      const decks = await this.deckService.getAllDecks();
      res.json(decks);
    } catch (error) {
      logger.error(`Error in getAllDecks: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async getDeckById(req: Request, res: Response) {
    try {
      const deckId = parseInt(req.params.deckId);
      if (isNaN(deckId)) {
        throw new BadRequestError('Invalid deckId');
      }
      const deck = await this.deckService.getDeckById(deckId);
      if (!deck) {
        throw new NotFoundError(`Deck with ID ${deckId} not found`);
      }
      res.json(deck);
    } catch (error) {
      logger.error(`Error in getDeckById: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async getDeckWordpairs(req: Request, res: Response) {
    try {
      const deckId = parseInt(req.params.deckId);
      if (isNaN(deckId)) {
        throw new BadRequestError('Invalid deckId');
      }
      logger.info(`Fetching wordpairs for deck ID: ${deckId}`);
      const wordpairs = await this.deckService.getDeckWordpairs(deckId);
      if (!wordpairs.length) {
        throw new NotFoundError(`No wordpairs found for deckId ${deckId}`);
      }
      res.json(wordpairs);
    } catch (error) {
      logger.error(`Error in getDeckWordpairs: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async createDeck(req: Request, res: Response) {
    try {
      const { name, language_from, language_to, wordpairs } = req.body;
      logger.info(`Creating new deck: ${name}, from ${language_from} to ${language_to}`);
      
      const deck = await this.deckService.createDeck(req.body);
      if (!deck) {
        throw new InternalServerError('Failed to create deck');
      }
      logger.info(`Deck created successfully with ID: ${deck.id}`);
      
      res.status(201).json(deck);
    } catch (error) {
      logger.error(`Error in createDeck: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async updateDeck(req: Request, res: Response) {
    try {
      const { id, name, language_from, language_to, wordpairs } = req.body;
      logger.info(`Updating deck ID: ${id} with name: ${name}`);
      
      const deck = await this.deckService.updateDeck(req.body);
      if (!deck) {
        throw new InternalServerError('Failed to update deck');
      }
      logger.info(`Deck updated successfully: ${deck.name}`);
      
      res.json(deck);
    } catch (error) {
      logger.error(`Error in updateDeck: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async deleteDeck(req: Request, res: Response) {
    try {
      const deckId = parseInt(req.params.deckId);
      if (isNaN(deckId)) {
        throw new BadRequestError('Invalid deckId');
      }
      logger.info(`Deleting deck ID: ${deckId}`);
      
      await this.deckService.deleteDeck(deckId);
      logger.info(`Deck deleted successfully: ID ${deckId}`);
      
      res.status(204).send();
    } catch (error) {
      logger.error(`Error in deleteDeck: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
} 