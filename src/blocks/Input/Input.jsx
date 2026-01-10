import './Input.css';

export function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  className = '',
  ...props
}) {
  const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={`input ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="input__label">
          {label}
          {required && <span className="input__required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`input__field ${error ? 'input__field--error' : ''}`.trim()}
        {...props}
      />
      {error && <span className="input__error">{error}</span>}
    </div>
  );
}
