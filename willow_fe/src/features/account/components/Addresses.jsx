import { useEffect, useState } from 'react';
import { addressService } from '../../../services/addressService.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import { MapPinIcon } from '../../../assets/icons/AccountIcons.jsx';
import AddressForm from '../../address/components/AddressForm.jsx';
import AddressText from '../../address/components/AddressText.jsx';

/** My Account > Addresses: the shopper's saved delivery addresses. */
export default function Addresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // 'new' or an address id
  const [busyId, setBusyId] = useState(null);

  const reload = () => addressService.list().then(setAddresses);

  useEffect(() => {
    reload().catch((err) => setError(err.message));
  }, []);

  async function run(id, action) {
    setBusyId(id);
    setError('');
    try {
      await action();
      await reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function save(values) {
    if (editing === 'new') await addressService.create(values);
    else await addressService.update(editing, values);
    await reload();
    setEditing(null);
  }

  function remove(a) {
    if (!window.confirm(`Remove the address for ${a.fullName} in ${a.city}?`)) return;
    run(a.id, () => addressService.remove(a.id));
  }

  return (
    <section className="account-section">
      <header className="account-section__header account-section__header--row">
        <div>
          <p className="account-hero__eyebrow">My Account</p>
          <h1 className="account-section__title">Addresses</h1>
          <p className="account-section__intro">Save the places you ship to most for a faster checkout.</p>
        </div>
        {addresses?.length > 0 && editing === null && (
          <button type="button" className="btn btn--primary" onClick={() => setEditing('new')}>+ Add new address</button>
        )}
      </header>

      {error && <p className="form-alert" role="alert">{error}</p>}

      {editing === 'new' && (
        <div className="order-panel">
          <h2 className="order-panel__title">New address</h2>
          <AddressForm
            initial={{ fullName: user.fullName, phone: user.phone ?? '' }}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {addresses === null && !error ? (
        <p className="state-msg">Loading addresses…</p>
      ) : addresses?.length === 0 && editing === null ? (
        <div className="account-empty">
          <span className="quick-link__icon quick-link__icon--sage"><MapPinIcon size={26} /></span>
          <h2 className="account-empty__title">No saved addresses</h2>
          <p className="account-empty__text">Add an address now, or save one when you check out.</p>
          <button type="button" className="account-empty__action" onClick={() => setEditing('new')}>Add an address</button>
        </div>
      ) : (
        <ul className="addr-list">
          {addresses?.map((a) => (
            <li key={a.id} className="order-panel addr-card">
              {editing === a.id ? (
                <AddressForm initial={a} onSubmit={save} onCancel={() => setEditing(null)} />
              ) : (
                <>
                  <div className="addr-card__body">
                    <AddressText name={a.fullName} phone={a.phone} line={a.addressLine} city={a.city} state={a.state} pincode={a.pincode} />
                    {a.isDefault && <span className="addr-badge">Default</span>}
                  </div>
                  <div className="addr-card__actions">
                    <button type="button" className="link-btn" disabled={busyId !== null} onClick={() => setEditing(a.id)}>Edit</button>
                    <button type="button" className="link-btn link-btn--danger" disabled={busyId !== null} onClick={() => remove(a)}>Remove</button>
                    {!a.isDefault && (
                      <button type="button" className="link-btn" disabled={busyId !== null} onClick={() => run(a.id, () => addressService.makeDefault(a.id))}>
                        Set as default
                      </button>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
