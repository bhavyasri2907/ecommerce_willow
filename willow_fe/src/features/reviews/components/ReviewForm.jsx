import { useState } from 'react';
import StarInput from './StarInput.jsx';

const TITLE_MAX = 120;
const COMMENT_MAX = 1000;

/**
 * Write or edit a review. `onSubmit({ rating, title, comment })` must return a promise; a rejected one
 * shows its message (and any field messages from the API). `onDelete` adds a Delete button when given.
 */
export default function ReviewForm({ initial, onSubmit, onCancel, onDelete }) {
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [comment, setComment] = useState(initial?.comment ?? '');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  async function run(action) {
    setBusy(true);
    setFormError('');
    try {
      await action();
    } catch (err) {
      setErrors(err.fields ?? {});
      setFormError(err.message);
      setBusy(false);
    }
  }

  function submit(e) {
    e.preventDefault();
    if (!rating) {
      setErrors({ rating: 'Choose a star rating' });
      return;
    }
    run(() => onSubmit({ rating, title: title.trim(), comment: comment.trim() }));
  }

  function remove() {
    if (!window.confirm('Delete your review? This cannot be undone.')) return;
    run(onDelete);
  }

  return (
    <form className="rv-form" onSubmit={submit} noValidate>
      {formError && <p className="form-alert" role="alert">{formError}</p>}

      <div className="rv-form__row">
        <span className="addr-field__label">Overall rating</span>
        <StarInput
          value={rating}
          invalid={!!errors.rating}
          onChange={(n) => {
            setRating(n);
            setErrors((prev) => ({ ...prev, rating: undefined }));
          }}
        />
        {errors.rating && <span className="addr-field__error">{errors.rating}</span>}
      </div>

      <label className={`addr-field ${errors.title ? 'has-error' : ''}`}>
        <span className="addr-field__label">Headline <em className="rv-form__optional">(optional)</em></span>
        <input
          value={title}
          maxLength={TITLE_MAX}
          placeholder="Sum it up in a few words"
          onChange={(e) => setTitle(e.target.value)}
        />
        {errors.title && <span className="addr-field__error">{errors.title}</span>}
      </label>

      <label className={`addr-field ${errors.comment ? 'has-error' : ''}`}>
        <span className="addr-field__label">Your review <em className="rv-form__optional">(optional)</em></span>
        <textarea
          className="rv-form__text"
          rows={4}
          maxLength={COMMENT_MAX}
          placeholder="How was the fit, fabric and quality? Would you recommend it?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <span className="rv-form__count">{comment.length}/{COMMENT_MAX}</span>
        {errors.comment && <span className="addr-field__error">{errors.comment}</span>}
      </label>

      <div className="addr-form__actions rv-form__actions">
        {onDelete && (
          <button type="button" className="link-btn link-btn--danger rv-form__delete" onClick={remove} disabled={busy}>
            Delete review
          </button>
        )}
        {onCancel && <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={busy}>Cancel</button>}
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? 'Saving…' : initial ? 'Update review' : 'Post review'}
        </button>
      </div>
    </form>
  );
}
