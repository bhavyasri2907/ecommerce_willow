import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Plus, Sparkles } from 'lucide-react';
import { curationService, MAX_PICKS } from '../services/curationService.js';
import { useFetch } from '../hooks/useFetch.js';
import { useAuth } from '../context/AuthProvider.jsx';
import { useToast } from '../context/ToastProvider.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import { Card, CardHeader } from '../components/common/Card.jsx';
import { Tabs } from '../components/common/Tabs.jsx';
import { SearchInput } from '../components/common/Input.jsx';
import { CountPill } from '../components/common/Badge.jsx';
import ProductStatusBadge from '../components/products/ProductStatusBadge.jsx';
import StockBadge from '../components/inventory/StockBadge.jsx';
import ProductThumb from '../components/common/ProductThumb.jsx';
import PickLinkInput from '../components/curation/PickLinkInput.jsx';
import PickList from '../components/curation/PickList.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { SkeletonRows } from '../components/common/Loader.jsx';
import { useCategories } from '../hooks/useCategories.js';
import { formatPrice } from '../utils/formatPrice.js';

/**
 * Curated Fit for each of the store's products: pick the pieces shoppers are shown with it.
 * Pieces are added by pasting a link from the Willow website (any store's product) or by
 * ticking products from the seller's own store.
 */
