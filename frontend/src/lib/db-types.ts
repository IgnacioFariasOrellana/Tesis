export type DatabaseOrderItem = {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  image: string | null;
};

export type DatabaseOrder = {
  id: number;
  number: string;
  userId: number | null;
  status: string;
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  recipient: string | null;
  phone: string | null;
  address: string | null;
  deliveryDate: string | null;
  timeFrom: string | null;
  timeTo: string | null;
  instructions: string | null;
  dedication: string | null;
  items: DatabaseOrderItem[];
};

export type InventoryItem = {
  id: number;
  nombre: string | null;
  unidad_medida: string | null;
  stock_actual: number;
  stock_minimo: number;
  activo: boolean;
};

export type DatabasePayment = {
  id: number;
  orderId: number;
  orderNumber: string;
  method: string | null;
  provider: string | null;
  reference: string | null;
  amount: number;
  status: string | null;
  paidAt: string | null;
  createdAt: string;
};

export type DeliveryStop = {
  id: number;
  status: string | null;
  orderSuggested: number | null;
  orderFinal: number | null;
  departureAt: string | null;
  deliveredAt: string | null;
  order: DatabaseOrder | null;
};

export type DeliveryRoute = {
  id: number;
  date: string;
  status: string | null;
  stops: DeliveryStop[];
};
