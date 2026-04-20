import { cn } from '../utils/cn';

interface ButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
}

export const Button = ({
    children,
    onClick,
    className = '',
    variant = 'primary',
    size = 'md',
    disabled = false
}: ButtonProps) => {
    const baseStyles = 'font-semibold rounded-[18px] transition-all duration-300 flex items-center justify-center shadow-[0_12px_30px_rgba(0,0,0,0.32)] hover:translate-y-[-1px] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantStyles = {
        primary: 'bg-white text-black border border-white/20 hover:bg-[#e7e7e2]',
        secondary: 'bg-surfaceDark text-white border border-borderColor hover:bg-surfaceLight',
        outline: 'bg-transparent border border-white/20 text-white hover:bg-white/6',
        ghost: 'bg-transparent text-textMuted hover:bg-white/6 hover:text-white shadow-none',
        success: 'bg-[#7ED6A7] text-black border border-[#7ED6A7]/50 hover:bg-[#96dfb6]',
        warning: 'bg-[#d4b25a] text-black border border-[#d4b25a]/50 hover:bg-[#dcc174]',
        danger: 'bg-[#C94F4F] text-white border border-[#C94F4F]/50 hover:bg-[#d26b6b]'
    };
    
    const sizeStyles = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-base',
        lg: 'px-6 py-3 text-lg'
    };
    
    return (
        <button 
            className={cn(
                baseStyles,
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};
