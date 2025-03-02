"use client";
import React, { useEffect, useState, useMemo, useRef, useLayoutEffect } from "react";
import isEqual from "lodash.isequal";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  DeckSummary,
  RefineDeckRequest,
  WordPairUpdateInput,
} from "@/types/decks";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import WordPairList from "@/components/newpage/WordPairList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faCheck,
  faRandom,
  faExchangeAlt,
  faPlay,
  faSync,
  faChevronUp,
  faChevronDown,
  faFileExport,
  faTrashAlt,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "@/lib/dates";
import toast from "react-hot-toast";
import ExportModal from "@/components/deckpage/ExportModal";
import ConfirmDialog from "@/components/deckpage/ConfirmDialog";
import DeckSkeleton from "@/components/deckpage/DeckSkeleton";
import { countdownRedirect } from "@/components/deckpage/countdownRedirect";
import { fisherYatesShuffle } from "@/lib/utils";
import { PreserveToggle } from "@/components/PreserveToggle";
import { ChevronsLeftIcon } from "lucide-react";

const DeckPage: React.FC = () => {
  const params = useParams();
  const deckId = parseInt(params.deck_id as string);
  const [originalDeck, setOriginalDeck] = useState<DeckSummary | null>(null);
  const [draftDeck, setDraftDeck] = useState<DeckSummary | null>(null);
  const [originalWordPairs, setOriginalWordPairs] = useState<WordPairUpdateInput[]>([]);
  const [draftWordPairs, setDraftWordPairs] = useState<WordPairUpdateInput[]>([]);
  const [editedName, setEditedName] = useState("");
  const [refineText, setRefineText] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState("private");

  const [preserveExistingPairs, setPreserveExistingPairs] = useState(true);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isRefineOpen, setIsRefineOpen] = useState(false);
  const [isWordPairsEditMode, setIsWordPairsEditMode] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);

  const router = useRouter();
  const {startCountdownRedirect} = countdownRedirect();

  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const [leftPaneHeight, setLeftPaneHeight] = useState<number | null>(null);


  useEffect(() => {
    const fetchDeckData = async () => {
      setLoading(true);
      const { success, data: deckData, error: deckError } = await api.decks.getDeckById(
        deckId,
        true
      );
      if (!success) {
        // if (deckError?.code === 404) { router.push("/notfound"); return; }
        startCountdownRedirect({
          message: "Failed to fetch deck data.",
          redirectPath: "/dashboard",
        });
        return;
      } else if (deckData) {
        setOriginalWordPairs(deckData.wordpairs as WordPairUpdateInput[]);
        setDraftWordPairs(deckData.wordpairs as WordPairUpdateInput[]);
        setOriginalDeck(deckData as DeckSummary);
        setDraftDeck(deckData as DeckSummary);
        setEditedName(deckData.name);
      }
      setLoading(false);
    };

    fetchDeckData();
  }, [deckId]);


  useLayoutEffect(() => {
    if (!leftPaneRef.current) return;
    
    const updateHeight = () => {
      if (leftPaneRef.current) {
        const height = Math.ceil(leftPaneRef.current.getBoundingClientRect().height);
        setLeftPaneHeight(height);
        if (rightPaneRef.current) {
          console.log(`window ineer height: ${window.innerHeight} leftpane height: ${height}`);
          if (window.innerHeight - 9*16 <= height) {
            console.log("leftheight larger than window height", height);
            rightPaneRef.current.style.maxHeight = `${height+16*3}px`;
          }
          rightPaneRef.current.style.height = `${height+16*3}px`;
        }
      }
    };
  
    const resizeObserver = new ResizeObserver((entries) => {
      const { height } = entries[0].contentRect;
      setLeftPaneHeight(Math.ceil(height));
      if (rightPaneRef.current) {
        console.log(`window ineer height: ${window.innerHeight} leftpane height: ${height}`);
        if (window.innerHeight - 9*16 <= height) {
          console.log("leftheight larger than window height", height);
          rightPaneRef.current.style.maxHeight = `${height+16*3}px`;
        }
        rightPaneRef.current.style.height = `${height+16*3}px`;
      }
    });
    resizeObserver.observe(leftPaneRef.current);
  
    window.addEventListener("resize", updateHeight);
  
    // Also call immediately when dependencies change, e.g., the refine toggle state.
    updateHeight();
    setTimeout(() => {
      updateHeight();
    }, 200);
  
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [isRefineOpen]);

  const shuffleWordPairs = () => {
    const pairs = fisherYatesShuffle(draftWordPairs).map((pair, index) => ({ ...pair, position: index + 1 }));
    setDraftWordPairs(pairs);
  };

  const reverseWordPairs = () => {
    setDraftWordPairs((prev) => {
      const reversed = [...prev].map((pair) => ({
        ...pair,
        wordOriginal: pair.wordTranslation,
        wordTranslation: pair.wordOriginal,
      }));
      return reversed;
    });
    setDraftDeck({ ...draftDeck!, languageFrom: draftDeck!.languageTo, languageTo: draftDeck!.languageFrom });
  };

  const handlePractice = () => {
    // DO NOT IMPLEMENT THIS YET
  };

  const handleRefine = async () => {
    if (!draftDeck) return;
    if (!refineText.trim()) {
      toast.error("Please provide instructions on how to refine the deck.");
      return;
    }
    setGenerating(true);

    const payload : RefineDeckRequest = {
      prompt: refineText,
      history: history,
      preserveExistingPairs: preserveExistingPairs,
      currentDeck: {
        name: draftDeck.name,
        languageFrom: draftDeck.languageFrom,
        languageTo: draftDeck.languageTo,
        wordpairs: draftWordPairs.map((pair) => ({
          wordOriginal: pair.wordOriginal,
          wordTranslation: pair.wordTranslation,
        })),
      },
    };

    const { success, data, error: refineError } = await api.decks.refineDeck(payload);
    if (!success) {
      let message = "Failed to refine deck.";
      if (
        refineError?.type === "LLMError" ||
        refineError?.type === "LLMParseError"
      ) {
        message =
          "An error occurred while generating a deck. Try again or change the prompt.";
      }
      toast.error(message);
    } else if (data) {

      // If preserving existing pairs, append the new pairs
      let updatedPairs = data.wordpairs;
      if (preserveExistingPairs) {
        updatedPairs = [...draftWordPairs, ...data.wordpairs].map((pair, index) => ({
          ...pair,
          position: index + 1,
        }));
      } else {
        updatedPairs = data.wordpairs.map((pair, index) => ({
          ...pair,
          position: index + 1,
        }));
      }
      // setDraftDeck((prev) => (prev ? { ...prev, name: data.name, languageFrom: data.languageFrom, languageTo: data.languageTo } as DeckSummary : prev));
      
      setDraftWordPairs(updatedPairs as WordPairUpdateInput[]);
      setDraftDeck({
        ...draftDeck,
        name: data.name,
        languageFrom: data.languageFrom,
        languageTo: data.languageTo,
      });
      setEditedName(data.name);
      setHistory([...history, refineText]);
      toast.success("Deck refined successfully!");
    }
    setGenerating(false);
    // setIsRefineOpen(false);
    setRefineText(""); // should that be turned off?
  };

  const handleSave = async () => {
    if (!draftDeck) return;
    // setLoading(true);
    // const loadingToast = toast.loading("Saving deck...");
    setIsWordPairsEditMode(false);

    const payload = {
      id: draftDeck.id,
      name: draftDeck.name,
      languageFrom: draftDeck.languageFrom,
      languageTo: draftDeck.languageTo,
      wordpairs: draftWordPairs,
    };

    const { success, data, error: updateError } = await api.decks.updateDeck(payload);
    if (!success) {
      // toast.dismiss(loadingToast);
      toast.error("Failed to save deck.");
    } else if (data) {
      setOriginalWordPairs(data.wordpairs as WordPairUpdateInput[]);
      setOriginalDeck(data as DeckSummary);
      setDraftWordPairs(data.wordpairs as WordPairUpdateInput[]);
      setDraftDeck(data as DeckSummary);
      setEditedName(data.name);
      // toast.dismiss(loadingToast);
      toast.success("Deck saved successfully!");
    }
    // setLoading(false);
  };

  const handleCancel = () => {
    // Reset any unsaved changes
    setIsWordPairsEditMode(false);
    if (originalDeck) {
      setEditedName(originalDeck.name);
      setDraftWordPairs(originalWordPairs);
      setDraftDeck(originalDeck);
      setHistory([]);
    }
    // setIsRefineOpen(false);
    // setRefineText("");
  };

  const handleDelete = async () => {
    if (!originalDeck) return;
    setLoading(true);

    const { error: deleteError } = await api.decks.deleteDeck(originalDeck.id);
    console.log(deleteError);
    if (deleteError) {
      toast.error("Failed to delete deck.");
    } else {
      toast.success("Deck deleted successfully!");
      router.push("/dashboard");
    }
    setLoading(false);
  };

  const formattedCreatedAt = draftDeck ? formatDate(draftDeck.createdAt) : "";
  const formattedModifiedAt = draftDeck ? formatDate(draftDeck.lastModified) : "";

  const isEditing = useMemo(() => {
    if (!originalDeck || !draftDeck) return false;
    
    const deckInfoChanged =
      originalDeck.name !== draftDeck.name ||
      originalDeck.languageFrom !== draftDeck.languageFrom ||
      originalDeck.languageTo !== draftDeck.languageTo ||
      originalDeck.wordpairCount !== draftDeck.wordpairCount;
    
    const wordPairsChanged = !isEqual(originalWordPairs, draftWordPairs);
    
    return deckInfoChanged || wordPairsChanged;
  }, [originalDeck, draftDeck, originalWordPairs, draftWordPairs]);

  return (
    <div className="min-h-[calc(100vh-4.55rem)] w-full font-roboto bg-[#1a1a1a] text-gray-200 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Panel: Deck information and actions */}
          <div
            ref={leftPaneRef}
            className="w-full md:w-1/2 bg-[#242424] rounded-xl p-6"
          >
            {loading ? (
              <DeckSkeleton />
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  {isEditingName ? (
                    <Input
                      type="text"
                      autoFocus
                      value={editedName}
                      onChange={(e) => {
                        setEditedName(e.target.value);
                        setDraftDeck({ ...draftDeck!, name: e.target.value });
                      }}
                      onBlur={() => setIsEditingName(false)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === "Escape") {
                          setIsEditingName(false);
                        }
                      }}
                      className="bg-[#1a1a1a] border-gray-600 text-lg md:text-lg"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold">{editedName}</h1>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditingName(!isEditingName)}
                  >
                    <FontAwesomeIcon icon={(isEditingName ? faCheck : faPencil)} className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={privacy}
                        onChange={(e) => setPrivacy(e.target.value)}
                        disabled
                        title="Visibility settings coming soon"
                        className="bg-[#1a1a1a] border border-gray-600 rounded-lg px-2 py-1 text-gray-200 text-sm opacity-50 cursor-not-allowed"
                      >
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                      </select>
                    </div>
                    <div className="text-sm text-gray-400">
                      {draftDeck && (
                        <>
                          <p>
                            From {draftDeck.languageFrom} to {draftDeck.languageTo}
                          </p>
                          <p>Created on {formattedCreatedAt}</p>
                          {formattedCreatedAt !== formattedModifiedAt && (
                            <p>Modified on {formattedModifiedAt}</p>
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
                        disabled={generating}
                      >
                        <FontAwesomeIcon icon={faRandom} className="h-4 w-4" />
                        Shuffle
                      </Button>
                      <Button
                        onClick={reverseWordPairs}
                        className="flex-1 inline-flex items-center gap-2 px-4 py-2 bg-[#2f2f2f] rounded-lg hover:bg-[#363636]"
                        disabled={generating}
                      >
                        <FontAwesomeIcon
                          icon={faExchangeAlt}
                          className="h-4 w-4"
                        />
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
                      <PreserveToggle 
                        checked={preserveExistingPairs} 
                        onChange={setPreserveExistingPairs} 
                        disabled={generating}
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

                {isEditing ? (
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
                ) : (
                  <div className="mt-8 space-y-3">
                    <ExportModal
                      wordPairs={originalWordPairs}
                      deck={originalDeck as DeckSummary}
                    />
                    <ConfirmDialog
                      title="Confirm Deletion"
                      description="Are you sure you want to delete this deck? This action cannot be undone."
                      onConfirm={handleDelete}
                      confirmButtonText="Delete"
                      cancelButtonText="Cancel"
                    >
                      <Button className="w-full px-4 py-3 bg-[#2f2f2f] text-red-500 rounded-lg hover:bg-[#3f2f2f] transition-colors border border-red-900/30 flex items-center justify-center gap-2 text-sm">
                        {/* <FontAwesomeIcon icon={faTrashAlt} className="h-4 w-4" /> */}
                        Delete Deck
                      </Button>
                    </ConfirmDialog>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Panel: Word Pairs List */}
          <div className="w-full md:w-1/2">
            <div 
                ref={rightPaneRef}
                className="relative h-full bg-[#242424] rounded-xl p-6 flex flex-col overflow-auto"
                style={{
                  maxHeight: leftPaneHeight
                    ? `max(calc(100vh - 9rem), ${leftPaneHeight}px)`
                    : "calc(100vh - 9rem)",
                }}
              >
              {!loading ? (
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-medium">Word Pairs</h1>
                  <button
                    onClick={() => setIsWordPairsEditMode(!isWordPairsEditMode)}
                    className="text-gray-400 hover:text-white"
                  >
                    <FontAwesomeIcon icon={(isWordPairsEditMode ? faCheck : faPencil)} className="h-4 w-4" />
                  </button>
                </div>
              ) : (<></>)}
                <WordPairList
                  wordPairs={draftWordPairs}
                  loading={loading}
                  generating={generating}
                  emptyMessage1="It looks like you haven't added any word pairs yet. "
                  emptyMessage2="Add some to get started!"
                  editMode={isWordPairsEditMode}
                  onUpdate={(updatedPairs) => setDraftWordPairs(updatedPairs)}
                />
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DeckPage;
