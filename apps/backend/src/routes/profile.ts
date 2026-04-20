import { Request, Response, Router } from "express";
import { client } from "@repo/db/client";
import { authMiddleware } from "../middleware/authMiddleware";
import { User } from "../passport";

export const profileRouter: Router = Router();

type GameStatus = "IN_PROGRESS" | "COMPLETED" | "ABANDONED" | "TIME_UP" | "PLAYER_EXIT";
type GameResult = "WHITE_WINS" | "BLACK_WINS" | "DRAW";
type TimeControl = "CLASSICAL" | "RAPID" | "BLITZ" | "BULLET";
type RecentGamePerspective = "WHITE" | "BLACK";
const TIME_CONTROLS: TimeControl[] = ["CLASSICAL", "RAPID", "BLITZ", "BULLET"];

type RecentGameRecord = {
    id: string;
    status: GameStatus;
    result: GameResult | null;
    timeControl: TimeControl;
    startAt: Date;
    endAt: Date | null;
    whitePlayerId: string;
    blackPlayerId: string;
    whitePlayer: {
        id: string;
        name: string | null;
        email: string;
        rating: number;
    };
    blackPlayer: {
        id: string;
        name: string | null;
        email: string;
        rating: number;
    };
};

function getAuthenticatedUserId(req: Request) {
    const user = req.user as User | undefined;
    return user?.id ?? null;
}

function getDisplayName(name: string | null, email: string) {
    return name ?? email.split("@")[0];
}

function getPerspective(game: RecentGameRecord, userId: string): RecentGamePerspective {
    return game.whitePlayerId === userId ? "WHITE" : "BLACK";
}

function getOpponent(game: RecentGameRecord, userId: string) {
    const opponent = game.whitePlayerId === userId ? game.blackPlayer : game.whitePlayer;
    return {
        id: opponent.id,
        name: getDisplayName(opponent.name, opponent.email),
        rating: opponent.rating,
    };
}

function getRelativeResult(result: GameResult | null, perspective: RecentGamePerspective) {
    if (result === "DRAW" || result === null) {
        return "DRAW";
    }

    if (perspective === "WHITE") {
        return result === "WHITE_WINS" ? "WIN" : "LOSS";
    }

    return result === "BLACK_WINS" ? "WIN" : "LOSS";
}

function shouldCountForStats(game: Pick<RecentGameRecord, "result">) {
    return game.result !== null;
}

function calculateBestWinStreak(games: RecentGameRecord[], userId: string) {
    let best = 0;
    let current = 0;

    for (const game of games) {
        const relativeResult = getRelativeResult(game.result, getPerspective(game, userId));
        if (relativeResult === "WIN") {
            current += 1;
            best = Math.max(best, current);
        } else {
            current = 0;
        }
    }

    return best;
}

function buildTimeControlBreakdown(games: RecentGameRecord[]) {
    return TIME_CONTROLS.map((timeControl) => ({
        timeControl,
        games: games.filter((game) => game.timeControl === timeControl).length,
    }));
}

profileRouter.use(authMiddleware);

