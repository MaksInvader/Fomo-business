import type { MenuItem, MenuSlug } from '../types/menu';

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'chicken-sandwich',
    name: 'Chicken Sandwich',
    description: 'Savory grilled chicken with crisp veggies, pickles, and house-made sauce.',
    price: 32000,
    image: '/images/chicken-sandwich.svg',
    badges: ['Best Seller', 'Protein+'],
  },
  {
    id: 'fruity-sandwich',
    name: 'Fruity Sandwich',
    description: 'Fluffy milk bread layered with seasonal fruits, silky cream, and honey drizzle.',
    price: 30000,
    image: '/images/fruity-sandwich.svg',
    badges: ['Fresh Daily'],
  },
  {
    id: 'spicy-egg-sandwich',
    name: 'Spicy Egg-Mayo Sandwich',
    description: 'Creamy egg mayo whipped with chilli crisp, sweet corn, and crunchy toppings.',
    price: 28000,
    image: '/images/spicy-egg-sandwich.svg',
    badges: ['Level 1 Heat'],
  },
];

export const MENU_LOOKUP: Record<MenuSlug, MenuItem> = MENU_ITEMS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<MenuSlug, MenuItem>,
);
