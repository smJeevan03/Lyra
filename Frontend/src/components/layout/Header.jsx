import { useAuth } from "../../hooks/useAuth";
import { Bell, User, Menu } from "lucide-react";
import { Link } from "react-router-dom";

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[rgba(255,255,255,0.06)] bg-[#06142D]/80 px-6 backdrop-blur-xl">
      
      {/* Left Section: Mobile Menu Button */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.06)] text-[#CBD5E1] transition hover:bg-[rgba(255,255,255,0.12)] hover:text-white lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} strokeWidth={2} />
        </button>
        
        {/* Optional: You could place a page title here for non-mobile views */}
        <span className="hidden text-sm font-medium text-[#CBD5E1] lg:block">
          Learning Workspace
        </span>
      </div>

      {/* Right Section: Actions & Profile */}
      <div className="flex items-center gap-4">
        
        {/* Notification Bell */}
        <button
          type="button"
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.06)] text-[#CBD5E1] transition hover:bg-[rgba(255,255,255,0.12)] hover:text-white"
          aria-label="Notifications"
        >
          <Bell size={20} strokeWidth={2} className="transition group-hover:-rotate-12" />
          {/* Notification Dot */}
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#FF8C32] shadow-[0_0_8px_rgba(255,140,50,0.6)]" />
        </button>

        {/* User Profile */}
        <Link to="/profile" className="group flex items-center gap-3 rounded-xl bg-[rgba(255,255,255,0.06)] px-3 py-2 pr-4 backdrop-blur-sm border border-[rgba(255,255,255,0.06)] transition hover:bg-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.12)]">
          
          {/* Avatar Container */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FF8C32] to-[#FFA74D] shadow-lg shadow-[#FF8C32]/20">
            <User size={16} strokeWidth={2.5} className="text-[#06142D]" />
          </div>

          {/* User Details (Hidden on small mobile) */}
          <div className="hidden flex-col leading-tight sm:flex">
            <p className="text-sm font-medium text-white transition group-hover:text-[#FFA74D]">
              {user?.username || 'User'}
            </p>
            <p className="text-[11px] text-[#CBD5E1]/60 transition group-hover:text-[#CBD5E1]">
              {user?.email || 'user@example.com'}
            </p>
          </div>

        </Link>
      </div>
    </header>
  );
};

export default Header;
