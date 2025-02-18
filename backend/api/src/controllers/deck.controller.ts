import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Route,
  Tags
} from 'tsoa';
import { DeckService } from '../services/deck.service';
import { LLMProvider } from '../services/llm/types';
import { OpenAIProvider } from '../services/llm/openai';
import { GENERATE_SYSTEM_PROMPT, REFINE_SYSTEM_PROMPT } from '../config/prompts';
import { 
  GenerateDeckResponse,
  GenerateDeckRequest,
  RefineDeckResponse,
  RefineDeckRequest,
  CreateDeckResponse,
  CreateDeckRequest,
  UpdateDeckResponse,
  UpdateDeckRequest,
  GetAllDecksResponse,
  GetDeckWordpairsResponse, 
  GetDeckByIdResponse
} from '../types/api';
import { BadRequestError, NotFoundError, InternalServerError } from '../errors';
import logger from '../utils/logger';
import { parseLlmResponse } from '../utils/llm';
import { z } from 'zod';

// Define zod schemas for request validation
const GenerateDeckRequestSchema = z.object({
  prompt: z.string().min(1, { message: "Prompt is required" })
});

const RefineDeckRequestSchema = z.object({
  prompt: z.string().min(1, { message: "Prompt is required" }),
  history: z.array(z.string()),
  currentDeck: z.object({
    name: z.string().min(1),
    languageFrom: z.string().min(1),
    languageTo: z.string().min(1),
    wordpairs: z.array(z.object({
      wordOriginal: z.string(),
      wordTranslation: z.string()
    }))
  })
});

const CreateDeckRequestSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  languageFrom: z.string().min(1, { message: "languageFrom is required" }),
  languageTo: z.string().min(1, { message: "languageTo is required" }),
  wordpairs: z.array(z.object({
    wordOriginal: z.string(),
    wordTranslation: z.string()
  }))
});

