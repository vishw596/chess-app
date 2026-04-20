import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogDescription,
} from './ui/alert-dialog';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { AlertTriangle, DoorOpen, ShieldCheck } from 'lucide-react';

const ExitGameModel = ({ onClick }: { onClick: () => void }) => {

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="md"
          onClick={() => {}}
          className="w-full border-0 text-textMain hover:bg-white/6 hover:text-white"
        >
          <motion.div
            initial={{ opacity: 0.8 }}
            whileHover={{
              opacity: 1,
              scale: 1.05,
            }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <DoorOpen size={16} strokeWidth={2} />
            Exit Game
          </motion.div>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className='max-w-md w-full overflow-hidden rounded-[24px] border border-borderColor bg-[linear-gradient(180deg,#171717_0%,#0a0a0a_100%)] p-0 shadow-[0_24px_80px_rgba(0,0,0,0.55)]'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AlertDialogHeader className="p-6 pb-2">
            <AlertDialogTitle className='mb-2 text-2xl font-bold text-white'>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="flex items-center"
              >
                <AlertTriangle size={22} strokeWidth={2} className="mr-2 text-[#C94F4F]" />
                Are you sure you want to exit?
              </motion.div>
            </AlertDialogTitle>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <AlertDialogDescription className='mt-4 text-base text-textMuted'>
                This action cannot be undone. Exiting the game will be considered as a <span className="font-medium text-[#C94F4F]">loss</span>.
              </AlertDialogDescription>
            </motion.div>
          </AlertDialogHeader>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <AlertDialogFooter className="p-6 pt-2 flex gap-3">
              <AlertDialogCancel asChild>
                <Button
                  size="md"
                  variant="secondary"
                  onClick={() => {}}
                  className="!bg-surfaceDark !text-textMain !border-borderColor hover:!bg-surfaceLight hover:!text-white"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1.5"
                  >
                    <ShieldCheck size={15} strokeWidth={2} />
                    Continue Playing
                  </motion.div>
                </Button>
              </AlertDialogCancel>

              <AlertDialogAction asChild>
                <Button
                  variant="danger"
                  size="md"
                  onClick={onClick}
                  className="!bg-[#C94F4F] !text-white !border-[#C94F4F]/70 hover:!bg-[#d26b6b]"
                >
                  <motion.div
                    whileHover={{
                      scale: 1.05,
                    }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1.5"
                  >
                    <DoorOpen size={15} strokeWidth={2} />
                    Exit Game
                  </motion.div>
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </motion.div>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ExitGameModel;

