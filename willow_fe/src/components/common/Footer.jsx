import { useState } from 'react';
import { Link } from 'react-router-dom';
import footerBg from '../../assets/images/footer.png';
import WillowLogo from './WillowLogo.jsx';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="willow-footer" style={{ backgroundImage: `url("${footerBg}")` }}>
      <div className="footer-overlay-content">
        <div className="footer-top-grid">
          {/* Column 1: Brand & Newsletter */}
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <WillowLogo height={52} color="#2C181E" />
            </div>
            <p className="footer-tagline">
              Dress in pairs, not pieces. Willow elevates your wardrobe with seller-approved top & bottom combinations and AI style curation.
            </p>

            <div className="newsletter-box">
              <h4>JOIN THE WILLOW CLUB</h4>
              <p>Enjoy 15% off your first purchase and exclusive access to new paired drops.</p>

              {subscribed ? (
                <div className="newsletter-success">
                  ✓ Thank you for subscribing! Check your inbox for your 15% discount code.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="newsletter-form">
                  <input
                    type="email"
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="newsletter-input"
                  />
                  <button type="submit" className="newsletter-btn">
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Column 2: Shop Links */}
          <div className="footer-col">
            <h4 className="footer-heading">SHOP COLLECTION</h4>
            <ul className="footer-links">
              <li><Link to="/new-in">New In</Link></li>
              <li><Link to="/men">Men's Edit</Link></li>
              <li><Link to="/all">All Catalog</Link></li>
              <li><Link to="/women">Women's Edit</Link></li>
              <li><Link to="/bags">Bags & Totes</Link></li>
              <li><Link to="/shoes">Shoes & Footwear</Link></li>
              <li><Link to="/accessories">Accessories</Link></li>
              <li><Link to="/sale" className="sale-link">Sale (Up to 40% Off)</Link></li>
            </ul>
          </div>

          {/* Column 3: The Willow Experience */}
          <div className="footer-col">
            <h4 className="footer-heading">EXPERIENCE</h4>
            <ul className="footer-links">
              <li><Link to="/studio">Seller Studio</Link></li>
              <li><Link to="/">AI Style Assistant</Link></li>
              <li><Link to="/all">Curated Pairings</Link></li>
              <li><Link to="/new-in">Fit Guarantee</Link></li>
              <li><Link to="/about">Sustainability</Link></li>
            </ul>
          </div>

          {/* Column 4: Customer Care */}
          <div className="footer-col">
            <h4 className="footer-heading">CUSTOMER CARE</h4>
            <ul className="footer-links">
              <li><Link to="/checkout">Track My Order</Link></li>
              <li><Link to="/shipping">Shipping & Delivery</Link></li>
              <li><Link to="/returns">Free Fit Swaps</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/faq">Frequently Asked Questions</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-legal">
            <span>© 2026 Willow Fashion Inc. All rights reserved.</span>
            <div className="legal-links">
              <Link to="/privacy">Privacy Policy</Link>
              <span className="dot">•</span>
              <Link to="/terms">Terms of Service</Link>
              <span className="dot">•</span>
              <Link to="/cookies">Cookie Settings</Link>
            </div>
          </div>

          <div className="footer-region">
            <span>Region: <strong>India (₹ INR)</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
