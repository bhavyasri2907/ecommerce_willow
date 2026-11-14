import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImageIcon, Plus, Save, X } from 'lucide-react';
import { sellerApi } from '../api/seller.js';
import { useQuery } from '../hooks/useQuery.js';
import { useToast } from '../components/toast/ToastProvider.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import { Card, CardHeader } from '../components/ui/Card.jsx';
import { Field, Input, Select, Textarea } from '../components/ui/Form.jsx';
import { ProductStatusBadge, StockBadge } from '../components/ui/Badge.jsx';
import { ErrorState, SkeletonRows } from '../components/ui/States.jsx';
import ProductThumb from '../components/ui/ProductThumb.jsx';
import { SIZE_PRESETS, STYLES, SWATCHES } from '../utils/constants.js';
import { useCategories } from '../hooks/useCategories.js';
import { formatCurrency, formatDateTime, formatNumber } from '../utils/format.js';

const EMPTY = {
  name: '',
  type: 'TOP',
  status: 'LIVE',
  sku: '',
  color: '',
  hex: '#8C2D42',
  style: 'Casual',
  price: '',
  originalPrice: '',
  stock: '0',
  sizes: [],
  imageUrl: '',
  description: '',
};

function fromProduct(p) {
  return {
    name: p.name,
    type: p.type,
    status: p.status,
    sku: p.sku ?? '',
    color: p.color ?? '',
    hex: p.hex ?? '#8C2D42',
    style: p.style ?? '',
    price: String(p.price ?? ''),
    originalPrice: p.originalPrice ? String(p.originalPrice) : '',
    stock: String(p.stock ?? 0),
    sizes: p.sizes ?? [],
    imageUrl: p.imageUrl ?? '',
    description: p.description ?? '',
  };
}

