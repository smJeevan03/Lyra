import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Layers, RotateCcw, Star } from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import flashcardService from '../../services/flashcardService';

const FlashcardsPage = () => {
  const { id } = useParams();
  const [sets, setSets] = useState([]);
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        setLoading(true);
        const data = await flashcardService.getFlashcardsForDocument(id);
        setSets(Array.isArray(data?.data) ? data.data : []);
      } catch (error) {
        toast.error(error.error || error.message || 'Failed to load flashcards.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFlashcards();
    }
  }, [id]);

  const activeSet = sets[activeSetIndex];
  const cards = useMemo(() => activeSet?.cards || [], [activeSet]);
  const activeCard = cards[activeCardIndex];

  const goToCard = (nextIndex) => {
    setActiveCardIndex(nextIndex);
    setShowAnswer(false);
  };

  const handlePrevious = () => {
    goToCard(Math.max(activeCardIndex - 1, 0));
  };

  const markReviewed = async () => {
    if (activeCard?._id) {
      try {
        setReviewing(true);
        const response = await flashcardService.reviewFlashcard(activeCard._id, activeCardIndex);
        const updatedSet = response?.data;

        if (updatedSet?._id) {
          setSets((currentSets) =>
            currentSets.map((set) => (set._id === updatedSet._id ? updatedSet : set))
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setReviewing(false);
      }
    }
  };

  const handleNext = async () => {
    await markReviewed();

    goToCard(Math.min(activeCardIndex + 1, cards.length - 1));
  };

  const handleSetChange = (event) => {
    setActiveSetIndex(Number(event.target.value));
    goToCard(0);
  };

  const handleToggleStar = async () => {
    if (!activeCard?._id) return;

    try {
      const response = await flashcardService.toggleStar(activeCard._id);
      const updatedSet = response?.data;

      if (updatedSet?._id) {
        setSets((currentSets) =>
          currentSets.map((set) => (set._id === updatedSet._id ? updatedSet : set))
        );
      }
    } catch (error) {
      toast.error(error.error || error.message || 'Failed to update flashcard.');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!activeSet || cards.length === 0) {
    return (
      <div className="space-y-6 px-6 py-8 lg:px-10">
        <Link to="/flashcards" className="inline-flex items-center gap-2 text-sm text-[#CBD5E1] hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to flashcards
        </Link>
        <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-10 text-center">
          <Layers className="mx-auto h-10 w-10 text-[#CBD5E1]/40" />
          <h1 className="mt-4 text-xl font-bold text-white">No flashcards found</h1>
          <p className="mt-2 text-sm text-[#CBD5E1]/60">Generate flashcards from the document first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/flashcards" className="inline-flex items-center gap-2 text-sm text-[#CBD5E1] hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to flashcards
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">Flashcards</h1>
          <p className="mt-1 text-sm text-[#CBD5E1]/60">
            Card {activeCardIndex + 1} of {cards.length}
          </p>
        </div>

        {sets.length > 1 && (
          <select
            value={activeSetIndex}
            onChange={handleSetChange}
            className="rounded-xl border border-[rgba(255,255,255,0.12)] bg-[#0B2345] px-4 py-2 text-sm text-white outline-none"
          >
            {sets.map((set, index) => (
              <option key={set._id} value={index}>
                Set {sets.length - index}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-8 shadow-xl shadow-black/20 backdrop-blur-lg">
        <button
          type="button"
          onClick={() => setShowAnswer((current) => !current)}
          className="min-h-[260px] w-full text-left"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <span className="rounded-full bg-[#FF8C32]/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#FFA74D]">
              {showAnswer ? 'Answer' : 'Question'}
            </span>
            <span className="inline-flex items-center gap-2 text-xs text-[#CBD5E1]/50">
              <RotateCcw className="h-4 w-4" />
              Click to flip
            </span>
          </div>
          <p className="whitespace-pre-wrap text-2xl font-bold leading-relaxed text-white">
            {showAnswer ? activeCard.answer : activeCard.question}
          </p>
        </button>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(255,255,255,0.06)] pt-5 text-sm text-[#CBD5E1]/60">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[rgba(255,255,255,0.06)] px-3 py-1">
              {activeCard.difficulty || 'medium'}
            </span>
            <span className="rounded-full bg-[rgba(255,255,255,0.06)] px-3 py-1">
              Reviewed {activeCard.reviewCount || 0} times
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleStar}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 transition ${
              activeCard.isStarred
                ? 'bg-yellow-500/15 text-yellow-300 hover:bg-yellow-500/20'
                : 'bg-[rgba(255,255,255,0.06)] text-[#CBD5E1]/70 hover:bg-[rgba(255,255,255,0.1)] hover:text-white'
            }`}
          >
            <Star className={`h-4 w-4 ${activeCard.isStarred ? 'fill-current' : ''}`} />
            {activeCard.isStarred ? 'Starred' : 'Star'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button variant="secondary" disabled={activeCardIndex === 0} onClick={handlePrevious}>
          Previous
        </Button>
        <Button
          variant="primary"
          loading={reviewing}
          disabled={reviewing}
          onClick={activeCardIndex === cards.length - 1 ? markReviewed : handleNext}
        >
          {activeCardIndex === cards.length - 1 ? 'Mark reviewed' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default FlashcardsPage;