profileRouter.get("/me", async (req: Request, res: Response) => {
    try {
        const userId = getAuthenticatedUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const user = await client.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                provider: true,
                rating: true,
                createdAt: true,
                lastLogin: true,
            },
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.json({
            success: true,
            profile: {
                id: user.id,
                username: user.username,
                displayName: getDisplayName(user.name, user.email),
                name: user.name,
                email: user.email,
                provider: user.provider,
                rating: user.rating,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
            },
        });
    } catch (error) {
        console.error("Profile fetch error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

profileRouter.get("/me/stats", async (req: Request, res: Response) => {
    try {
        const userId = getAuthenticatedUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const [user, games] = await Promise.all([
            client.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    rating: true,
                },
            }),
            client.game.findMany({
                where: {
                    OR: [{ whitePlayerId: userId }, { blackPlayerId: userId }],
                },
                include: {
                    whitePlayer: {
                        select: { id: true, name: true, email: true, rating: true },
                    },
                    blackPlayer: {
                        select: { id: true, name: true, email: true, rating: true },
                    },
                },
                orderBy: {
                    startAt: "asc",
                },
            }),
        ]);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const statGames = games.filter(shouldCountForStats);
        const wins = statGames.filter((game) => getRelativeResult(game.result, getPerspective(game, userId)) === "WIN").length;
        const losses = statGames.filter((game) => getRelativeResult(game.result, getPerspective(game, userId)) === "LOSS").length;
        const draws = statGames.filter((game) => getRelativeResult(game.result, getPerspective(game, userId)) === "DRAW").length;
        const gamesPlayed = statGames.length;
        const favoriteTimeControl = buildTimeControlBreakdown(statGames).sort((a, b) => b.games - a.games)[0];
        const latestCompletedGame = [...statGames].reverse().find((game) => game.result !== null) ?? null;

        return res.json({
            success: true,
            stats: {
                rating: user.rating,
                gamesPlayed,
                wins,
                losses,
                draws,
                winRate: gamesPlayed === 0 ? 0 : Number(((wins / gamesPlayed) * 100).toFixed(2)),
                bestWinStreak: calculateBestWinStreak(statGames, userId),
                favoriteTimeControl: favoriteTimeControl && favoriteTimeControl.games > 0 ? favoriteTimeControl.timeControl : null,
                timeControlBreakdown: buildTimeControlBreakdown(statGames),
                lastGameResult: latestCompletedGame
                    ? getRelativeResult(latestCompletedGame.result, getPerspective(latestCompletedGame, userId))
                    : null,
            },
        });
    } catch (error) {
        console.error("Profile stats error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

profileRouter.get("/me/games", async (req: Request, res: Response) => {
    try {
        const userId = getAuthenticatedUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const limitParam = Number(req.query.limit);
        const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 20) : 10;

        const games = await client.game.findMany({
            where: {
                OR: [{ whitePlayerId: userId }, { blackPlayerId: userId }],
            },
            include: {
                whitePlayer: {
                    select: { id: true, name: true, email: true, rating: true },
                },
                blackPlayer: {
                    select: { id: true, name: true, email: true, rating: true },
                },
            },
            orderBy: {
                startAt: "desc",
            },
            take: limit,
        });

        return res.json({
            success: true,
            games: games.map((game) => {
                const perspective = getPerspective(game, userId);
                const opponent = getOpponent(game, userId);
                return {
                    id: game.id,
                    status: game.status,
                    result: game.result,
                    resultLabel: getRelativeResult(game.result, perspective),
                    timeControl: game.timeControl,
                    startedAt: game.startAt,
                    endedAt: game.endAt,
                    opponent,
                    playerColor: perspective,
                };
            }),
        });
    } catch (error) {
        console.error("Recent games fetch error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

profileRouter.get("/me/active-game", async (req: Request, res: Response) => {
    try {
        const userId = getAuthenticatedUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const activeGame = await client.game.findFirst({
            where: {
                status: "IN_PROGRESS",
                OR: [{ whitePlayerId: userId }, { blackPlayerId: userId }],
            },
            include: {
                whitePlayer: {
                    select: { id: true, name: true, email: true, rating: true },
                },
                blackPlayer: {
                    select: { id: true, name: true, email: true, rating: true },
                },
            },
            orderBy: {
                startAt: "desc",
            },
        });

        if (!activeGame) {
            return res.json({
                success: true,
                activeGame: null,
            });
        }

        const perspective = getPerspective(activeGame, userId);
        return res.json({
            success: true,
            activeGame: {
                id: activeGame.id,
                status: activeGame.status,
                timeControl: activeGame.timeControl,
                startedAt: activeGame.startAt,
                currentFen: activeGame.currentFen,
                playerColor: perspective,
                opponent: getOpponent(activeGame, userId),
            },
        });
    } catch (error) {
        console.error("Active game fetch error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
