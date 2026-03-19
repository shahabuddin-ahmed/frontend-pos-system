'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { RevenueTable } from '@/features/reports/revenue-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageState } from '@/components/shared/page-state';
import { api } from '@/lib/api';
import type { Outlet, RevenueSummary, TopItemSummary } from '@/types';

export default function ReportsPage() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [revenueRows, setRevenueRows] = useState<RevenueSummary[]>([]);
  const [topItems, setTopItems] = useState<TopItemSummary[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInitial = async () => {
    try {
      setLoading(true);
      setError(null);
      const [outletData, revenueData] = await Promise.all([api.getOutlets(), api.getRevenueReport()]);
      setOutlets(outletData);
      setRevenueRows(revenueData);
      const defaultOutletId = outletData[0]?.id ?? null;
      setSelectedOutletId(defaultOutletId);
      if (defaultOutletId) {
        setTopItems(await api.getTopItemsReport(defaultOutletId));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  const selectedOutletName = useMemo(
    () => outlets.find((outlet) => outlet.id === selectedOutletId)?.name || 'Outlet',
    [outlets, selectedOutletId],
  );

  const handleOutletChange = async (outletId: number) => {
    try {
      setSelectedOutletId(outletId);
      setLoading(true);
      setError(null);
      setTopItems(await api.getTopItemsReport(outletId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load top items');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Revenue and top selling items by outlet.</p>
        </div>

        {loading && revenueRows.length === 0 ? <PageState message="Loading reports..." /> : null}
        {error ? <PageState message={error} error /> : null}

        {!error ? (
          <div className="grid gap-6 xl:grid-cols-2">
            <RevenueTable rows={revenueRows} />
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <span>Top items by outlet</span>
                  <select
                    className="h-10 rounded-md border bg-background px-3 text-sm font-normal"
                    value={selectedOutletId ?? ''}
                    onChange={(event) => handleOutletChange(Number(event.target.value))}
                  >
                    {outlets.map((outlet) => (
                      <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
                    ))}
                  </select>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sales found for {selectedOutletName}.</p>
                ) : (
                  topItems.map((row, index) => (
                    <div key={`${row.masterMenuItem.sku}-${index}`} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <div className="font-medium">{index + 1}. {row.masterMenuItem.name}</div>
                        <div className="text-sm text-muted-foreground">SKU: {row.masterMenuItem.sku}</div>
                      </div>
                      <div className="font-semibold">{row.totalQuantity} sold</div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
