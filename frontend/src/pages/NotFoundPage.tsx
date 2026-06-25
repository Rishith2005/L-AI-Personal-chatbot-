import React from 'react';
import { Button } from '../components/ui/Button';
import { Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export const NotFoundPage: React.FC = () => {
  const handleHome = () => {
    window.location.hash = '/chat';
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col justify-center items-center px-6">
      <div className="glow-spot top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center z-10 space-y-6 max-w-md"
      >
        <h1 className="font-heading text-9xl font-bold tracking-wide text-white/10 select-none">
          404
        </h1>
        <div className="space-y-2">
          <h2 className="font-heading text-3xl font-medium text-white">
            Lost in Space
          </h2>
          <p className="text-sm text-white/40 leading-relaxed">
            The workspace or resource you are looking for does not exist or has been moved.
          </p>
        </div>

        <Button
          onClick={handleHome}
          variant="glass"
          className="px-6 py-3 flex items-center justify-center gap-2 mx-auto cursor-pointer"
        >
          <Compass className="w-4 h-4" />
          Navigate to Chat
        </Button>
      </motion.div>
    </div>
  );
};
