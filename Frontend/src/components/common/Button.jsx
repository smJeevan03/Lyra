const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false, 
  onClick, 
  className = '', 
  type = 'button',
  ...rest
}) => {
  
  // Base classes applied to all buttons
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-bold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-[#06142D] disabled:cursor-not-allowed disabled:opacity-60';

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-8 py-3.5 text-base rounded-xl',
  };

  // Variant classes (Color schemes)
  const variantClasses = {
    // PRIMARY: Your Orange Gradient
    primary: 'bg-gradient-to-r from-[#FF8C32] to-[#FFA74D] text-[#06142D] shadow-lg shadow-[#FF8C32]/30 hover:shadow-[#FF8C32]/50 hover:brightness-105 focus:ring-[#FF8C32]/50',
    
    // SECONDARY: Outline glass variant
    secondary: 'bg-[rgba(255,255,255,0.06)] backdrop-blur-sm border border-[rgba(255,255,255,0.12)] text-[#CBD5E1] shadow-xl shadow-black/20 hover:bg-[rgba(255,255,255,0.12)] hover:text-white hover:border-[rgba(255,255,255,0.2)] focus:ring-[#CBD5E1]/30',
    
    // GHOST: No background, just text
    ghost: 'bg-transparent text-[#CBD5E1] hover:bg-[rgba(255,255,255,0.06)] hover:text-white focus:ring-[#CBD5E1]/20',
    
    // DANGER: Red for destructive actions
    danger: 'bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 focus:ring-red-500/50',
  };

  // Loading spinner styles
  const spinnerClasses = `h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent`;
  const spinnerColor = variant === 'primary' ? 'border-[#06142D]' : 'border-white';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses} 
        ${sizeClasses[size]} 
        ${variantClasses[variant]} 
        ${className}
        relative overflow-hidden
      `}
      {...rest}
    >
      {/* Shine Effect (Only on primary buttons) */}
      {variant === 'primary' && !loading && (
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      )}

      {/* Button Content */}
      <span className="relative z-10 flex items-center gap-2">
        {loading ? (
          <>
            <span className={`${spinnerClasses} ${spinnerColor}`} />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
};

export default Button;
