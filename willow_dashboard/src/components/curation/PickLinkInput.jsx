import { useState } from 'react';
import { ExternalLink, Link2, Loader2 } from 'lucide-react';
import { STOREFRONT_URL } from '../../constants/config.js';

/**
 * "Paste a Willow product link" box. `onAdd(link)` does the work and may throw; its
 * error message is shown under the box. `disabledReason` greys the box out (e.g. fit is full).
 */
export default function PickLinkInput({ onAdd, disabledReason }) {
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');

  async function add() {
    const value = link.trim();
    if (!value || busy) return;
    setBusy(true);
    setProblem('');
    try {
      await onAdd(value);
      setLink('');
    } catch (err) {
      setProblem(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="link-add">
      <div className="link-add__box">
        {busy ? <Loader2 size={15} className="spin" aria-hidden /> : <Link2 size={15} aria-hidden />}
        <input
          value={link}
          onChange={(e) => {
            setLink(e.target.value);
            setProblem('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault(); // inside the product form, Enter must not save the whole form
              add();
            }
          }}
          placeholder={`Paste a product link, e.g. ${STOREFRONT_URL}/product/1001`}
          aria-label="Willow product link"
          disabled={Boolean(disabledReason)}
        />
        <button type="button" onClick={add} disabled={!link.trim() || busy || Boolean(disabledReason)}>Add</button>
      </div>
      {problem || disabledReason ? (
        <p className={problem ? 'field__error' : 'field__hint'} role={problem ? 'alert' : undefined}>{problem || disabledReason}</p>
      ) : (
        <p className="field__hint">
          Find a piece on{' '}
          <a href={`${STOREFRONT_URL}/all`} target="_blank" rel="noreferrer" className="link-add__browse">
            the Willow website <ExternalLink size={12} aria-hidden />
          </a>
          , copy its page link and paste it here. It can be from any store.
        </p>
      )}
    </div>
  );
}
