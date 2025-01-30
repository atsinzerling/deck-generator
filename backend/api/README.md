# API Documentation

## Endpoints

### Generate Deck

- **Endpoint**: `POST /api/decks/generate`
- **Description**: Generates a new vocabulary deck based on the provided prompt.
- **Input**:
  ```json
  {
    "prompt": "Create a deck for basic Spanish greetings."
  }
  ```
- **Output**:
  ```json
  {
    "deck_name": "Basic Spanish Greetings",
    "language_from": "English",
    "language_to": "Spanish",
    "deck": [
      {
        "word_original": "Hello",
        "word_translation": "Hola"
      },
      {
        "word_original": "Good morning",
        "word_translation": "Buenos días"
      }
      // ... more word pairs
    ]
  }
  ```

### Refine Deck

- **Endpoint**: `POST /api/decks/refine`
- **Description**: Refines an existing vocabulary deck based on the provided prompt and conversation history.
- **Input**:
  ```json
  {
    "prompt": "Add more formal greetings and correct any inaccuracies.",
    "history": ["Create a deck for basic Spanish greetings."],
    "current_deck": {
      "name": "Basic Spanish Greetings",
      "language_from": "English",
      "language_to": "Spanish",
      "deck": [
        {
          "word_original": "Hello",
          "word_translation": "Hola"
        },
        {
          "word_original": "Good morning",
          "word_translation": "Buenos días"
        }
      ]
    }
  }
  ```
- **Output**:
  ```json
  {
    "deck_name": "Basic and Advanced Spanish Greetings",
    "language_from": "English",
    "language_to": "Spanish",
    "deck": [
      {
        "word_original": "Good evening",
        "word_translation": "Buenas noches"
      },
      {
        "word_original": "How are you?",
        "word_translation": "¿Cómo estás?"
      }
    ]
  }
  ```

### CRUD Endpoints

#### Get All Decks

- **Endpoint**: `GET /api/decks/`
- **Description**: Retrieves a list of all vocabulary decks.
- **Input**: None
- **Output**:
  ```json
  [
    {
      "id": 1,
      "name": "Basic Spanish Greetings",
      "language_from": "English",
      "language_to": "Spanish",
      "created_at": "2023-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "name": "Advanced French Phrases",
      "language_from": "English",
      "language_to": "French",
      "created_at": "2023-01-05T12:34:56Z"
    }
  ]
  ```

#### Get Deck Wordpairs

- **Endpoint**: `GET /api/decks/:deckId/wordpairs`
- **Description**: Retrieves all word pairs for a specific deck.
- **Input**:
  - `deckId` (path parameter): ID of the deck.
- **Output**:
  ```json
  [
    {
      "id": 1,
      "deck_id": 1,
      "word_original": "Hello",
      "word_translation": "Hola",
      "created_at": "2023-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "deck_id": 1,
      "word_original": "Good morning",
      "word_translation": "Buenos días",
      "created_at": "2023-01-01T00:01:00Z"
    }
  ]
  ```

#### Create Deck

- **Endpoint**: `POST /api/decks/`
- **Description**: Creates a new vocabulary deck.
- **Input**:
  ```json
  {
    "name": "Basic Spanish Greetings",
    "language_from": "English",
    "language_to": "Spanish",
    "wordpairs": [
      {
        "word_original": "Hello",
        "word_translation": "Hola"
      },
      {
        "word_original": "Good morning",
        "word_translation": "Buenos días"
      }
    ]
  }
  ```
- **Output**:
  ```json
  {
    "id": 1,
    "name": "Basic Spanish Greetings",
    "language_from": "English",
    "language_to": "Spanish",
    "wordpairs": [
      {
        "word_original": "Hello",
        "word_translation": "Hola"
      },
      {
        "word_original": "Good morning",
        "word_translation": "Buenos días"
      }
    ]
  }
  ```

#### Update Deck

- **Endpoint**: `PUT /api/decks/:deckId`
- **Description**: Updates an existing vocabulary deck.
- **Input**:
  ```json
  {
    "id": 1,
    "name": "Basic Spanish Greetings - Updated",
    "language_from": "English",
    "language_to": "Spanish",
    "wordpairs": [
      {
        "word_original": "Good evening",
        "word_translation": "Buenas noches"
      },
      {
        "word_original": "Thank you",
        "word_translation": "Gracias"
      }
    ]
  }
  ```
- **Output**:
  ```json
  {
    "id": 1,
    "name": "Basic Spanish Greetings - Updated",
    "language_from": "English",
    "language_to": "Spanish",
    "wordpairs": [
      {
        "word_original": "Good evening",
        "word_translation": "Buenas noches"
      },
      {
        "word_original": "Thank you",
        "word_translation": "Gracias"
      }
    ]
  }
  ```

#### Delete Deck

- **Endpoint**: `DELETE /api/decks/:deckId`
- **Description**: Deletes a vocabulary deck by its ID.
- **Input**:
  - `deckId` (path parameter): ID of the deck to delete.
- **Output**: No content (204 No Content)
- **Example**:

  **Request**:

  `DELETE /api/decks/1`

  **Response**:

  - **Status**: 204 No Content


First run migrations: npx ts-node scripts/migrate.ts
Seed the database: npx ts-node scripts/seed.ts
Start the development server: npm run dev

sudo -i -u postgres
psql
CREATE DATABASE deckgen;
CREATE USER pguser WITH PASSWORD '';
GRANT ALL PRIVILEGES ON DATABASE deckgen TO pguser;
\q
exit