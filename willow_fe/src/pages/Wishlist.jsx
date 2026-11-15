import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import WishlistCard from '../features/wishlist/components/WishlistCard.jsx';

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const items = Object.values(wishlist);

  function moveToBag(product) {
    addToCart(product);
    toggleWishlist(product);
  }

  return (
    <div className="wishlist">
      <header className="wishlist__header">
        <h1 className="wishlist__title">My Wishlist</h1>
        <span className="wishlist__count">{items.length} item{items.length === 1 ? '' : 's'}</span>
      </header>

      {items.length === 0 ? (
        <div className="wishlist-empty">
          <h2 className="wishlist-empty__title">Your wishlist is empty</h2>
          <p className="wishlist-empty__text">Tap the heart on any piece you love and it will be saved here for later.</p>
          <Link to="/all" className="wishlist-empty__action">Explore the collection</Link>
        </div>
      ) : (
        <div className="wishlist__grid">
          {items.map((product) => (
            <WishlistCard key={product.id} product={product} onRemove={toggleWishlist} onMoveToBag={moveToBag} />
          ))}
        </div>
      )}
    </div>
  );
}
