/* eslint-disable no-case-declarations */
import { useEffect, useRef, useState } from "react";
import { Button } from "../components/Button";
import { ChessBoard, isPromoting } from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess, Move } from "chess.js";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { userAtom } from "../store/atoms/user";
import {
    CREATE_INVITE,
    EXIT_GAME,
    GAME_ENDED,
    GAME_JOINED,
    GAME_NOT_FOUND,
    GAME_OVER,
    GAME_TIME,
    GAME_TIME_MS,
    INIT_GAME,
    INVITE_CREATED,
    INVITE_EXPIRED,
    JOIN_ROOM,
    MOVE,
    Result,
    USER_TIMEOUT,
} from "@repo/messages"
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../store/hooks/useUser";
import { movesAtom, userSelectedMoveIndexAtom } from "../store/atoms/chessBoard";
import GameEndModal from "../components/GameEndModal";
import { UserAvatar } from "../components/UserAvatar";
import { Waitopponent } from "../components/Waitopponent";
import { ShareGame } from "../components/ShareGame";
import ExitGameModel from "../components/ExitModel";
import { MovesTable } from "../components/MovesTable";
import { motion } from "framer-motion";
import { ArrowLeft, CircleDot, Shuffle } from "lucide-react";

export interface GameResult {
    result: Result;
    by: string;
    rating?: {
        white: { before: number; after: number; delta: number };
        black: { before: number; after: number; delta: number };
    };
}
const moveAudio = new Audio('/move.wav');

export interface Player {
    id: string;
    name: string;
    isGuest: boolean;
}

export interface Metadata {
    blackPlayer: Player;
    whitePlayer: Player;
}

