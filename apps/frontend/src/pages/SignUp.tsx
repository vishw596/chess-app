import { AuthWrapper } from "../components/AuthWrapper";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSetRecoilState } from "recoil";
import { userAtom } from "../store/atoms/user";
import { motion } from "framer-motion";
import { useUser } from "../store/hooks/useUser";

export const Signup = () => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const setUser = useSetRecoilState(userAtom);
    const user = useUser();

    useEffect(() => {
        if (user?.id) {
            navigate("/profile");
        }
    }, [navigate, user?.id]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validate passwords match
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        // Validate password strength
        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post("http://localhost:3000/auth/signup", {
                email,
                name,
                password
            }, {
                withCredentials: true
            });

            if (response.data.success) {
                setUser(response.data.user);
                navigate("/profile");
            }
        } catch (err: unknown) {            
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || "Signup failed. Please try again.");
            } else {
                setError("Signup failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthWrapper title="Join Chess Verse" showNavbar>
            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 rounded-[18px] border border-[#C94F4F]/30 bg-[#C94F4F]/10 p-3 text-[#F2C0C0]"
                >
                    {error}
                </motion.div>
            )}
            
            <form onSubmit={handleSignup} className="space-y-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <label className="mb-2 block text-sm font-medium text-textMuted">Email</label>
                    <input
                        type="email"
                        className="w-full rounded-[18px] border border-borderColor bg-black/25 px-4 py-3 text-white placeholder:text-textMuted focus:border-white/35 focus:outline-none"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </motion.div>
                
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <label className="mb-2 block text-sm font-medium text-textMuted">Name</label>
                    <input
                        type="text"
                        className="w-full rounded-[18px] border border-borderColor bg-black/25 px-4 py-3 text-white placeholder:text-textMuted focus:border-white/35 focus:outline-none"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </motion.div>
                
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <label className="mb-2 block text-sm font-medium text-textMuted">Password</label>
                    <input
                        type="password"
                        className="w-full rounded-[18px] border border-borderColor bg-black/25 px-4 py-3 text-white placeholder:text-textMuted focus:border-white/35 focus:outline-none"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </motion.div>
                
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <label className="mb-2 block text-sm font-medium text-textMuted">Confirm Password</label>
                    <input
                        type="password"
                        className="w-full rounded-[18px] border border-borderColor bg-black/25 px-4 py-3 text-white placeholder:text-textMuted focus:border-white/35 focus:outline-none"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </motion.div>
                
                <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    type="submit"
                    className="w-full rounded-[18px] border border-white/15 bg-white px-4 py-3 font-semibold text-black transition hover:bg-[#e6e6e0] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            Creating Account...
                        </div>
                    ) : "Create Account"}
                </motion.button>
            </form>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 flex items-center justify-between"
            >
                <span className="w-1/5 border-t border-borderColor lg:w-1/4"></span>
                <span className="text-center text-xs uppercase tracking-wider text-textMuted">or sign up with</span>
                <span className="w-1/5 border-t border-borderColor lg:w-1/4"></span>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-4"
            >
                <button 
                    className="w-full flex items-center justify-center gap-3 rounded-[18px] border border-borderColor bg-black/20 py-3 text-textMain transition hover:bg-white/5"
                    onClick={() => {
                        window.location.href = "http://localhost:3000/auth/google"
                    }}
                    type="button"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="currentColor"/>
                    </svg>
                    Sign up with Google
                </button>
            </motion.div>

            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 text-center text-sm text-textMuted"
            >
                Already have an account?
                <Link to={"/login"} className="ml-1 font-medium text-white transition hover:text-[#d9d9d4] hover:underline">
                    Login
                </Link>
            </motion.p>
        </AuthWrapper>
    );
};
