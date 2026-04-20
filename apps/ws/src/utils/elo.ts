/** Standard Elo expected score: E = 1 / (1 + 10^((opponentRating - playerRating) / 400)) */
const K = 32;

export function expectedScore(playerRating: number, opponentRating: number): number {
    return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}

/** newRating = oldRating + K * (score - expected); win=1, draw=0.5, loss=0 */
export function computeEloPair(
    whiteRating: number,
    blackRating: number,
    result: "WHITE_WINS" | "BLACK_WINS" | "DRAW"
): {
    newWhiteRating: number;
    newBlackRating: number;
    whiteDelta: number;
    blackDelta: number;
} {
    let whiteScore: number;
    let blackScore: number;
    switch (result) {
        case "WHITE_WINS":
            whiteScore = 1;
            blackScore = 0;
            break;
        case "BLACK_WINS":
            whiteScore = 0;
            blackScore = 1;
            break;
        case "DRAW":
            whiteScore = 0.5;
            blackScore = 0.5;
            break;
    }

    const eWhite = expectedScore(whiteRating, blackRating);
    const eBlack = expectedScore(blackRating, whiteRating);

    const newWhiteRating = Math.round(whiteRating + K * (whiteScore - eWhite));
    const newBlackRating = Math.round(blackRating + K * (blackScore - eBlack));
    console.log("At 41 elo.ts   ", newBlackRating, newWhiteRating);

    return {
        newWhiteRating,
        newBlackRating,
        whiteDelta: newWhiteRating - whiteRating,
        blackDelta: newBlackRating - blackRating,
    };
}