const UpdateDeckRequestSchema = z.object({
  id: z.number().min(1, { message: "ID is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  languageFrom: z.string().min(1, { message: "languageFrom is required" }),
  languageTo: z.string().min(1, { message: "languageTo is required" }),
  wordpairs: z.array(z.object({
    wordOriginal: z.string(),
    wordTranslation: z.string()
  }))
});

@Route('decks')
@Tags('Deck')
export class DeckController extends Controller {
  private deckService: DeckService;
  private llmProvider: LLMProvider;

  constructor() {
    super();
    // Instantiate the deck service
    this.deckService = new DeckService();

    // Initialize the LLM provider here using environment variables.
    const llmConfig = {
      apiKey: process.env.OPENAI_API_KEY!,
      apiUrl: process.env.OPENAI_API_URL!
    };
    this.llmProvider = new OpenAIProvider(llmConfig);
  }

  @Post('generate')
  public async generateDeck(
    @Body() request: GenerateDeckRequest
  ): Promise<GenerateDeckResponse> {
    try {
      const parsedRequest = GenerateDeckRequestSchema.parse(request);
      logger.info(`Generating deck with prompt: ${parsedRequest.prompt}`);
      
      const llmPrompt = `Generate a deck for the following user prompt: ${parsedRequest.prompt}`;
      logger.debug(`LLM Prompt: ${llmPrompt}`);

      const result = await this.llmProvider.generateCompletion(
        GENERATE_SYSTEM_PROMPT,
        llmPrompt
      );
      const deck: GenerateDeckResponse = parseLlmResponse(result);

      logger.info(`Deck generated successfully: ${deck.name}`);
      logger.debug(`LLM Response: ${result}`);
      
      return deck;
    } catch (error) {
      logger.error(`Error in generateDeck: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  @Post('refine')
  public async refineDeck(
    @Body() request: RefineDeckRequest
  ): Promise<RefineDeckResponse> {
    try {
      const parsedRequest = RefineDeckRequestSchema.parse(request);
      logger.info(`Refining deck ${parsedRequest.currentDeck.name} with prompt: ${parsedRequest.prompt}`);
      
      const userPrompt = `Refine given deck given this data, conversation history and user refinement request. Current deck: ${JSON.stringify(parsedRequest.currentDeck)}\n\nConversation history: ${JSON.stringify(parsedRequest.history)}\n\nRefinement request: ${parsedRequest.prompt}`;
      logger.debug(`LLM Refinement Prompt: ${userPrompt}`);

      const result = await this.llmProvider.generateCompletion(REFINE_SYSTEM_PROMPT, userPrompt);
      const refinedDeck: RefineDeckResponse = JSON.parse(result);

      logger.info(`Deck refined successfully: ${refinedDeck.name}`);
      logger.debug(`LLM Refinement Response: ${result}`);
      
      return refinedDeck;
    } catch (error) {
      logger.error(`Error in refineDeck: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  @Get('/')
  public async getAllDecks(): Promise<GetAllDecksResponse[]> {
    try {
      logger.info('Fetching all decks');
      return await this.deckService.getAllDecks();
    } catch (error) {
      logger.error(`Error in getAllDecks: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  @Get('{deckId}')
  public async getDeckById(
    @Path() deckId: number
  ): Promise<GetDeckByIdResponse> {
    try {
      const deck = await this.deckService.getDeckById(deckId);
      if (!deck) {
        throw new NotFoundError(`Deck with ID ${deckId} not found`);
      }
      return deck;
    } catch (error) {
      logger.error(`Error in getDeckById: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  @Get('{deckId}/wordpairs')
  public async getDeckWordpairs(
    @Path() deckId: number
  ): Promise<GetDeckWordpairsResponse[]> {
    try {
      logger.info(`Fetching wordpairs for deck ID: ${deckId}`);
      const wordpairs = await this.deckService.getDeckWordpairs(deckId);
      if (!wordpairs.length) {
        throw new NotFoundError(`No wordpairs found for deckId ${deckId}`);
      }
      return wordpairs;
    } catch (error) {
      logger.error(`Error in getDeckWordpairs: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  @Post('/')
  public async createDeck(
    @Body() request: CreateDeckRequest
  ): Promise<CreateDeckResponse> {
    // try {
      const parsedRequest = CreateDeckRequestSchema.parse(request);
      logger.info(`Creating new deck: ${parsedRequest.name} from ${parsedRequest.languageFrom} to ${parsedRequest.languageTo}`);
      
      const deck = await this.deckService.createDeck(parsedRequest);
      if (!deck) {
        throw new InternalServerError('Failed to create deck');
      }
      logger.info(`Deck created successfully with ID: ${deck.id}`);
      return deck;
    // } catch (error) {
    //   logger.error(`Error in createDeck: ${error instanceof Error ? error.message : 'Unknown error'}`);
    //   throw error;
    // }
  }

  @Put('{deckId}')
  public async updateDeck(
    @Path() deckId: number,
    @Body() request: UpdateDeckRequest
  ): Promise<UpdateDeckResponse> {
    try {
      if (deckId !== request.id) {
        throw new BadRequestError("deckId in path does not match id in body");
      }
      const parsedRequest = UpdateDeckRequestSchema.parse(request);
      logger.info(`Updating deck ID: ${deckId} with name: ${parsedRequest.name}`);
      
      const deck = await this.deckService.updateDeck(parsedRequest);
      if (!deck) {
        throw new InternalServerError('Failed to update deck');
      }
      logger.info(`Deck updated successfully: ${deck.name}`);
      return deck;
    } catch (error) {
      logger.error(`Error in updateDeck: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  @Delete('{deckId}')
  public async deleteDeck(
    @Path() deckId: number
  ): Promise<void> {
    try {
      logger.info(`Deleting deck ID: ${deckId}`);
      await this.deckService.deleteDeck(deckId);
    } catch (error) {
      logger.error(`Error in deleteDeck: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
} 