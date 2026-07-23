import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Clock,
  FileText,
  Layers,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import * as aiService from '../../services/aiService';
import documentService from '../../services/documentService';
import flashcardService from '../../services/flashcardService';

const getDocumentId = (set) => {
  if (!set?.documentId) return '';
  return typeof set.documentId === 'string' ? set.documentId : set.documentId._id;
};

const getDocumentTitle = (set) => {
  if (!set?.documentId || typeof set.documentId === 'string') return 'No source document';
  return set.documentId.title || set.documentId.fileName || 'Untitled document';
};

const formatDate = (date) => {
  if (!date) return 'Never';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

const getLastReviewed = (cards = []) => {
  const reviewedDates = cards
    .map((card) => card.lastReviewed)
    .filter(Boolean)
    .map((date) => new Date(date).getTime());

  if (reviewedDates.length === 0) return null;
  return new Date(Math.max(...reviewedDates));
};

const FlashcardsListPage = () => {
  const navigate = useNavigate();
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState('');
  const [cardCount, setCardCount] = useState(10);

  const loadFlashcards = async () => {
    const response = await flashcardService.getAllFlashcardSets();
    const sets = response?.data || response;
    setFlashcardSets(Array.isArray(sets) ? sets : []);
  };

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        const [flashcardResponse, documentResponse] = await Promise.all([
          flashcardService.getAllFlashcardSets(),
          documentService.getDocuments(),
        ]);

        const sets = flashcardResponse?.data || flashcardResponse;
        const readyDocs = Array.isArray(documentResponse)
          ? documentResponse.filter((document) => document.status === 'ready')
          : [];

        setFlashcardSets(Array.isArray(sets) ? sets : []);
        setDocuments(readyDocs);
        setSelectedDocumentId((current) => current || readyDocs[0]?._id || '');
      } catch (error) {
        toast.error(error.error || error.message || 'Failed to load flashcards.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, []);

  const filteredSets = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return flashcardSets;

    return flashcardSets.filter((set) => {
      const title = set.title || `${getDocumentTitle(set)} Flashcards`;
      const source = getDocumentTitle(set);

      return title.toLowerCase().includes(query) || source.toLowerCase().includes(query);
    });
  }, [flashcardSets, searchTerm]);

  const totals = useMemo(() => {
    return flashcardSets.reduce(
      (stats, set) => {
        const cards = Array.isArray(set.cards) ? set.cards : [];
        stats.cards += cards.length;
        stats.reviewed += cards.filter((card) => card.reviewCount > 0).length;
        stats.starred += cards.filter((card) => card.isStarred).length;
        return stats;
      },
      { cards: 0, reviewed: 0, starred: 0 }
    );
  }, [flashcardSets]);

  const handleGenerateFlashcards = async (event) => {
    event.preventDefault();

    if (!selectedDocumentId) {
      toast.error('Choose a ready document first.');
      return;
    }

    try {
      setGenerating(true);
      const response = await aiService.generateFlashcards(selectedDocumentId, { count: cardCount });
      const generatedSet = response?.data || response;

      toast.success('Flashcards created successfully.');
      setShowCreatePanel(false);
      await loadFlashcards();

      const documentId =
        typeof generatedSet.documentId === 'string'
          ? generatedSet.documentId
          : generatedSet.documentId?._id || selectedDocumentId;

      navigate(`/documents/${documentId}/flashcards`);
    } catch (error) {
      toast.error(error.error || error.message || 'Failed to create flashcards.');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (event, setId, title) => {
    event.preventDefault();
    event.stopPropagation();

    if (!window.confirm(`Delete "${title}"?`)) return;

    try {
      await flashcardService.deleteFlashcardSet(setId);
      setFlashcardSets((current) => current.filter((set) => set._id !== setId));
      toast.success('Flashcard set deleted.');
    } catch (error) {
      toast.error(error.error || error.message || 'Failed to delete flashcards.');
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

  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Flashcards</h1>
          <p className="mt-1 text-sm text-[#CBD5E1]">Create, open, review, and manage AI-generated study cards.</p>
        </div>

        <Button onClick={() => setShowCreatePanel((current) => !current)}>
          <Plus className="h-4 w-4" />
          New Flashcards
        </Button>
      </div>

      {showCreatePanel && (
        <form
          onSubmit={handleGenerateFlashcards}
          className="grid gap-5 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-5 shadow-xl shadow-black/20 backdrop-blur-lg md:grid-cols-[minmax(0,1fr)_160px_auto]"
        >
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#CBD5E1]">Source document</span>
            <select
              value={selectedDocumentId}
              onChange={(event) => setSelectedDocumentId(event.target.value)}
              className="h-12 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#0B2345] px-4 text-sm text-white outline-none focus:border-[#FF8C32]"
            >
              {documents.length === 0 ? (
                <option value="">No ready documents available</option>
              ) : (
                documents.map((document) => (
                  <option key={document._id} value={document._id}>
                    {document.title || document.fileName || 'Untitled document'}
                  </option>
                ))
              )}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#CBD5E1]">Card count</span>
            <input
              type="number"
              min="3"
              max="30"
              value={cardCount}
              onChange={(event) => setCardCount(Number(event.target.value))}
              className="h-12 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#0B2345] px-4 text-sm text-white outline-none focus:border-[#FF8C32]"
            />
          </label>

          <div className="flex items-end">
            <Button type="submit" loading={generating} disabled={!selectedDocumentId || generating} className="h-12 w-full">
              <BrainCircuit className="h-4 w-4" />
              Generate
            </Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.05)] p-4 backdrop-blur-sm">
          <p className="text-xs font-medium text-[#CBD5E1]/60">Total Sets</p>
          <p className="mt-1 text-2xl font-bold text-white">{flashcardSets.length}</p>
        </div>
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.05)] p-4 backdrop-blur-sm">
          <p className="text-xs font-medium text-[#CBD5E1]/60">Total Cards</p>
          <p className="mt-1 text-2xl font-bold text-white">{totals.cards}</p>
        </div>
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.05)] p-4 backdrop-blur-sm">
          <p className="text-xs font-medium text-[#CBD5E1]/60">Reviewed</p>
          <p className="mt-1 text-2xl font-bold text-white">{totals.reviewed}</p>
        </div>
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.05)] p-4 backdrop-blur-sm">
          <p className="text-xs font-medium text-[#CBD5E1]/60">Starred</p>
          <p className="mt-1 text-2xl font-bold text-white">{totals.starred}</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-5 w-5 text-[#CBD5E1]/60" strokeWidth={2} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search flashcard sets..."
          className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#0B2345]/60 py-3.5 pl-12 pr-4 text-base text-white outline-none backdrop-blur-sm transition-all duration-200 placeholder:text-[#CBD5E1]/60 focus:border-[#FF8C32] focus:shadow-[0_0_15px_rgba(255,140,50,0.15)]"
        />
      </div>

      {filteredSets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-6 py-20 text-center backdrop-blur-sm">
          <div className="rounded-full bg-[rgba(255,255,255,0.06)] p-4 backdrop-blur-sm">
            <Layers className="h-12 w-12 text-[#CBD5E1]/40" strokeWidth={1.5} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-white">No flashcard sets found</h3>
          <p className="mt-1 max-w-md text-sm text-[#CBD5E1]/60">
            {searchTerm ? 'Try adjusting your search terms.' : 'Generate your first set from a ready document.'}
          </p>
          {!searchTerm && documents.length === 0 && (
            <Link to="/documents/upload" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#FFA74D] hover:text-[#FF8C32]">
              <FileText className="h-4 w-4" />
              Upload a document
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredSets.map((set) => {
            const cards = Array.isArray(set.cards) ? set.cards : [];
            const reviewedCount = cards.filter((card) => card.reviewCount > 0).length;
            const starredCount = cards.filter((card) => card.isStarred).length;
            const progress = cards.length ? Math.round((reviewedCount / cards.length) * 100) : 0;
            const sourceDocumentId = getDocumentId(set);
            const sourceTitle = getDocumentTitle(set);
            const title = set.title || `${sourceTitle} Flashcards`;

            return (
              <Link
                key={set._id}
                to={sourceDocumentId ? `/documents/${sourceDocumentId}/flashcards` : '/flashcards'}
                className="group relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-6 shadow-xl shadow-black/20 backdrop-blur-lg transition-all duration-300 hover:scale-[1.01] hover:bg-[rgba(255,255,255,0.08)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF8C32]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.06)] backdrop-blur-sm">
                      <BrainCircuit className="h-6 w-6 text-[#CBD5E1]" strokeWidth={1.5} />
                    </div>
                    <button
                      type="button"
                      onClick={(event) => handleDelete(event, set._id, title)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-[#CBD5E1]/55 transition hover:bg-red-500/10 hover:text-red-300"
                      aria-label={`Delete ${title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="truncate text-lg font-bold leading-tight text-white transition-colors group-hover:text-[#FFA74D]">
                      {title}
                    </h3>
                    <p className="mt-1 truncate text-sm text-[#CBD5E1]/60">
                      {sourceTitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-[#CBD5E1]/65">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] px-2.5 py-2">
                      <BookOpen className="h-3.5 w-3.5" />
                      {cards.length} cards
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] px-2.5 py-2">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {reviewedCount} reviewed
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] px-2.5 py-2">
                      <Star className={`h-3.5 w-3.5 ${starredCount ? 'fill-yellow-300 text-yellow-300' : ''}`} />
                      {starredCount} starred
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] px-2.5 py-2">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDate(getLastReviewed(cards))}
                    </span>
                  </div>

                  <div className="border-t border-[rgba(255,255,255,0.06)] pt-4">
                    <div className="mb-2 flex items-center justify-between text-xs text-[#CBD5E1]/60">
                      <span>{progress}% complete</span>
                      <span>{formatDate(set.createdAt)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF8C32] to-[#FFA74D] transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FlashcardsListPage;
