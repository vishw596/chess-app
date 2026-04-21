import { useUser } from '../store/hooks/useUser';
import type { Metadata, Player } from '../pages/Game';
import { motion } from 'framer-motion';

interface UserAvatarProps {
  gameMetadata: Metadata | null;
  self?: boolean;
}

export const UserAvatar = ({ gameMetadata, self }: UserAvatarProps) => {
  const user = useUser();
  
  if (!user || !gameMetadata) {
    return null;
  }

  let player: Player | undefined;
  if (gameMetadata.blackPlayer.id === user.id) {
    player = self ? gameMetadata.blackPlayer : gameMetadata.whitePlayer;
  } else {
    player = self ? gameMetadata.whitePlayer : gameMetadata.blackPlayer;
  }

  // Determine piece color based on player
  const pieceType = self ? 
    (gameMetadata.blackPlayer.id === user.id ? 'b' : 'w') : 
    (gameMetadata.blackPlayer.id === user.id ? 'w' : 'b');
  
  const pieceImage = `/${pieceType}k.png`; // King piece for avatar

  return (
    <div className="flex items-center gap-3">
      <motion.div 
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="h-11 w-11 rounded-full border border-white/10 bg-[radial-gradient(circle_at_top,#ffffff24,transparent_60%),#111111] p-0.5 shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
      >
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-black">
          <img src={pieceImage} alt="Chess Piece" className="w-7 h-7 object-contain" />
        </div>
      </motion.div>
      
      <div className="flex flex-col">
        <p className="font-medium text-white">{player?.name}</p>
        {player?.isGuest && (
          <p className="text-xs text-textMuted">Guest Player</p>
        )}
      </div>
    </div>
  );
};
