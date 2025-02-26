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
import { GENERATE_SYSTEM_PROMPT, getGenerateDeckPrompt, getRefineDeckPrompt, REFINE_OVERWRITE_SYSTEM_PROMPT, REFINE_PRESERVE_SYSTEM_PROMPT } from '../config/prompts';

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
  DeckSummary,
  apiSuccessResponse
} from '../types/deck';

function successResponse<T>(data: T): apiSuccessResponse<T> {
  return {
    success: true,
    data: data
  };
}


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
  ): Promise<apiSuccessResponse<LLMDeck>> {
      // const parsedRequest = GenerateDeckRequestSchema.parse(request);
      
      const result = await this.llmProvider.generateCompletion(
        GENERATE_SYSTEM_PROMPT,
        getGenerateDeckPrompt(request.languageFrom, request.languageTo, request.pairCount, request.theme, request.additionalPrompt)
      );
      const deck: LLMDeck = parseLlmResponse(result);
      
      return successResponse(deck);
  }

  @Post('refine')
  public async refineDeck(
    @Body() request: RefineDeckRequest
  ): Promise<apiSuccessResponse<LLMDeck>> {
      // const parsedRequest = RefineDeckRequestSchema.parse(request);
      const systemPrompt = (request.preserveExistingPairs) ? REFINE_PRESERVE_SYSTEM_PROMPT : REFINE_OVERWRITE_SYSTEM_PROMPT;
      const result = await this.llmProvider.generateCompletion(
        systemPrompt, 
        getRefineDeckPrompt(request.prompt, request.currentDeck, request.history)
      );
      const refinedDeck: LLMDeck = parseLlmResponse(result);
      
      return successResponse(refinedDeck);
  }

  @Get('/')
  public async getAllDecks(): Promise<apiSuccessResponse<DeckSummary[]>> {
      return successResponse(await this.deckService.getAllDecks());
  }

  /**
   * Get a deck by id.
   * If "includeWordpairs" is set to true, fetch the deck details with its associated wordpairs.
   */
  @Get('{deckId}')
  public async getDeckById(
    @Path() deckId: number,
    @Query() includeWordpairs?: boolean
  ): Promise<apiSuccessResponse<DeckSummaryOptionalReturn>> {
      return successResponse(await this.deckService.getDeckById(deckId, includeWordpairs));
  }


  @Post('/')
  public async createDeck(
    @Body() request: DeckCreateInput
  ): Promise<apiSuccessResponse<DeckOptionalReturn>> {
      // const parsedRequest = CreateDeckRequestSchema.parse(request);
      return successResponse(await this.deckService.createDeck(request));
  }

  @Put('{deckId}')
  public async updateDeck(
    @Path() deckId: number,
    @Body() request: DeckUpdateInput
  ): Promise<apiSuccessResponse<DeckOptionalReturn>> {
      if (deckId !== request.id) {
        throw new BadRequestError("deckId in path does not match id in body");
      }
      // const parsedRequest = UpdateDeckRequestSchema.parse(request);
      return successResponse(await this.deckService.updateDeck(request));
  }

  @Delete('{deckId}')
  public async deleteDeck(
    @Path() deckId: number
  ): Promise<apiSuccessResponse<null>> {
      await this.deckService.deleteDeck(deckId);
      return successResponse(null);
  }

  // WordPair CRUD Endpoints


  @Get('{deckId}/wordpairs')
  public async getDeckWordpairs(
    @Path() deckId: number
  ): Promise<apiSuccessResponse<WordPairEntity[]>> {
      return successResponse(await this.deckService.getDeckWordpairs(deckId));
  }

  @Post('{deckId}/wordpairs')
  public async createWordpairs(
    @Path() deckId: number,
    @Body() wordpairs: WordPairInput[]
  ): Promise<apiSuccessResponse<WordPairEntity[]>> {
      return successResponse(await this.deckService.createWordpairs(deckId, wordpairs));
  }

  @Put('{deckId}/wordpairs')
  public async updateWordpairs(
    @Path() deckId: number,
    @Body() wordpairs: Array<WordPairUpdateInput>
  ): Promise<apiSuccessResponse<WordPairEntity[]>> {
      return successResponse(await this.deckService.updateWordpairs(deckId, wordpairs));
  }

  @Delete('{deckId}/wordpairs')
  public async deleteWordpairs(
    @Path() deckId: number
  ): Promise<apiSuccessResponse<null>> {
      await this.deckService.deleteWordpairs(deckId);
      return successResponse(null);
  }
} 