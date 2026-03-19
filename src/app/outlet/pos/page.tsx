'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { MenuGrid } from '@/features/outlet-pos/menu-grid';
import { CartPanel } from '@/features/outlet-pos/cart-panel';
import { Input } from '@/components/ui/input';
import { PageState } from '@/components/shared/page-state';
import { api } from '@/lib/api';
import type { Outlet, OutletMenuItem } from '@/types';

export default function OutletPosPage() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState<number | null>(null);
  const [menuItems, setMenuItems] = useState<OutletMenuItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMenu = async (outletId: number) => {
    const assignedItems = await api.getOutletMenuItems(outletId);
    setMenuItems(assignedItems.filter((item) => item.isAvailable));
  };

  useEffect(() => {
    async function loadInitial() {
      try {
        setLoading(true);
        setError(null);
        const outletData = await api.getOutlets();
        setOutlets(outletData);
        const defaultOutletId = outletData[0]?.id ?? null;
        setSelectedOutletId(defaultOutletId);
        if (defaultOutletId) {
          await loadMenu(defaultOutletId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load outlet POS');
      } finally {
        setLoading(false);
      }
    }

    loadInitial();
  }, []);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return menuItems.filter((item) => !q || item.masterMenuItem.name.toLowerCase().includes(q) || item.masterMenuItem.sku.toLowerCase().includes(q));
  }, [menuItems, search]);

  const handleOutletChange = async (outletId: number) => {
    try {
      setSelectedOutletId(outletId);
      setLoading(true);
      setError(null);
      await loadMenu(outletId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch outlet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Outlet POS</h1>
            <p className="text-muted-foreground">Sell only the menu items assigned to the selected outlet.</p>
          </div>
          <div className="flex gap-3">
            <Input
              placeholder="Search menu"
              className="w-56"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={selectedOutletId ?? ''}
              onChange={(event) => handleOutletChange(Number(event.target.value))}
            >
              {outlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? <PageState message="Loading outlet menu..." /> : null}
        {error ? <PageState message={error} error /> : null}

        {!loading && !error ? (
          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              {filteredItems.length === 0 ? <PageState message="No assigned menu items found for this outlet." /> : <MenuGrid items={filteredItems} />}
            </div>
            <CartPanel outletId={selectedOutletId} onSaleComplete={() => selectedOutletId && loadMenu(selectedOutletId)} />
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
