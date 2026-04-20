import type { Move } from "chess.js"
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, FlagIcon, HandshakeIcon, RefreshCw } from "lucide-react"
import { useEffect, useRef } from "react"
import { useSetRecoilState, useRecoilValue, useRecoilState } from "recoil"
import { isBoardFlippedAtom, movesAtom, userSelectedMoveIndexAtom } from "../store/atoms/chessBoard"

export const MovesTable = () => {
    const [userSelectedMoveIndex, setUserSelectedMoveIndex] = useRecoilState(userSelectedMoveIndexAtom)
    const setIsFlipped = useSetRecoilState(isBoardFlippedAtom)
    const moves = useRecoilValue(movesAtom);
    const movesTableRef = useRef<HTMLDivElement>(null)
    const movesArray = moves.reduce((result, _, index: number, array: Move[]) => {
        if (index % 2 == 0) {
            result.push(array.slice(index, index + 2))
        }
        return result
    }, [] as Move[][])

    useEffect(() => {
        if (movesTableRef && movesTableRef.current) {
            movesTableRef.current.scrollTo({
                top: movesTableRef.current.scrollHeight,
                behavior: 'smooth'
            })
        }
    }, [moves])
    if (moves.length === 0) {
        return (
            <div className="overflow-hidden rounded-[24px] border border-borderColor bg-surfaceDark">
                <div className="border-b border-borderColor p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-textMuted">Move History</h3>
                </div>
                <div className="px-4 py-8 text-sm text-textMuted">
                    Moves will appear here once the game begins.
                </div>
            </div>
        )
        // return <div className="relative w-full bg-slate-800 rounded-lg border border-blue-500/20 overflow-hidden">
        //     <div className="p-3 bg-slate-800 border-b border-blue-500/20">
        //         <h3 className="text-blue-300 font-bold text-base flex items-center">
        //             Move History
        //         </h3>
        //     </div>
        // </div>
    }
    return (
        <div className="relative w-full overflow-hidden rounded-[24px] border border-borderColor bg-surfaceDark">
            <div className="border-b border-borderColor p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-textMuted">
                    Move History
                </h3>
            </div>
            
            <div 
                className="h-full max-h-full overflow-y-auto text-sm no-scrollbar" 
                ref={movesTableRef}
            >
                {movesArray.map((movePairs, index) => {
                    return (
                        <div 
                            key={index}
                            className={`w-full items-stretch px-4 py-2 font-medium ${index % 2 !== 0 ? 'bg-black/10' : 'bg-transparent'}`}
                        >
                            <div className="grid grid-cols-6 gap-4 w-full">
                                <span className="px-2 py-1.5 text-right text-textMuted">
                                    {`${index + 1}.`}
                                </span>
                                {movePairs.map((move, movePairIndex) => {
                                    const isLastIndex = movePairIndex === movePairs.length - 1 && movesArray.length - 1 === index
                                    const isHighlighted = userSelectedMoveIndex !== null ? userSelectedMoveIndex === index * 2 + movePairIndex : isLastIndex
                                    const { san } = move
                                    return (
                                        <div 
                                            key={movePairIndex}
                                            className={`col-span-2 flex w-full cursor-pointer items-center justify-center rounded-md px-2 py-1.5 ${isHighlighted ? 'bg-white/10 text-white' : 'text-textMuted hover:bg-white/5 hover:text-white'}`}
                                            onClick={() => {
                                                setUserSelectedMoveIndex(index * 2 + movePairIndex);
                                            }}
                                        >
                                            <span className={isHighlighted ? 'font-bold' : ''}>{san}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
            {moves.length ? (
                <div className="flex w-full items-center justify-between border-t border-borderColor bg-black/10 p-3">
                   
                    <div className="flex gap-1 rounded-md border border-borderColor bg-black/20 p-1">
                        <button
                            onClick={() => {
                                setUserSelectedMoveIndex(0);
                            }}
                            disabled={userSelectedMoveIndex === 0}
                            className={`rounded-md p-1 ${userSelectedMoveIndex === 0 ? 'text-[#5c5c58]' : 'text-textMuted hover:bg-white/6 hover:text-white'}`}
                            title="Go to first move"
                        >
                            <ChevronFirst size={16} />
                        </button>

                        <button
                            onClick={() => {
                                setUserSelectedMoveIndex((prev) =>
                                    prev !== null ? prev - 1 : moves.length - 2,
                                );
                            }}
                            disabled={userSelectedMoveIndex === 0}
                            className={`rounded-md p-1 ${userSelectedMoveIndex === 0 ? 'text-[#5c5c58]' : 'text-textMuted hover:bg-white/6 hover:text-white'}`}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => {
                                setUserSelectedMoveIndex((prev) =>
                                    prev !== null
                                        ? prev + 1 >= moves.length - 1
                                            ? moves.length - 1
                                            : prev + 1
                                        : null,
                                );
                            }}
                            disabled={userSelectedMoveIndex === null}
                            className={`rounded-md p-1 ${userSelectedMoveIndex === null ? 'text-[#5c5c58]' : 'text-textMuted hover:bg-white/6 hover:text-white'}`}
                        >
                            <ChevronRight size={16} />
                        </button>
                        <button
                            onClick={() => {
                                setUserSelectedMoveIndex(moves.length - 1);
                            }}
                            disabled={userSelectedMoveIndex === null}
                            className={`rounded-md p-1 ${userSelectedMoveIndex === null ? 'text-[#5c5c58]' : 'text-textMuted hover:bg-white/6 hover:text-white'}`}
                            title="Go to last move"
                        >
                            <ChevronLast size={16} />
                        </button>
                        <div className="mx-1 h-5 w-px self-center bg-borderColor"></div>
                        <button
                            onClick={() => {
                                setIsFlipped((prev) => !prev);
                            }}
                            className="rounded-md p-1 text-textMuted hover:bg-white/6 hover:text-white"
                            title="Flip the board"
                        >
                            <RefreshCw size={16} />
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    )
}
