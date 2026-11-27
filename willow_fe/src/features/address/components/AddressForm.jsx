import { useState } from 'react';
import { INDIAN_STATES } from '../indianStates.js';

const EMPTY = { fullName: '', phone: '', pincode: '', addressLine: '', city: '', state: '', makeDefault: false };

/** Same rules as the server, checked first so the shopper gets instant feedback. */
function validate(form) {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = "Enter the recipient's name";
  const digits = form.phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
  if (!/^[6-9]\d{9}$/.test(digits)) errors.phone = 'Enter a valid 10-digit mobile number';
  if (!/^[1-9]\d{5}$/.test(form.pincode.trim())) errors.pincode = 'Enter a valid 6-digit pincode';
  if (!form.addressLine.trim()) errors.addressLine = 'Enter the house number, street and area';
  if (!form.city.trim()) errors.city = 'Enter the city';
  if (!form.state) errors.state = 'Choose the state';
  return errors;
}

/**
 * Add / edit a delivery address. `onSubmit(values)` must return a promise; a rejected one with
 * `fields` (from the API) shows those messages next to the matching inputs.
 */
export default function AddressForm({ initial, onSubmit, onCancel, submitLabel = 'Save address', showDefaultToggle = true }) {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initial, makeDefault: !!initial?.isDefault }));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (name) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      await onSubmit({
        fullName: form.fullName.trim(),
        phone: form.phone.replace(/\D/g, '').slice(-10),
        pincode: form.pincode.trim(),
        addressLine: form.addressLine.trim(),
        city: form.city.trim(),
        state: form.state,
        makeDefault: form.makeDefault,
      });
    } catch (err) {
      setErrors(err.fields ?? {});
      setFormError(err.message);
      setSaving(false);
    }
  }

  const field = (name, label, props = {}) => (
    <label className={`addr-field ${errors[name] ? 'has-error' : ''} ${props.wide ? 'addr-field--wide' : ''}`}>
      <span className="addr-field__label">{label}</span>
      {props.as === 'select' ? (
        <select value={form[name]} onChange={set(name)} aria-invalid={!!errors[name]}>
          <option value="">Select state</option>
          {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      ) : (
        <input
          value={form[name]}
          onChange={set(name)}
          aria-invalid={!!errors[name]}
          inputMode={props.inputMode}
          maxLength={props.maxLength}
          autoComplete={props.autoComplete}
          placeholder={props.placeholder}
        />
      )}
      {errors[name] && <span className="addr-field__error">{errors[name]}</span>}
    </label>
  );

  return (
    <form className="addr-form" onSubmit={handleSubmit} noValidate>
      {formError && <p className="form-alert" role="alert">{formError}</p>}
      <div className="addr-form__grid">
        {field('fullName', 'Full name', { autoComplete: 'name' })}
        {field('phone', 'Mobile number', { inputMode: 'tel', maxLength: 14, autoComplete: 'tel', placeholder: '10-digit mobile number' })}
        {field('addressLine', 'Address (house no., building, street, area)', { wide: true, autoComplete: 'street-address' })}
        {field('pincode', 'Pincode', { inputMode: 'numeric', maxLength: 6, autoComplete: 'postal-code' })}
        {field('city', 'City / Town', { autoComplete: 'address-level2' })}
        {field('state', 'State', { as: 'select' })}
      </div>
      {showDefaultToggle && !initial?.isDefault && (
        <label className="addr-form__default">
          <input type="checkbox" className="cart-check" checked={form.makeDefault} onChange={set('makeDefault')} />
          <span>Make this my default address</span>
        </label>
      )}
      <div className="addr-form__actions">
        {onCancel && <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={saving}>Cancel</button>}
        <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Saving…' : submitLabel}</button>
      </div>
    </form>
  );
}
