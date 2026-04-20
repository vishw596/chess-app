import { type Color, type PieceSymbol,type Square } from "chess.js"

const ChessSquare = ({
    square
}: {
    square: {
        square: Square;
        type: PieceSymbol;
        color: Color;
    }
}) => {
    return <div className="flex h-full w-full items-center justify-center">
        {square ? (
            <img
                className="h-[82%] w-[82%] object-contain"
                src={`/${square?.color === 'b' ? `b${square.type}` : `w${square.type}`}.png`}
            />
        ) : null}
    </div>
}

export default ChessSquare