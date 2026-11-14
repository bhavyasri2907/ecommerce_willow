import { useEffect, useState } from 'react';
import { AtSign, Globe, Mail, MapPin, Phone, Save } from 'lucide-react';
import { sellerApi } from '../api/seller.js';
import { useQuery } from '../hooks/useQuery.js';
import { useToast } from '../components/toast/ToastProvider.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import { Card, CardHeader } from '../components/ui/Card.jsx';
import { Field, Input, Textarea } from '../components/ui/Form.jsx';
import { ErrorState, SkeletonRows } from '../components/ui/States.jsx';
import { formatDateTime } from '../utils/format.js';

const FIELDS = ['storeName', 'tagline', 'description', 'ownerName', 'contactEmail', 'contactPhone', 'addressLine', 'city', 'state', 'pincode', 'gstin', 'logoUrl', 'website', 'instagram'];

const toForm = (data) => Object.fromEntries(FIELDS.map((f) => [f, data?.[f] ?? '']));

export default function StoreProfile() {
  const toast = useToast();
  const profile = useQuery((signal) => sellerApi.storeProfile(signal), [], { live: ['store.'] });
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (profile.data && !dirty) setForm(toForm(profile.data));
  }, [profile.data, dirty]);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setDirty(true);
    if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
  };

  async function save(e) {
    e.preventDefault();
    if (!form.storeName.trim()) return setErrors({ storeName: 'Store name is required' });
    setSaving(true);
    try {
      await sellerApi.updateStoreProfile({ ...form, gstin: form.gstin.toUpperCase() });
      setDirty(false);
      setErrors({});
      toast.success('Store profile saved');
    } catch (err) {
      setErrors(err.fields ?? {});
      toast.error('Could not save profile', err.message);
    } finally {
      setSaving(false);
    }
  }

  if (profile.error) return <ErrorState error={profile.error} onRetry={profile.refetch} />;
  if (!form) return <Card><SkeletonRows rows={6} columns={2} /></Card>;

  const field = (key, label, props = {}) => (
    <Field label={label} error={errors[key]} required={props.required} hint={props.hint} className={props.className}>
      {(id) => (props.textarea
        ? <Textarea id={id} rows={4} value={form[key]} onChange={set(key)} maxLength={1000} />
        : <Input id={id} value={form[key]} onChange={set(key)} type={props.type} placeholder={props.placeholder} prefix={props.prefix} maxLength={props.maxLength} />)}
    </Field>
  );

  return (
    <form onSubmit={save} noValidate>
      <PageHeader
        title="Store Profile"
        description={profile.data?.updatedAt ? `How your store appears to shoppers · last saved ${formatDateTime(profile.data.updatedAt)}` : 'How your store appears to shoppers'}
        actions={
          <>
            {dirty && <Button type="button" variant="ghost" onClick={() => { setDirty(false); setForm(toForm(profile.data)); setErrors({}); }}>Discard</Button>}
            <Button type="submit" variant="primary" icon={Save} loading={saving} disabled={!dirty}>Save profile</Button>
          </>
        }
      />

      <div className="form-layout">
        <div className="form-layout__main">
          <Card>
            <CardHeader title="Brand" subtitle="Your storefront name and story" />
            <div className="form-grid">
              {field('storeName', 'Store name', { required: true, maxLength: 80 })}
              {field('tagline', 'Tagline', { maxLength: 120, placeholder: 'e.g. Dress in pairs' })}
              {field('description', 'About the store', { textarea: true, className: 'span-2' })}
              {field('logoUrl', 'Logo URL', { type: 'url', placeholder: 'https://…', className: 'span-2' })}
            </div>
          </Card>
          <Card>
            <CardHeader title="Contact" subtitle="Shown on invoices and the storefront footer" />
            <div className="form-grid">
              {field('ownerName', 'Owner / business name')}
              {field('contactEmail', 'Support email', { type: 'email', prefix: <Mail size={14} /> })}
              {field('contactPhone', 'Phone', { prefix: <Phone size={14} /> })}
              {field('website', 'Website', { type: 'url', prefix: <Globe size={14} />, placeholder: 'https://…' })}
              {field('instagram', 'Instagram', { prefix: <AtSign size={14} /> })}
            </div>
          </Card>
          <Card>
            <CardHeader title="Business address & tax" subtitle="Used for GST invoices" />
            <div className="form-grid">
              {field('addressLine', 'Address', { className: 'span-2' })}
              {field('city', 'City')}
              {field('state', 'State')}
              {field('pincode', 'PIN code', { maxLength: 6 })}
              {field('gstin', 'GSTIN', { maxLength: 15, hint: '15-character GST number' })}
            </div>
          </Card>
        </div>

        <aside className="form-layout__side">
          <Card className="store-preview">
            <CardHeader title="Preview" subtitle="Updates as you type" />
            <div className="store-preview__banner">
              {/^https?:\/\//.test(form.logoUrl) ? (
                <img src={form.logoUrl} alt="" className="store-preview__logo" />
              ) : (
                <span className="store-preview__logo store-preview__logo--initials">{(form.storeName || 'W').slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <div className="store-preview__body">
              <h3>{form.storeName || 'Your store'}</h3>
              {form.tagline && <p className="store-preview__tagline">{form.tagline}</p>}
              {form.description && <p className="muted small">{form.description}</p>}
              <ul className="store-preview__contact">
                {form.contactEmail && <li><Mail size={14} aria-hidden /> {form.contactEmail}</li>}
                {form.contactPhone && <li><Phone size={14} aria-hidden /> {form.contactPhone}</li>}
                {(form.city || form.state) && <li><MapPin size={14} aria-hidden /> {[form.city, form.state].filter(Boolean).join(', ')}</li>}
                {form.instagram && <li><AtSign size={14} aria-hidden /> {form.instagram.replace(/^@/, '')}</li>}
              </ul>
            </div>
          </Card>
        </aside>
      </div>
    </form>
  );
}
