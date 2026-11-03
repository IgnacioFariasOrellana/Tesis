export type ProductSupply = {
  insumoId: number;
  name: string;
  unit: string;
  quantity: number;
};
export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  occasions: string[];
  description: string;
  price: number;
  image: string;
  badge: string;
  availableToday: boolean;
  features: string[];
  supplies: ProductSupply[];
};
export type CartItem = {
  lineId: string;
  product: Product;
  quantity: number;
  dedication: string;
  deliveryDate: string;
  deliverySlot: string;
  extraPrice: number;
  balloon?: boolean;
  treat?: boolean;
};
