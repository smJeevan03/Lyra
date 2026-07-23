import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import DashboardPage from './pages/DashBoard/DashboardPage'
import ChatPage from './pages/Chat/ChatPage'
import DocumentListPage from './pages/Documents/DocumentListPage'
import DocumentsDetailPage from './pages/Documents/DocumentsDetailPage'
import DocumentUploadPage from './pages/Documents/DocumentUploadPage'
import FlashcardsPage from './pages/Flashcards/FlashcardsPage'
import FlashcardsListPage from './pages/Flashcards/FlashcardsListPage'
import ProfilesPage from './pages/Profile/ProfilesPage'
import QuizTakePage from './pages/Quizzes/QuizTakePage'
import QuizResultPage from './pages/Quizzes/QuizResultPage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import QuizzesListPage from './pages/Quizzes/QuizzesListPage'; // <-- ADD THIS

import { useAuth } from './hooks/useAuth'

const App = () => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <div className='flex justify-center items-center h-screen'>Loading...</div>
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/documents" element={<DocumentListPage />} />
          <Route path="/documents/upload" element={<DocumentUploadPage />} />
          <Route path="/documents/:id" element={<DocumentsDetailPage />} />
          <Route path="/flashcards" element={<FlashcardsListPage />} />
          <Route path="/flashcards/:id" element={<FlashcardsPage />} />
          <Route path="/documents/:id/flashcards" element={<FlashcardsPage />} />
          <Route path="/chat/:id" element={<ChatPage />} />
          <Route path="/quizzes" element={<QuizzesListPage />} />      
          <Route path="/quizzes/:quizId" element={<QuizTakePage />} /> 
          <Route path="/quizzes/:quizId/result" element={<QuizResultPage />} /> 
          <Route path="/quizzes/results" element={<QuizzesListPage />} /> 
          <Route path="/profile" element={<ProfilesPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App