export const Game = () => {
    //the useSocket Hook establishes the connection to the websocket server
    const socket = useSocket();
    const { gameId } = useParams();

    const user = useUser();
    const setUser = useSetRecoilState(userAtom);
    const userRef = useRef(user);
    useEffect(() => {
        userRef.current = user;
    }, [user]);
    const navigate = useNavigate();

    const [chess] = useState(new Chess());
    const [board, setBoard] = useState(chess.board());
    const [added, setAdded] = useState(false);
    const [started, setStarted] = useState(false);
    const [gameMetadata, setGameMetadata] = useState<Metadata | null>(null);
    const [result, setResult] = useState<GameResult | null>(null);
    const [player1TimeConsumed, setPlayer1TimeConsumed] = useState(0);
    const [player2TimeConsumed, setPlayer2TimeConsumed] = useState(0);
    const [gameID, setGameID] = useState("");
    const setMoves = useSetRecoilState(movesAtom);
    const userSelectedMoveIndex = useRecoilValue(userSelectedMoveIndexAtom);
    const userSelectedMoveIndexRef = useRef(userSelectedMoveIndex);

    useEffect(() => {
        userSelectedMoveIndexRef.current = userSelectedMoveIndex
    }, [userSelectedMoveIndex])

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate])

    useEffect(() => {
        if (!socket) {
            return;
        }
        socket.onmessage = function (event) {
            const message = JSON.parse(event.data);
            switch (message.type) {
                case INVITE_CREATED:
                    setAdded(true)
                    setGameID(message.payload?.gameId ?? message.gameId);
                    break;
                case INIT_GAME:
                    setBoard(chess.board());
                    setStarted(true);
                    navigate(`/game/${message.payload.gameId}`)
                    setGameMetadata({
                        blackPlayer: message.payload.blackPlayer,
                        whitePlayer: message.payload.whitePlayer,
                    })
                    break;
                case MOVE:
                    const { move, player1TimeConsumed, player2TimeConsumed } = message.payload;
                    setPlayer1TimeConsumed(player1TimeConsumed)
                    setPlayer2TimeConsumed(player2TimeConsumed)
                    if (userSelectedMoveIndexRef.current !== null) {
                        setMoves((moves) => {
                            const lastMove = moves[moves.length - 1];
                            if (lastMove?.from === move.from && lastMove?.to === move.to && lastMove?.after === move.after) {
                                return moves;
                            }
                            return [...moves, move];
                        });
                        return;
                    }
                    if (move.after && chess.fen() === move.after) {
                        // Ignore echoed socket moves that were already applied locally.
                        setMoves((moves) => {
                            const lastMove = moves[moves.length - 1];
                            if (lastMove?.from === move.from && lastMove?.to === move.to && lastMove?.after === move.after) {
                                return moves;
                            }
                            return [...moves, move];
                        });
                        return;
                    }
                    try {
                        if (isPromoting(chess, move.from, move.to)) {
                            chess.move({
                                from: move.from,
                                to: move.to,
                                promotion: 'q'
                            })
                        } else {
                            chess.move({ from: move.from, to: move.to })
                        }
                        setMoves((moves) => {
                            const lastMove = moves[moves.length - 1];
                            if (lastMove?.from === move.from && lastMove?.to === move.to && lastMove?.after === move.after) {
                                return moves;
                            }
                            return [...moves, move];
                        })
                        moveAudio.play();
                    } catch (error) {
                        // alert('Error in Game.tsx ' + error)
                        console.log('Error in Game.tsx', error);
                    }
                    break;
                case GAME_OVER:
                    setResult(message.payload.result)
                    break;
                case GAME_ENDED:
                    let wonBy;
                    switch (message.payload.status) {
                        case 'COMPLETED':
                            wonBy = message.payload.result !== 'DRAW' ? 'CheckMate' : 'Draw'
                            break;
                        case 'PLAYER_EXIT':
                            wonBy = 'Player Exit'
                            break;
                        default:
                            wonBy = 'Timeout';
                    }
                    const rating = message.payload.rating as GameResult['rating'] | undefined;
                    const uid = userRef.current?.id;
                    if (rating && uid) {
                        const next =
                            uid === message.payload.whitePlayer?.id
                                ? rating.white.after
                                : uid === message.payload.blackPlayer?.id
                                  ? rating.black.after
                                  : undefined;
                        if (next !== undefined) {
                            setUser((prev) => (prev ? { ...prev, rating: next } : null));
                        }
                    }
                    setGameMetadata({
                        blackPlayer: message.payload.blackPlayer,
                        whitePlayer: message.payload.whitePlayer,
                    });
                    setResult({
                        result: message.payload.result,
                        by: wonBy,
                        ...(rating ? { rating } : {}),
                    })
                    chess.reset();
                    setMoves([])
                    setStarted(false)
                    setAdded(false)

                    break;
                case USER_TIMEOUT:
                    setResult(message.payload.win);
                    break;
                case GAME_JOINED:
                    setGameMetadata({
                        blackPlayer: message.payload.blackPlayer,
                        whitePlayer: message.payload.whitePlayer
                    })
                    setPlayer1TimeConsumed(message.payload.player1TimeConsumed);
                    setPlayer2TimeConsumed(message.payload.player2TimeConsumed)
                    console.error(message.payload);
                    setStarted(true);
                    message.payload.moves.map((x: Move) => {
                        if (isPromoting(chess, x.from, x.to)) {
                            chess.move({ ...x, promotion: 'q' })
                        } else {
                            chess.move(x)
                        }
                    })
                    setMoves(message.payload.moves);
                    break;
                case INVITE_EXPIRED:
                    setAdded(false);
                    setGameID("");
                    alert("Invite expired. Please create a new game link.");
                    navigate("/game/random");
                    break;
                case GAME_NOT_FOUND:
                    setAdded(false);
                    setGameID("");
                    alert("This game link is invalid or no longer available.");
                    navigate("/game/random");
                    break;
                case GAME_TIME:
                    setPlayer1TimeConsumed(message.payload.player1Time);
                    setPlayer2TimeConsumed(message.payload.player2Time);
                    break;
                default:
                    alert(message.payload.message)
                    break;
            }
        }
        if (gameId !== "random") {
            socket.send(JSON.stringify({
                type: JOIN_ROOM,
                payload: {
                    gameId
                }
            }))
        }
    }, [chess, gameId, navigate, setMoves, setUser, socket]);
    useEffect(() => {
        if (started) {
            const interval = setInterval(() => {
                if (chess.turn() === 'w') {
                    setPlayer1TimeConsumed((p) => p + 100)
                } else {
                    setPlayer2TimeConsumed((p) => p + 100)
                }
            }, 100)
            return () => clearInterval(interval);
        }
    }, [started, gameMetadata, user])

    const getTimer = (timeConsumed: number) => {
        const timeLeftMs = GAME_TIME_MS - timeConsumed;
        const minutes = Math.floor(timeLeftMs / (1000 * 60));
        const remainingSeconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000)
        return (
            <span className="font-mono text-sm font-semibold tabular-nums text-textMain">
                {minutes < 10 ? '0' : ''}{minutes}:{remainingSeconds < 10 ? '0' : ''}
                {remainingSeconds}
            </span>)
    }
    const handleExit = () => {
        socket?.send(JSON.stringify({
            type: EXIT_GAME, payload: {
                gameId
            }
        }))
        socket?.close()
        setMoves([])
        navigate('/profile')
    }
    if (!socket) return (
        <div className="flex min-h-screen items-center justify-center bg-bgMain px-4 text-textMain">
            <div className="rounded-[24px] border border-borderColor bg-surfaceDark px-6 py-5 text-sm text-textMuted shadow-[0_16px_44px_rgba(0,0,0,0.35)]">
                Connecting to the live match server...
            </div>
        </div>
    )

    const myColor = user?.id === gameMetadata?.blackPlayer.id ? "b" : "w";
    const isMyTurn = started && myColor === chess.turn();

    return (
        <div className={`${started ? "min-h-[100dvh] overflow-y-auto md:h-[100dvh] md:overflow-hidden" : "min-h-[100dvh] overflow-y-auto"} bg-bgMain text-textMain`}>
            {result && (<GameEndModal blackPlayer={gameMetadata?.blackPlayer} whitePlayer={gameMetadata?.whitePlayer} gameResult={result} socket={socket} />)}

            <main className={`flex w-full flex-col md:flex-row ${started ? "min-h-[100dvh] md:h-full md:overflow-hidden" : "min-h-[100dvh]"}`}>
                <section className="flex min-h-0 flex-1 flex-col items-center justify-start gap-2 p-2 sm:gap-3 sm:p-3 md:justify-center md:p-4">
                    <div className="flex w-full max-w-[min(100%,76vh,calc(100dvh-14rem))] items-center justify-between">
                        <button
                            onClick={() => navigate("/profile")}
                            className="flex items-center gap-1.5 rounded-[14px] border border-borderColor bg-black/20 px-3 py-1.5 text-xs text-textMuted transition hover:bg-white/6 hover:text-white"
                        >
                            <ArrowLeft size={13} strokeWidth={2} />
                            Profile
                        </button>
                        {started && (
                            <motion.div
                                key={isMyTurn ? "my" : "opp"}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className={`rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${
                                    isMyTurn
                                        ? "border-white/20 bg-white text-black"
                                        : "border-borderColor bg-surfaceDark text-textMuted"
                                }`}
                            >
                                {isMyTurn ? "Your turn" : "Opponent's turn"}
                            </motion.div>
                        )}
                    </div>

                    {started && (
                        <div className="w-full max-w-[min(100%,76vh,calc(100dvh-14rem))] shrink-0 rounded-[18px] border border-borderColor bg-surfaceDark px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
                            <div className="flex items-center justify-between">
                                <UserAvatar gameMetadata={gameMetadata} />
                                <div className="rounded-[12px] border border-borderColor bg-black/30 px-4 py-1.5 shadow-inner">
                                    {getTimer(user?.id === gameMetadata?.whitePlayer?.id ? player2TimeConsumed : player1TimeConsumed)}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="aspect-square w-full max-w-[min(100%,50dvh)] overflow-hidden rounded-[20px] border border-borderColor shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:max-w-[min(100%,64dvh,calc(100dvh-16rem))] md:max-w-[min(100%,76vh,calc(100dvh-14rem))]">
                        <ChessBoard
                            started={started}
                            gameId={gameId ?? ''}
                            myColor={myColor}
                            chess={chess}
                            board={board}
                            socket={socket}
                            setBoard={setBoard}
                        />
                    </div>

                    {started && (
                        <div className="w-full max-w-[min(100%,76vh,calc(100dvh-14rem))] shrink-0 rounded-[18px] border border-borderColor bg-surfaceDark px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
                            <div className="flex items-center justify-between">
                                <UserAvatar gameMetadata={gameMetadata} self />
                                <div className="rounded-[12px] border border-borderColor bg-black/30 px-4 py-1.5 shadow-inner">
                                    {getTimer(user?.id === gameMetadata?.blackPlayer?.id ? player2TimeConsumed : player1TimeConsumed)}
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                <aside className={`flex w-full shrink-0 flex-col border-t border-borderColor bg-surfaceDark md:w-80 md:border-l md:border-t-0 ${started ? "h-[34dvh] min-h-[220px] max-h-[42dvh] md:h-full md:max-h-none" : "h-auto max-h-none md:h-full md:max-h-none"}`}>
                    <div className="shrink-0 border-b border-borderColor p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <CircleDot size={14} strokeWidth={2} className="text-textMuted" />
                            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-textMuted">Move History</h2>
                        </div>
                        {!started ? (
                            <div className="flex flex-col gap-3">
                                {added ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <Waitopponent />
                                        <ShareGame gameId={gameID} />
                                    </div>
                                ) : (
                                    gameId === 'random' && (
                                        <Button
                                            variant="primary"
                                            size="md"
                                            onClick={() => {
                                                socket.send(JSON.stringify({ type: CREATE_INVITE }))
                                            }}
                                        >
                                            <Shuffle size={15} strokeWidth={2} className="mr-2" />
                                            Create Game Link
                                        </Button>
                                    )
                                )}
                            </div>
                        ) : null}
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto p-3 no-scrollbar">
                        <MovesTable />
                    </div>

                    {started && (
                        <div className="shrink-0 border-t border-borderColor p-3">
                            <ExitGameModel onClick={handleExit} />
                        </div>
                    )}
                </aside>
            </main>
        </div>
    )
}
