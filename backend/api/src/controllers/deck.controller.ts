import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Query,
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
import {
  GenerateDeckRequestSchema,
  RefineDeckRequestSchema,
  CreateDeckRequestSchema,
  UpdateDeckRequestSchema
} from '../types/zodSchemas';

import {
  DeckCreateInput,
  DeckUpdateInput,
  DeckOptionalReturn,
  WordPairInput,
  WordPairEntity,
  WordPairSummary,
  WordPairUpdateInput,
  DeckEntity,
  DeckDetail,
  DeckSummary,
  DeckSummaryOptionalReturn
} from '../types/deck2';


@Route('decks')
@Tags('Deck')
export class DeckController extends Controller {
  private deckService: DeckService;
  private llmProvider: LLMProvider;

  constructor() {
    super();
    // Instantiate the deck service
    this.deckService = new DeckService();

    // Initialize the LLM provider using environment variables.
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
  }

  @Post('refine')
  public async refineDeck(
    @Body() request: RefineDeckRequest
  ): Promise<RefineDeckResponse> {
      const parsedRequest = RefineDeckRequestSchema.parse(request);
      logger.info(`Refining deck ${parsedRequest.currentDeck.name} with prompt: ${parsedRequest.prompt}`);
      
      const userPrompt = `Refine given deck given this data, conversation history and user refinement request. Current deck: ${JSON.stringify(parsedRequest.currentDeck)}\n\nConversation history: ${JSON.stringify(parsedRequest.history)}\n\nRefinement request: ${parsedRequest.prompt}`;
      logger.debug(`LLM Refinement Prompt: ${userPrompt}`);

      const result = await this.llmProvider.generateCompletion(REFINE_SYSTEM_PROMPT, userPrompt);
      const refinedDeck: RefineDeckResponse = JSON.parse(result);

      logger.info(`Deck refined successfully: ${refinedDeck.name}`);
      logger.debug(`LLM Refinement Response: ${result}`);
      
      return refinedDeck;
  }

  @Get('/')
  public async getAllDecks(): Promise<GetAllDecksResponse[]> {
      logger.info('Fetching all decks');
      return await this.deckService.getAllDecks();
  }

  /**
   * Get a deck by id.
   * If "includeWordpairs" is set to true, fetch the deck details with its associated wordpairs.
   */
  @Get('{deckId}')
  public async getDeckById(
    @Path() deckId: number,
    @Query() includeWordpairs?: boolean
  ): Promise<DeckSummaryOptionalReturn> {
      const deck = await this.deckService.getDeckById(deckId, includeWordpairs);
      return deck;
  }


  @Post('/')
  public async createDeck(
    @Body() request: DeckCreateInput
  ): Promise<DeckOptionalReturn> {
      // const parsedRequest = CreateDeckRequestSchema.parse(request);
      const parsedRequest = request;
      logger.info(`Creating new deck: ${parsedRequest.name} from ${parsedRequest.languageFrom} to ${parsedRequest.languageTo}`);
      
      const deck = await this.deckService.createDeck(parsedRequest);
      if (!deck) {
        throw new InternalServerError('Failed to create deck');
      }
      logger.info(`Deck created successfully with ID: ${deck.id}`);
      return deck;
  }

  @Put('{deckId}')
  public async updateDeck(
    @Path() deckId: number,
    @Body() request: DeckUpdateInput
  ): Promise<DeckOptionalReturn> {
      if (deckId !== request.id) {
        throw new BadRequestError("deckId in path does not match id in body");
      }
      // const parsedRequest = UpdateDeckRequestSchema.parse(request);
      const parsedRequest = request;
      logger.info(`Updating deck ID: ${deckId} with name: ${parsedRequest.name}`);
      
      const deck = await this.deckService.updateDeck(parsedRequest);
      if (!deck) {
        throw new InternalServerError('Failed to update deck');
      }
      logger.info(`Deck updated successfully: ${deck.name}`);
      return deck;
  }

  @Delete('{deckId}')
  public async deleteDeck(
    @Path() deckId: number
  ): Promise<void> {
      logger.info(`Deleting deck ID: ${deckId}`);
      await this.deckService.deleteDeck(deckId);
  }

  // New WordPair CRUD Endpoints


  @Get('{deckId}/wordpairs')
  public async getDeckWordpairs(
    @Path() deckId: number
  ): Promise<WordPairEntity[]> {
      logger.info(`Fetching wordpairs for deck ID: ${deckId}`);
      const wordpairs = await this.deckService.getDeckWordpairs(deckId);
      if (!wordpairs.length) {
        throw new NotFoundError(`No wordpairs found for deckId ${deckId}`);
      }
      return wordpairs;
  }

  @Post('{deckId}/wordpairs')
  public async createWordpairs(
    @Path() deckId: number,
    @Body() wordpairs: WordPairInput[]
  ): Promise<WordPairEntity[]> {
      logger.info(`Creating wordpairs for deck ID: ${deckId}`);
      const newWordpairs = await this.deckService.createWordpairs(deckId, wordpairs);
      return newWordpairs;
  }

  @Put('{deckId}/wordpairs')
  public async updateWordpairs(
    @Path() deckId: number,
    @Body() wordpairs: Array<{ id?: number } & WordPairInput>
  ): Promise<WordPairEntity[]> {
      logger.info(`Updating wordpairs for deck ID: ${deckId}`);
      const updatedWordpairs = await this.deckService.updateWordpairs(deckId, wordpairs);
      return updatedWordpairs;
  }

  @Delete('{deckId}/wordpairs')
  public async deleteWordpairs(
    @Path() deckId: number
  ): Promise<void> {
      logger.info(`Deleting all wordpairs for deck ID: ${deckId}`);
      await this.deckService.deleteWordpairs(deckId);
  }
} 