import { useEffect, useState } from 'react';
import { Bell, Boxes, FlaskConical, Save, ShoppingCart, Truck } from 'lucide-react';
import { storeService } from '../services/storeService.js';
import { useFetch } from '../hooks/useFetch.js';
import { useToast } from '../context/ToastProvider.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Button from '../components/common/Button.jsx';
import { Card, CardHeader } from '../components/common/Card.jsx';
import { Field, Input, Toggle } from '../components/common/Input.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { SkeletonRows } from '../components/common/Loader.jsx';
import { formatPrice } from '../utils/formatPrice.js';
import { formatDateTime } from '../utils/formatDate.js';

export default function Settings() {
  const toast = useToast();
  const settings = useFetch((signal) => storeService.getSettings(signal), [], { live: ['settings.'] });
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (settings.data && !dirty) setForm(settings.data);
  }, [settings.data, dirty]);

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
    if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
  };

  async function save(e) {
    e?.preventDefault();
    const body = {
      ...form,
      lowStockThreshold: Number(form.lowStockThreshold),
      returnWindowDays: Number(form.returnWindowDays),
      shippingFee: Number(form.shippingFee),
      freeShippingThreshold: Number(form.freeShippingThreshold),
    };
    setSaving(true);
    try {
      await storeService.updateSettings(body);
      setDirty(false);
      setErrors({});
      toast.success('Settings saved');
    } catch (err) {
      setErrors(err.fields ?? {});
      toast.error('Could not save settings', err.message);
    } finally {
      setSaving(false);
    }
  }

  // The simulator is a dev tool: toggle it immediately rather than waiting for "Save".
  async function toggleSimulator(on) {
    try {
      const updated = await storeService.updateSettings({ ...settings.data, simulateLiveOrders: on });
      setForm((f) => ({ ...f, simulateLiveOrders: updated.simulateLiveOrders }));
      toast.info(on ? 'Live order simulator on' : 'Live order simulator off', on ? 'A new storefront order arrives every few seconds.' : undefined);
    } catch (err) {
      toast.error('Could not change simulator', err.message);
    }
  }

  if (settings.error) return <ErrorState error={settings.error} onRetry={settings.refetch} />;
  if (!form) return <Card><SkeletonRows rows={6} columns={2} /></Card>;

  const numberField = (key, label, props) => (
    <Field label={label} error={errors[key]} hint={props.hint}>
      {(id) => (
        <Input id={id} type="number" min="0" step="1" value={form[key]} onChange={(e) => set(key, e.target.value)} prefix={props.prefix} suffix={props.suffix} />
      )}
    </Field>
  );

  return (
    <form onSubmit={save} noValidate>
      <PageHeader
        title="Settings"
        description={form.updatedAt ? `Last saved ${formatDateTime(form.updatedAt)}` : 'Store operations and notifications'}
        actions={
          <>
            {dirty && <Button type="button" variant="ghost" onClick={() => { setDirty(false); setForm(settings.data); setErrors({}); }}>Discard</Button>}
            <Button type="submit" variant="primary" icon={Save} loading={saving} disabled={!dirty}>Save settings</Button>
          </>
        }
      />

      <div className="settings-grid">
        <Card>
          <CardHeader title="Inventory" subtitle="When products are flagged as running low" icon={Boxes} />
          <div className="form-grid form-grid--single">
            {numberField('lowStockThreshold', 'Low stock threshold', { suffix: 'units', hint: 'A product at or below this level shows as Low stock' })}
          </div>
        </Card>

        <Card>
          <CardHeader title="Orders" subtitle="How new orders are handled" icon={ShoppingCart} />
          <div className="stack">
            <Toggle
              label="Auto-confirm new orders"
              description="Skip Pending: storefront orders arrive already Confirmed."
              checked={form.autoConfirmOrders}
              onChange={(v) => set('autoConfirmOrders', v)}
            />
            {numberField('returnWindowDays', 'Return window', { suffix: 'days' })}
          </div>
        </Card>

        <Card>
          <CardHeader title="Shipping" subtitle="Charged at checkout" icon={Truck} />
          <div className="form-grid">
            {numberField('shippingFee', 'Shipping fee', { prefix: '₹' })}
            {numberField('freeShippingThreshold', 'Free shipping from', { prefix: '₹', hint: `Orders of ${formatPrice(form.freeShippingThreshold || 0)} or more ship free` })}
          </div>
        </Card>

        <Card>
          <CardHeader title="Notifications" subtitle="Real-time pop-ups in this dashboard" icon={Bell} />
          <div className="stack">
            <Toggle label="New order alerts" description="Show a notification the moment an order is placed." checked={form.orderNotifications} onChange={(v) => set('orderNotifications', v)} />
            <Toggle label="Low stock alerts" description="Warn when a sale takes a product to or below the threshold." checked={form.lowStockAlerts} onChange={(v) => set('lowStockAlerts', v)} />
          </div>
        </Card>

        <Card className="settings-grid__full card--dev">
          <CardHeader title="Developer tools" subtitle="For demos and testing. Applies immediately." icon={FlaskConical} />
          <Toggle
            label="Simulate live storefront orders"
            description="Places realistic orders and moves open orders forward every few seconds, through the same API as real checkouts. Watch Overview, Orders and Inventory update live."
            checked={form.simulateLiveOrders}
            onChange={toggleSimulator}
          />
        </Card>
      </div>
    </form>
  );
}
