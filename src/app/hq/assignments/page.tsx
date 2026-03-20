'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageState } from '@/components/shared/page-state';
import { api } from '@/lib/api';
import type { MasterMenuItem, Outlet, OutletMenuItem } from '@/types';
import { formatCurrency } from '@/lib/format';

type AssignmentRow = {
  masterMenuItemId: number;
  name: string;
  basePrice: number;
  assigned: boolean;
  overridePrice: string;
};

export default function AssignmentPage() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [masterItems, setMasterItems] = useState<MasterMenuItem[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState<number | null>(null);
  const [rows, setRows] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const buildRows = (menuData: MasterMenuItem[], assignedItems: OutletMenuItem[]) => {
    const assignedMap = new Map(assignedItems.map((item) => [item.masterMenuItemId, item]));
    setRows(
      menuData.filter((item) => item.isActive).map((item) => {
        const assignedItem = assignedMap.get(item.id);
        return {
          masterMenuItemId: item.id,
          name: item.name,
          basePrice: item.basePrice,
          assigned: Boolean(assignedItem),
          overridePrice: assignedItem?.overridePrice != null ? String(assignedItem.overridePrice) : '',
        };
      }),
    );
  };

  const loadBase = async () => {
    try {
      setLoading(true);
      setError(null);
      const [outletData, menuData] = await Promise.all([api.getOutlets(), api.getHqMenu()]);
      const activeOutlets = outletData.filter((outlet) => outlet.isActive);
      setOutlets(activeOutlets);
      setMasterItems(menuData);
      const firstOutletId = activeOutlets[0]?.id ?? null;
      setSelectedOutletId(firstOutletId);
      if (firstOutletId) {
        const assignedItems = await api.getOutletMenuItems(firstOutletId);
        buildRows(menuData, assignedItems);
      } else {
        setRows([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBase();
  }, []);

  const selectedOutletName = useMemo(
    () => outlets.find((outlet) => outlet.id === selectedOutletId)?.name || 'Select outlet',
    [outlets, selectedOutletId],
  );

  const handleOutletChange = async (outletId: number) => {
    try {
      setSelectedOutletId(outletId);
      setLoading(true);
      setError(null);
      const assignedItems = await api.getOutletMenuItems(outletId);
      buildRows(masterItems, assignedItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch outlet');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedOutletId) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const checkedRows = rows.filter((row) => row.assigned);
      await Promise.all(
        checkedRows.map((row) =>
          api.assignMenuToOutlet({
            outletId: selectedOutletId,
            masterMenuItemId: row.masterMenuItemId,
            overridePrice: row.overridePrice ? Number(row.overridePrice) : null,
            isAvailable: true,
          }),
        ),
      );
      setSuccess('Assigned items saved successfully. Unassign requires a backend delete/unassign endpoint.');
      const assignedItems = await api.getOutletMenuItems(selectedOutletId);
      buildRows(masterItems, assignedItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save assignments');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Outlet Assignment</h1>
          <p className="text-muted-foreground">Assign HQ menu items to a branch and override price where needed.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <span>{selectedOutletName}</span>
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm font-normal"
                value={selectedOutletId ?? ''}
                onChange={(event) => handleOutletChange(Number(event.target.value))}
                disabled={outlets.length === 0}
              >
                {outlets.map((outlet) => (
                  <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
                ))}
              </select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <PageState message="Loading outlet assignments..." /> : null}
            {error ? <PageState message={error} error /> : null}
            {success ? <PageState message={success} /> : null}

            {!loading && !error ? (
              <div className="space-y-4">
                {outlets.length === 0 ? <PageState message="No active outlets available for assignment." /> : null}
                {outlets.length > 0 && rows.length === 0 ? <PageState message="No active menu items available for assignment." /> : null}
                {rows.map((row, index) => (
                  <div key={row.masterMenuItemId} className="grid grid-cols-12 items-center gap-4 rounded-lg border p-4">
                    <input
                      type="checkbox"
                      checked={row.assigned}
                      onChange={(event) => {
                        const assigned = event.target.checked;
                        setRows((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, assigned } : item)));
                      }}
                      className="col-span-1 h-4 w-4"
                    />
                    <div className="col-span-4 font-medium">{row.name}</div>
                    <div className="col-span-3 text-sm text-muted-foreground">Base: {formatCurrency(row.basePrice)}</div>
                    <Input
                      value={row.overridePrice}
                      onChange={(event) => {
                        const overridePrice = event.target.value;
                        setRows((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, overridePrice } : item)));
                      }}
                      placeholder="Override price"
                      className="col-span-4"
                    />
                  </div>
                ))}
                <Button onClick={handleSave} disabled={saving || !selectedOutletId || rows.length === 0}>{saving ? 'Saving...' : 'Save assignments'}</Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
