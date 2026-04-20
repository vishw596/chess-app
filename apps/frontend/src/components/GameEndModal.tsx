import React, { useState } from 'react';
import WhiteKing from '../../public/wk.png';
import BlackKing from '../../public/bk.png';
import { type GameResult } from "../pages/Game";

function formatRatingLine(r: { before: number; after: number; delta: number }) {
  const sign = r.delta >= 0 ? "+" : "";
  return `${r.before} → ${r.after} (${sign}${r.delta})`;
}
import { Result } from '@repo/messages';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

interface ModalProps {
  blackPlayer?: { id: string; name: string };
  whitePlayer?: { id: string; name: string };
  gameResult: GameResult;
  socket: WebSocket | null;
}

const GameEndModal: React.FC<ModalProps> = ({
  blackPlayer,
  whitePlayer,
  gameResult,
  socket
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate()
  const closeModal = () => {
    setIsOpen(false);
    socket?.close()
    navigate("/profile")
    
  };

  const PlayerDisplay = ({
    player,
    gameResult,
    isWhite,
    ratingLine,
  }: {
    player?: { id: string; name: string };
    gameResult: Result;
    isWhite: boolean;
    ratingLine?: { before: number; after: number; delta: number };
  }) => {
    const imageSrc = isWhite ? WhiteKing : BlackKing;
    const isWinner = gameResult === (isWhite ? Result.WHITE_WINS : Result.BLACK_WINS);
    const glowColor = isWinner ? '#ffffff' : '#404040';
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: isWhite ? 0.2 : 0.4 }}
        className="flex flex-col items-center"
      >
        <motion.div 
          className="rounded-full p-3 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${glowColor}, #111111)` }}
          animate={isWinner ? {
            scale: [1, 1.05, 1],
            boxShadow: [
              '0 0 0 rgba(255,255,255,0)',
              '0 0 20px rgba(255,255,255,0.35)',
              '0 0 0 rgba(255,255,255,0)'
            ]
          } : {}}
          transition={{
            repeat: isWinner ? Infinity : 0,
            duration: 2
          }}
        >
          <div className="rounded-full bg-black p-2">
            <motion.img
              src={imageSrc}
              alt={`${isWhite ? 'White' : 'Black'} King`}
              className="w-12 h-12"
              animate={isWinner ? { rotate: [0, 5, 0, -5, 0] } : {}}
              transition={{ repeat: isWinner ? Infinity : 0, duration: 2 }}
            />
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center p-2"
        >
          <p 
            className={`w-24 truncate font-medium ${isWinner ? 'text-white' : 'text-textMuted'}`} 
            title={getPlayerName(player)}
          >
            {getPlayerName(player)}
          </p>
          {ratingLine && (
            <p className="mt-1 w-28 max-w-[10rem] text-[11px] leading-tight text-textMuted" title={formatRatingLine(ratingLine)}>
              {formatRatingLine(ratingLine)}
            </p>
          )}
        </motion.div>
      </motion.div>
    );
  };

  const getWinnerMessage = (result: Result) => {
    switch (result) {
      case Result.BLACK_WINS:
        return 'Black Wins!';
      case Result.WHITE_WINS:
        return 'White Wins!';
      default:
        return "It's a Draw";
    }
  };

  const getPlayerName = (player: { id: string; name: string } | undefined) => {
    return player ? player.name : 'Unknown';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900 backdrop-blur-sm"
            onClick={closeModal}
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-[26px] border border-borderColor bg-[linear-gradient(180deg,#171717_0%,#0a0a0a_100%)] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
          >
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="px-8 py-10 items-center"
            >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="mb-8"
              >
                <h2 className={`mb-3 text-center text-4xl font-bold ${gameResult.result === Result.DRAW ? 'text-textMain' : 'text-white'}`}>
                  {getWinnerMessage(gameResult.result)}  
                </h2>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="mx-auto h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <p className="text-center text-xl font-light text-textMuted">
                  by <span className="font-medium text-white">{gameResult.by}</span>
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-row items-center justify-between rounded-xl border border-white/10 bg-black/20 px-6 py-8 shadow-inner"
              >
                <PlayerDisplay
                  isWhite={true}
                  player={whitePlayer}
                  gameResult={gameResult.result}
                  ratingLine={gameResult.rating?.white}
                />
                
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="relative"
                >
                  <div className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-2xl font-bold text-white shadow-lg">
                    VS
                  </div>
                </motion.div>
                
                <PlayerDisplay
                  isWhite={false}
                  player={blackPlayer}
                  gameResult={gameResult.result}
                  ratingLine={gameResult.rating?.black}
                />
              </motion.div>
            </motion.div>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center rounded-b-lg border-t border-borderColor bg-black/20 px-6 py-5"
            >
              <Button
                variant="secondary"
                size="md"
                onClick={closeModal}
              >
                <X size={16} strokeWidth={2.2} className="mr-1.5" />
                Close
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameEndModal;
