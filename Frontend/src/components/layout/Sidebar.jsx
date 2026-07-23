import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { 
  LayoutDashboard, 
  FileText, 
  Layers, 
  BrainCircuit, 
  LogOut, 
  X,
  BookOpen, // <-- Added this icon for Quizzes
  User
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Navigation Links Configuration (Added "Quizzes")
  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/documents', label: 'Documents', icon: FileText },
    { to: '/flashcards', label: 'Flashcards', icon: Layers },
    { to: '/quizzes', label: 'Quizzes', icon: BookOpen }, // <-- Added
    { to: '/profile', label: 'Profile', icon: User },
  ];

  // Helper to check if a Quiz route is active (takes results pages into account)
  const isQuizActive = (to) => {
    if (to === '/quizzes') {
      return location.pathname.startsWith('/quizzes');
    }
    return false;
  };

  return (
    <>
      {/* Mobile Overlay (Closes sidebar when clicking outside on mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" 
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-[rgba(255,255,255,0.06)] 
          bg-[#06142D]/95 backdrop-blur-xl transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        
        {/* Sidebar Header (Logo & Close Button) */}
        <div className="flex h-16 items-center justify-between border-b border-[rgba(255,255,255,0.06)] px-6">
          
          <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.06)] backdrop-blur-md border border-[rgba(255,255,255,0.12)]">
              <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-br from-[#FF8C32] to-[#FFA74D]">
                L
              </span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold text-white tracking-tight">Lyra</span>
              <span className="text-[8px] font-semibold tracking-[0.3em] text-[#CBD5E1]/60 uppercase">AI</span>
            </div>
          </Link>

          {/* Mobile Close Button */}
          <button 
            type="button"
            onClick={toggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#CBD5E1] transition hover:bg-[rgba(255,255,255,0.08)] hover:text-white lg:hidden"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-[rgba(255,255,255,0.1)]">
          {navLinks.map((link) => {
            // Special handling for Quizzes to detect child routes (Take / Result)
            const isActive = link.to === '/quizzes' 
              ? isQuizActive(link.to) 
              : location.pathname === link.to;

            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => isSidebarOpen && toggleSidebar()} // Auto-close on mobile when clicked
                className={`
                  group flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors duration-150
                  ${isActive 
                    ? 'border-[rgba(255,140,50,0.18)] bg-[rgba(255,140,50,0.14)] text-white shadow-lg shadow-[#FF8C32]/5' 
                    : 'border-transparent text-[#CBD5E1] hover:border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.06)] hover:text-white'
                  }
                `}
              >
                <>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-br from-[#FF8C32] to-[#FFA74D] shadow-md shadow-[#FF8C32]/25' 
                      : 'bg-[rgba(255,255,255,0.06)] group-hover:bg-[rgba(255,255,255,0.12)]'
                  }`}>
                    <link.icon className={`h-5 w-5 ${
                      isActive ? 'text-[#06142D]' : 'text-[#CBD5E1] group-hover:text-white'
                    }`} strokeWidth={2} />
                  </div>
                  <span className="flex-1">{link.label}</span>
                  <div className={`h-2 w-2 rounded-full transition-colors duration-150 ${
                    isActive ? 'bg-[#FF8C32] shadow-[0_0_8px_rgba(255,140,50,0.6)]' : 'bg-transparent'
                  }`} />
                </>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer (Logout Button) */}
        <div className="border-t border-[rgba(255,255,255,0.06)] p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 transition group-hover:bg-red-500/20">
              <LogOut className="h-5 w-5" strokeWidth={2} />
            </div>
            <span>Logout</span>
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;