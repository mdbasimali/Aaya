import { Images, MessageSquare, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const AdminLayout = ({ children }) => {
  const { admin, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Brand */}
            <div className="flex items-center gap-3">
              <img src={logo} alt="Reeyansh Aya Care" className="h-9 w-auto object-contain" />
              <div className="hidden sm:block">
                <p className="text-xs text-slate-400 leading-none">Admin Panel</p>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex items-center gap-1">
              <NavLink
                to="/gallery"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-pink-50 text-pink-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Images size={16} />
                <span>Gallery</span>
              </NavLink>

              <NavLink
                to="/feedback"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-pink-50 text-pink-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <MessageSquare size={16} />
                <span>Feedback</span>
              </NavLink>

              {/* Admin info + logout */}
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
                <span className="hidden sm:block text-xs text-slate-500 max-w-32 truncate">
                  {admin?.email}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
