import { AlertCircle, RotateCw } from 'lucide-react';
import Button from './Button.jsx';

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <span className="state__icon" aria-hidden>
        <AlertCircle size={22} />
      </span>
      <h3>Couldn't load this</h3>
      <p>{error?.message ?? 'Something went wrong.'}</p>
      {onRetry && (
        <Button icon={RotateCw} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
