'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageState } from '@/components/shared/page-state';
import { api } from '@/lib/api';
import type { InventoryItem, Outlet, OutletMenuItem } from '@/types';

export default function OutletInventoryPage() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState<number | null>(null);
  const [inventoryRows, setInventoryRows] = useState<InventoryItem[]>([]);
  const [menuItems, setMenuItems] = useState<OutletMenuItem[]>([]);
  const [form, setForm] = useState({ masterMenuItemId: '', currentStock: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadInventory = async (outletId: number) => {
    const [inventoryData, outletMenu] = await Promise.all([api.getInventoryByOutlet(outletId), api.getOutletMenuItems(outletId)]);
    setInventoryRows(inventoryData);
    setMenuItems(outletMenu);
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
          await loadInventory(defaultOutletId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load inventory page');
      } finally {
        setLoading(false);
      }
    }

    loadInitial();
  }, []);

  const handleOutletChange = async (outletId: number) => {
    try {
      setSelectedOutletId(outletId);
      setLoading(true);
      setError(null);
      setSuccess(null);
      await loadInventory(outletId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch outlet');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustInventory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedOutletId) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await api.setInventory({
        outletId: selectedOutletId,
        masterMenuItemId: Number(form.masterMenuItemId),
        currentStock: Number(form.currentStock),
      });
      setSuccess('Inventory updated successfully.');
      setForm({ masterMenuItemId: '', currentStock: '' });
      await loadInventory(selectedOutletId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update inventory');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Inventory</h1>
            <p className="text-muted-foreground">Track and set current stock per outlet and menu item.</p>
          </div>
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

        {error ? <PageState message={error} error /> : null}
        {success ? <PageState message={success} /> : null}
        {loading ? <PageState message="Loading inventory..." /> : null}

        {!loading ? (
          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Current stock</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {inventoryRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No inventory records yet.</p>
                ) : (
                  inventoryRows.map((row) => (
                    <div key={row.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <div className="font-medium">{row.masterMenuItem?.name || `Item #${row.masterMenuItemId}`}</div>
                        <div className="text-sm text-muted-foreground">SKU: {row.masterMenuItem?.sku || '-'} • Menu item ID: {row.masterMenuItemId}</div>
                      </div>
                      <div className="text-sm font-medium">{row.currentStock} units</div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Set stock</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdjustInventory} className="space-y-4">
                  <select
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={form.masterMenuItemId}
                    onChange={(event) => setForm((prev) => ({ ...prev, masterMenuItemId: event.target.value }))}
                    required
                  >
                    <option value="">Select assigned item</option>
                    {menuItems.map((item) => (
                      <option key={item.masterMenuItemId} value={item.masterMenuItemId}>
                        {item.masterMenuItem.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder="Current stock"
                    type="number"
                    min="0"
                    value={form.currentStock}
                    onChange={(event) => setForm((prev) => ({ ...prev, currentStock: event.target.value }))}
                    required
                  />
                  <Button className="w-full" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save stock'}</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
