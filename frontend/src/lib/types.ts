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
};
export type CartItem = {
  lineId: string;
  product: Product;
  quantity: number;
  dedication: string;
  deliveryDate: string;
  deliverySlot: string;
  extraPrice: number;
};
export type DemoOrder = {
  id: string;
  createdAt: string;
  recipient: string;
  address: string;
  items: CartItem[];
  total: number;
  status: "Recibido";
  instructions?: string;
};
