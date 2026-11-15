import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Plus, Sparkles, X } from 'lucide-react';
import { curationService } from '../services/curationService.js';
import { useFetch } from '../hooks/useFetch.js';
import { useToast } from '../context/ToastProvider.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import { Card, CardHeader } from '../components/common/Card.jsx';
import { Tabs } from '../components/common/Tabs.jsx';
import { SearchInput } from '../components/common/Input.jsx';
import { CountPill } from '../components/common/Badge.jsx';
import ProductStatusBadge from '../components/products/ProductStatusBadge.jsx';
import StockBadge from '../components/inventory/StockBadge.jsx';
import ProductThumb from '../components/common/ProductThumb.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { SkeletonRows } from '../components/common/Loader.jsx';
import { useCategories } from '../hooks/useCategories.js';
import { formatPrice } from '../utils/formatPrice.js';

/** Tops are the anchor of every pairing; every other category can be matched to one. */
const ANCHOR_TYPE = 'TOP';

export default function CuratedPicks() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [topSearch, setTopSearch] = useState('');
  const { categories } = useCategories();
  const matchTypes = useMemo(() => categories.filter((c) => c.value !== ANCHOR_TYPE), [categories]);
  const [chosenCategory, setCategory] = useState(null);
  const category = chosenCategory ?? matchTypes[0]?.value;
  // Optimistic overrides keyed "topId:matchId" -> approved?, cleared whenever fresh data arrives.
  const [overrides, setOverrides] = useState({});

  const board = useFetch((signal) => curationService.listCurations(signal), [], { live: ['curation.', 'product.'] });
  useEffect(() => setOverrides({}), [board.data]);

  const tops = board.data?.tops ?? [];
  const selectedId = Number(params.get('top')) || tops[0]?.top.id;
  const selected = tops.find((t) => t.top.id === selectedId) ?? tops[0];

  const approvedIds = useMemo(() => {
    if (!selected) return new Set();
    const set = new Set(selected.matches.map((m) => m.product.id));
    Object.entries(overrides).forEach(([key, on]) => {
      const [topId, matchId] = key.split(':').map(Number);
      if (topId !== selected.top.id) return;
      on ? set.add(matchId) : set.delete(matchId);
    });
    return set;
  }, [selected, overrides]);

  const candidates = (board.data?.candidates ?? []).filter((c) => c.type === category);
  const countsByType = useMemo(() => {
    const counts = {};
    (board.data?.candidates ?? []).forEach((c) => {
      if (approvedIds.has(c.id)) counts[c.type] = (counts[c.type] ?? 0) + 1;
    });
    return counts;
  }, [board.data, approvedIds]);

  async function toggle(match) {
    const topId = selected.top.id;
    const on = !approvedIds.has(match.id);
    setOverrides((o) => ({ ...o, [`${topId}:${match.id}`]: on }));
    try {
      if (on) await curationService.approvePick(topId, match.id);
      else await curationService.revokePick(topId, match.id);
      toast.success(on ? 'Pick approved' : 'Pick removed', `${match.name} ${on ? 'will now be suggested with' : 'is no longer suggested with'} ${selected.top.name}`);
    } catch (err) {
      setOverrides((o) => {
        const next = { ...o };
        delete next[`${topId}:${match.id}`];
        return next;
      });
      toast.error('Could not update pick', err.message);
    }
  }

  const visibleTops = tops.filter((t) => t.top.name.toLowerCase().includes(topSearch.trim().toLowerCase()));
  const rankedMatches = selected?.matches.filter((m) => approvedIds.has(m.product.id)) ?? [];
  const pendingAdds = (board.data?.candidates ?? []).filter((c) => approvedIds.has(c.id) && !rankedMatches.some((m) => m.product.id === c.id));

  return (
    <>
      <PageHeader
        title="Seller's Curated Picks"
        description="Choose what Willow's style assistant may suggest with each top. It only ever recommends pairings you approve here."
      />

      {board.error ? (
        <Card><ErrorState error={board.error} onRetry={board.refetch} /></Card>
      ) : !board.data ? (
        <Card><SkeletonRows rows={6} columns={3} /></Card>
      ) : tops.length === 0 ? (
        <Card>
          <EmptyState icon={Sparkles} title="No tops to curate" description="Add a product in the Tops category to start building pairings." />
        </Card>
      ) : (
        <div className="curate">
          <Card padded={false} className="curate__list">
            <div className="curate__list-head">
              <SearchInput value={topSearch} onChange={setTopSearch} placeholder="Search tops" />
            </div>
            <ul role="listbox" aria-label="Tops">
              {visibleTops.map(({ top, matches }) => {
                const active = top.id === selected?.top.id;
                return (
                  <li key={top.id}>
                    <button
                      role="option"
                      aria-selected={active}
                      className={`curate__top ${active ? 'is-active' : ''}`}
                      onClick={() => setParams({ top: top.id }, { replace: true })}
                    >
                      <ProductThumb product={top} size={40} />
                      <span className="curate__top-text">
                        <strong>{top.name}</strong>
                        <span>{top.style ?? 'Top'} · {formatPrice(top.price)}</span>
                      </span>
                      <CountPill value={matches.length} tone={matches.length ? 'accent' : 'neutral'} />
                    </button>
                  </li>
                );
              })}
              {visibleTops.length === 0 && <li className="muted small curate__none">No tops match.</li>}
            </ul>
          </Card>

          {selected && (
            <div className="stack">
              <Card>
                <div className="curate__hero">
                  <ProductThumb product={selected.top} size={72} />
                  <div className="curate__hero-text">
                    <h2>{selected.top.name}</h2>
                    <p className="muted">{[selected.top.color, selected.top.style, formatPrice(selected.top.price)].filter(Boolean).join(' · ')}</p>
                    <div className="row-gap">
                      <ProductStatusBadge status={selected.top.status} />
                      <StockBadge status={selected.top.stockStatus} />
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <CardHeader title="Approved picks" subtitle="Ranked by the style assistant's match score" icon={Sparkles} />
                {rankedMatches.length === 0 && pendingAdds.length === 0 ? (
                  <p className="muted small">No picks yet. Choose pieces below to pair with this top.</p>
                ) : (
                  <ul className="picks">
                    {rankedMatches.map((m) => (
                      <li key={m.product.id} className="pick">
                        <ProductThumb product={m.product} size={44} />
                        <div className="pick__text">
                          <strong>{m.product.name}</strong>
                          <span>{m.reason}</span>
                        </div>
                        <div className="pick__score" title={`Match score ${m.matchScore}/100`}>
                          <span className="pick__score-value">{m.matchScore}</span>
                          <span className="pick__score-bar"><span style={{ width: `${m.matchScore}%` }} /></span>
                        </div>
                        <button className="icon-btn" aria-label={`Remove ${m.product.name}`} onClick={() => toggle(m.product)}>
                          <X size={16} />
                        </button>
                      </li>
                    ))}
                    {pendingAdds.map((p) => (
                      <li key={p.id} className="pick is-pending">
                        <ProductThumb product={p} size={44} />
                        <div className="pick__text">
                          <strong>{p.name}</strong>
                          <span>Scoring…</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card padded={false} className="table-card">
                <div className="card--padded card__header-pad">
                  <CardHeader title="Add pieces" subtitle="Tap to approve or remove a pairing" />
                </div>
                <Tabs
                  value={category}
                  onChange={setCategory}
                  ariaLabel="Category"
                  tabs={matchTypes.map((t) => ({ value: t.value, label: t.label, count: countsByType[t.value] ?? 0 }))}
                />
                {candidates.length === 0 ? (
                  <EmptyState title="No products in this category" description="Add some from the Products page." />
                ) : (
                  <div className="candidate-grid">
                    {candidates.map((c) => {
                      const on = approvedIds.has(c.id);
                      return (
                        <button key={c.id} className={`candidate ${on ? 'is-on' : ''}`} aria-pressed={on} onClick={() => toggle(c)}>
                          <span className="candidate__check" aria-hidden>{on ? <Check size={14} strokeWidth={3} /> : <Plus size={14} />}</span>
                          <ProductThumb product={c} size={64} />
                          <span className="candidate__name">{c.name}</span>
                          <span className="candidate__meta">{formatPrice(c.price)}{c.status !== 'LIVE' ? ' · Draft' : ''}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      )}
    </>
  );
}
