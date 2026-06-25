import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Settings, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileSidebar,
  isMobileSidebarOpen = false,
}) => {
  const { user, profile, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getInitials = () => {
    if (profile?.username) {
      return profile.username.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'L';
  };

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-40 h-[72px] px-4 md:px-6 flex items-center justify-between border-b border-white/8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors cursor-pointer"
            aria-label={isMobileSidebarOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileSidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        )}

        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white text-black font-semibold text-lg font-heading">
          L
        </div>
        <span className="font-heading text-2xl tracking-wide font-medium bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent select-none">
          L AI
        </span>
      </div>

      {user && (
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="profile"
                className="w-6 h-6 rounded-full object-cover border border-white/10"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[10px] font-semibold font-body text-white/80">
                {getInitials()}
              </div>
            )}
            <span className="text-sm font-medium text-white/80 max-w-[120px] truncate hidden sm:inline">
              {profile?.username || user.email?.split('@')[0]}
            </span>
          </motion.button>

          <AnimatePresence>
            {dropdownOpen && (
              <>
                {/* Backdrop clicks */}
                <div
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setDropdownOpen(false)}
                />
                
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="glass absolute right-0 mt-2 w-52 rounded-xl border border-white/8 p-1.5 shadow-2xl z-50 overflow-hidden"
                >
                  <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-white/40">
                      Signed in as
                    </p>
                    <p className="text-xs font-semibold text-white/80 truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      // Navigation handled by router
                      window.location.hash = '/settings';
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4" />
                    Account Settings
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}
    </nav>
  );
};
