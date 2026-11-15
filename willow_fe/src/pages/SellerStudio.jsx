import { useEffect, useState } from 'react';
import { productService } from '../services/productService.js';
import Garment from '../assets/icons/Garment.jsx';

export default function SellerStudio() {
  const [tops, setTops] = useState([]);
  const [pants, setPants] = useState([]);
  const [approvedByTop, setApprovedByTop] = useState({}); // topId -> Set(pantsId)
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    Promise.all([productService.listProducts('TOP'), productService.listProducts('PANTS')])
      .then(async ([topList, pantsList]) => {
        setTops(topList);
        setPants(pantsList);
        const entries = await Promise.all(
          topList.map(async (t) => {
            const matches = await productService.getAiMatches(t.id);
            return [t.id, new Set(matches.map((m) => m.product.id))];
          })
        );
        setApprovedByTop(Object.fromEntries(entries));
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  async function togglePant(topId, pantId) {
    const current = approvedByTop[topId] || new Set();
    const isOn = current.has(pantId);

    // optimistic update
    const nextSet = new Set(current);
    isOn ? nextSet.delete(pantId) : nextSet.add(pantId);
    setApprovedByTop((prev) => ({ ...prev, [topId]: nextSet }));

    try {
      if (isOn) await productService.revokeMatch(topId, pantId);
      else await productService.approveMatch(topId, pantId);
    } catch {
      // roll back on failure
      setApprovedByTop((prev) => ({ ...prev, [topId]: current }));
    }
  }

  if (status === 'loading') return <p className="state-msg">Loading Seller Studio…</p>;
  if (status === 'error') {
    return (
      <p className="state-msg">
        Couldn't reach the Willow API. Make sure the Spring Boot backend is running on
        http://localhost:8080.
      </p>
    );
  }

  return (
    <div>
      <div className="studio-intro">
        <h1>Seller Studio</h1>
        <p>
          Choose which pants Willow is allowed to suggest for each top. The style assistant only
          ever recommends what you tick here — it never invents a pairing on its own.
        </p>
      </div>

      <div className="studio-table">
        {tops.map((top) => (
          <div className="studio-row" key={top.id}>
            <div className="studio-top-line">
              <div className="ssw" style={{ background: `${top.hex}22` }}>
                <Garment type={top.type} hex={top.hex} />
              </div>
              <div>
                <div className="stname">{top.name}</div>
                <div className="stmeta">{top.style} · ₹{Number(top.price).toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div className="pants-picker">
              {pants.map((pant) => {
                const isOn = approvedByTop[top.id]?.has(pant.id);
                return (
                  <button
                    key={pant.id}
                    className={`pill${isOn ? ' on' : ''}`}
                    onClick={() => togglePant(top.id, pant.id)}
                  >
                    {pant.name}
                  </button>
                );
              })}
            </div>
            <div className="studio-note">Tap a pant to approve or remove it as a suggested match for this top.</div>
          </div>
        ))}
      </div>
    </div>
  );
}
