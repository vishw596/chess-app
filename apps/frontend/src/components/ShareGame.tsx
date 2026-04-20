import { useState, useEffect } from "react"
import { Button } from "./Button";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Copy, Check, Users } from "lucide-react";

export const ShareGame = ({className, gameId}: {className?: string, gameId: string}) => {
    const url = window.origin + "/game/" + gameId;
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await window.navigator.clipboard.writeText(url);
            setCopied(true);
            return;
        } catch {
            const textArea = document.createElement("textarea");
            textArea.value = url;
            textArea.setAttribute("readonly", "");
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const didCopy = document.execCommand("copy");
            document.body.removeChild(textArea);
            if (didCopy) {
                setCopied(true);
            }
        }
    }

    // Reset copied state after 3 seconds
    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`flex w-3/4 flex-col items-center gap-y-6 rounded-[24px] border border-borderColor bg-black/20 p-5 shadow-[0_16px_44px_rgba(0,0,0,0.35)] ${className}`}
        >
            <motion.h3 
                className="flex items-center gap-2 text-2xl font-bold text-white"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Users size={24} strokeWidth={2} />
                Play with Friends
            </motion.h3>

            <motion.div 
                className="flex w-full max-w-md items-center gap-x-3 overflow-hidden rounded-[18px] border border-borderColor bg-black/25 p-3"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
            >
                <motion.div whileHover={{ rotate: 15 }} className="text-textMuted">
                    <Link2 size={20} strokeWidth={2} />
                </motion.div>

                <div 
                    onClick={handleCopy} 
                    className="cursor-pointer truncate font-mono text-sm text-textMain transition-colors hover:text-white"
                >
                    {url}
                </div>
            </motion.div>
            
            <AnimatePresence mode="wait">
                <motion.div
                    key={copied ? "copied" : "copy"}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <Button 
                        onClick={handleCopy} 
                        variant={copied ? "secondary" : "primary"}
                        
                    >
                        {copied ? (
                            <>
                                <Check size={16} strokeWidth={2} className="mr-1.5" />
                                Copied to Clipboard
                            </>
                        ) : (
                            <>
                                <Copy size={16} strokeWidth={2} className="mr-1.5" />
                                Copy Invite Link
                            </>
                        )}
                    </Button>
                </motion.div>
            </AnimatePresence>
        </motion.div>
    )
}
