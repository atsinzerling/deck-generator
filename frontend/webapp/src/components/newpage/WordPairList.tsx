import React from "react";
import CustomScrollArea from "@/components/CustomScrollArea";
import WordPairTile from "@/components/newpage/WordPairTile";
import { WordPairUpdateInput } from "@/types/decks";
import { Circles } from "react-loader-spinner";
import WordPairListSkeleton from "@/components/newpage/WordPairListSkeleton";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { faGripVertical, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface WordPairListProps {
  wordPairs: WordPairUpdateInput[];
  title?: string;
  loading?: boolean; // when waiting for data, show skeleton
  generating?: boolean; // when generating data, show spinner
  emptyMessage1?: string; // when empty, show messages
  emptyMessage2?: string;
  editMode?: boolean;
  onUpdate?: (updatedPairs: WordPairUpdateInput[]) => void;
}

const WordPairList: React.FC<WordPairListProps> = ({
  wordPairs,
  loading = false,
  generating = false,
  emptyMessage1 = "It looks like you haven't added any word pairs yet. Add some to get started!",
  emptyMessage2 = "Fill in the form and click Generate to create your custom language learning deck",
  editMode = false,
  onUpdate,
}) => {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    const newList = Array.from(wordPairs);

    const [movedPair] = newList.splice(sourceIndex, 1);
    newList.splice(destinationIndex, 0, movedPair);

    let newPos: number;
    if (newList.length === 1) {
      newPos = 0;
    } else if (destinationIndex === 0) {
      newPos = newList[1].position / 2;
    } else if (destinationIndex === newList.length - 1) {
      newPos = newList[destinationIndex - 1].position + 1;
    } else {
      const prev = newList[destinationIndex - 1].position;
      const next = newList[destinationIndex + 1].position;
      newPos = (prev + next) / 2;
    }
    movedPair.position = newPos;

    newList.sort((a, b) => a.position - b.position);

    if (onUpdate) onUpdate(newList);
  };

  const handleDelete = (index: number) => {
    const newList = Array.from(wordPairs);
    newList.splice(index, 1);
    if (onUpdate) onUpdate(newList);
  };

  const renderContent = () => {
    if (loading) return <WordPairListSkeleton />;
    if (!editMode && wordPairs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
          <div className="text-2xl font-medium text-center">{emptyMessage1}</div>
          <div className="text-sm text-gray-500 text-center max-w-md">{emptyMessage2}</div>
        </div>
      );
    }

    if (!editMode) {
      return (
        <div className="flex-1 min-h-0">
          <CustomScrollArea className="h-full">
            <div className="space-y-4 pr-4">
              {wordPairs.map((pair) => (
                <WordPairTile key={pair.position} pair={pair} />
              ))}
            </div>
          </CustomScrollArea>
        </div>
      );
    }

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="word-pairs-droppable">
          {(provided: any) => (
            <div
              className="flex-1 min-h-0"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <CustomScrollArea className="h-full">
                <div className="space-y-4 pr-4">
                  {wordPairs.map((pair, index) => (
                    <Draggable
                      key={pair.position.toString()}
                      draggableId={pair.position.toString()}
                      index={index}
                    >
                      {(provided: any) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center gap-2 word-pair-enter"
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="flex items-center justify-center px-2 py-4 bg-[#2f2f2f] rounded-lg cursor-move"
                          >
                            <FontAwesomeIcon icon={faGripVertical} />
                          </div>
                          <div className="flex-1 flex gap-4">
                            <div className="w-1/2 bg-[#2f2f2f] p-4 rounded-lg">
                              {pair.wordOriginal}
                            </div>
                            <div className="w-1/2 bg-[#363636] p-4 rounded-lg">
                              {pair.wordTranslation}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(index)}
                            className="flex items-center justify-center px-2 py-4 bg-[#2f2f2f] rounded-lg hover:bg-[#3f2f2f] text-red-400 hover:text-red-300"
                          >
                            <FontAwesomeIcon icon={faTrashAlt} />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </CustomScrollArea>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  };

  return (
    <div className="relative h-full bg-[#242424] rounded-xl p-6 flex flex-col max-h-[calc(100vh)]">
      {/* <h2 className="text-2xl font-bold mb-8">{title}</h2> */}
      {renderContent()}
      {generating && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
          <Circles
            height="80"
            width="80"
            color="#4f46e5"
            ariaLabel="loading-indicator"
            visible={true}
          />
        </div>
      )}
    </div>
  );
};

export default WordPairList;
