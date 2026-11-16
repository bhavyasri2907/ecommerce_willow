import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import banner from '../assets/images/auth-banner.jpg';

const COPY = {
  login: {
    sub: 'Sign in to see your orders, wishlist and saved details.',
    submit: 'Sign in',
    busy: 'Signing in…',
    switchText: 'New to Willow?',
    switchLabel: 'Create an account',
    switchTo: '/signup',
  },
  signup: {
    sub: 'Join Willow to track orders and save the pieces you love.',
    submit: 'Create account',
    busy: 'Creating account…',
    switchText: 'Already have an account?',
    switchLabel: 'Sign in',
    switchTo: '/login',
  },
};

const EMPTY_FORM = { fullName: '', email: '', phone: '', password: '' };

/** Checks done in the browser before calling the API; the server validates again. */
function validate(mode, form) {
  const errors = {};
  if (mode === 'signup' && !form.fullName.trim()) errors.fullName = 'Enter your name';
  if (!form.email.trim()) errors.email = 'Enter your email';
  else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = 'Enter a valid email address';
  if (!form.password) errors.password = mode === 'signup' ? 'Choose a password' : 'Enter your password';
  else if (mode === 'signup' && form.password.length < 8) errors.password = 'Password must be at least 8 characters';
  return errors;
}

/** Sign in (/login) and sign up (/signup): one card with the Willow banner on top and the form below. */
export default function Auth({ mode }) {
  const { user, status, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const copy = COPY[mode];
  const isSignup = mode === 'signup';
  // Where the shopper was heading before being asked to sign in.
  const destination = location.state?.from || '/account';

  if (status === 'ready' && user) return <Navigate to={destination} replace />;

  const setField = (name) => (e) => {
    setForm((prev) => ({ ...prev, [name]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate(mode, form);
    setFieldErrors(errors);
    setFormError('');
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    try {
      if (isSignup) {
        await register({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
        });
      } else {
        await login(form.email.trim(), form.password);
      }
      navigate(destination, { replace: true });
    } catch (error) {
      setFieldErrors(error.fields || {});
      setFormError(error.message);
      setSubmitting(false);
    }
  };

  const field = (name, label, props) => (
    <div className="auth-field">
      <label htmlFor={`auth-${name}`}>{label}</label>
      <input
        id={`auth-${name}`}
        value={form[name]}
        onChange={setField(name)}
        aria-invalid={Boolean(fieldErrors[name])}
        aria-describedby={fieldErrors[name] ? `auth-${name}-error` : undefined}
        {...props}
      />
      {fieldErrors[name] && (
        <p id={`auth-${name}-error`} className="auth-field__error">{fieldErrors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img className="auth-banner" src={banner} alt="Willow Fashion — Shop your style, effortlessly." />

        <div className="auth-body">
          {/* The current mode is the heading; the other word switches to it. */}
          <h1 className="auth-title">
            {isSignup ? <Link to="/login" state={location.state}>Login</Link> : <span>Login</span>}
            <small>or</small>
            {isSignup ? <span>Signup</span> : <Link to="/signup" state={location.state}>Signup</Link>}
          </h1>
          <p className="auth-sub">{copy.sub}</p>

          <form onSubmit={handleSubmit} noValidate>
            {formError && <p className="auth-error" role="alert">{formError}</p>}

            {isSignup && (
              <div className="auth-row">
                {field('fullName', 'Full name', { type: 'text', autoComplete: 'name', autoFocus: true })}
                {field('phone', 'Phone (optional)', { type: 'tel', autoComplete: 'tel' })}
              </div>
            )}
            {field('email', 'Email', { type: 'email', autoComplete: 'email', autoFocus: !isSignup })}

            <div className="auth-field">
              <label htmlFor="auth-password">Password</label>
              <div className="auth-password">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={setField('password')}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'auth-password-error' : undefined}
                />
                <button
                  type="button"
                  className="auth-password__toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-pressed={showPassword}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {fieldErrors.password ? (
                <p id="auth-password-error" className="auth-field__error">{fieldErrors.password}</p>
              ) : (
                isSignup && <p className="auth-field__hint">At least 8 characters.</p>
              )}
            </div>

            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? copy.busy : copy.submit}
            </button>
          </form>

          <p className="auth-switch">
            {copy.switchText}{' '}
            <Link to={copy.switchTo} state={location.state}>{copy.switchLabel}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
