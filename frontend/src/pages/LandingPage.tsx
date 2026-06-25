import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNotification } from '../context/NotificationContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { GlassContainer } from '../components/ui/GlassContainer';
import { Divider } from '../components/ui/Divider';
import { Mail, Lock, User, Sparkles, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type AuthView = 'login' | 'register' | 'forgot-password';

export const LandingPage: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  
  const [view, setView] = useState<AuthView>('login');
  const [loading, setLoading] = useState<boolean>(false);
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');

  const resetFields = () => {
    setEmail('');
    setPassword('');
    setUsername('');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || (view !== 'forgot-password' && !password)) {
      showError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      if (view === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        showSuccess('Welcome back!');
      } else if (view === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username || email.split('@')[0],
            },
          },
        });
        if (error) throw error;
        showSuccess('Registration successful! Please check your email for confirmation.');
      } else if (view === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        showSuccess('Password reset link sent! Please check your email.');
        setView('login');
        resetFields();
      }
    } catch (err: any) {
      showError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchView = (newView: AuthView) => {
    setView(newView);
    resetFields();
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col justify-center items-center px-6">
      {/* Dynamic ambient backgrounds */}
      <div className="glow-spot top-1/4 left-1/4" />
      <div className="glow-spot bottom-1/4 right-1/4 bg-white/2" />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        {/* Brand signature */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white text-black font-semibold text-2xl font-heading mb-4 shadow-2xl">
            L
          </div>
          <h1 className="font-heading text-4xl font-semibold tracking-wide text-white">
            L AI
          </h1>
          <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mt-2">
            Your Premium AI Workspace
          </p>
        </div>

        <GlassContainer className="!p-8">
          <AnimatePresence mode="wait">
            {view === 'forgot-password' ? (
              /* Forgot Password View */
              <motion.div
                key="forgot-password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => switchView('login')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white transition-colors mb-5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>
                <h2 className="text-lg font-semibold text-white mb-1">Reset Password</h2>
                <p className="text-xs text-white/40 mb-5 leading-relaxed">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="relative">
                    <Input
                      label="Email Address"
                      id="reset-email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Mail className="absolute right-4 bottom-3 w-4 h-4 text-white/30" />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-3.5 mt-2 font-bold flex items-center justify-center gap-2 cursor-pointer"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-t-black border-black/20 rounded-full animate-spin" />
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </form>
              </motion.div>
            ) : (
              /* Login / Register View */
              <motion.div
                key="auth"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Tab selector */}
                <div className="flex bg-white/5 rounded-xl p-1 mb-6 border border-white/5 select-none">
                  <button
                    onClick={() => switchView('login')}
                    className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      view === 'login' ? 'bg-white text-black shadow-md font-bold' : 'text-white/50 hover:text-white/80'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => switchView('register')}
                    className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      view === 'register' ? 'bg-white text-black shadow-md font-bold' : 'text-white/50 hover:text-white/80'
                    }`}
                  >
                    Register
                  </button>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  {view === 'register' && (
                    <div className="relative">
                      <Input
                        label="Username"
                        id="username"
                        type="text"
                        placeholder="e.g., alex"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                      <User className="absolute right-4 bottom-3 w-4 h-4 text-white/30" />
                    </div>
                  )}

                  <div className="relative">
                    <Input
                      label="Email Address"
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Mail className="absolute right-4 bottom-3 w-4 h-4 text-white/30" />
                  </div>

                  <div className="relative">
                    <Input
                      label="Password"
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Lock className="absolute right-4 bottom-3 w-4 h-4 text-white/30" />
                  </div>

                  {/* Forgot Password link — Login only */}
                  {view === 'login' && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => switchView('forgot-password')}
                        className="text-[11px] font-medium text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-3.5 mt-2 font-bold flex items-center justify-center gap-2 cursor-pointer"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-t-black border-black/20 rounded-full animate-spin" />
                    ) : view === 'login' ? (
                      <>
                        Sign In
                        <Sparkles className="w-4 h-4 text-black/50" />
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>

                {/* Divider + subtle sign-up prompt */}
                {view === 'login' && (
                  <>
                    <Divider label="or" className="my-5" />
                    <p className="text-center text-xs text-white/30">
                      Don't have an account?{' '}
                      <button
                        onClick={() => switchView('register')}
                        className="text-white/60 hover:text-white font-semibold transition-colors cursor-pointer"
                      >
                        Create one
                      </button>
                    </p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </GlassContainer>

        {/* Footer */}
        <p className="text-center text-[10px] text-white/20 mt-6 font-medium tracking-wider">
          Built with precision. Powered by intelligence.
        </p>
      </motion.div>
    </div>
  );
};
