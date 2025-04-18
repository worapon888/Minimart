export type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
  tag?: string;
};

export type NavItem = {
  item: string;
  href: string;
};

export type Category = {
  category: string;
  image: string;
};
