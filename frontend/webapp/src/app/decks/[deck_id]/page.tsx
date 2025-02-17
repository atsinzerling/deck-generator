"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Deck, WordPair } from "@/types/decks";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import WordPairList from "@/components/WordPairList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPencil,
  faRandom,
  faExchangeAlt,
  faPlay,
  faSync,
  faChevronUp,
  faChevronDown
} from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "@/lib/dates";

const DeckPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const deckId = params.deck_id as string;
  const [deck, setDeck] = useState<Deck | null>(null);
  const [wordPairs, setWordPairs] = useState<WordPair[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New state for design-specific features:
  const [isRefineOpen, setIsRefineOpen] = useState(false);
  const [refineText, setRefineText] = useState("");
  const [privacy, setPrivacy] = useState("private");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    const fetchDeckData = async () => {
      const { data: deckData, error: deckError } = await api.decks.getById(deckId);
      if (deckError) {
        setError(deckError);
        setLoading(false);
        return;
      }

      if (deckData) {
        setDeck(deckData);
        setEditedName(deckData.name); // update our local deck name state
        const { data: wordPairsData, error: wordPairsError } = await api.decks.getWordPairs(deckId);
        if (wordPairsError) {
          setError(wordPairsError);
        } else if (wordPairsData) {
          setWordPairs(wordPairsData);
        }
      }
      setLoading(false);
    };

    fetchDeckData();
  }, [deckId]);

  const shuffleWordPairs = () => {
    setWordPairs((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  const reverseWordPairs = () => {
    setWordPairs((prev) => [...prev].reverse());
  };

  const handlePractice = () => {
    // DO NOT IMPLEMENT THIS YET
  };

  const handleRefine = async () => {
    if (!deck) return;
    setLoading(true);
    setError(null);

    const payload = {
      prompt: refineText,
      history: [],
      current_deck: {
        name: editedName,
        language_from: deck.language_from,
        language_to: deck.language_to,
        wordpairs: wordPairs.map((pair) => ({
          word_original: pair.word_original,
          word_translation: pair.word_translation,
        })),
      },
    };

    const { data, error: refineError } = await api.decks.refine(payload);
    if (refineError) {
      setError(refineError);
    } else if (data) {
      // update the word pairs and deck name based on refined data
      setWordPairs(data.wordpairs);
      if (data.name) {
        setDeck((prev) => (prev ? { ...prev, name: data.name } : prev));
        setEditedName(data.name);
      }
    }
    setLoading(false);
    setIsRefineOpen(false);
    setRefineText("");
  };

  const handleSave = async () => {
    if (!deck) return;
    setLoading(true);
    setError(null);

    const payload = {
      id: deck.id,
      name: editedName,
      language_from: deck.language_from,
      language_to: deck.language_to,
      wordpairs: wordPairs.map((pair) => ({
        word_original: pair.word_original,
        word_translation: pair.word_translation,
      })),
    };

    const { data, error: updateError } = await api.decks.update(payload);
    if (updateError) {
      setError(updateError);
    } else if (data) {
      // update the deck state based on the saved data
      setDeck(data);
      setEditedName(data.name);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    // Reset any unsaved changes
    if (deck) {
      setEditedName(deck.name);
    }
    setIsRefineOpen(false);
    setRefineText("");
  };

  const formattedCreatedAt = deck ? formatDate(deck.created_at) : "";
  const formattedModifiedAt = deck ? formatDate(deck.last_modified) : "";

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen w-full font-roboto bg-[#1a1a1a] text-gray-200 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Panel: Deck information and actions */}
          <div className="w-full md:w-1/2 bg-[#242424] rounded-xl p-6">
            
            <div className="flex items-center gap-3 mb-6">
                  {isEditingName ? (
                    <Input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="bg-[#1a1a1a] border-gray-600"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold">{editedName}</h1>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => setIsEditingName(!isEditingName)}>
                    <FontAwesomeIcon icon={faPencil} className="h-4 w-4" />
                  </Button>
                </div>
            
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-4">
                
                <div className="flex items-center gap-2">
                  <select
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value)}
                    className="bg-[#1a1a1a] border border-gray-600 rounded-lg px-2 py-1 text-gray-200 text-sm"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                <div className="text-sm text-gray-400">
                  {deck && (
                    <>
                      <p>
                        From {deck.language_from} to {deck.language_to}
                      </p>
                      <p>
                        Created on {formattedCreatedAt}
                      </p>
                      {formattedCreatedAt !== formattedModifiedAt && (
                        <p>
                          Modified on {formattedModifiedAt}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    onClick={shuffleWordPairs}
                    className="flex-1 inline-flex items-center gap-2 px-4 py-2 bg-[#2f2f2f] rounded-lg hover:bg-[#363636]"
                  >
                    <FontAwesomeIcon icon={faRandom} className="h-4 w-4" />
                    Shuffle
                  </Button>
                  <Button
                    onClick={reverseWordPairs}
                    className="flex-1 inline-flex items-center gap-2 px-4 py-2 bg-[#2f2f2f] rounded-lg hover:bg-[#363636]"
                  >
                    <FontAwesomeIcon icon={faExchangeAlt} className="h-4 w-4" />
                    Reverse
                  </Button>
                </div>
                <Button
                  onClick={handlePractice}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#4f46e5] rounded-lg hover:bg-[#4338ca] text-white"
                >
                  <FontAwesomeIcon icon={faPlay} className="h-4 w-4" />
                  Practice
                </Button>
                <Button
                  onClick={handlePractice}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#2f2f2f] rounded-lg hover:bg-[#363636]"
                >
                  Practice Shuffled
                </Button>
              </div>
            </div>

            <div className="mt-8 border border-gray-700 rounded-lg p-4">
              <button
                className="flex items-center justify-between w-full text-left"
                onClick={() => setIsRefineOpen(!isRefineOpen)}
              >
                <span className="text-md font-medium">Refine Deck</span>
                <FontAwesomeIcon 
                  icon={isRefineOpen ? faChevronUp : faChevronDown} 
                  className="h-4 w-4" 
                />
              </button>
              {isRefineOpen && (
                <div className="mt-4 space-y-4">
                  <Textarea
                    name="refine"
                    placeholder="Enter refinement instructions..."
                    value={refineText}
                    onChange={(e) => setRefineText(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-gray-600 rounded-lg px-4 py-2 h-24 resize-none"
                  />
                  <Button
                    onClick={handleRefine}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#4f46e5] rounded-lg hover:bg-[#4338ca] text-white w-full justify-center"
                  >
                    <FontAwesomeIcon icon={faSync} className="h-4 w-4" />
                    Refine
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                onClick={handleSave}
                className="w-1/2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save Changes
              </Button>
              <Button
                onClick={handleCancel}
                className="w-1/2 px-4 py-2 bg-[#2f2f2f] text-white rounded-lg hover:bg-[#363636]"
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* Right Panel: Word Pairs List */}
          <div className="w-full md:w-1/2">
            <WordPairList wordPairs={wordPairs} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckPage; 