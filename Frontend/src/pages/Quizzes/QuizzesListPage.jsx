import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  FileText,
  Calendar,
  Plus,
  X,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import quizService from '../../services/quizService';
import documentService from '../../services/documentService'; // You'll need this

const QuizzesListPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  const navigate = useNavigate();

  // Fetch quizzes and documents on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const quizData = await quizService.getAllQuizzes();
        const quizzesList = quizData?.data || quizData || [];
        setQuizzes(quizzesList);
        setFilteredQuizzes(quizzesList);

        // Fetch documents for the dropdown
        try {
          const docsData = await documentService.getDocuments();
          setDocuments(docsData?.data || docsData || []);
        } catch (err) {
          console.error('Failed to load documents for quiz generation');
        }
      } catch (error) {
        toast.error('Failed to load quizzes.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle Search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredQuizzes(quizzes);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      setFilteredQuizzes(
        quizzes.filter(q => 
          q.title.toLowerCase().includes(lowerSearch) || 
          q.documentId?.title.toLowerCase().includes(lowerSearch)
        )
      );
    }
  }, [searchTerm, quizzes]);

  // Handle Quiz Generation
  const handleGenerateQuiz = async () => {
    if (!selectedDocId) {
      toast.error('Please select a document to generate a quiz from.');
      return;
    }

    setIsGenerating(true);
    try {
      // Call your backend service to generate the quiz
      const response = await quizService.generateQuizFromDocument(selectedDocId, numQuestions);
      const newQuiz = response?.data || response;
      
      toast.success('Quiz generated successfully!');
      setIsModalOpen(false);
      
      // Refresh the quiz list
      const updatedQuizData = await quizService.getAllQuizzes();
      const quizzesList = updatedQuizData?.data || updatedQuizData || [];
      setQuizzes(quizzesList);
      setFilteredQuizzes(quizzesList);
      
      // Optionally navigate to the quiz immediately
      navigate(`/quizzes/${newQuiz._id}`);
    } catch (error) {
      toast.error(error.message || 'Failed to generate quiz.');
    } finally {
      setIsGenerating(false);
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
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Quizzes</h1>
          <p className="mt-1 text-sm text-[#CBD5E1]">Review your generated quizzes and track your progress.</p>
        </div>
        
        {/* Generate Quiz Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF8C32] to-[#FFA74D] px-5 py-2.5 text-sm font-bold text-[#06142D] shadow-lg shadow-[#FF8C32]/30 transition-all duration-300 hover:shadow-[#FF8C32]/50 hover:brightness-105"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" strokeWidth={2.5} />
          Generate Quiz
        </button>
      </div>

      {/* Header Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm text-[#CBD5E1]/60">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            {quizzes.filter(q => q.completed).length} Completed
          </span>
          <span className="text-[#CBD5E1]/20">|</span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-yellow-400" />
            {quizzes.filter(q => !q.completed).length} Pending
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-5 w-5 text-[#CBD5E1]/60" strokeWidth={2} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search quizzes..."
          className="w-full rounded-xl bg-[#0B2345]/60 py-3.5 pl-12 pr-4 text-base text-white outline-none transition-all duration-200 placeholder:text-[#CBD5E1]/60 backdrop-blur-sm border border-[rgba(255,255,255,0.08)] focus:border-[#FF8C32] focus:shadow-[0_0_15px_rgba(255,140,50,0.15)]"
        />
      </div>

      {/* Quiz Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-6 py-20 text-center backdrop-blur-sm">
          <div className="rounded-full bg-[rgba(255,255,255,0.06)] p-4 backdrop-blur-sm">
            <BookOpen className="h-12 w-12 text-[#CBD5E1]/40" strokeWidth={1.5} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-white">No quizzes found</h3>
          <p className="mt-1 text-sm text-[#CBD5E1]/60">
            {searchTerm ? 'Try adjusting your search terms.' : 'Click "Generate Quiz" to create your first quiz.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredQuizzes.map((quiz) => {
            const isCompleted = !!quiz.completed;
            
            return (
              <div 
                key={quiz._id} 
                className="group relative overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.05)] p-6 backdrop-blur-lg border border-[rgba(255,255,255,0.08)] shadow-xl shadow-black/20 transition-all duration-300 hover:bg-[rgba(255,255,255,0.08)] hover:scale-[1.02]"
              >
                <div className="absolute inset-0 opacity-0 bg-gradient-to-br from-[#FF8C32]/5 to-transparent transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative z-10 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.06)] backdrop-blur-sm border border-[rgba(255,255,255,0.06)]">
                      <BookOpen className="h-6 w-6 text-[#CBD5E1]" strokeWidth={1.5} />
                    </div>
                    <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider border ${
                      isCompleted 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/10' 
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/10'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3 animate-spin-slow" />}
                      {isCompleted ? 'Completed' : 'Pending'}
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-lg font-bold text-white truncate leading-tight group-hover:text-[#FFA74D] transition-colors">
                      {quiz.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#CBD5E1]/60 truncate">
                      {quiz.documentId?.title || 'No source document'}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-[#CBD5E1]/40">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {quiz.totalQuestions || 0} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {isCompleted ? 'Completed' : 'Created'} {new Date(quiz.completedAt || quiz.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-end border-t border-[rgba(255,255,255,0.06)] pt-4">
                    <Link
                      to={isCompleted ? `/quizzes/${quiz._id}/result` : `/quizzes/${quiz._id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-[rgba(255,255,255,0.06)] px-4 py-2 text-xs font-medium text-[#CBD5E1] backdrop-blur-sm border border-[rgba(255,255,255,0.06)] transition hover:bg-[#FF8C32]/20 hover:text-[#FF8C32] hover:border-[#FF8C32]/30"
                    >
                      {isCompleted ? 'View Results' : 'Take Quiz'}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- Generate Quiz Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[rgba(255,255,255,0.05)] p-6 backdrop-blur-xl border border-[rgba(255,255,255,0.12)] shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Generate New Quiz</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-[#CBD5E1] transition hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Select Document */}
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#CBD5E1]">
                  Select Document
                </label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full rounded-xl bg-[#0B2345]/60 py-3 pl-4 pr-4 text-white outline-none transition-all duration-200 backdrop-blur-sm border border-[rgba(255,255,255,0.08)] focus:border-[#FF8C32] focus:shadow-[0_0_15px_rgba(255,140,50,0.15)]"
                >
                  <option value="">Choose a document...</option>
                  {documents.map(doc => (
                    <option key={doc._id} value={doc._id}>
                      {doc.title || 'Untitled Document'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Number of Questions */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#CBD5E1]">
                  Number of Questions
                </label>
                <div className="flex items-center gap-3">
                  {[5, 10, 15, 20].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setNumQuestions(num)}
                      className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${
                        numQuestions === num
                          ? 'bg-[#FF8C32] text-[#06142D] shadow-lg shadow-[#FF8C32]/30'
                          : 'bg-[rgba(255,255,255,0.06)] text-[#CBD5E1] hover:bg-[rgba(255,255,255,0.12)]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleGenerateQuiz}
                disabled={!selectedDocId || isGenerating}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF8C32] to-[#FFA74D] py-3 text-sm font-bold text-[#06142D] shadow-lg shadow-[#FF8C32]/30 transition hover:shadow-[#FF8C32]/50 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Generate Quiz
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizzesListPage;