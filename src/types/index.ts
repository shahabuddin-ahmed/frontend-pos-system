export type ApiEnvelope<T> = {
  code: string;
  message: string;
  response: T;
  errors: string[];
};

export type Outlet = {
  id: number;
  name: string;
  code: string;
  location?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type MasterMenuItem = {
  id: number;
  name: string;
  sku: string;
  basePrice: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type OutletMenuItem = {
  id: number;
  outletId?: number;
  masterMenuItemId: number;
  overridePrice: number | null;
  isAvailable: boolean;
  effectivePrice: number;
  masterMenuItem: MasterMenuItem;
  createdAt?: string;
  updatedAt?: string;
};

export type InventoryItem = {
  id: number;
  outletId: number;
  masterMenuItemId: number;
  currentStock: number;
  createdAt?: string;
  updatedAt?: string;
  masterMenuItem?: MasterMenuItem;
  outlet?: Outlet;
};

export type CartItem = {
  id: number;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
};

export type SaleItemPayload = {
  masterMenuItemId: number;
  quantity: number;
};

export type SaleResponse = {
  id: number;
  receiptNumber: string;
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
  items: Array<{
    id: number;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    createdAt?: string;
    updatedAt?: string;
    masterMenuItem: Pick<MasterMenuItem, 'id' | 'name' | 'sku' | 'basePrice' | 'isActive'>;
  }>;
};

export type RevenueSummary = {
  totalRevenue: number;
  outlet: {
    name: string;
    code: string;
  };
};

export type TopItemSummary = {
  totalQuantity: number;
  masterMenuItem: {
    name: string;
    sku: string;
  };
};
