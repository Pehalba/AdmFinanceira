import './Button.css';

export function Button({ children, variant = 'primary', onClick, type = 'button', disabled = false, className = '' }) {
  const classes = `button button--${variant} ${className}`.trim();
  
  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
