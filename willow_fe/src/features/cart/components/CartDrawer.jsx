import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext.jsx';
import Garment from '../../../assets/icons/Garment.jsx';

export default function CartDrawer() {
  const { items, total, isOpen, setIsOpen, changeQty, removeItem } = useCart();
  const navigate = useNavigate();
  const entries = Object.values(items);

  if (!isOpen) return null;

  function viewBag() {
    setIsOpen(false);
    navigate('/cart');
  }

  return (
    <>
      <div className="overlay" onClick={() => setIsOpen(false)} />
      <div className="drawer open" style={{ transform: 'translateX(0)' }}>
        <div className="drawer-head">
          <h3>Your bag</h3>
          <button onClick={() => setIsOpen(false)}>×</button>
        </div>

        <div className="cart-items">
          {entries.length === 0 && (
            <div className="empty-cart">Your bag is empty.<br />Add something from the edit.</div>
          )}
          {entries.map(({ product, qty }) => (
            <div className="cart-item" key={product.id}>
              <div className="csw" style={{ background: `${product.hex}22` }}>
                <Garment type={product.type} hex={product.hex} />
              </div>
              <div>
                <div className="cname">{product.name}</div>
                <div className="cmeta">₹{Number(product.price).toLocaleString('en-IN')}</div>
                <div className="qty-row">
                  <button onClick={() => changeQty(product.id, -1)}>–</button>
                  <span>{qty}</span>
                  <button onClick={() => changeQty(product.id, 1)}>+</button>
                </div>
              </div>
              <button className="remove-btn" onClick={() => removeItem(product.id)}>Remove</button>
            </div>
          ))}
        </div>

        {entries.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <button className="checkout-btn" onClick={viewBag}>View Bag</button>
          </div>
        )}
      </div>
    </>
  );
}
