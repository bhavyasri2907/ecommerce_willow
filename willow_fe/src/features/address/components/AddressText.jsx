/** An address formatted the way couriers read it. Works for saved addresses and order shipping details. */
export default function AddressText({ name, phone, line, city, state, pincode }) {
  return (
    <address className="addr-text">
      {name && <strong className="addr-text__name">{name}</strong>}
      <span>{line}</span>
      <span>{[city, state].filter(Boolean).join(', ')}{pincode ? ` – ${pincode}` : ''}</span>
      {phone && <span className="addr-text__phone">Mobile: {phone}</span>}
    </address>
  );
}
