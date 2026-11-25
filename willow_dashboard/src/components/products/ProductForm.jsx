import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save, X } from 'lucide-react';
import { productService } from '../../services/productService.js';
import { curationService, MAX_PICKS } from '../../services/curationService.js';
import { useAuth } from '../../context/AuthProvider.jsx';
import { useCategories } from '../../hooks/useCategories.js';
import { useToast } from '../../context/ToastProvider.jsx';
import PageHeader from '../common/PageHeader.jsx';
import Button from '../common/Button.jsx';
import { Card, CardHeader } from '../common/Card.jsx';
import { Field, Input, Select, Textarea } from '../common/Input.jsx';
import ProductThumb from '../common/ProductThumb.jsx';
import StockBadge from '../inventory/StockBadge.jsx';
import ProductStatusBadge from './ProductStatusBadge.jsx';
import ImageUploader from './ImageUploader.jsx';
import PickLinkInput from '../curation/PickLinkInput.jsx';
import PickList from '../curation/PickList.jsx';
import { GENDERS, MAX_SIZES, MAX_SIZE_LENGTH, SIZE_PRESETS, STYLES, SWATCHES } from '../../constants/productOptions.js';
import { STOREFRONT_URL } from '../../constants/config.js';
import { formatPrice } from '../../utils/formatPrice.js';
import { formatNumber } from '../../utils/formatNumber.js';
import { formatDateTime } from '../../utils/formatDate.js';
import { validateProduct } from '../../utils/validators.js';

const EMPTY = {
  name: '',
  type: 'TOP',
  gender: 'WOMEN',
  brand: '',
  material: '',
  status: 'LIVE',
  sku: '',
  color: '',
  hex: '#8C2D42',
  style: 'Casual',
  price: '',
  originalPrice: '',
  stock: '0',
  sizes: [],
  images: [],
  description: '',
};

function fromProduct(p) {
  return {
    name: p.name,
    type: p.type,
    gender: p.gender ?? 'UNISEX',
    brand: p.brand ?? '',
    material: p.material ?? '',
    status: p.status,
    sku: p.sku ?? '',
    color: p.color ?? '',
    hex: p.hex ?? '#8C2D42',
    style: p.style ?? '',
    price: String(p.price ?? ''),
    originalPrice: p.originalPrice ? String(p.originalPrice) : '',
    stock: String(p.stock ?? 0),
    sizes: p.sizes ?? [],
    images: p.images?.length ? p.images : p.imageUrl ? [p.imageUrl] : [],
    description: p.description ?? '',
  };
}

/**
 * Create / edit form for a product. Pass `product` to edit it; omit it to create a new one.
 * Mount with a `key` per product so the form state resets when the product changes.
 */
