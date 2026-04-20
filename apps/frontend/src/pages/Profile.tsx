import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BACKEND_URL, userAtom } from "../store/atoms/user";
import { useUser } from "../store/hooks/useUser";
import { Button } from "../components/Button";
import { Navbar } from "../components/Navbar";
import { useSetRecoilState } from "recoil";

type ProfileData = {
    id: string;
    username?: string | null;
    displayName: string;
    name?: string | null;
    email: string;
    provider: string;
    rating: number;
    createdAt: string;
    lastLogin?: string | null;
};

type StatsData = {
    rating: number;
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
    bestWinStreak: number;
    favoriteTimeControl: string | null;
    timeControlBreakdown: Array<{ timeControl: string; games: number }>;
    lastGameResult: string | null;
};

type RecentGame = {
    id: string;
    status: string;
    result: string | null;
    resultLabel: "WIN" | "LOSS" | "DRAW";
    timeControl: string;
    startedAt: string;
    endedAt: string | null;
    playerColor: "WHITE" | "BLACK";
    opponent: {
        id: string;
        name: string;
        rating: number;
    };
};

type ActiveGame = {
    id: string;
    status: string;
    timeControl: string;
    startedAt: string;
    currentFen: string | null;
    playerColor: "WHITE" | "BLACK";
    opponent: {
        id: string;
        name: string;
        rating: number;
    };
} | null;

const StatCard = ({ label, value, detail }: { label: string; value: string | number; detail?: string }) => (
    <div className="rounded-[22px] border border-borderColor bg-surfaceDark p-5 shadow-[0_16px_60px_rgba(0,0,0,0.35)]">
        <p className="text-xs uppercase tracking-[0.24em] text-textMuted">{label}</p>
        <p className="mt-3 text-3xl font-semibold text-textMain">{value}</p>
        {detail ? <p className="mt-2 text-sm text-textMuted">{detail}</p> : null}
    </div>
);

