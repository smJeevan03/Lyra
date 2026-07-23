import { useState, useEffect } from 'react';
import Spinner from '../../components/common/Spinner';
import progressService from '../../services/progressService';
import toast from 'react-hot-toast';

import { 
  FileText, 
  BookOpen, 
  BrainCircuit, 
  TrendingUp, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const formatDate = (dateValue) => {
  if (!dateValue) {
    return 'Recently';
  }

  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? 'Recently' : date.toLocaleDateString();
};

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await progressService.getDashboardData();
        setDashboardData(data.data || data);
      } catch (error) {
        toast.error(error.error || error.message || 'Failed to fetch dashboard data.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06142D] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!dashboardData || !dashboardData.overview) {
    return (
      <div className="min-h-screen bg-[#06142D] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm p-8 rounded-3xl bg-[rgba(255,255,255,0.05)] backdrop-blur-md border border-[rgba(255,255,255,0.08)] shadow-xl">
          <div className="rounded-full bg-[rgba(255,255,255,0.06)] p-4 backdrop-blur-sm border border-[rgba(255,255,255,0.08)]">
            <TrendingUp className="h-10 w-10 text-[#CBD5E1]" />
          </div>
          <p className="text-lg font-medium text-[#CBD5E1]">No dashboard data available.</p>
          <p className="text-sm text-[#CBD5E1]/60">Start by uploading your first document.</p>
          <Link to="/documents" className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF8C32] to-[#FFA74D] px-6 py-2.5 text-sm font-bold text-[#06142D] shadow-lg shadow-[#FF8C32]/30 transition hover:brightness-105">
            Go to Documents <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Stats Array
  const stats = [
    {
      label: 'Total Documents',
      value: dashboardData.overview.totalDocuments || 0,
      icon: FileText,
      gradient: 'from-blue-400 to-cyan-500',
      shadowColor: 'shadow-blue-500/25',
      bgGlow: 'bg-blue-500/10'
    },
    {
      label: 'Total Flashcards',
      value: dashboardData.overview.totalFlashcards || 0,
      icon: BookOpen,
      gradient: 'from-purple-400 to-pink-500',
      shadowColor: 'shadow-purple-500/25',
      bgGlow: 'bg-purple-500/10'
    },
    {
      label: 'Total Quizzes',
      value: dashboardData.overview.totalQuizzes || 0,
      icon: BrainCircuit,
      gradient: 'from-emerald-400 to-teal-500',
      shadowColor: 'shadow-emerald-500/25',
      bgGlow: 'bg-emerald-500/10'
    },
    {
      label: 'Avg. Score',
      value: `${dashboardData.overview.averageScore || 0}%`,
      icon: TrendingUp,
      gradient: 'from-orange-400 to-[#FF8C32]',
      shadowColor: 'shadow-[#FF8C32]/30',
      bgGlow: 'bg-[#FF8C32]/10'
    },
  ];

    return (
    <main className="flex-1 bg-[#06142D] text-white selection:bg-[#FF8C32] selection:text-white overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -right-32 h-[600px] w-[600px] rounded-full bg-[#FF8C32]/5 blur-[150px]" />
        <div className="absolute -bottom-32 -left-32 h-[600px] w-[600px] rounded-full bg-[#0B2345]/50 blur-[120px]" />
        <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-[#FF8C32]/5 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-4 lg:px-10 min-h-full flex flex-col">
        {/* Hero Greeting */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight">Welcome back!</h1>
          <p className="mt-2 text-[#CBD5E1]">Here's an overview of your learning progress.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="relative overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.05)] p-6 backdrop-blur-lg border border-[rgba(255,255,255,0.08)] shadow-xl shadow-black/20 transition-all duration-300 hover:bg-[rgba(255,255,255,0.08)] hover:scale-[1.02] group"
            >
              <div className={`absolute inset-0 opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-20 ${stat.bgGlow}`} />
              
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#CBD5E1]">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`rounded-xl bg-[rgba(255,255,255,0.06)] p-3 backdrop-blur-sm border border-[rgba(255,255,255,0.06)] shadow-lg ${stat.shadowColor}`}>
                  <stat.icon className="h-6 w-6 text-white" strokeWidth={2}/>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Documents */}
          <div className="rounded-2xl bg-[rgba(255,255,255,0.05)] p-6 backdrop-blur-lg border border-[rgba(255,255,255,0.08)] shadow-xl shadow-black/20">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#CBD5E1]" />
                <h2 className="text-lg font-bold text-white">Recent Documents</h2>
              </div>
            </div>
            
            <div className="space-y-3">
              {dashboardData.recentActivity?.documents?.length > 0 ? (
                dashboardData.recentActivity.documents.map((doc) => (
                <Link
                    key={doc._id}
                    to={`/documents/${doc._id}`}
                    className="block"
                >
                    <div className="flex cursor-pointer items-center justify-between rounded-xl bg-[rgba(255,255,255,0.04)] p-4 backdrop-blur-sm border border-[rgba(255,255,255,0.04)] transition hover:bg-[rgba(255,255,255,0.08)] hover:scale-[1.01]">
                    <div className="flex items-center gap-3 truncate">
                        <div className="rounded-lg bg-[rgba(255,255,255,0.06)] p-2">
                        <FileText className="h-4 w-4 text-[#CBD5E1]" />
                        </div>

                        <div className="truncate">
                        <p className="font-medium text-white truncate">
                            {doc.title || "Untitled Document"}
                        </p>

                        <p className="text-xs text-[#CBD5E1]/60">
                            {formatDate(doc.lastAccessed)}
                        </p>
                        </div>
                    </div>

                    <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${
                        doc.status === "ready"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/10"
                            : "bg-slate-500/20 text-slate-400 border border-slate-500/10"
                        }`}
                    >
                        {doc.status || "Processing"}
                    </span>
                    </div>
                </Link>
                ))
              ) : (
                <p className="text-sm text-[#CBD5E1]/60 py-4 text-center">No recent documents found.</p>
              )}
            </div>
          </div>

          {/* Recent Quizzes */}
          <div className="rounded-2xl bg-[rgba(255,255,255,0.05)] p-6 backdrop-blur-lg border border-[rgba(255,255,255,0.08)] shadow-xl shadow-black/20">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-[#CBD5E1]" />
                <h2 className="text-lg font-bold text-white">Recent Quizzes</h2>
              </div>
            </div>

            <div className="space-y-3">
              {dashboardData.recentActivity?.quizzes?.length > 0 ? (
                dashboardData.recentActivity.quizzes.map((quiz) => (
                <Link
                    key={quiz._id}
                    to={quiz.completed ? `/quizzes/${quiz._id}/result` : `/quizzes/${quiz._id}`}
                    className="block"
                >
                    <div className="flex cursor-pointer items-center justify-between rounded-xl bg-[rgba(255,255,255,0.04)] p-4 backdrop-blur-sm border border-[rgba(255,255,255,0.04)] transition hover:bg-[rgba(255,255,255,0.08)] hover:scale-[1.01]">
                    <div className="flex items-center gap-3 truncate">
                        <div className="rounded-lg bg-[rgba(255,255,255,0.06)] p-2">
                        <CheckCircle className="h-4 w-4 text-[#CBD5E1]" />
                        </div>

                        <div className="truncate">
                        <p className="font-medium text-white truncate">
                            {quiz.title || "Untitled Quiz"}
                        </p>

                        <p className="text-xs text-[#CBD5E1]/60">
                            Score:
                            <span className="font-semibold text-[#FF8C32]">
                            {" "}
                            {quiz.score || 0}%
                            </span>
                        </p>
                        </div>
                    </div>

                    <span className="text-xs text-[#CBD5E1]/50">
                        {formatDate(
                        quiz.completedAt || quiz.updatedAt || quiz.createdAt
                        )}
                    </span>
                    </div>
                </Link>
                ))
              ) : (
                <p className="text-sm text-[#CBD5E1]/60 py-4 text-center">No quizzes taken yet.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
