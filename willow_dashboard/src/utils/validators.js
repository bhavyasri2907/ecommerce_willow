export const isHttpUrl = (value) => /^https?:\/\//.test(value);
export const isSku = (value) => /^[A-Za-z0-9-]+$/.test(value);

/** Client-side product checks that mirror the API's validation, for instant feedback. */
export function validateProduct(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Product name is required';
  if (!form.price || Number(form.price) < 1) errors.price = 'Price must be at least 1';
  if (form.originalPrice && Number(form.originalPrice) <= Number(form.price)) {
    errors.originalPrice = 'Compare-at price should be higher than the price';
  }
  if (form.stock === '' || Number(form.stock) < 0 || !Number.isInteger(Number(form.stock))) {
    errors.stock = 'Stock must be a whole number, 0 or more';
  }
  if (form.sku && !isSku(form.sku)) errors.sku = 'Only letters, numbers and dashes';
  return errors;
}
