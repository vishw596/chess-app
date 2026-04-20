import { redirect, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { useUser } from "../store/hooks/useUser";
import { motion } from "framer-motion";
import axios from "axios";
import { BACKEND_URL, userAtom } from "../store/atoms/user";
import { useSetRecoilState } from "recoil";

export const Landing = () => {
    const navigate = useNavigate();
    const user = useUser();
    const setUser = useSetRecoilState(userAtom)
    const handlePlayNow = () => {
        if (user) {
            navigate("/game/random");
        } else {
            navigate("/login");
        }
    };
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-cyan-500/5 to-blue-800/10"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-blue-500/5 via-cyan-500/5 to-blue-500/5 rounded-full blur-3xl animate-spin" style={{ animationDuration: '20s' }}></div>
            
            <motion.div 
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-10 relative z-10"
            >
                <motion.h1 
                    className="text-5xl md:text-7xl font-bold mb-4 tracking-tight bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent"
                    animate={{ 
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "linear" 
                    }}
                    style={{ backgroundSize: '200% 200%' }}
                >
                    Chess Verse
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="text-xl text-slate-300 max-w-md mx-auto"
                >
                    Challenge your mind with the ultimate game of strategy and skill
                </motion.p>
            </motion.div>
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="relative w-64 h-64 md:w-80 md:h-80 mb-10 group"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
                <motion.img 
                    src="/chess.png" 
                    alt="Chess Board" 
                    className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    transition={{ duration: 0.3 }}
                />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <motion.img 
                        src="/wk.png" 
                        alt="White King" 
                        className="w-16 h-16 md:w-20 md:h-20 object-contain absolute top-1/4 left-1/4 drop-shadow-lg"
                        animate={{ 
                            y: [0, -10, 0],
                            rotate: [0, 5, 0]
                        }}
                        transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                        }}
                    />
                    <motion.img 
                        src="/bq.png" 
                        alt="Black Queen" 
                        className="w-16 h-16 md:w-20 md:h-20 object-contain absolute bottom-1/4 right-1/4 drop-shadow-lg"
                        animate={{ 
                            y: [0, 10, 0],
                            rotate: [0, -5, 0]
                        }}
                        transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 1.5
                        }}
                    />
                </div>
            </motion.div>
            
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="flex flex-col md:flex-row gap-4 relative z-10"
            >
                <Button 
                    onClick={handlePlayNow}
                    variant="primary"
                    size="lg"
                    className=""
                >
                    {user ? "🎮 Play Now!" : "🔐 Login to Play"}
                </Button>
                
                {!user && (
                    <Button 
                        onClick={() => navigate("/signup")}
                        variant="secondary"
                        size="lg"
                    >
                        ✨ Sign Up
                    </Button>
                )}
                
                {user && (
                    <Button 
                        onClick={async() => {
                            const res = await axios.get(`${BACKEND_URL}/auth/logout`,{
                                withCredentials:true
                            })
                            if(res.status == 200)
                            {
                                setUser(null)
                                navigate("/login")
                            }else{
                                alert("Failed to logout")
                                return
                            }
                        }}
                        variant="outline"
                        size="lg"
                    >
                        🚪 Logout
                    </Button>
                )}
            </motion.div>
            
            {user && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                    className="mt-6 px-6 py-3 bg-slate-800/50 rounded-xl border border-blue-500/20 text-slate-300 backdrop-blur-sm"
                >
                    <span className="text-slate-400">Welcome back,</span> 
                    <span className="text-blue-400 font-semibold ml-1">{user.name}</span>
                    <span className="text-slate-400 ml-1">👋</span>
                </motion.div>
            )}
        </div>
    );
};