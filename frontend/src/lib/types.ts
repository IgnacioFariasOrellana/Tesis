export type Category = "Bandejas de Desayuno" | "Cajas de Pino Grabadas" | "Cestas Dulces" | "Detalles Florales";
export type Occasion = "Pareja" | "Mamá" | "Papá" | "Cumpleaños" | "Aniversario" | "Agradecimiento";
export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  occasions: Occasion[];
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
