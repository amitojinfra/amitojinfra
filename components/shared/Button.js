const Button = ({ 
  children, 
  href, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  ...props 
}) => {
  const baseClasses = 'btn';
  const variantClasses = variant === 'secondary' ? 'btn-secondary' : '';
  const classes = `${baseClasses} ${variantClasses}`.trim();

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button 
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;