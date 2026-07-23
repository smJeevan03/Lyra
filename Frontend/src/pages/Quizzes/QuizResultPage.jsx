import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import Spinner from '../../components/common/Spinner';
import quizService from '../../services/quizService';

const QuizResultPage = () => {
  const { quizId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const data = await quizService.getQuizResults(quizId);
        setResult(data?.data || data);
      } catch (error) {
        toast.error(error.error || error.message || 'Failed to load quiz results.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchResults();
    }
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium text-[#CBD5E1]">Quiz results not found.</p>
        <Link to="/documents" className="text-[#FF8C32] hover:underline">
          Go back to documents
        </Link>
      </div>
    );
  }

  const quiz = result.quiz || {};
  const results = result.results || [];

  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {quiz.document?._id && (
            <Link to={`/documents/${quiz.document._id}`} className="inline-flex items-center gap-2 text-sm text-[#CBD5E1] hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to document
            </Link>
          )}
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">{quiz.title || 'Quiz Results'}</h1>
          <p className="mt-1 text-sm text-[#CBD5E1]/60">
            Score: <span className="font-bold text-[#FFA74D]">{quiz.score || 0}%</span>
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {results.map((item) => (
          <section
            key={item.questionIndex}
            className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-6 shadow-xl shadow-black/20 backdrop-blur-lg"
          >
            <div className="mb-4 flex items-start gap-3">
              {item.isCorrect ? (
                <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-emerald-400" />
              ) : (
                <XCircle className="mt-1 h-5 w-5 shrink-0 text-red-400" />
              )}
              <div>
                <h2 className="text-lg font-bold leading-relaxed text-white">{item.question}</h2>
                <p className="mt-2 text-sm text-[#CBD5E1]/70">
                  Your answer: <span className="text-white">{item.selectedAnswer || 'No answer'}</span>
                </p>
                <p className="mt-1 text-sm text-[#CBD5E1]/70">
                  Correct answer: <span className="text-emerald-300">{item.correctAnswer}</span>
                </p>
              </div>
            </div>

            {item.explanation && (
              <p className="rounded-xl bg-[rgba(255,255,255,0.04)] p-4 text-sm leading-relaxed text-[#CBD5E1]">
                {item.explanation}
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

export default QuizResultPage;
