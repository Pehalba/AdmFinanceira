import './Select.css';

export function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Selecione...',
  error,
  required = false,
  className = '',
  ...props
}) {
  const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={`select ${className}`.trim()}>
      {label && (
        <label htmlFor={selectId} className="select__label">
          {label}
          {required && <span className="select__required">*</span>}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        required={required}
        className={`select__field ${error ? 'select__field--error' : ''}`.trim()}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="select__error">{error}</span>}
    </div>
  );
}
