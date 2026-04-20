import { motion } from "framer-motion";

export const NumberNotation = ({
    label,
    isMainBoxColor
}: {
    label: string,
    isMainBoxColor: boolean
}) => {
    return (
        <div
            className={`pointer-events-none absolute left-1 top-0.5 z-10 text-xs font-bold ${isMainBoxColor ? 'text-[#1f1f1f]' : 'text-[#f6f6f1]'}`}
           
        >
            {label}
        </div>
    );
}
