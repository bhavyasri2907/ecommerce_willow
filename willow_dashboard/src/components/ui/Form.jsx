import { useId } from 'react';
import { Search } from 'lucide-react';

/** Label + control + hint/error. `children` is a render function receiving the generated id. */
export function Field({ label, hint, error, required, children, className = '' }) {
  const id = useId();
  return (
    <div className={`field ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
          {required && <span className="field__required" aria-hidden> *</span>}
        </label>
      )}
      {children(id)}
      {error ? (
        <p className="field__error" role="alert">{error}</p>
      ) : (
        hint && <p className="field__hint">{hint}</p>
      )}
    </div>
  );
}

export function Input({ prefix, suffix, className = '', ...props }) {
  if (!prefix && !suffix) return <input className={`input ${className}`} {...props} />;
  return (
    <div className={`input-group ${className}`}>
      {prefix && <span className="input-group__addon">{prefix}</span>}
      <input className="input" {...props} />
      {suffix && <span className="input-group__addon">{suffix}</span>}
    </div>
  );
}

export function Select({ options, placeholder, className = '', ...props }) {
  return (
    <select className={`input select ${className}`} {...props}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Textarea(props) {
  return <textarea className="input textarea" {...props} />;
}

export function Toggle({ checked, onChange, label, description, disabled }) {
  const id = useId();
  return (
    <div className="toggle-row">
      <div className="toggle-row__text">
        <label htmlFor={id} className="toggle-row__label">{label}</label>
        {description && <p className="toggle-row__desc">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={`toggle ${checked ? 'is-on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle__thumb" />
      </button>
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search', className = '', ...props }) {
  return (
    <label className={`search-input ${className}`}>
      <Search size={16} aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        {...props}
      />
    </label>
  );
}

export function Checkbox({ checked, indeterminate, onChange, label }) {
  return (
    <input
      type="checkbox"
      className="checkbox"
      checked={checked}
      aria-label={label}
      ref={(el) => el && (el.indeterminate = !!indeterminate)}
      onChange={(e) => onChange(e.target.checked)}
      onClick={(e) => e.stopPropagation()}
    />
  );
}
