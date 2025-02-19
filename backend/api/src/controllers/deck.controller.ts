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
import { GENERATE_SYSTEM_PROMPT, getGenerateDeckPrompt, getRefineDeckPrompt, REFINE_SYSTEM_PROMPT } from '../config/prompts';

import { BadRequestError} from '../errors';
import { parseLlmResponse } from '../utils/llm';
// import {
//   GenerateDeckRequestSchema,
//   RefineDeckRequestSchema,
//   CreateDeckRequestSchema,
//   UpdateDeckRequestSchema
// } from '../types/zodSchemas';

import {
  DeckCreateInput,
  DeckUpdateInput,
  DeckOptionalReturn,
  WordPairInput,
  WordPairEntity,
  DeckSummaryOptionalReturn,
  WordPairUpdateInput,
  LLMDeck,
  GenerateDeckRequest,
  RefineDeckRequest,
  DeckSummary
} from '../types/deck';


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
  ): Promise<LLMDeck> {
      // const parsedRequest = GenerateDeckRequestSchema.parse(request);
      
      const result = await this.llmProvider.generateCompletion(
        GENERATE_SYSTEM_PROMPT,
        getGenerateDeckPrompt(request.languageFrom, request.languageTo, request.pairCount, request.theme, request.additionalPrompt)
      );
      const deck: LLMDeck = parseLlmResponse(result);
      
      return deck;
  }

  @Post('refine')
  public async refineDeck(
    @Body() request: RefineDeckRequest
  ): Promise<LLMDeck> {
      // const parsedRequest = RefineDeckRequestSchema.parse(request);

      const result = await this.llmProvider.generateCompletion(
        REFINE_SYSTEM_PROMPT, 
        getRefineDeckPrompt(request.prompt, request.currentDeck, request.history)
      );
      const refinedDeck: LLMDeck = parseLlmResponse(result);
      
      return refinedDeck;
  }

  @Get('/')
  public async getAllDecks(): Promise<DeckSummary[]> {
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
      return this.deckService.getDeckById(deckId, includeWordpairs);
  }


  @Post('/')
  public async createDeck(
    @Body() request: DeckCreateInput
  ): Promise<DeckOptionalReturn> {
      // const parsedRequest = CreateDeckRequestSchema.parse(request);
      return this.deckService.createDeck(request);
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
      return this.deckService.updateDeck(request);
  }

  @Delete('{deckId}')
  public async deleteDeck(
    @Path() deckId: number
  ): Promise<void> {
      await this.deckService.deleteDeck(deckId);
  }

  // WordPair CRUD Endpoints


  @Get('{deckId}/wordpairs')
  public async getDeckWordpairs(
    @Path() deckId: number
  ): Promise<WordPairEntity[]> {
      return this.deckService.getDeckWordpairs(deckId);
  }

  @Post('{deckId}/wordpairs')
  public async createWordpairs(
    @Path() deckId: number,
    @Body() wordpairs: WordPairInput[]
  ): Promise<WordPairEntity[]> {
      return this.deckService.createWordpairs(deckId, wordpairs);
  }

  @Put('{deckId}/wordpairs')
  public async updateWordpairs(
    @Path() deckId: number,
    @Body() wordpairs: Array<WordPairUpdateInput>
  ): Promise<WordPairEntity[]> {
      return this.deckService.updateWordpairs(deckId, wordpairs);
  }

  @Delete('{deckId}/wordpairs')
  public async deleteWordpairs(
    @Path() deckId: number
  ): Promise<void> {
      await this.deckService.deleteWordpairs(deckId);
  }
} 