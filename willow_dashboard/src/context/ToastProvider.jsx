import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, ShoppingBag, X, XCircle } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  order: ShoppingBag,
};

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const show = useCallback(
    (toast) => {
      const id = nextId++;
      const entry = { tone: 'info', duration: 4500, ...toast, id };
      setToasts((prev) => [entry, ...prev].slice(0, 5));
      if (entry.duration) setTimeout(() => dismiss(id), entry.duration);
      return id;
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      show,
      success: (title, description) => show({ tone: 'success', title, description }),
      error: (title, description) => show({ tone: 'error', title, description, duration: 6500 }),
      warning: (title, description) => show({ tone: 'warning', title, description }),
      info: (title, description) => show({ tone: 'info', title, description }),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack" role="region" aria-live="polite" aria-label="Notifications">
        {toasts.map((t) => {
          const Icon = ICONS[t.tone] ?? Info;
          return (
            <div key={t.id} className={`toast toast--${t.tone}`}>
              <Icon size={18} className="toast__icon" aria-hidden />
              <div className="toast__body">
                <div className="toast__title">{t.title}</div>
                {t.description && <div className="toast__desc">{t.description}</div>}
                {t.action && (
                  <button className="toast__action" onClick={() => { t.action.onClick(); dismiss(t.id); }}>
                    {t.action.label}
                  </button>
                )}
              </div>
              <button className="toast__close" onClick={() => dismiss(t.id)} aria-label="Dismiss">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
