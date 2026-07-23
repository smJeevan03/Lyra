import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as registerRequest } from "../../services/authService";
import { Mail, Lock, ArrowRight, User } from "lucide-react";
import toast from "react-hot-toast";

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedUsername = username.trim();
        const trimmedEmail = email.trim();

        if (!trimmedUsername || !trimmedEmail || !password) {
            setError("Please fill in all fields.");
            return;
        }

        if (trimmedUsername.length < 3) {
            setError("Username must be at least 3 characters long.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        setError('');
        setLoading(true);

        try {
            await registerRequest(trimmedUsername, trimmedEmail, password);
            toast.success('Registration successful! Please log in.');
            navigate('/login');
        } catch (err) {
            const message = err.error || err.message || 'Failed to register. Please try again.';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // Shared styling for inputs with floating glow effect
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

                    <div className="relative max-w-xl mt-8">
                        <div className="inline-block rounded-full bg-[rgba(255,255,255,0.08)] px-5 py-2 text-sm font-medium text-[#CBD5E1] backdrop-blur-sm border border-[rgba(255,255,255,0.12)] mb-6">
                            AI-Powered Study Assistant
                        </div>
                        <h1 className="text-5xl font-extrabold leading-[1.1] text-white">
                            Start your journey <br />
                            <span className="bg-gradient-to-r from-[#FF8C32] to-[#FFA74D] bg-clip-text text-transparent">to academic excellence.</span>
                        </h1>
                        <p className="mt-6 text-base leading-relaxed text-[#CBD5E1]">
                            Join Lyra AI today. Upload documents, generate smart flashcards, and test your knowledge with AI-driven quizzes in one seamless workspace.
                        </p>
                    </div>

                    <p className="relative text-sm text-[#CBD5E1]/70">
                        © 2026 Lyra AI. Smarter learning, better results.
                    </p>
                </section>

                {/* Right Panel - Glassmorphism Register Form */}
                <section className="relative flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
                    <div className="w-full max-w-sm rounded-3xl bg-[rgba(255,255,255,0.08)] p-8 backdrop-blur-xl border border-[rgba(255,255,255,0.12)] shadow-2xl shadow-black/30">
                        
                        {/* Mobile Only Logo */}
                        <div className="mb-8 lg:hidden text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.06)] backdrop-blur-md border border-[rgba(255,255,255,0.12)] shadow-xl shadow-black/40">
                                <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-[#FF8C32] to-[#FFA74D] drop-shadow-[0_0_15px_rgba(255,140,50,0.4)]">
                                    Lyra
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mt-2">Lyra AI</h2>
                        </div>

                        {/* Form Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold tracking-tight text-white">Create account</h1>
                            <p className="mt-2 text-sm text-[#CBD5E1]">Start your AI-powered learning journey today.</p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                            
                            {/* Username Input */}
                            <div>
                                <label htmlFor="username" className="mb-2 block text-sm font-semibold text-[#CBD5E1]">
                                    Username
                                </label>
                                <div className="relative">
                                    <div
                                        className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 transition-colors duration-200 ${
                                            focusedField === 'username' ? 'text-[#FF8C32]' : 'text-[#CBD5E1]/60'
                                        }`}
                                    >
                                        <User className="h-5 w-5" strokeWidth={2} />
                                    </div>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(event) => setUsername(event.target.value)}
                                        onFocus={() => setFocusedField('username')}
                                        onBlur={() => setFocusedField(null)}
                                        className={inputClass}
                                        placeholder="johndoe"
                                        autoComplete="username"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

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
                                    Password (Min. 6 characters)
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
                                        placeholder="Create a strong password"
                                        autoComplete="new-password"
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
                                className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#FF8C32] to-[#FFA74D] px-5 text-sm font-bold text-white shadow-lg shadow-[#FF8C32]/30 transition-all duration-300 hover:shadow-[#FF8C32]/50 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {/* Button subtle shine animation */}
                                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                                
                                {loading ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        Sign up
                                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2.5} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer Links */}
                        <div className="mt-8 flex flex-col items-center gap-3">
                            <p className="text-sm text-[#CBD5E1]">
                                Already have an account?{' '}
                                <Link to="/login" className="font-semibold text-[#FF8C32] transition hover:text-[#FFA74D] hover:underline">
                                    Sign in
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

export default RegisterPage;
