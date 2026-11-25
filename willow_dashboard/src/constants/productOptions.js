/** Size presets offered on the product form, per category. */
export const SIZE_PRESETS = {
  TOP: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  PANTS: ['26', '28', '30', '32', '34', '36'],
  SHOES: ['UK4', 'UK5', 'UK6', 'UK7', 'UK8', 'UK9', 'UK10'],
  BAG: ['One Size'],
  ACCESSORY: ['One Size', 'S', 'M', 'L'],
};

/** Who a product is for; matches willow_be's ProductGender. */
export const GENDERS = [
  { value: 'WOMEN', label: 'Women' },
  { value: 'MEN', label: 'Men' },
  { value: 'UNISEX', label: 'Unisex (shown under both)' },
];

/** Photo upload limits; the API enforces the same ones. */
export const MAX_PHOTOS = 8;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Limits on a product's sizes; the API enforces the same ones. */
export const MAX_SIZES = 12;
export const MAX_SIZE_LENGTH = 10;

export const STYLES = ['Casual', 'Smart Casual', 'Smart', 'Formal', 'Athleisure', 'Evening'];

export const SWATCHES = ['#2B2730', '#EDEAE3', '#C9BBA0', '#5C7AA6', '#9DB3C8', '#7C8B6F', '#B4636F', '#8C2D42', '#C9A24B', '#4A2E1B'];
