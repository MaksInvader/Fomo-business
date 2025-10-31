export type MenuSlug = 'chicken-sandwich' | 'fruity-sandwich' | 'spicy-egg-sandwich';

export interface MenuItem {
  id: MenuSlug;
  name: string;
  description: string;
  price: number;
  image: string;
  badges?: string[];
}
