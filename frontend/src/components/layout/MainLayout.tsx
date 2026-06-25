import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Close mobile sidebar on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcut: Escape closes mobile sidebar
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [mobileSidebarOpen]);

  const toggleMobileSidebar = useCallback(() => {
    setMobileSidebarOpen((prev) => !prev);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black text-white">
      <Navbar
        onToggleMobileSidebar={toggleMobileSidebar}
        isMobileSidebarOpen={mobileSidebarOpen}
      />
      <div className="flex flex-1 h-[calc(100vh-72px)] mt-[72px] overflow-hidden relative">
        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden md:block">
          <Sidebar onNavigate={() => {}} />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
              onClick={closeMobileSidebar}
            />
            {/* Slide-in sidebar */}
            <div className="fixed inset-y-0 left-0 z-50 w-[280px] md:hidden mt-[72px] animate-slide-in-left">
              <Sidebar onNavigate={closeMobileSidebar} />
            </div>
          </>
        )}

        <main className="flex-1 h-full overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
};
