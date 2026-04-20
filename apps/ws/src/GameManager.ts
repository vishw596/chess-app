import { WebSocket } from "ws";
import {
    CREATE_INVITE,
    EXIT_GAME,
    GAME_ALERT,
    GAME_ENDED,
    GAME_JOINED,
    GAME_NOT_FOUND,
    INIT_GAME,
    INVITE_CREATED,
    INVITE_EXPIRED,
    JOIN_ROOM,
    MOVE,
} from "@repo/messages/client";
import { Game } from "./Game";
import { socketManager, User } from "./SocketManager";
import { client } from "@repo/db/client";

const INVITE_EXPIRY_MS = 60 * 1000;

type PendingInvite = {
    gameId: string;
    creatorUserId: string;
    expiresAt: number;
};

export class GameManager {
    private games: Game[];
    private users: User[];
    private invitesByGameId: Map<string, PendingInvite>;
    private inviteByCreator: Map<string, string>;
    private inviteTimeouts: Map<string, NodeJS.Timeout>;
    constructor() {
        this.games = [];
        this.users = [];
        this.invitesByGameId = new Map();
        this.inviteByCreator = new Map();
        this.inviteTimeouts = new Map();
    }
    addUser(user: User) {
        this.users.push(user);
        this.addHandler(user);
    }
    removeUser(socket: WebSocket) {
        const user = this.users.find((user) => user.socket === socket);
        if (!user) {
            console.error("user not found");
            return;
        }
        this.users = this.users.filter((user) => user.socket !== socket);
        socketManager.removeUser(user);
    }
    removeGame(gameId: string) {
        console.log("game removed!");
        this.clearInvite(gameId);
        this.games = this.games.filter((game) => game.gameId !== gameId);
    }
    private clearInvite(gameId: string) {
        const invite = this.invitesByGameId.get(gameId);
        if (invite) {
            this.inviteByCreator.delete(invite.creatorUserId);
            this.invitesByGameId.delete(gameId);
        }
        const timeout = this.inviteTimeouts.get(gameId);
        if (timeout) {
            clearTimeout(timeout);
            this.inviteTimeouts.delete(gameId);
        }
    }
    private sendInviteCreated(user: User, gameId: string, expiresAt: number) {
        user.socket.send(
            JSON.stringify({
                type: INVITE_CREATED,
                payload: {
                    gameId,
                    expiresAt,
                },
            })
        );
    }
    private createOrResumeInvite(user: User) {
        const now = Date.now();
        const existingInviteId = this.inviteByCreator.get(user.userId);
        if (existingInviteId) {
            const existingInvite = this.invitesByGameId.get(existingInviteId);
            const existingGame = this.games.find((game) => game.gameId === existingInviteId);
            if (existingInvite && existingGame && existingInvite.expiresAt > now) {
                socketManager.addUser(user, existingInvite.gameId);
                this.sendInviteCreated(user, existingInvite.gameId, existingInvite.expiresAt);
                return;
            }
            this.clearInvite(existingInviteId);
            this.games = this.games.filter((game) => game.gameId !== existingInviteId);
        }

        const game = new Game(user.userId, null);
        this.games.push(game);

        const expiresAt = now + INVITE_EXPIRY_MS;
        const invite: PendingInvite = {
            gameId: game.gameId,
            creatorUserId: user.userId,
            expiresAt,
        };
        this.invitesByGameId.set(game.gameId, invite);
        this.inviteByCreator.set(user.userId, game.gameId);
        socketManager.addUser(user, game.gameId);
        this.sendInviteCreated(user, game.gameId, expiresAt);

        const timeout = setTimeout(() => {
            const activeInvite = this.invitesByGameId.get(game.gameId);
            if (!activeInvite) {
                return;
            }
            const creator = this.users.find((u) => u.userId === activeInvite.creatorUserId);
            if (creator) {
                creator.socket.send(
                    JSON.stringify({
                        type: INVITE_EXPIRED,
                        payload: {
                            gameId: game.gameId,
                        },
                    })
                );
            }
            this.clearInvite(game.gameId);
            this.games = this.games.filter((activeGame) => activeGame.gameId !== game.gameId);
        }, INVITE_EXPIRY_MS);
        this.inviteTimeouts.set(game.gameId, timeout);
    }
    private addHandler(user: User) {
        const socket = user.socket;
        socket.on("message", async (data) => {
            const message = JSON.parse(data.toString());
            if (message.type === CREATE_INVITE || message.type === INIT_GAME) {
                this.createOrResumeInvite(user);
            }
            if (message.type === MOVE) {
                const gameId = message.payload.gameId;
                const game = this.games.find((game) => game.gameId === gameId);
                if (game) {
                    game.makeMove(user, message.payload.move);
                    if (game.result) {
                        this.removeGame(gameId);
                    }
                }
            }
            if (message.type == EXIT_GAME) {
                const gameId = message.payload.gameId;
                const game = this.games.find((game) => game.gameId === gameId);
                if (game) {
                    game.exitGame(user);
                    this.removeGame(game.gameId);
                }
            }
            if (message.type === JOIN_ROOM) {
                const gameId = message.payload.gameId;
                if (!gameId) return;
                let availableGame = this.games.find((game) => game.gameId === gameId);
                const invite = this.invitesByGameId.get(gameId);

                if (invite) {
                    if (Date.now() > invite.expiresAt) {
                        this.clearInvite(gameId);
                        this.games = this.games.filter((game) => game.gameId !== gameId);
                        user.socket.send(
                            JSON.stringify({
                                type: INVITE_EXPIRED,
                                payload: {
                                    gameId,
                                },
                            })
                        );
                        return;
                    }
                    if (!availableGame) {
                        this.clearInvite(gameId);
                        user.socket.send(
                            JSON.stringify({
                                type: GAME_NOT_FOUND,
                            })
                        );
                        return;
                    }
                    if (user.userId === invite.creatorUserId) {
                        socketManager.addUser(user, gameId);
                        this.sendInviteCreated(user, gameId, invite.expiresAt);
                        return;
                    }
                    socketManager.addUser(user, availableGame.gameId);
                    await availableGame.updateSecondPlayer(user.userId);
                    this.clearInvite(gameId);
                    return;
                }

                const gameFromDb = await client.game.findUnique({
                    where: {
                        id: gameId,
                    },
                    include: {
                        moves: {
                            orderBy: {
                                moveNumber: "asc",
                            },
                        },
                        blackPlayer: true,
                        whitePlayer: true,
                    },
                });

                if (availableGame && !availableGame.player2UserId) {
                    if (user.userId === availableGame.player1UserId) {
                        user.socket.send(
                            JSON.stringify({
                                type: GAME_ALERT,
                                payload: {
                                    message: "You cannot join your own invite as opponent",
                                },
                            })
                        );
                        return;
                    }
                    socketManager.addUser(user, availableGame.gameId);
                    await availableGame.updateSecondPlayer(user.userId);
                    this.clearInvite(gameId);
                    return;
                }

                if (!gameFromDb) {
                    user.socket.send(
                        JSON.stringify({
                            type: GAME_NOT_FOUND,
                        })
                    );
                    return;
                }

                if (gameFromDb.status !== "IN_PROGRESS") {
                    user.socket.send(
                        JSON.stringify({
                            type: GAME_ENDED,
                            payload: {
                                result: gameFromDb.result,
                                moves: gameFromDb.moves,
                                status: gameFromDb.status,
                                blackPlayer: {
                                    id: gameFromDb.blackPlayer.id,
                                    name: gameFromDb.blackPlayer.name,
                                },
                                whitePlayer: {
                                    id: gameFromDb.whitePlayer.id,
                                    name: gameFromDb.whitePlayer.name,
                                },
                            },
                        })
                    );
                    return;
                }

                if (!availableGame) {
                    const game = new Game(
                        gameFromDb.whitePlayer.id,
                        gameFromDb.blackPlayer.id,
                        gameFromDb.startAt,
                        gameFromDb.id
                    );
                    game.seedMoves(gameFromDb.moves || []);
                    this.games.push(game);
                    availableGame = game;
                }

                user.socket.send(
                    JSON.stringify({
                        type: GAME_JOINED,
                        payload: {
                            gameId,
                            moves: gameFromDb.moves,
                            blackPlayer: {
                                id: gameFromDb.blackPlayer.id,
                                name: gameFromDb.blackPlayer.name,
                            },
                            whitePlayer: {
                                id: gameFromDb.whitePlayer.id,
                                name: gameFromDb.whitePlayer.name,
                            },
                            player1TimeConsumed: availableGame.getPlayer1TimeConsumed(),
                            player2TimeConsumed: availableGame.getPlayer2TimeConsumed(),
                        },
                    })
                );
                socketManager.addUser(user, gameId);
            }
        });
    }
}
