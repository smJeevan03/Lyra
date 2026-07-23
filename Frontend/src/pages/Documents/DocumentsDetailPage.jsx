import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  CheckCircle,
  Clock,
  FileText,
  Layers,
  MessageSquare,
  Trash2,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import * as aiService from '../../services/aiService';
import documentService from '../../services/documentService';

const DocumentsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const [generatedQuizId, setGeneratedQuizId] = useState('');
  const [flashcardsReady, setFlashcardsReady] = useState(false);
  const [generating, setGenerating] = useState({
    flashcards: false,
    quiz: false,
    summary: false,
  });

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const data = await documentService.getDocumentById(id);
        setDocument(data?.data || data);
      } catch (error) {
        toast.error(error.error || error.message || 'Failed to load document details.');
        console.error(error);
        navigate('/documents');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDocument();
    }
  }, [id, navigate]);

  const handleGenerateFlashcards = async () => {
    setGenerating((prev) => ({ ...prev, flashcards: true }));

    try {
      await aiService.generateFlashcards(document._id);
      setFlashcardsReady(true);
      toast.success('Flashcards generated successfully!');
      navigate(`/documents/${document._id}/flashcards`);
    } catch (error) {
      toast.error(error.error || error.message || 'Failed to generate flashcards.');
      console.error(error);
    } finally {
      setGenerating((prev) => ({ ...prev, flashcards: false }));
    }
  };

  const handleGenerateQuiz = async () => {
    setGenerating((prev) => ({ ...prev, quiz: true }));

    try {
      const data = await aiService.generateQuiz(document._id);
      const quiz = data?.data || data;
      if (!quiz?._id) {
        throw new Error('Quiz was generated, but no quiz id was returned.');
      }

      setGeneratedQuizId(quiz._id);
      toast.success('Quiz generated successfully!');
      navigate(`/quizzes/${quiz._id}`);
    } catch (error) {
      toast.error(error.error || error.message || 'Failed to generate quiz.');
      console.error(error);
    } finally {
      setGenerating((prev) => ({ ...prev, quiz: false }));
    }
  };

  const handleGenerateSummary = async () => {
    setGenerating((prev) => ({ ...prev, summary: true }));

    try {
      const data = await aiService.generateSummary(document._id);
      setSummary(data?.data?.summary || data?.summary || '');
      toast.success('Summary generated successfully!');
    } catch (error) {
      toast.error(error.error || error.message || 'Failed to generate summary.');
      console.error(error);
    } finally {
      setGenerating((prev) => ({ ...prev, summary: false }));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await documentService.deleteDocument(id);
      toast.success('Document deleted successfully.');
      navigate('/documents');
    } catch (error) {
      toast.error(error.error || error.message || 'Failed to delete document.');
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

  if (!document) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium text-[#CBD5E1]">Document not found.</p>
        <Link to="/documents" className="text-[#FF8C32] hover:underline">
          Go back to documents
        </Link>
      </div>
    );
  }

  const isReady = document.status === 'ready';

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            to="/documents"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.06)] text-[#CBD5E1] transition hover:bg-[rgba(255,255,255,0.12)] hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </Link>
          <div className="min-w-0">
            <h1 className="max-w-lg truncate text-3xl font-bold tracking-tight text-white">
              {document.title || 'Untitled Document'}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <span className="truncate text-sm text-[#CBD5E1]/60">
                {document.fileName || 'Unknown file'}
              </span>
              <span className="text-[#CBD5E1]/20">&bull;</span>
              <div
                className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                  isReady
                    ? 'border-emerald-500/10 bg-emerald-500/20 text-emerald-400'
                    : 'border-yellow-500/10 bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {isReady ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3 animate-spin-slow" />
                )}
                {document.status || 'unknown'}
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          className="self-start sm:self-center"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-6 shadow-xl shadow-black/20 backdrop-blur-lg">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#CBD5E1]" />
              <h2 className="text-lg font-bold text-white">Extracted Text</h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto whitespace-pre-wrap pr-4 leading-relaxed text-[#CBD5E1] scrollbar-thin scrollbar-thumb-[rgba(255,255,255,0.1)]">
              {document.extractedText || (
                <span className="italic text-[#CBD5E1]/40">
                  No text extracted from this document yet.
                </span>
              )}
            </div>
          </div>

          {summary && (
            <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-6 shadow-xl shadow-black/20 backdrop-blur-lg">
              <div className="mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#FF8C32]" />
                <h2 className="text-lg font-bold text-white">Summary</h2>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed text-[#CBD5E1]">{summary}</p>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <nav className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] shadow-xl shadow-black/20 backdrop-blur-lg">
            <div className="border-b border-[rgba(255,255,255,0.08)] p-5">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-[#FF8C32]" />
                <h2 className="text-base font-bold text-white">AI Workspace</h2>
              </div>
            </div>

            <div className="space-y-2 p-3">
              <button
                type="button"
                disabled={!isReady || generating.flashcards}
                onClick={handleGenerateFlashcards}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[#CBD5E1] transition hover:bg-[rgba(255,255,255,0.08)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FF8C32]/15 text-[#FFA74D]">
                  <Layers className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">Generate Flashcards</span>
                  <span className="block truncate text-xs text-[#CBD5E1]/50">
                    {generating.flashcards ? 'Creating cards...' : 'Practice cards from this document'}
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-[#CBD5E1]/40 group-hover:text-[#FF8C32]" />
              </button>

              {flashcardsReady && (
                <Link
                  to={`/documents/${document._id}/flashcards`}
                  className="ml-[3.25rem] block rounded-lg px-3 py-2 text-xs font-bold text-[#FFA74D] hover:bg-[#FF8C32]/10"
                >
                  View generated flashcards
                </Link>
              )}

              <button
                type="button"
                disabled={!isReady || generating.quiz}
                onClick={handleGenerateQuiz}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[#CBD5E1] transition hover:bg-[rgba(255,255,255,0.08)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                  <BookOpen className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">Generate Quiz</span>
                  <span className="block truncate text-xs text-[#CBD5E1]/50">
                    {generating.quiz ? 'Building quiz...' : 'Test yourself with questions'}
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-[#CBD5E1]/40 group-hover:text-[#FF8C32]" />
              </button>

              {generatedQuizId && (
                <Link
                  to={`/quizzes/${generatedQuizId}`}
                  className="ml-[3.25rem] block rounded-lg px-3 py-2 text-xs font-bold text-[#FFA74D] hover:bg-[#FF8C32]/10"
                >
                  Open generated quiz
                </Link>
              )}

              <button
                type="button"
                disabled={!isReady || generating.summary}
                onClick={handleGenerateSummary}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[#CBD5E1] transition hover:bg-[rgba(255,255,255,0.08)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-300">
                  <Zap className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">Generate Summary</span>
                  <span className="block truncate text-xs text-[#CBD5E1]/50">
                    {generating.summary ? 'Summarizing...' : summary ? 'Summary shown below text' : 'Create a quick overview'}
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-[#CBD5E1]/40 group-hover:text-[#FF8C32]" />
              </button>
            </div>

            <div className="border-t border-[rgba(255,255,255,0.08)] p-3">
              <Link
                to={`/chat/${document._id}`}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[#CBD5E1] transition hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
                  <MessageSquare className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">Chat with AI</span>
                  <span className="block truncate text-xs text-[#CBD5E1]/50">Ask questions separately</span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-[#CBD5E1]/40 group-hover:text-[#FF8C32]" />
              </Link>
            </div>
          </nav>
        </aside>
      </div>
    </div>
  );
};

export default DocumentsDetailPage;
