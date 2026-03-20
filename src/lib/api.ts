import type {
  ApiEnvelope,
  InventoryItem,
  MasterMenuItem,
  Outlet,
  OutletMenuItem,
  ReportPeriod,
  ReportSummary,
  RevenueSummary,
  SaleItemPayload,
  SaleResponse,
  TopItemSummary,
} from '@/types';
import { toNumber } from '@/lib/format';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function request<TResponse, TMapped = TResponse>(
  path: string,
  init?: RequestInit,
  map?: (response: TResponse) => TMapped,
): Promise<TMapped> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<TResponse> | null;

  if (!response.ok || !payload) {
    throw new Error(payload?.message || payload?.errors?.[0] || 'Request failed');
  }

  const data = payload.response;
  return map ? map(data) : (data as unknown as TMapped);
}

function normalizeOutlet(raw: any): Outlet {
  return {
    id: Number(raw.id),
    name: raw.name,
    code: raw.code,
    location: raw.location ?? null,
    isActive: raw.isActive,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function normalizeMasterMenuItem(raw: any): MasterMenuItem {
  return {
    id: Number(raw.id),
    name: raw.name,
    sku: raw.sku,
    basePrice: toNumber(raw.basePrice),
    isActive: Boolean(raw.isActive),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function normalizeOutletMenuItem(raw: any): OutletMenuItem {
  const masterMenuItem = normalizeMasterMenuItem(raw.masterMenuItem || {});
  return {
    id: Number(raw.id),
    outletId: raw.outletId ? Number(raw.outletId) : undefined,
    masterMenuItemId: Number(raw.masterMenuItemId ?? masterMenuItem.id),
    overridePrice: raw.overridePrice == null ? null : toNumber(raw.overridePrice),
    isAvailable: Boolean(raw.isAvailable),
    effectivePrice: toNumber(raw.effectivePrice ?? raw.overridePrice ?? masterMenuItem.basePrice),
    masterMenuItem,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function normalizeInventoryItem(raw: any): InventoryItem {
  return {
    id: Number(raw.id),
    outletId: Number(raw.outletId ?? raw.outlet?.id),
    masterMenuItemId: Number(raw.masterMenuItemId ?? raw.masterMenuItem?.id),
    currentStock: toNumber(raw.currentStock),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    masterMenuItem: raw.masterMenuItem ? normalizeMasterMenuItem(raw.masterMenuItem) : undefined,
    outlet: raw.outlet ? normalizeOutlet(raw.outlet) : undefined,
  };
}

function normalizeSaleResponse(raw: any): SaleResponse {
  return {
    id: Number(raw.id),
    receiptNumber: raw.receiptNumber,
    totalAmount: toNumber(raw.totalAmount),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    items: Array.isArray(raw.items)
      ? raw.items.map((item: any) => ({
          id: Number(item.id),
          quantity: Number(item.quantity),
          unitPrice: toNumber(item.unitPrice),
          lineTotal: toNumber(item.lineTotal),
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          masterMenuItem: normalizeMasterMenuItem(item.masterMenuItem),
        }))
      : [],
  };
}

function normalizeRevenueSummary(raw: any): RevenueSummary {
  return {
    totalRevenue: toNumber(raw.totalRevenue),
    outlet: {
      id: raw.outlet?.id ? Number(raw.outlet.id) : undefined,
      name: raw.outlet?.name || 'Unknown outlet',
      code: raw.outlet?.code || '-',
    },
  };
}

function normalizeTopItem(raw: any): TopItemSummary {
  return {
    totalQuantity: toNumber(raw.totalQuantity),
    masterMenuItem: {
      name: raw.masterMenuItem?.name || 'Unknown item',
      sku: raw.masterMenuItem?.sku || '-',
    },
  };
}

function normalizeReportSummary(raw: any): ReportSummary {
  return {
    period: raw.period,
    totalRevenue: toNumber(raw.totalRevenue),
    topOutlet: raw.topOutlet ? normalizeRevenueSummary(raw.topOutlet) : null,
    selectedOutletId: raw.selectedOutletId == null ? null : Number(raw.selectedOutletId),
    revenueByOutlet: Array.isArray(raw.revenueByOutlet) ? raw.revenueByOutlet.map(normalizeRevenueSummary) : [],
    topItems: Array.isArray(raw.topItems) ? raw.topItems.map(normalizeTopItem) : [],
  };
}

export const api = {
  health: () => request<{ ok: boolean }>('/health'),

  getOutlets: () => request<any[], Outlet[]>('/outlets', undefined, (items) => items.map(normalizeOutlet)),
  createOutlet: (payload: { name: string; code: string; location?: string; isActive?: boolean }) =>
    request<any, Outlet>('/outlets', { method: 'POST', body: JSON.stringify(payload) }, normalizeOutlet),
  updateOutlet: (id: number, payload: Partial<Pick<Outlet, 'name' | 'location' | 'isActive'>>) =>
    request<any, Outlet>(`/outlets/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }, normalizeOutlet),

  getHqMenu: () => request<any[], MasterMenuItem[]>('/menu-items', undefined, (items) => items.map(normalizeMasterMenuItem)),
  createMasterMenuItem: (payload: { name: string; sku: string; basePrice: number; isActive?: boolean }) =>
    request<any, MasterMenuItem>('/menu-items', { method: 'POST', body: JSON.stringify(payload) }, normalizeMasterMenuItem),
  updateMasterMenuItem: (
    id: number,
    payload: Partial<Pick<MasterMenuItem, 'name' | 'basePrice' | 'isActive'>>,
  ) =>
    request<any, MasterMenuItem>(`/menu-items/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }, normalizeMasterMenuItem),

  assignMenuToOutlet: (payload: { outletId: number; masterMenuItemId: number; overridePrice?: number | null; isAvailable?: boolean }) =>
    request<any, OutletMenuItem>('/outlet-menu-items', { method: 'POST', body: JSON.stringify(payload) }, normalizeOutletMenuItem),
  getOutletMenuItems: (outletId: number) =>
    request<any[], OutletMenuItem[]>(`/outlet-menu-items/${outletId}`, undefined, (items) => items.map(normalizeOutletMenuItem)),

  getInventoryByOutlet: (outletId: number) =>
    request<any[], InventoryItem[]>(`/inventories/${outletId}`, undefined, (items) => items.map(normalizeInventoryItem)),
  setInventory: (payload: { outletId: number; masterMenuItemId: number; currentStock: number }) =>
    request<any, InventoryItem>('/inventories', { method: 'POST', body: JSON.stringify(payload) }, normalizeInventoryItem),

  createSale: (payload: { outletId: number; items: SaleItemPayload[] }) =>
    request<any, SaleResponse>('/sales', { method: 'POST', body: JSON.stringify(payload) }, normalizeSaleResponse),

  getRevenueReport: (period: ReportPeriod = 'lifetime') =>
    request<any[], RevenueSummary[]>(`/reports/revenue-by-outlet?period=${period}`, undefined, (items) => items.map(normalizeRevenueSummary)),
  getTopItemsReport: (outletId: number, period: ReportPeriod = 'lifetime') =>
    request<any[], TopItemSummary[]>(`/reports/top-items/${outletId}?period=${period}`, undefined, (items) => items.map(normalizeTopItem)),
  getReportSummary: (period: ReportPeriod, outletId?: number) =>
    request<any, ReportSummary>(
      `/reports/summary?period=${period}${outletId ? `&outletId=${outletId}` : ''}`,
      undefined,
      normalizeReportSummary,
    ),
};
