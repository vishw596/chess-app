import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/Button";
import { Navbar } from "../components/Navbar";
import { useUser } from "../store/hooks/useUser";

const staticPieces = [
    { src: "/wk.png", row: 7, col: 4 },
    { src: "/wq.png", row: 7, col: 3 },
    { src: "/wn.png", row: 5, col: 5 },
    { src: "/wb.png", row: 4, col: 2 },
    { src: "/bk.png", row: 0, col: 4 },
    { src: "/bq.png", row: 0, col: 3 },
    { src: "/bn.png", row: 2, col: 2 },
    { src: "/bp.png", row: 1, col: 4 },
];

export const Home = () => {
    const navigate = useNavigate();
    const user = useUser();

    const handlePrimaryAction = () => {
        if (user?.id) {
            navigate("/profile");
            return;
        }
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-bgMain text-textMain">
            <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
                <Navbar />

                <section className="flex flex-1 items-center py-4">
                    <div className="grid w-full gap-10 lg:grid-cols-[0.95fr,1.05fr] lg:items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mx-auto w-full max-w-[430px] rounded-[20px] border border-borderColor bg-surfaceDark p-3 shadow-[0_20px_70px_rgba(0,0,0,0.45)]"
                        >
                            <div className="mb-3 flex items-center justify-between rounded-[10px] border border-white/10 bg-black/25 px-3 py-2">
                                <p className="text-xs uppercase tracking-[0.2em] text-textMuted">Live Position</p>
                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-textMuted">
                                    Your Turn
                                </span>
                            </div>
                            <div className="relative grid grid-cols-8 overflow-hidden rounded-[12px] border border-white/10">
                                {Array.from({ length: 64 }).map((_, index) => {
                                    const row = Math.floor(index / 8);
                                    const col = index % 8;
                                    const isDark = (row + col) % 2 === 1;
                                    return (
                                        <div
                                            key={index}
                                            className={`aspect-square ${isDark ? "bg-black" : "bg-boardLight"}`}
                                        />
                                    );
                                })}
                                {staticPieces.map((piece, index) => (
                                    <img
                                        key={`${piece.src}-${index}`}
                                        src={piece.src}
                                        alt=""
                                        className="pointer-events-none absolute z-10 h-[12.5%] w-[12.5%] object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.55)]"
                                        style={{
                                            left: `${piece.col * 12.5}%`,
                                            top: `${piece.row * 12.5}%`,
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="mt-3 rounded-[10px] border border-white/10 bg-black/25 px-3 py-2">
                                <p className="font-mono text-xs text-textMuted">1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.06 }}
                            className="mx-auto w-full max-w-xl"
                        >
                            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                                Play Chess Online
                            </h1>
                            <p className="mt-5 max-w-md text-lg leading-8 text-textMuted">
                                Join live matches, track your progress, and keep the focus on strong moves with a clean board-first experience.
                            </p>
                            <div className="mt-8">
                                <div className="flex flex-wrap gap-3">
                                    <Button variant="primary" size="lg" onClick={handlePrimaryAction}>
                                        {user?.id ? "Open Profile" : "Get Started"}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        onClick={() => navigate(user?.id ? "/game/random" : "/signup")}
                                    >
                                        {user?.id ? "Quick Match" : "Create Account"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>
        </div>
    );
};