export default function ProductForm({ product }) {
  const isEdit = Boolean(product);
  const navigate = useNavigate();
  const toast = useToast();
  const { categories, labelOf } = useCategories();

  const [form, setForm] = useState(() => (product ? fromProduct(product) : EMPTY));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [customSize, setCustomSize] = useState('');
  const [sizeProblem, setSizeProblem] = useState('');

  // Curated Fit: Willow products to suggest with this one. null while an existing fit is loading.
  const { seller } = useAuth();
  const [picks, setPicks] = useState(isEdit ? null : []);
  useEffect(() => {
    if (!isEdit) return undefined;
    const controller = new AbortController();
    curationService
      .getPicks(product.id, controller.signal)
      .then(setPicks)
      .catch((err) => err.name !== 'AbortError' && setPicks(null)); // fit stays as it is on save
    return () => controller.abort();
  }, [isEdit, product?.id]);

  async function addPickByLink(link) {
    const pick = await curationService.resolveLink(link);
    if (isEdit && pick.id === product.id) throw new Error("A product can't be part of its own fit");
    if (picks.some((p) => p.id === pick.id)) throw new Error(`"${pick.name}" is already in this fit`);
    setPicks([...picks, pick]);
  }

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
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

  /**
   * Adds whatever is typed in the custom size box. Several sizes can be typed at once,
   * separated by commas. A size that matches an existing one (in any letter case) just
   * switches that one on instead of creating a near-duplicate.
   */
  function addCustomSizes() {
    const typed = customSize.split(',').map((s) => s.trim()).filter(Boolean);
    if (!typed.length) {
      setCustomSize('');
      return;
    }
    const known = [...presets, ...form.sizes];
    const next = [...form.sizes];
    let problem = '';
    typed.forEach((size) => {
      const existing = known.find((k) => k.toLowerCase() === size.toLowerCase());
      const value = existing ?? size;
      if (next.includes(value)) return;
      if (value.length > MAX_SIZE_LENGTH) problem = `"${value}" is too long: a size can be up to ${MAX_SIZE_LENGTH} characters.`;
      else if (next.length >= MAX_SIZES) problem = `A product can have up to ${MAX_SIZES} sizes.`;
      else next.push(value);
    });
    set('sizes')(next);
    setSizeProblem(problem);
    setCustomSize('');
  }

  async function submit(e) {
    e.preventDefault();
    const clientErrors = validateProduct(form);
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
      brand: form.brand.trim() || null,
      material: form.material.trim() || null,
      // Left out when an existing fit could not be loaded, so saving never wipes it.
      curatedPickIds: picks ? picks.map((p) => p.id) : undefined,
    };
    setSaving(true);
    try {
      const saved = isEdit ? await productService.updateProduct(product.id, body) : await productService.createProduct(body);
      toast.show({
        tone: 'success',
        title: isEdit ? 'Product updated' : saved.status === 'LIVE' ? 'Product is live on your store' : 'Product saved as draft',
        description: `${saved.name} · ${saved.sku}`,
        // A live product can be opened on the storefront straight away.
        action: saved.status === 'LIVE'
          ? { label: 'View on storefront', onClick: () => window.open(`${STOREFRONT_URL}/product/${saved.id}`, '_blank', 'noopener') }
          : undefined,
        duration: 8000,
      });
      navigate(isEdit ? '/products' : `/products?type=${saved.type}`);
    } catch (err) {
      setErrors(err.fields ?? {});
      toast.error(isEdit ? 'Could not update product' : 'Could not create product', err.message);
    } finally {
      setSaving(false);
    }
  }

  const preview = {
    ...form,
    price: Number(form.price || 0),
    stock: Number(form.stock || 0),
    imageUrl: form.images[0] ?? null,
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
        title={isEdit ? `Edit ${product.name}` : 'Add Product'}
        description={isEdit ? `Last updated ${formatDateTime(product.updatedAt)}` : 'Create a new product for your storefront.'}
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
            <CardHeader title="Photos" subtitle="Shown on your storefront. Add a few angles." />
            <ImageUploader images={form.images} onChange={set('images')} error={errors.images} />
          </Card>

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
              <Field label="For" required error={errors.gender} hint="Decides whether it shows under Men, Women or both.">
                {(fid) => <Select id={fid} value={form.gender} onChange={(e) => set('gender')(e.target.value)} options={GENDERS} />}
              </Field>
              <Field label="Style" error={errors.style}>
                {(fid) => <Select id={fid} value={form.style} onChange={(e) => set('style')(e.target.value)} placeholder="Not set" options={STYLES.map((s) => ({ value: s, label: s }))} />}
              </Field>
              <Field label="Brand" error={errors.brand} hint="Leave blank to show your store name.">
                {(fid) => <Input id={fid} value={form.brand} onChange={(e) => set('brand')(e.target.value)} placeholder="Your store name" maxLength={80} />}
              </Field>
              <Field label="Material" error={errors.material}>
                {(fid) => <Input id={fid} value={form.material} onChange={(e) => set('material')(e.target.value)} placeholder="e.g. 100% cotton" maxLength={120} />}
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
                      onChange={(e) => {
                        setCustomSize(e.target.value);
                        setSizeProblem('');
                      }}
                      onKeyDown={(e) => {
                        // Enter or a comma adds the size; Enter must not save the whole form.
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          addCustomSizes();
                        }
                      }}
                      onBlur={addCustomSizes}
                      placeholder="Add your own size"
                      aria-label="Custom size"
                    />
                    <button type="button" onClick={addCustomSizes} aria-label="Add size"><Plus size={14} /> Add</button>
                  </span>
                </div>
                {sizeProblem ? (
                  <p className="field__error" role="alert">{sizeProblem}</p>
                ) : (
                  <p className="field__hint">
                    {form.sizes.length ? `${form.sizes.length} variation${form.sizes.length > 1 ? 's' : ''} selected. ` : 'No sizes: sold as a single item. '}
                    Type your own (e.g. 3XL, Free Size) and press Enter.
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Colour" subtitle="Shown beside the product, and used as its tile when there is no photo." />
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
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Curated fit"
              subtitle="Optional. Suggest pieces from anywhere on Willow to wear with this; shoppers see them on its page."
            />
            {picks === null ? (
              <p className="muted small">Loading this product's fit…</p>
            ) : (
              <div className="stack-sm">
                {picks.length > 0 && (
                  <PickList picks={picks} ownStoreId={seller?.storeId} onRemove={(pick) => setPicks(picks.filter((p) => p.id !== pick.id))} />
                )}
                <PickLinkInput
                  onAdd={addPickByLink}
                  disabledReason={picks.length >= MAX_PICKS ? `This fit is full (${MAX_PICKS} pieces). Remove one to add another.` : undefined}
                />
              </div>
            )}
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
                <div className="preview__meta">
                  {GENDERS.find((g) => g.value === form.gender)?.label.split(' ')[0]} · {labelOf(form.type)}
                  {form.style ? ` · ${form.style}` : ''}
                </div>
                <div className="preview__name">{form.name || 'Product name'}</div>
                <div className="preview__price">
                  {formatPrice(preview.price)}
                  {discount && (
                    <>
                      <span className="price-cell__was">{formatPrice(form.originalPrice)}</span>
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
                <div><dt>Units sold</dt><dd>{formatNumber(product.unitsSold)}</dd></div>
                <div><dt>Revenue</dt><dd>{formatPrice(product.revenue)}</dd></div>
                <div><dt>Created</dt><dd>{formatDateTime(product.createdAt)}</dd></div>
              </dl>
            </Card>
          )}
        </aside>
      </div>
    </form>
  );
}
