import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import { authService } from '../../../services/authService.js';

const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const cleanPhone = (phone) => phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');

/** My Account > Profile: change name, email and mobile number, and the password. */
export default function Profile() {
  return (
    <section className="account-section">
      <header className="account-section__header">
        <p className="account-hero__eyebrow">My Account</p>
        <h1 className="account-section__title">Profile</h1>
        <p className="account-section__intro">Keep your details up to date. We use them for your orders and sign-in.</p>
      </header>
      <div className="profile-grid">
        <DetailsForm />
        <PasswordForm />
      </div>
    </section>
  );
}

function Field({ label, error, hint, ...input }) {
  return (
    <label className={`addr-field ${error ? 'has-error' : ''}`}>
      <span className="addr-field__label">{label}</span>
      <input aria-invalid={!!error} {...input} />
      {error ? <span className="addr-field__error">{error}</span> : hint && <span className="profile-hint">{hint}</span>}
    </label>
  );
}

function DetailsForm() {
  const { user, updateProfile } = useAuth();
  const initial = { fullName: user.fullName, email: user.email, phone: user.phone ?? '' };
  const [form, setForm] = useState({ ...initial, currentPassword: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const emailChanged = form.email.trim().toLowerCase() !== user.email;
  const dirty = form.fullName !== initial.fullName || form.email !== initial.email || form.phone !== initial.phone;

  const set = (name) => (e) => {
    setForm((prev) => ({ ...prev, [name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setMessage({ type: '', text: '' });
  };

  function validate() {
    const found = {};
    if (!form.fullName.trim()) found.fullName = 'Enter your name';
    if (!EMAIL_RE.test(form.email.trim())) found.email = 'Enter a valid email address';
    if (form.phone.trim() && !PHONE_RE.test(cleanPhone(form.phone))) found.phone = 'Enter a valid 10-digit mobile number';
    if (emailChanged && !form.currentPassword) found.currentPassword = 'Enter your password to change your email';
    return found;
  }

  async function submit(e) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      const saved = await updateProfile({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() ? cleanPhone(form.phone) : '',
        currentPassword: emailChanged ? form.currentPassword : undefined,
      });
      setForm({ fullName: saved.fullName, email: saved.email, phone: saved.phone ?? '', currentPassword: '' });
      setMessage({ type: 'ok', text: 'Your details have been saved.' });
    } catch (err) {
      setErrors(err.fields ?? {});
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="order-panel profile-card" onSubmit={submit} noValidate>
      <h2 className="order-panel__title">Personal details</h2>
      {message.text && (
        <p className={message.type === 'ok' ? 'form-success' : 'form-alert'} role={message.type === 'ok' ? 'status' : 'alert'}>
          {message.text}
        </p>
      )}
      <div className="profile-fields">
        <Field label="Full name" value={form.fullName} onChange={set('fullName')} error={errors.fullName} autoComplete="name" maxLength={120} />
        <Field label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" />
        {emailChanged && (
          <Field
            label="Current password"
            type="password"
            value={form.currentPassword}
            onChange={set('currentPassword')}
            error={errors.currentPassword}
            hint="Needed because you sign in with your email."
            autoComplete="current-password"
          />
        )}
        <Field
          label="Mobile number"
          value={form.phone}
          onChange={set('phone')}
          error={errors.phone}
          inputMode="tel"
          maxLength={14}
          autoComplete="tel"
          placeholder="10-digit mobile number"
          hint="Optional. Used to pre-fill new delivery addresses."
        />
      </div>
      <div className="addr-form__actions">
        <button
          type="button"
          className="btn btn--ghost"
          disabled={!dirty || saving}
          onClick={() => {
            setForm({ ...initial, currentPassword: '' });
            setErrors({});
            setMessage({ type: '', text: '' });
          }}
        >
          Reset
        </button>
        <button type="submit" className="btn btn--primary" disabled={!dirty || saving}>{saving ? 'Saving…' : 'Save changes'}</button>
      </div>
    </form>
  );
}

function PasswordForm() {
  const EMPTY = { current: '', next: '', confirm: '' };
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const set = (name) => (e) => {
    setForm((prev) => ({ ...prev, [name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setMessage({ type: '', text: '' });
  };

  async function submit(e) {
    e.preventDefault();
    const found = {};
    if (!form.current) found.current = 'Enter your current password';
    if (form.next.length < 8 || form.next.length > 72) found.next = 'Password must be 8 to 72 characters';
    if (form.confirm !== form.next) found.confirm = "Passwords don't match";
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      await authService.changePassword(form.current, form.next);
      setForm(EMPTY);
      setMessage({ type: 'ok', text: 'Password changed. You have been signed out on your other devices.' });
    } catch (err) {
      const f = err.fields ?? {};
      setErrors({ current: f.currentPassword, next: f.newPassword });
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="order-panel profile-card" onSubmit={submit} noValidate>
      <h2 className="order-panel__title">Change password</h2>
      {message.text && (
        <p className={message.type === 'ok' ? 'form-success' : 'form-alert'} role={message.type === 'ok' ? 'status' : 'alert'}>
          {message.text}
        </p>
      )}
      <div className="profile-fields">
        <Field label="Current password" type="password" value={form.current} onChange={set('current')} error={errors.current} autoComplete="current-password" />
        <Field label="New password" type="password" value={form.next} onChange={set('next')} error={errors.next} autoComplete="new-password" hint="At least 8 characters." />
        <Field label="Confirm new password" type="password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} autoComplete="new-password" />
      </div>
      <div className="addr-form__actions">
        <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Updating…' : 'Update password'}</button>
      </div>
    </form>
  );
}
