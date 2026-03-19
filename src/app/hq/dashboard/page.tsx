'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { StatCard } from '@/components/shared/stat-card';
import { PageState } from '@/components/shared/page-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import type { MasterMenuItem, Outlet, RevenueSummary } from '@/types';
import { formatCurrency } from '@/lib/format';

export default function HqDashboardPage() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [menuItems, setMenuItems] = useState<MasterMenuItem[]>([]);
  const [revenueRows, setRevenueRows] = useState<RevenueSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [outletData, menuData, revenueData] = await Promise.all([
          api.getOutlets(),
          api.getHqMenu(),
          api.getRevenueReport(),
        ]);
        setOutlets(outletData);
        setMenuItems(menuData);
        setRevenueRows(revenueData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const totalRevenue = useMemo(() => revenueRows.reduce((sum, row) => sum + row.totalRevenue, 0), [revenueRows]);
  const activeItems = useMemo(() => menuItems.filter((item) => item.isActive).length, [menuItems]);
  const topOutlet = revenueRows[0];

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">HQ Dashboard</h1>
          <p className="text-muted-foreground">Live overview of outlets, menu coverage, and sales performance.</p>
        </div>

        {loading ? <PageState message="Loading dashboard metrics..." /> : null}
        {error ? <PageState message={error} error /> : null}

        {!loading && !error ? (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard title="Outlets" value={String(outlets.length)} helper="Registered branch count" />
              <StatCard title="Menu Items" value={String(menuItems.length)} helper="Total master catalog" />
              <StatCard title="Active Items" value={String(activeItems)} helper="Currently sellable items" />
              <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} helper="Sum across all outlets" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle>Revenue ranking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {revenueRows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No sales yet.</p>
                  ) : (
                    revenueRows.map((row, index) => (
                      <div key={`${row.outlet.code}-${index}`} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <div className="font-medium">#{index + 1} {row.outlet.name}</div>
                          <div className="text-sm text-muted-foreground">Outlet code: {row.outlet.code}</div>
                        </div>
                        <div className="font-semibold">{formatCurrency(row.totalRevenue)}</div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle>Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="rounded-xl bg-secondary/60 p-4">
                    <div className="text-muted-foreground">Top outlet</div>
                    <div className="mt-1 text-lg font-semibold">{topOutlet ? topOutlet.outlet.name : 'No data yet'}</div>
                  </div>
                  <div className="rounded-xl bg-secondary/60 p-4">
                    <div className="text-muted-foreground">Outlet coverage</div>
                    <div className="mt-1 text-lg font-semibold">{outlets.length} outlets connected</div>
                  </div>
                  <div className="rounded-xl bg-secondary/60 p-4">
                    <div className="text-muted-foreground">Catalog readiness</div>
                    <div className="mt-1 text-lg font-semibold">{activeItems} active items ready for assignment</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
