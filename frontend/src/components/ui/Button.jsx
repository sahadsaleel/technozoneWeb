export function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  icon: Icon,
  loading = false,
  ...props 
}) {
  const baseClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    icon: 'btn-icon'
  }[variant];

  return (
    <button 
      className={`${baseClass} flex items-center justify-center gap-2 ${className}`} 
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <div className="spinner border-2 w-4 h-4" /> : Icon && <Icon size={18} />}
      {variant !== 'icon' && children}
    </button>
  );
}
