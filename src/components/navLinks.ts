export interface NavLinkItem {
  label: string;
  to: string;
}

export const NAV_LINKS: NavLinkItem[] = [
  { label: 'Menu', to: '/' },
  { label: 'Order', to: '/order' },
  { label: 'Track Order', to: '/track' },
  { label: 'Contact', to: '/contact' },
];