/** Client-side checks that mirror the API's validation, for instant feedback. */
function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Product name is required';
  if (!form.price || Number(form.price) < 1) errors.price = 'Price must be at least 1';
  if (form.originalPrice && Number(form.originalPrice) <= Number(form.price)) {
    errors.originalPrice = 'Compare-at price should be higher than the price';
  }
  if (form.stock === '' || Number(form.stock) < 0 || !Number.isInteger(Number(form.stock))) errors.stock = 'Stock must be a whole number, 0 or more';
  if (form.sku && !/^[A-Za-z0-9-]+$/.test(form.sku)) errors.sku = 'Only letters, numbers and dashes';
  if (form.imageUrl && !/^https?:\/\//.test(form.imageUrl)) errors.imageUrl = 'Must start with http:// or https://';
  return errors;
}

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { categories, labelOf } = useCategories();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [customSize, setCustomSize] = useState('');
  const [dirty, setDirty] = useState(false);

  const existing = useQuery((signal) => sellerApi.getProduct(id, signal), [id], { enabled: isEdit });

  useEffect(() => {
    if (existing.data && !dirty) setForm(fromProduct(existing.data));
  }, [existing.data, dirty]);

  useEffect(() => {
    if (!isEdit) {
      setForm(EMPTY);
      setDirty(false);
      setErrors({});
    }
  }, [isEdit]);

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const discount = useMemo(() => {
    const p = Number(form.price);
    const o = Number(form.originalPrice);
    return o > p && p > 0 ? Math.round(((o - p) / o) * 100) : null;
  }, [form.price, form.originalPrice]);

  const presets = SIZE_PRESETS[form.type] ?? [];
  const extraSizes = form.sizes.filter((s) => !presets.includes(s));

  function toggleSize(size) {
    set('sizes')(form.sizes.includes(size) ? form.sizes.filter((s) => s !== size) : [...form.sizes, size]);
  }

  function addCustomSize(e) {
    e.preventDefault();
    const s = customSize.trim();
    if (s && !form.sizes.includes(s)) set('sizes')([...form.sizes, s]);
    setCustomSize('');
  }

  async function submit(e) {
    e.preventDefault();
    const clientErrors = validate(form);
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      toast.error('Please fix the highlighted fields');
      return;
    }
    const body = {
      ...form,
      name: form.name.trim(),
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      stock: Number(form.stock),
      sku: form.sku.trim() || null,
      imageUrl: form.imageUrl.trim() || null,
    };
    setSaving(true);
    try {
      const saved = isEdit ? await sellerApi.updateProduct(id, body) : await sellerApi.createProduct(body);
      toast.success(isEdit ? 'Product updated' : 'Product created', `${saved.name} · ${saved.sku}`);
      setDirty(false);
      navigate(isEdit ? '/products' : `/products?type=${saved.type}`);
    } catch (err) {
      setErrors(err.fields ?? {});
      toast.error(isEdit ? 'Could not update product' : 'Could not create product', err.message);
    } finally {
      setSaving(false);
    }
  }

  if (isEdit && existing.error) return <ErrorState error={existing.error} onRetry={existing.refetch} />;
  if (isEdit && !existing.data) return <Card><SkeletonRows rows={6} columns={3} /></Card>;

  const preview = {
    ...form,
    price: Number(form.price || 0),
    stock: Number(form.stock || 0),
    imageUrl: /^https?:\/\//.test(form.imageUrl) ? form.imageUrl : null,
  };
  const previewStock = preview.stock <= 0 ? 'OUT_OF_STOCK' : preview.stock <= 10 ? 'LOW_STOCK' : 'IN_STOCK';

  return (
    <form onSubmit={submit} noValidate>
      <PageHeader
        eyebrow={
          <Link to="/products" className="back-link">
            <ArrowLeft size={14} aria-hidden /> Products
          </Link>
        }
        title={isEdit ? `Edit ${existing.data.name}` : 'Add Product'}
        description={isEdit ? `Last updated ${formatDateTime(existing.data.updatedAt)}` : 'Create a new product for your storefront.'}
        actions={
          <>
            <Button type="button" variant="ghost" onClick={() => navigate('/products')}>Cancel</Button>
            <Button type="submit" variant="primary" icon={Save} loading={saving}>
              {isEdit ? 'Save changes' : 'Create product'}
            </Button>
          </>
        }
      />

      <div className="form-layout">
        <div className="form-layout__main">
          <Card>
            <CardHeader title="Basic information" subtitle="What shoppers see first." />
            <div className="form-grid">
              <Field label="Product name" required error={errors.name} className="span-2">
                {(fid) => <Input id={fid} value={form.name} onChange={(e) => set('name')(e.target.value)} placeholder="e.g. Ivory Silk Blouse" maxLength={120} />}
              </Field>
              <Field label="Category" required error={errors.type}>
                {(fid) => (
                  <Select id={fid} value={form.type} onChange={(e) => { set('type')(e.target.value); set('sizes')([]); }} options={categories} />
                )}
              </Field>
              <Field label="Style" error={errors.style}>
                {(fid) => <Select id={fid} value={form.style} onChange={(e) => set('style')(e.target.value)} placeholder="Not set" options={STYLES.map((s) => ({ value: s, label: s }))} />}
              </Field>
              <Field label="Description" error={errors.description} hint={`${form.description.length}/1000`} className="span-2">
                {(fid) => (
                  <Textarea id={fid} rows={4} value={form.description} maxLength={1000} onChange={(e) => set('description')(e.target.value)} placeholder="Fabric, fit and how to style it." />
                )}
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader title="Pricing" subtitle="Set a compare-at price to show a discount." />
            <div className="form-grid">
              <Field label="Price" required error={errors.price}>
                {(fid) => <Input id={fid} type="number" min="1" step="1" prefix="₹" value={form.price} onChange={(e) => set('price')(e.target.value)} placeholder="0" />}
              </Field>
              <Field label="Compare-at price" error={errors.originalPrice} hint={discount ? `Shoppers see ${discount}% off` : 'Optional'}>
                {(fid) => <Input id={fid} type="number" min="0" step="1" prefix="₹" value={form.originalPrice} onChange={(e) => set('originalPrice')(e.target.value)} placeholder="0" />}
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader title="Inventory & variants" subtitle={isEdit ? 'Stock edits here are logged as adjustments in Inventory.' : 'Opening stock is logged in Inventory.'} />
            <div className="form-grid">
              <Field label="SKU" error={errors.sku} hint={isEdit ? undefined : 'Leave blank to generate one automatically'}>
                {(fid) => <Input id={fid} value={form.sku} onChange={(e) => set('sku')(e.target.value.toUpperCase())} placeholder="WL-TP-1234" maxLength={40} />}
              </Field>
              <Field label="Stock on hand" required error={errors.stock}>
                {(fid) => <Input id={fid} type="number" min="0" step="1" suffix="units" value={form.stock} onChange={(e) => set('stock')(e.target.value)} />}
              </Field>
              <div className="field span-2">
                <span className="field__label">Sizes / variations</span>
                <div className="chip-group" role="group" aria-label="Sizes">
                  {[...presets, ...extraSizes].map((size) => {
                    const on = form.sizes.includes(size);
                    return (
                      <button type="button" key={size} className={`chip ${on ? 'is-on' : ''}`} aria-pressed={on} onClick={() => toggleSize(size)}>
                        {size}
                        {on && extraSizes.includes(size) && <X size={12} aria-hidden />}
                      </button>
                    );
                  })}
                  <span className="chip-add">
                    <input
                      value={customSize}
                      onChange={(e) => setCustomSize(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCustomSize(e)}
                      placeholder="Custom"
                      aria-label="Custom size"
                      maxLength={10}
                    />
                    <button type="button" onClick={addCustomSize} aria-label="Add size"><Plus size={14} /></button>
                  </span>
                </div>
                <p className="field__hint">{form.sizes.length ? `${form.sizes.length} variation${form.sizes.length > 1 ? 's' : ''}` : 'No sizes: sold as a single item'}</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Appearance" subtitle="Used for the product image and the colour swatch." />
            <div className="form-grid">
              <Field label="Colour name" error={errors.color}>
                {(fid) => <Input id={fid} value={form.color} onChange={(e) => set('color')(e.target.value)} placeholder="e.g. Ivory" maxLength={60} />}
              </Field>
              <Field label="Swatch" error={errors.hex}>
                {(fid) => (
                  <div className="swatch-picker">
                    <input id={fid} type="color" value={form.hex} onChange={(e) => set('hex')(e.target.value.toUpperCase())} aria-label="Pick swatch colour" />
                    {SWATCHES.map((hex) => (
                      <button
                        type="button"
                        key={hex}
                        className={`swatch ${form.hex.toUpperCase() === hex ? 'is-on' : ''}`}
                        style={{ background: hex }}
                        onClick={() => set('hex')(hex)}
                        aria-label={`Use ${hex}`}
                      />
                    ))}
                  </div>
                )}
              </Field>
              <Field label="Image URL" error={errors.imageUrl} hint="Paste a link to a square product photo." className="span-2">
                {(fid) => <Input id={fid} type="url" value={form.imageUrl} onChange={(e) => set('imageUrl')(e.target.value)} placeholder="https://…" prefix={<ImageIcon size={15} />} />}
              </Field>
            </div>
          </Card>
        </div>

        <aside className="form-layout__side">
          <Card>
            <CardHeader title="Visibility" />
            <div className="radio-cards" role="radiogroup" aria-label="Status">
              {[
                { value: 'LIVE', label: 'Live', desc: 'Visible and purchasable on the storefront' },
                { value: 'DRAFT', label: 'Draft', desc: 'Hidden until you publish it' },
                ...(isEdit ? [{ value: 'ARCHIVED', label: 'Archived', desc: 'Retired; kept for order history' }] : []),
              ].map((opt) => (
                <label key={opt.value} className={`radio-card ${form.status === opt.value ? 'is-on' : ''}`}>
                  <input type="radio" name="status" value={opt.value} checked={form.status === opt.value} onChange={() => set('status')(opt.value)} />
                  <span>
                    <strong>{opt.label}</strong>
                    <span>{opt.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </Card>

          <Card className="preview-card">
            <CardHeader title="Preview" subtitle="How it appears in your catalogue" />
            <div className="preview">
              <div className="preview__media">
                <ProductThumb product={preview} size={180} />
              </div>
              <div className="preview__body">
                <div className="preview__meta">{labelOf(form.type)}{form.style ? ` · ${form.style}` : ''}</div>
                <div className="preview__name">{form.name || 'Product name'}</div>
                <div className="preview__price">
                  {formatCurrency(preview.price)}
                  {discount && (
                    <>
                      <span className="price-cell__was">{formatCurrency(form.originalPrice)}</span>
                      <span className="preview__off">{discount}% off</span>
                    </>
                  )}
                </div>
                <div className="preview__badges">
                  <ProductStatusBadge status={form.status} />
                  <StockBadge status={previewStock} />
                </div>
              </div>
            </div>
          </Card>

          {isEdit && (
            <Card>
              <CardHeader title="Performance" subtitle="All-time, excluding cancelled and returned orders" />
              <dl className="stat-list">
                <div><dt>Units sold</dt><dd>{formatNumber(existing.data.unitsSold)}</dd></div>
                <div><dt>Revenue</dt><dd>{formatCurrency(existing.data.revenue)}</dd></div>
                <div><dt>Created</dt><dd>{formatDateTime(existing.data.createdAt)}</dd></div>
              </dl>
            </Card>
          )}
        </aside>
      </div>
    </form>
  );
}
