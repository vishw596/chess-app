import { motion } from "framer-motion";

const LetterNotation = ({
  label,
  isMainBoxColor,
}: {
  label: string;
  isMainBoxColor: boolean;
}) => {
  return (
    <div
      className={`pointer-events-none absolute bottom-0.5 right-1 z-10 text-xs font-bold ${isMainBoxColor ? 'text-[#1f1f1f]' : 'text-[#f6f6f1]'}`}

    >
      {label}
    </div>
  );
};

export default LetterNotation;
