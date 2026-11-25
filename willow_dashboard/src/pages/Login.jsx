import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Store } from 'lucide-react';
import { useAuth } from '../context/AuthProvider.jsx';
import Button from '../components/common/Button.jsx';
import { Field, Input } from '../components/common/Input.jsx';
import logo from '../assets/images/willow-logo.png';
import '../styles/auth.css';

const COPY = {
  login: {
    title: 'Sign in to your store',
    sub: 'Manage products, orders and stock from one place.',
    submit: 'Sign in',
    icon: LogIn,
  },
  signup: {
    title: 'Open your store on Willow',
    sub: 'Create a seller account and start listing your products.',
    submit: 'Create store',
    icon: Store,
  },
};

const EMPTY_FORM = { storeName: '', fullName: '', email: '', phone: '', password: '' };

/** Checks done in the browser before calling the API; the server validates again. */
function validate(isSignup, form) {
  const errors = {};
  if (isSignup && !form.storeName.trim()) errors.storeName = 'Enter your store name';
  if (isSignup && !form.fullName.trim()) errors.fullName = 'Enter your name';
  if (!form.email.trim()) errors.email = 'Enter your email';
  else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = 'Enter a valid email address';
  if (!form.password) errors.password = isSignup ? 'Choose a password' : 'Enter your password';
  else if (isSignup && form.password.length < 8) errors.password = 'Password must be at least 8 characters';
  return errors;
}

/**
 * Seller sign-in (/login) and sign-up (/signup). Willow is a marketplace: signing up
 * opens a new store of the seller's own, alongside everyone else's.
 */
export default function Login({ mode }) {
  const { seller, status, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const destination = location.state?.from || '/';
  if (status === 'ready' && seller) return <Navigate to={destination} replace />;

  const isSignup = mode === 'signup';
  const copy = COPY[mode];

  const setField = (name) => (e) => {
    setForm((prev) => ({ ...prev, [name]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate(isSignup, form);
    setFieldErrors(errors);
    setFormError('');
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    try {
      if (isSignup) {
        await register({
          storeName: form.storeName.trim(),
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

  const text = (name, label, props) => (
    <Field label={label} error={fieldErrors[name]}>
      {(id) => <Input id={id} value={form[name]} onChange={setField(name)} aria-invalid={Boolean(fieldErrors[name])} {...props} />}
    </Field>
  );

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__brand">
          <img src={logo} alt="Willow" />
          <span>Seller Panel</span>
        </div>

        <h1 className="auth__title">{copy.title}</h1>
        <p className="auth__sub">{copy.sub}</p>

        <form className="auth__form" onSubmit={handleSubmit} noValidate>
          {formError && <p className="auth__error" role="alert">{formError}</p>}

          {isSignup && text('storeName', 'Store name', { autoComplete: 'organization', autoFocus: true, placeholder: 'e.g. Willow Fashion' })}
          {isSignup && (
            <div className="auth__row">
              {text('fullName', 'Your name', { autoComplete: 'name' })}
              {text('phone', 'Phone (optional)', { type: 'tel', autoComplete: 'tel' })}
            </div>
          )}
          {text('email', 'Email', { type: 'email', autoComplete: 'email', autoFocus: !isSignup })}

          <Field label="Password" error={fieldErrors.password} hint={isSignup ? 'At least 8 characters.' : undefined}>
            {(id) => (
              <Input
                id={id}
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={setField('password')}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                aria-invalid={Boolean(fieldErrors.password)}
                suffix={
                  <button
                    type="button"
                    className="auth__toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
            )}
          </Field>

          <Button type="submit" variant="primary" icon={copy.icon} loading={submitting} className="auth__submit">
            {copy.submit}
          </Button>
        </form>

        <p className="auth__switch">
          {isSignup ? 'Already selling on Willow?' : 'New to Willow?'}{' '}
          <Link to={isSignup ? '/login' : '/signup'} state={location.state}>
            {isSignup ? 'Sign in' : 'Open your store'}
          </Link>
        </p>
      </div>
    </div>
  );
}
