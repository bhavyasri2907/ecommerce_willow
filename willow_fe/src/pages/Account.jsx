import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import Garment from '../icons/Garment.jsx';

export default function Account() {
  const navigate = useNavigate();
  const {
    wishlistCount,
    sellerProducts,
    sellerPairings,
    addSellerProduct,
    addOutfitPairing
  } = useCart();

  const [activeTab, setActiveTab] = useState('account'); // 'account' | 'seller'

  // Product Upload Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdType, setNewProdType] = useState('TOP');
  const [newProdStyle, setNewProdStyle] = useState('Casual');
  const [newProdColor, setNewProdColor] = useState('Dusty Rose');
  const [newProdHex, setNewProdHex] = useState('#D99B9B');
  const [newProdPrice, setNewProdPrice] = useState(1499);
  const [newProdDesc, setNewProdDesc] = useState('');
  const [productCreatedMsg, setProductCreatedMsg] = useState('');

  // Outfit Linker Form State
  const [pairTopId, setPairTopId] = useState('101');
  const [pairMatchName, setPairMatchName] = useState('Black Wide-Leg Pants');
  const [pairMatchType, setPairMatchType] = useState('PANTS');
  const [pairMatchColor, setPairMatchColor] = useState('Black');
  const [pairMatchHex, setPairMatchHex] = useState('#2B2730');
  const [pairMatchPrice, setPairMatchPrice] = useState(1499);
  const [pairReason, setPairReason] = useState('Seller Curated: Perfectly balanced high-rise wide leg with relaxed top.');
  const [pairScore, setPairScore] = useState(98);
  const [pairingCreatedMsg, setPairingCreatedMsg] = useState('');

  const handleUploadProduct = (e) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const createdProduct = {
      id: Date.now(),
      name: newProdName,
      type: newProdType,
      style: newProdStyle,
      color: newProdColor,
      hex: newProdHex,
      price: Number(newProdPrice),
      description: newProdDesc || 'Curated seller product uploaded to Willow collection.',
    };

    addSellerProduct(createdProduct);
    setProductCreatedMsg(`✓ "${newProdName}" successfully uploaded to store catalog!`);
    setNewProdName('');
    setNewProdDesc('');
    setTimeout(() => setProductCreatedMsg(''), 4000);
  };

  const handleLinkOutfit = (e) => {
    e.preventDefault();
    if (!pairMatchName.trim()) return;

    const newPairing = {
      topId: pairTopId,
      matchProduct: {
        id: Date.now(),
        name: pairMatchName,
        type: pairMatchType,
        color: pairMatchColor,
        hex: pairMatchHex,
        style: 'Stylist Match',
        price: Number(pairMatchPrice),
        description: 'Stylist picked outfit pair.',
      },
      reason: pairReason,
      matchScore: Number(pairScore),
    };

    addOutfitPairing(newPairing);
    setPairingCreatedMsg(`✓ Stylist outfit link created for Product ID #${pairTopId}!`);
    setTimeout(() => setPairingCreatedMsg(''), 4000);
  };

  return (
    <div className="account-page-container">
      {/* Breadcrumb Bar */}
      <div className="category-breadcrumb">
        <Link to="/">Home</Link>
        <span className="sep">/</span>
        <span className="current">Account & Seller Portal</span>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="account-mode-tabs">
        <button
          className={`mode-tab ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          👤 Customer Account
        </button>
        <button
          className={`mode-tab seller-tab ${activeTab === 'seller' ? 'active' : ''}`}
          onClick={() => setActiveTab('seller')}
        >
          ✨ Seller & Stylist Studio
        </button>
      </div>

      {/* CUSTOMER ACCOUNT VIEW */}
      {activeTab === 'account' && (
        <div className="account-dashboard-view">
          <div className="account-hero-card">
            <div className="avatar-circle">W</div>
            <div className="user-info-text">
              <h2>Welcome back, Willow VIP</h2>
              <p>Member since 2026 · Preferred Stylist Curation</p>
            </div>
          </div>

          <div className="account-grid">
            <div className="account-card">
              <h3>📦 Recent Orders</h3>
              <p className="card-sub">No active orders right now. Items you purchase will appear here with live tracking.</p>
              <button className="account-action-btn" onClick={() => navigate('/all')}>
                Explore Collections
              </button>
            </div>

            <div className="account-card">
              <h3>♡ Saved Wishlist</h3>
              <p className="card-sub">You have <strong>{wishlistCount} saved items</strong> in your wishlist.</p>
              <button className="account-action-btn" onClick={() => navigate('/wishlist')}>
                View Saved Wishlist
              </button>
            </div>

            <div className="account-card">
              <h3>✨ Seller Account</h3>
              <p className="card-sub">Are you a fashion seller or stylist? Upload products & curate outfit combinations.</p>
              <button className="account-action-btn seller-btn" onClick={() => setActiveTab('seller')}>
                Switch to Seller Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SELLER & STYLIST PORTAL VIEW */}
      {activeTab === 'seller' && (
        <div className="seller-portal-view">
          <div className="seller-hero-header">
            <div className="category-hero-badge">SELLER & STYLIST STUDIO</div>
            <h1>Upload Products & Curate Outfit Pairs</h1>
            <p className="category-hero-sub">
              Add new products to the e-commerce store catalog and link matching bottoms, shoes, or accessories that suit the outfit.
            </p>
          </div>

          <div className="seller-grid-forms">
            {/* FORM 1: UPLOAD NEW E-COMMERCE PRODUCT */}
            <div className="seller-form-card">
              <div className="form-head">
                <h3>🛍️ 1. Upload New E-Commerce Product</h3>
                <p>Add a new garment or accessory to the store.</p>
              </div>

              {productCreatedMsg && <div className="form-success-banner">{productCreatedMsg}</div>}

              <form onSubmit={handleUploadProduct} className="seller-form">
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Linen Wrap Blouse"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Category / Type</label>
                    <select value={newProdType} onChange={(e) => setNewProdType(e.target.value)}>
                      <option value="TOP">Top / Shirt</option>
                      <option value="PANTS">Pants / Bottom</option>
                      <option value="BAG">Bag / Tote</option>
                      <option value="SHOES">Shoes / Footwear</option>
                      <option value="ACCESSORY">Accessory / Jewelry</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Style</label>
                    <select value={newProdStyle} onChange={(e) => setNewProdStyle(e.target.value)}>
                      <option value="Casual">Casual</option>
                      <option value="Smart">Smart</option>
                      <option value="Smart Casual">Smart Casual</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-3">
                  <div className="form-group">
                    <label>Color Name</label>
                    <input
                      type="text"
                      placeholder="Dusty Rose"
                      value={newProdColor}
                      onChange={(e) => setNewProdColor(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Color Swatch Hex</label>
                    <input
                      type="color"
                      value={newProdHex}
                      onChange={(e) => setNewProdHex(e.target.value)}
                      className="color-picker"
                    />
                  </div>

                  <div className="form-group">
                    <label>Price (₹ INR)</label>
                    <input
                      type="number"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Enter fabric details, fit notes, and styling instructions..."
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    rows={3}
                  />
                </div>

                <button type="submit" className="seller-submit-btn">
                  Publish Product to Store →
                </button>
              </form>
            </div>

            {/* FORM 2: LINK OUTFIT PAIRS (EXTRA FEATURE) */}
            <div className="seller-form-card accent-card">
              <div className="form-head">
                <h3>🔗 2. Link Matching Outfit Pairs</h3>
                <p>Select a top and link matching pants, shoes, or accessories that suit the outfit.</p>
              </div>

              {pairingCreatedMsg && <div className="form-success-banner">{pairingCreatedMsg}</div>}

              <form onSubmit={handleLinkOutfit} className="seller-form">
                <div className="form-group">
                  <label>Select Primary Top / Outfit (Product ID)</label>
                  <select value={pairTopId} onChange={(e) => setPairTopId(e.target.value)}>
                    <option value="101">Product #101: Blue Crop Top</option>
                    <option value="102">Product #102: Ivory Silk Blouse</option>
                    <option value="103">Product #103: Rust Knit Top</option>
                    <option value="104">Product #104: Sage Linen Shirt</option>
                  </select>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Matching Item Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Light Blue Jeans"
                      value={pairMatchName}
                      onChange={(e) => setPairMatchName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Matching Item Type</label>
                    <select value={pairMatchType} onChange={(e) => setPairMatchType(e.target.value)}>
                      <option value="PANTS">Pants / Bottom</option>
                      <option value="SHOES">Shoes / Footwear</option>
                      <option value="BAG">Bag / Tote</option>
                      <option value="ACCESSORY">Accessory / Jewelry</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-3">
                  <div className="form-group">
                    <label>Color</label>
                    <input
                      type="text"
                      value={pairMatchColor}
                      onChange={(e) => setPairMatchColor(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Color Hex</label>
                    <input
                      type="color"
                      value={pairMatchHex}
                      onChange={(e) => setPairMatchHex(e.target.value)}
                      className="color-picker"
                    />
                  </div>

                  <div className="form-group">
                    <label>Price (₹)</label>
                    <input
                      type="number"
                      value={pairMatchPrice}
                      onChange={(e) => setPairMatchPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Stylist Curation Reason</label>
                  <textarea
                    placeholder="Explain why these items suit each other (e.g., color contrast, silhouette balance)..."
                    value={pairReason}
                    onChange={(e) => setPairReason(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="form-group">
                  <label>Stylist Match Score: {pairScore}%</label>
                  <input
                    type="range"
                    min="80"
                    max="99"
                    value={pairScore}
                    onChange={(e) => setPairScore(e.target.value)}
                  />
                </div>

                <button type="submit" className="seller-submit-btn accent-submit">
                  Link Stylist Approved Pair →
                </button>
              </form>
            </div>
          </div>

          {/* LIVE SELLER DASHBOARD VIEW */}
          <div className="seller-dashboard-section">
            <h3>✨ Live Seller Curated Pairings ({sellerPairings.length})</h3>
            <div className="seller-pairings-list">
              {sellerPairings.map((sp, idx) => (
                <div className="seller-pairing-card" key={idx}>
                  <div className="pairing-badge">★ STYLIST PICKED MATCH ({sp.matchScore}% MATCH)</div>
                  <div className="pairing-body">
                    <div className="swatch-sm" style={{ background: `${sp.matchProduct.hex}22` }}>
                      <Garment type={sp.matchProduct.type} hex={sp.matchProduct.hex} />
                    </div>
                    <div className="pairing-details">
                      <h4>{sp.matchProduct.name}</h4>
                      <p className="pairing-reason">"{sp.reason}"</p>
                      <span className="pairing-price">₹{Number(sp.matchProduct.price).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
