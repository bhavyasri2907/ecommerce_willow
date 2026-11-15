import { useParams } from 'react-router-dom';
import { productService } from '../services/productService.js';
import { useFetch } from '../hooks/useFetch.js';
import ErrorState from '../components/common/ErrorState.jsx';
import Loader from '../components/common/Loader.jsx';
import ProductForm from '../components/products/ProductForm.jsx';

export default function EditProduct() {
  const { id } = useParams();
  const product = useFetch((signal) => productService.getProduct(id, signal), [id]);

  if (product.error) return <ErrorState error={product.error} onRetry={product.refetch} />;
  // Also covers switching straight from one product to another, while the old one is still in state.
  if (!product.data || String(product.data.id) !== id) return <Loader rows={6} columns={3} />;

  return <ProductForm key={product.data.id} product={product.data} />;
}
