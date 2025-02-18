/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DeckController } from './../controllers/deck.controller';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "ShortWordPair": {
        "dataType": "refObject",
        "properties": {
            "word_original": {"dataType":"string","required":true},
            "word_translation": {"dataType":"string","required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GenerateDeckResponse": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "language_from": {"dataType":"string","required":true},
            "language_to": {"dataType":"string","required":true},
            "wordpairs": {"dataType":"array","array":{"dataType":"refObject","ref":"ShortWordPair"},"required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GenerateDeckRequest": {
        "dataType": "refObject",
        "properties": {
            "prompt": {"dataType":"string","required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RefineDeckResponse": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "language_from": {"dataType":"string","required":true},
            "language_to": {"dataType":"string","required":true},
            "wordpairs": {"dataType":"array","array":{"dataType":"refObject","ref":"ShortWordPair"},"required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ShortDeckWithWordPairs": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "language_from": {"dataType":"string","required":true},
            "language_to": {"dataType":"string","required":true},
            "wordpairs": {"dataType":"array","array":{"dataType":"refObject","ref":"ShortWordPair"},"required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RefineDeckRequest": {
        "dataType": "refObject",
        "properties": {
            "prompt": {"dataType":"string","required":true},
            "history": {"dataType":"array","array":{"dataType":"string"},"required":true},
            "current_deck": {"ref":"ShortDeckWithWordPairs","required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GetAllDecksResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "language_from": {"dataType":"string","required":true},
            "language_to": {"dataType":"string","required":true},
            "created_at": {"dataType":"string","required":true},
            "last_modified": {"dataType":"string","required":true},
            "wordpair_count": {"dataType":"double","required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GetDeckByIdResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "language_from": {"dataType":"string","required":true},
            "language_to": {"dataType":"string","required":true},
            "created_at": {"dataType":"string","required":true},
            "last_modified": {"dataType":"string","required":true},
            "wordpair_count": {"dataType":"double","required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GetDeckWordpairsResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "deck_id": {"dataType":"string","required":true},
            "word_original": {"dataType":"string","required":true},
            "word_translation": {"dataType":"string","required":true},
            "created_at": {"dataType":"string","required":true},
            "last_modified": {"dataType":"string","required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateDeckResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "language_from": {"dataType":"string","required":true},
            "language_to": {"dataType":"string","required":true},
            "created_at": {"dataType":"string","required":true},
            "last_modified": {"dataType":"string","required":true},
            "wordpair_count": {"dataType":"double","required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateDeckRequest": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "language_from": {"dataType":"string","required":true},
            "language_to": {"dataType":"string","required":true},
            "wordpairs": {"dataType":"array","array":{"dataType":"refObject","ref":"ShortWordPair"},"required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateDeckResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "language_from": {"dataType":"string","required":true},
            "language_to": {"dataType":"string","required":true},
            "created_at": {"dataType":"string","required":true},
            "last_modified": {"dataType":"string","required":true},
            "wordpair_count": {"dataType":"double","required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateDeckRequest": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "language_from": {"dataType":"string","required":true},
            "language_to": {"dataType":"string","required":true},
            "wordpairs": {"dataType":"array","array":{"dataType":"refObject","ref":"ShortWordPair"},"required":true},
            "id": {"dataType":"string","required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"ignore","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsDeckController_generateDeck: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"body","name":"request","required":true,"ref":"GenerateDeckRequest"},
        };
        app.post('/decks/generate',
            ...(fetchMiddlewares<RequestHandler>(DeckController)),
            ...(fetchMiddlewares<RequestHandler>(DeckController.prototype.generateDeck)),

            async function DeckController_generateDeck(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDeckController_generateDeck, request, response });

                const controller = new DeckController();

              await templateService.apiHandler({
                methodName: 'generateDeck',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDeckController_refineDeck: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"body","name":"request","required":true,"ref":"RefineDeckRequest"},
        };
        app.post('/decks/refine',
            ...(fetchMiddlewares<RequestHandler>(DeckController)),
            ...(fetchMiddlewares<RequestHandler>(DeckController.prototype.refineDeck)),

            async function DeckController_refineDeck(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDeckController_refineDeck, request, response });

                const controller = new DeckController();

              await templateService.apiHandler({
                methodName: 'refineDeck',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDeckController_getAllDecks: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/decks',
            ...(fetchMiddlewares<RequestHandler>(DeckController)),
            ...(fetchMiddlewares<RequestHandler>(DeckController.prototype.getAllDecks)),

            async function DeckController_getAllDecks(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDeckController_getAllDecks, request, response });

                const controller = new DeckController();

              await templateService.apiHandler({
                methodName: 'getAllDecks',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDeckController_getDeckById: Record<string, TsoaRoute.ParameterSchema> = {
                deckId: {"in":"path","name":"deckId","required":true,"dataType":"double"},
        };
        app.get('/decks/:deckId',
            ...(fetchMiddlewares<RequestHandler>(DeckController)),
            ...(fetchMiddlewares<RequestHandler>(DeckController.prototype.getDeckById)),

            async function DeckController_getDeckById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDeckController_getDeckById, request, response });

                const controller = new DeckController();

              await templateService.apiHandler({
                methodName: 'getDeckById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDeckController_getDeckWordpairs: Record<string, TsoaRoute.ParameterSchema> = {
                deckId: {"in":"path","name":"deckId","required":true,"dataType":"double"},
        };
        app.get('/decks/:deckId/wordpairs',
            ...(fetchMiddlewares<RequestHandler>(DeckController)),
            ...(fetchMiddlewares<RequestHandler>(DeckController.prototype.getDeckWordpairs)),

            async function DeckController_getDeckWordpairs(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDeckController_getDeckWordpairs, request, response });

                const controller = new DeckController();

              await templateService.apiHandler({
                methodName: 'getDeckWordpairs',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDeckController_createDeck: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"body","name":"request","required":true,"ref":"CreateDeckRequest"},
        };
        app.post('/decks',
            ...(fetchMiddlewares<RequestHandler>(DeckController)),
            ...(fetchMiddlewares<RequestHandler>(DeckController.prototype.createDeck)),

            async function DeckController_createDeck(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDeckController_createDeck, request, response });

                const controller = new DeckController();

              await templateService.apiHandler({
                methodName: 'createDeck',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDeckController_updateDeck: Record<string, TsoaRoute.ParameterSchema> = {
                deckId: {"in":"path","name":"deckId","required":true,"dataType":"double"},
                request: {"in":"body","name":"request","required":true,"ref":"UpdateDeckRequest"},
        };
        app.put('/decks/:deckId',
            ...(fetchMiddlewares<RequestHandler>(DeckController)),
            ...(fetchMiddlewares<RequestHandler>(DeckController.prototype.updateDeck)),

            async function DeckController_updateDeck(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDeckController_updateDeck, request, response });

                const controller = new DeckController();

              await templateService.apiHandler({
                methodName: 'updateDeck',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDeckController_deleteDeck: Record<string, TsoaRoute.ParameterSchema> = {
                deckId: {"in":"path","name":"deckId","required":true,"dataType":"double"},
        };
        app.delete('/decks/:deckId',
            ...(fetchMiddlewares<RequestHandler>(DeckController)),
            ...(fetchMiddlewares<RequestHandler>(DeckController.prototype.deleteDeck)),

            async function DeckController_deleteDeck(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDeckController_deleteDeck, request, response });

                const controller = new DeckController();

              await templateService.apiHandler({
                methodName: 'deleteDeck',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
