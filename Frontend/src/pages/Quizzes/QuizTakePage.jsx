import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Circle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import quizService from '../../services/quizService';

const QuizTakePage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // --- TIMER STATE & REFS ---
  const [timeLeft, setTimeLeft] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);
  const answersRef = useRef(answers); // 🛡️ ALWAYS holds the latest answers
  const TIMER_START_KEY = `quiz_${quizId}_timer_start`;

  // --- KEEP ANSWERS REF IN SYNC ---
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // --- FETCH QUIZ ---
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const data = await quizService.getQuizById(quizId);
        const nextQuiz = data?.data || data;
        setQuiz(nextQuiz);

        if (nextQuiz?.completed) {
          localStorage.removeItem(TIMER_START_KEY);
          navigate(`/quizzes/${quizId}/result`, { replace: true });
        } else {
          const totalQuestions = nextQuiz?.questions?.length || 0;
          const totalSeconds = Math.max(60, totalQuestions * 30); 

          const savedStartTime = localStorage.getItem(TIMER_START_KEY);
          
          if (savedStartTime) {
            const elapsedSeconds = Math.floor((Date.now() - parseInt(savedStartTime)) / 1000);
            const remaining = Math.max(0, totalSeconds - elapsedSeconds);
            setTimeLeft(remaining);
            setIsTimerRunning(remaining > 0);
          } else {
            localStorage.setItem(TIMER_START_KEY, Date.now().toString());
            setTimeLeft(totalSeconds);
            setIsTimerRunning(true);
          }
        }
      } catch (error) {
        toast.error(error.error || error.message || 'Failed to load quiz.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuiz();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [navigate, quizId, TIMER_START_KEY]);

  // --- TIMER TICKER ---
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (isTimerRunning && timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          // 🛡️ IF HITTING 0, CHECK ANSWERS HERE (INSIDE THE UPDATER)
          if (prev <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;

            setIsTimerRunning(false);
            localStorage.removeItem(TIMER_START_KEY);

            const currentAnswers = answersRef.current;

            // Automatically submit all currently selected answers
            handleSubmit(true, currentAnswers);

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const questions = quiz?.questions || [];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  // --- HANDLE SUBMIT ---
  const handleSubmit = async (
      isAutoSubmit = false,
      answersToSubmit = answers
    ) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setIsTimerRunning(false);

      if (!isAutoSubmit && !allAnswered) {
        toast.error('Please answer every question before submitting.');
        setIsTimerRunning(true);
        return;
      }

      const payload = Object.entries(answersToSubmit).map(
        ([questionIndex, selectedAnswer]) => ({
          questionIndex: Number(questionIndex),
          selectedAnswer,
        })
      );

      try {
        setSubmitting(true);

        await quizService.submitQuiz(quizId, payload);

        if (isAutoSubmit) {
          toast('⏰ Time is up! Quiz auto-submitted.');
        } else {
          toast.success('Quiz submitted successfully!');
        }

        navigate(`/quizzes/${quizId}/result`);
      } catch (error) {
        toast.error(
          error.error ||
          error.message ||
          'Failed to submit quiz.'
        );

        console.error(error);

        if (!isAutoSubmit) {
          setIsTimerRunning(true);
        }
      } finally {
        setSubmitting(false);
      }
    };

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium text-[#CBD5E1]">Quiz not found.</p>
        <Link to="/documents" className="text-[#FF8C32] hover:underline">
          Go back to documents
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to={`/documents/${quiz.documentId}`} className="inline-flex items-center gap-2 text-sm text-[#CBD5E1] hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to document
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">{quiz.title || 'Quiz'}</h1>
          <p className="mt-1 text-sm text-[#CBD5E1]/60">
            {answeredCount} of {questions.length} answered
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur-sm border ${
            timeLeft < 60 ? 'border-red-500/30 bg-red-500/10 text-red-400' : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#CBD5E1]'
          }`}>
            <Clock className={`h-4 w-4 ${timeLeft < 60 ? 'animate-pulse' : ''}`} />
            <span className="font-mono font-bold text-sm">{formatTime(timeLeft)}</span>
          </div>
          
          <Button variant="primary" loading={submitting} disabled={!allAnswered} onClick={() => handleSubmit(false)}>
            Submit Quiz
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        {questions.map((question, questionIndex) => (
          <section
            key={question._id || questionIndex}
            className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-6 shadow-xl shadow-black/20 backdrop-blur-lg"
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FF8C32]/15 text-sm font-bold text-[#FFA74D]">
                {questionIndex + 1}
              </span>
              <h2 className="text-lg font-bold leading-relaxed text-white">{question.question}</h2>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {question.options.map((option) => {
                const selected = answers[questionIndex] === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setAnswers((current) => ({ ...current, [questionIndex]: option }))}
                    className={`flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                      selected
                        ? 'border-[#FF8C32]/50 bg-[#FF8C32]/15 text-white'
                        : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#CBD5E1] hover:bg-[rgba(255,255,255,0.08)] hover:text-white'
                    }`}
                  >
                    {selected ? (
                      <CheckCircle className="h-5 w-5 shrink-0 text-[#FFA74D]" />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-[#CBD5E1]/40" />
                    )}
                    <span className="text-sm font-medium">{option}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default QuizTakePage;