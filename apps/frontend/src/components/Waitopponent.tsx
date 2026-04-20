import { motion } from 'framer-motion';

export function Waitopponent() {
  // Animation variants for chess pieces
  const pieceVariants = {
    animate: (i: number) => ({
      y: [0, -15, 0],
      transition: {
        delay: i * 0.2,
        duration: 1,
        repeat: Infinity,
        repeatType: 'loop' as const,
      },
    }),
  };

  // Chess pieces to animate
  const pieces = ['wp', 'wn', 'wb', 'wq', 'wk'];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative flex max-w-sm flex-col items-center rounded-[24px] border border-borderColor bg-black/20 p-8 shadow-[0_16px_44px_rgba(0,0,0,0.35)]"
    >
      <motion.h5 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-6 text-center text-xl font-bold text-white"
      >
        Waiting for opponent...
      </motion.h5>
      
      <div className="flex justify-center items-end space-x-2 h-16 mb-2">
        {pieces.map((piece, i) => (
          <motion.div
            key={piece}
            custom={i}
            variants={pieceVariants}
            animate="animate"
            className="flex items-center justify-center"
          >
            <img 
              src={`/${piece}.png`} 
              alt={piece} 
              className="w-8 h-8 object-contain drop-shadow-lg" 
            />
          </motion.div>
        ))}
      </div>

      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-2 text-sm text-textMuted"
      >
        Your game is ready to begin
      </motion.p>
    </motion.div>
  );
}
  