const formatDate = (value?: string | null) => {
    if (!value) return "Unavailable";
    return new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const getProviderLabel = (provider?: string) => {
    if (!provider) return "Unknown";
    return provider.charAt(0).toUpperCase() + provider.slice(1).toLowerCase();
};

const getResultTone = (resultLabel: RecentGame["resultLabel"]) => {
    if (resultLabel === "WIN") return "text-[#7ED6A7] border-[#7ED6A7]/30 bg-[#7ED6A7]/10";
    if (resultLabel === "LOSS") return "text-[#C94F4F] border-[#C94F4F]/30 bg-[#C94F4F]/10";
    return "text-textMain border-white/15 bg-white/5";
};

export const Profile = () => {
    const user = useUser();
    const navigate = useNavigate();
    const setUser = useSetRecoilState(userAtom);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [stats, setStats] = useState<StatsData | null>(null);
    const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
    const [activeGame, setActiveGame] = useState<ActiveGame>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (user === null) {
            navigate("/login");
        }
    }, [navigate, user]);

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        const loadProfileDashboard = async () => {
            setIsLoading(true);
            setError("");

            try {
                const [profileRes, statsRes, gamesRes, activeGameRes] = await Promise.all([
                    fetch(`${BACKEND_URL}/profile/me`, { credentials: "include" }),
                    fetch(`${BACKEND_URL}/profile/me/stats`, { credentials: "include" }),
                    fetch(`${BACKEND_URL}/profile/me/games?limit=6`, { credentials: "include" }),
                    fetch(`${BACKEND_URL}/profile/me/active-game`, { credentials: "include" }),
                ]);

                if (!profileRes.ok || !statsRes.ok || !gamesRes.ok || !activeGameRes.ok) {
                    throw new Error("Failed to load dashboard");
                }

                const profileJson = await profileRes.json();
                const statsJson = await statsRes.json();
                const gamesJson = await gamesRes.json();
                const activeGameJson = await activeGameRes.json();

                setProfile(profileJson.profile);
                setStats(statsJson.stats);
                setRecentGames(gamesJson.games ?? []);
                setActiveGame(activeGameJson.activeGame ?? null);
            } catch (fetchError) {
                console.error(fetchError);
                setError("We couldn't load your dashboard right now.");
            } finally {
                setIsLoading(false);
            }
        };

        void loadProfileDashboard();
    }, [user?.id]);

    const initials = useMemo(() => {
        const source = profile?.displayName ?? user?.name ?? "Chess User";
        return source
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("");
    }, [profile?.displayName, user?.name]);


    if (!user?.id) {
        return null;
    }

    return (
        <div className="min-h-screen bg-bgMain text-textMain">
            <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">

                <Navbar />

                {/* ── Page title + primary CTA ── */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-textMuted">Profile Dashboard</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Your chess statistics</h1>
                    </div>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => navigate(activeGame ? `/game/${activeGame.id}` : "/game/random")}
                    >
                        {activeGame ? "Continue Active Game" : "Start Playing"}
                    </Button>
                </div>

                {/* ── Error banner ── */}
                {error ? (
                    <div className="mb-6 rounded-[22px] border border-[#C94F4F]/30 bg-[#C94F4F]/10 p-4 text-sm text-[#F2C0C0]">
                        {error}
                    </div>
                ) : null}

                {/* ── Player Overview (full-width) ── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 rounded-[28px] border border-borderColor bg-surfaceDark p-6 shadow-[0_24px_80px_rgba(0,0,0,0.4)]"
                >
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        {/* Avatar + name + meta */}
                        <div className="flex items-center gap-5">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_top,#ffffff1c,transparent_55%),#111111] text-2xl font-semibold text-white">
                                {initials || "CU"}
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.24em] text-textMuted">Player Overview</p>
                                <h2 className="mt-1.5 text-2xl font-semibold text-white">
                                    {isLoading ? "Loading..." : profile?.displayName ?? user.name ?? "Chess User"}
                                </h2>
                                <p className="mt-1 text-sm text-textMuted">
                                    {profile?.email ?? user.email ?? "Signed in"}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-textMuted">
                                        {getProviderLabel(profile?.provider ?? user.provider)}
                                    </span>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-textMuted">
                                        Joined {formatDate(profile?.createdAt ?? user.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Rating badge */}
                        <div className="rounded-[24px] border border-white/10 bg-black/30 px-6 py-4 text-center sm:text-right">
                            <p className="text-xs uppercase tracking-[0.24em] text-textMuted">Current Rating</p>
                            <p className="mt-1.5 text-4xl font-semibold text-white">
                                {stats?.rating ?? profile?.rating ?? user.rating ?? "--"}
                            </p>
                        </div>
                    </div>
                </motion.section>

                {/* ── Stats Grid ── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 }}
                    className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                >
                    <StatCard label="Games Played" value={isLoading ? "--" : stats?.gamesPlayed ?? 0} />
                    <StatCard
                        label="Wins"
                        value={isLoading ? "--" : stats?.wins ?? 0}
                        detail={`Losses ${stats?.losses ?? 0} • Draws ${stats?.draws ?? 0}`}
                    />
                    <StatCard
                        label="Win Rate"
                        value={isLoading ? "--" : `${stats?.winRate ?? 0}%`}
                        detail={`Best streak ${stats?.bestWinStreak ?? 0}`}
                    />
                    <StatCard
                        label="Favorite Time Control"
                        value={isLoading ? "--" : stats?.favoriteTimeControl ?? "None yet"}
                    />
                    <StatCard
                        label="Last Result"
                        value={isLoading ? "--" : stats?.lastGameResult ?? "No games yet"}
                    />
                </motion.section>

                {/* ── Latest Games (full width) ── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="rounded-[28px] border border-borderColor bg-surfaceDark p-6 shadow-[0_24px_80px_rgba(0,0,0,0.4)]"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-textMuted">Recent Games</p>
                            <h3 className="mt-2 text-2xl font-semibold text-white">Latest match activity</h3>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(activeGame ? `/game/${activeGame.id}` : "/game/random")}
                        >
                            Play
                        </Button>
                    </div>

                    <div className="mt-5 space-y-3">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="h-20 rounded-[20px] border border-white/8 bg-black/20" />
                            ))
                        ) : recentGames.length > 0 ? (
                            recentGames.map((game) => (
                                <div key={game.id} className="rounded-[22px] border border-white/10 bg-black/20 px-5 py-4">
                                    <div className="flex flex-wrap items-center gap-3">
                                        {/* Result badge */}
                                        <span
                                            className={`rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.18em] ${getResultTone(game.resultLabel)}`}
                                        >
                                            {game.resultLabel}
                                        </span>

                                        {/* Time control */}
                                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-textMuted">
                                            {game.timeControl}
                                        </span>

                                        {/* Color played */}
                                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-textMuted">
                                            {game.playerColor}
                                        </span>

                                        {/* Opponent name */}
                                        <span className="text-sm font-medium text-white">
                                            vs {game.opponent.name}
                                        </span>
                                        {/* <span className="text-xs text-textMuted">
                                            Rating {game.opponent.rating}
                                        </span> */}

                                        {/* Date pushed to the right */}
                                        <span className="ml-auto text-xs text-textMuted">
                                            {formatDate(game.startedAt)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-[22px] border border-dashed border-white/15 bg-black/20 px-5 py-12 text-center">
                                <p className="text-lg font-medium text-white">No games yet</p>
                                <p className="mt-2 text-sm text-textMuted">
                                    Your stats and recent matches will appear here after your first game.
                                </p>
                                <div className="mt-5">
                                    <Button variant="primary" size="sm" onClick={() => navigate("/game/random")}>
                                        Start First Game
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.section>
            </div>
        </div>
    );
};
