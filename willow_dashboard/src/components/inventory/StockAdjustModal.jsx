import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService.js';
import { useToast } from '../../context/ToastProvider.jsx';
import Button from '../common/Button.jsx';
import { Segmented } from '../common/Tabs.jsx';
import { Field, Input, Select, Textarea } from '../common/Input.jsx';
import { Modal } from '../common/Modal.jsx';
import { STOCK_REASONS } from '../../constants/stockStatus.js';
import { formatNumber } from '../../utils/formatNumber.js';

/** Add or remove stock for one inventory item, with a reason that is logged as a movement. */
export default function StockAdjustModal({ item, onClose }) {
  const toast = useToast();
  const [direction, setDirection] = useState('in');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('RESTOCK');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const p = item.product;

  const reasons = STOCK_REASONS.filter((r) => r.direction === 'both' || r.direction === direction);
  useEffect(() => {
    if (!reasons.some((r) => r.value === reason)) setReason(reasons[0].value);
  }, [direction]); // eslint-disable-line react-hooks/exhaustive-deps

  const qty = Number(quantity) || 0;
  const change = direction === 'in' ? qty : -qty;
  const after = p.stock + change;

  async function submit(e) {
    e.preventDefault();
    if (!Number.isInteger(qty) || qty <= 0) return setErrors({ quantityChange: 'Enter a whole number greater than 0' });
    if (after < 0) return setErrors({ quantityChange: `Only ${p.stock} in stock` });
    setSaving(true);
    try {
      await inventoryService.adjustStock(p.id, { quantityChange: change, reason, note: note.trim() || null });
      toast.success('Stock updated', `${p.name}: ${p.stock} → ${after}`);
      onClose();
    } catch (err) {
      setErrors(err.fields ?? { quantityChange: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Adjust stock"
      subtitle={`${p.name} · ${p.sku}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit} loading={saving} disabled={!qty}>Save adjustment</Button>
        </>
      }
    >
      <form className="stack" onSubmit={submit}>
        <Segmented
          ariaLabel="Direction"
          value={direction}
          onChange={setDirection}
          options={[{ value: 'in', label: 'Add stock' }, { value: 'out', label: 'Remove stock' }]}
        />
        <Field label="Quantity" required error={errors.quantityChange}>
          {(id) => (
            <Input id={id} type="number" min="1" step="1" autoFocus value={quantity} onChange={(e) => { setQuantity(e.target.value); setErrors({}); }} prefix={direction === 'in' ? <Plus size={14} /> : <Minus size={14} />} suffix="units" />
          )}
        </Field>
        <Field label="Reason" required>
          {(id) => <Select id={id} value={reason} onChange={(e) => setReason(e.target.value)} options={reasons} />}
        </Field>
        <Field label="Note" hint="Optional, e.g. supplier invoice number">
          {(id) => <Textarea id={id} rows={2} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />}
        </Field>
        <div className="adjust-preview">
          <div><span>Current</span><strong>{formatNumber(p.stock)}</strong></div>
          <div className="adjust-preview__arrow" aria-hidden>→</div>
          <div><span>After</span><strong className={after < 0 ? 'text-danger' : ''}>{formatNumber(after)}</strong></div>
        </div>
      </form>
    </Modal>
  );
}