export default function CuratedPicks() {
  const toast = useToast();
  const { seller } = useAuth();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const { categories } = useCategories();
  const [chosenCategory, setCategory] = useState(null);

  const board = useFetch((signal) => curationService.listCurations(signal), [], { live: ['curation.', 'product.'] });

  const entries = board.data?.products ?? [];
  const selectedId = Number(params.get('product')) || entries[0]?.product.id;
  const selected = entries.find((e) => e.product.id === selectedId) ?? entries[0];
  const pickIds = useMemo(() => new Set((selected?.picks ?? []).map((p) => p.id)), [selected]);
  const full = pickIds.size >= MAX_PICKS;

  // "From your store": the seller's other products, grouped by category.
  const ownOthers = entries.map((e) => e.product).filter((p) => p.id !== selected?.product.id);
  const tabs = categories
    .map((c) => ({ value: c.value, label: c.label, count: ownOthers.filter((p) => p.type === c.value).length }))
    .filter((t) => t.count > 0);
  const category = tabs.some((t) => t.value === chosenCategory) ? chosenCategory : tabs[0]?.value;
  const candidates = ownOthers.filter((p) => p.type === category);

  /** Replaces the selected product's picks on screen straight away; the server's copy follows. */
  function showPicks(picks) {
    board.setData((data) => ({
      ...data,
      products: data.products.map((e) => (e.product.id === selected.product.id ? { ...e, picks } : e)),
    }));
  }

  async function addByLink(link) {
    const pick = await curationService.addPickByLink(selected.product.id, link); // errors show under the box
    showPicks([...selected.picks, pick]);
    toast.success('Added to the fit', `${pick.name} will be shown with ${selected.product.name}`);
  }

  async function remove(pick) {
    const before = selected.picks;
    showPicks(before.filter((p) => p.id !== pick.id));
    try {
      await curationService.removePick(selected.product.id, pick.id);
    } catch (err) {
      showPicks(before);
      toast.error('Could not remove it', err.message);
    }
  }

  async function toggleOwn(product) {
    if (pickIds.has(product.id)) return remove(product);
    const before = selected.picks;
    showPicks([...before, product]);
    try {
      await curationService.addPick(selected.product.id, product.id);
    } catch (err) {
      showPicks(before);
      toast.error('Could not add it', err.message);
    }
    return undefined;
  }

  const visible = entries.filter((e) => e.product.name.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <>
      <PageHeader
        title="Seller's Curated Picks"
        description="Build a Curated Fit for each product: the pieces shoppers see alongside it on the Willow website. Pick from your own store or from anywhere on Willow."
      />

      {board.error ? (
        <Card><ErrorState error={board.error} onRetry={board.refetch} /></Card>
      ) : !board.data ? (
        <Card><SkeletonRows rows={6} columns={3} /></Card>
      ) : entries.length === 0 ? (
        <Card>
          <EmptyState icon={Sparkles} title="No products to curate yet" description="Add a product first, then come back to build its Curated Fit." />
        </Card>
      ) : (
        <div className="curate">
          <Card padded={false} className="curate__list">
            <div className="curate__list-head">
              <SearchInput value={search} onChange={setSearch} placeholder="Search your products" />
            </div>
            <ul role="listbox" aria-label="Your products">
              {visible.map(({ product, picks }) => {
                const active = product.id === selected?.product.id;
                return (
                  <li key={product.id}>
                    <button
                      role="option"
                      aria-selected={active}
                      className={`curate__top ${active ? 'is-active' : ''}`}
                      onClick={() => setParams({ product: product.id }, { replace: true })}
                    >
                      <ProductThumb product={product} size={40} />
                      <span className="curate__top-text">
                        <strong>{product.name}</strong>
                        <span>{product.typeLabel} · {formatPrice(product.price)}</span>
                      </span>
                      <CountPill value={picks.length} tone={picks.length ? 'accent' : 'neutral'} />
                    </button>
                  </li>
                );
              })}
              {visible.length === 0 && <li className="muted small curate__none">No products match.</li>}
            </ul>
          </Card>

          {selected && (
            <div className="stack">
              <Card>
                <div className="curate__hero">
                  <ProductThumb product={selected.product} size={72} />
                  <div className="curate__hero-text">
                    <h2>{selected.product.name}</h2>
                    <p className="muted">
                      {[selected.product.typeLabel, selected.product.color, formatPrice(selected.product.price)].filter(Boolean).join(' · ')}
                    </p>
                    <div className="row-gap">
                      <ProductStatusBadge status={selected.product.status} />
                      <StockBadge status={selected.product.stockStatus} />
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <CardHeader
                  title="Curated fit"
                  subtitle={`${selected.picks.length} of ${MAX_PICKS} pieces · shown on this product's page in this order`}
                  icon={Sparkles}
                />
                {selected.picks.length === 0 ? (
                  <p className="muted small curate__empty">No pieces yet. Paste a link below, or tick products from your store.</p>
                ) : (
                  <PickList picks={selected.picks} ownStoreId={seller?.storeId} onRemove={remove} />
                )}
                <div className="curate__add">
                  <span className="field__label">Add from anywhere on Willow</span>
                  <PickLinkInput onAdd={addByLink} disabledReason={full ? `This fit is full (${MAX_PICKS} pieces). Remove one to add another.` : undefined} />
                </div>
              </Card>

              <Card padded={false} className="table-card">
                <div className="card--padded card__header-pad">
                  <CardHeader title="Add from your store" subtitle="Tap a product to add it to the fit, or tap again to remove it" />
                </div>
                {tabs.length === 0 ? (
                  <EmptyState title="No other products in your store" description="Use a Willow link above, or add more products." />
                ) : (
                  <>
                    <Tabs
                      value={category}
                      onChange={setCategory}
                      ariaLabel="Category"
                      tabs={tabs.map((t) => ({ ...t, count: ownOthers.filter((p) => p.type === t.value && pickIds.has(p.id)).length }))}
                    />
                    <div className="candidate-grid">
                      {candidates.map((c) => {
                        const on = pickIds.has(c.id);
                        const unavailable = !on && (full || c.status !== 'LIVE');
                        return (
                          <button
                            key={c.id}
                            className={`candidate ${on ? 'is-on' : ''}`}
                            aria-pressed={on}
                            disabled={unavailable}
                            title={c.status !== 'LIVE' && !on ? 'Publish this product before adding it to a fit' : undefined}
                            onClick={() => toggleOwn(c)}
                          >
                            <span className="candidate__check" aria-hidden>{on ? <Check size={14} strokeWidth={3} /> : <Plus size={14} />}</span>
                            <ProductThumb product={c} size={64} />
                            <span className="candidate__name">{c.name}</span>
                            <span className="candidate__meta">{formatPrice(c.price)}{c.status !== 'LIVE' ? ' · Draft' : ''}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </Card>
            </div>
          )}
        </div>
      )}
    </>
  );
}
