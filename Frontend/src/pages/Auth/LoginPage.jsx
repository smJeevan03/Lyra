import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BrainCircuit, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../../hooks/useAuth';
import { login as loginRequest } from '../../services/authService';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { token, user } = await loginRequest(trimmedEmail, password);
      login(user, token);
      toast.success('Logged in successfully!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err.error || err.message || 'Failed to login. Please check your credentials.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full rounded-xl bg-[#0B2345]/60 py-3.5 pl-12 pr-4 text-base text-white outline-none transition-all duration-200 placeholder:text-[#CBD5E1]/60 backdrop-blur-sm border border-[rgba(255,255,255,0.08)] focus:border-[#FF8C32] focus:shadow-[0_0_15px_rgba(255,140,50,0.15)]`;

  return (
    <main className="min-h-screen bg-[#06142D] text-white selection:bg-[#FF8C32] selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-[#FF8C32]/10 blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-[#0B2345]/50 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[#0B2345]/30 blur-[100px]" />
      </div>

      <div className="relative grid min-h-screen lg:grid-cols-[1fr_520px]">
        
        {/* Left Panel - Brand Information */}
        <section className="relative hidden flex-col justify-between overflow-hidden px-14 py-12 lg:flex">
          {/* Left panel subtle grid/pattern for depth */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,140,50,0.08),transparent_50%)]" />

            <div className="relative flex items-center gap-3 group">
                {/* Text Glass Box Container */}
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.06)] backdrop-blur-md border border-[rgba(255,255,255,0.12)] shadow-xl shadow-black/40 group-hover:shadow-[#FF8C32]/20 transition-all duration-500">
                    
                    {/* Neon Pulse Glow Behind Text */}
                    <div className="absolute inset-0 rounded-2xl bg-[#FF8C32]/30 blur-xl animate-[pulse_3s_ease-in-out_infinite]" />
                    
                    {/* Outer Glowing Ring (Rotating) */}
                    <div className="absolute inset-0 rounded-2xl border border-[rgba(255,255,255,0.05)] animate-[spin_8s_linear_infinite]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#FF8C32] shadow-[0_0_10px_rgba(255,140,50,0.8)]" />
                    </div>

                    {/* The Actual Text "Lyra" */}
                    <span className="relative z-10 text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-[#FF8C32] to-[#FFA74D] drop-shadow-[0_0_15px_rgba(255,140,50,0.4)] animate-[float_3s_ease-in-out_infinite]">
                    Lyra
                    </span>

                </div>
            </div>

          <div className="relative max-w-xl">
            <div className="inline-block rounded-full bg-[rgba(255,255,255,0.08)] px-5 py-2 text-sm font-medium text-[#CBD5E1] backdrop-blur-sm border border-[rgba(255,255,255,0.12)] mb-6">
                AI-Powered Study Assistant
            </div>
            <h1 className="text-5xl font-extrabold leading-[1.1] text-white">
              Master your courses <br />
              <span className="bg-gradient-to-r from-[#FF8C32] to-[#FFA74D] bg-clip-text text-transparent">faster than ever.</span>
            </h1>
            <p className="mt-6 text-base leading-relaxed text-[#CBD5E1]">
              Upload documents, generate smart flashcards, and test your knowledge with AI-driven quizzes in one seamless workspace.
            </p>
          </div>

          <p className="relative text-sm text-[#CBD5E1]/70">
            © 2026 Lyra AI. Smarter learning, better results.
          </p>
        </section>

        {/* Right Panel - Glassmorphism Login Form */}
        <section className="relative flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
          {/* The Glass Card */}
          <div className="w-full max-w-sm rounded-3xl bg-[rgba(255,255,255,0.08)] p-8 backdrop-blur-xl border border-[rgba(255,255,255,0.12)] shadow-2xl shadow-black/30">
            
            {/* Mobile Only Logo */}
            <div className="mb-8 lg:hidden text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF8C32] to-[#FFA74D] shadow-lg shadow-[#FF8C32]/30">
                <BrainCircuit className="h-8 w-8 text-white" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-white">LearnSmart AI</h2>
            </div>

            {/* Form Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back</h1>
              <p className="mt-2 text-sm text-[#CBD5E1]">Sign in to continue your learning journey.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#CBD5E1]">
                  Email Address
                </label>
                <div className="relative">
                  <div
                    className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 transition-colors duration-200 ${
                      focusedField === 'email' ? 'text-[#FF8C32]' : 'text-[#CBD5E1]/60'
                    }`}
                  >
                    <Mail className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className={inputClass}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#CBD5E1]">
                  Password
                </label>
                <div className="relative">
                  <div
                    className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 transition-colors duration-200 ${
                      focusedField === 'password' ? 'text-[#FF8C32]' : 'text-[#CBD5E1]/60'
                    }`}
                  >
                    <Lock className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={inputClass}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 backdrop-blur-sm">
                  {error}
                </div>
              )}

              {/* Modern Gradient Accent Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#FF8C32] to-[#FFA74D] px-5 text-sm font-bold text-[#06142D] shadow-lg shadow-[#FF8C32]/30 transition-all duration-300 hover:shadow-[#FF8C32]/50 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {/* Button subtle shine animation */}
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#06142D]/30 border-t-[#06142D]" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-sm text-[#CBD5E1]">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="font-semibold text-[#FF8C32] transition hover:text-[#FFA74D] hover:underline">
                  Create one
                </Link>
              </p>
              <p className="text-[11px] leading-5 text-[#CBD5E1]/60">
                By continuing, you agree to our Terms and Privacy Policy.
              </p>
            </div>
            
          </div>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
