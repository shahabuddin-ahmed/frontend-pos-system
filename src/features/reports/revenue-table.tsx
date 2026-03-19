import { RevenueSummary } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';

export function RevenueTable({ rows }: { rows: RevenueSummary[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by outlet</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-3">Outlet</th>
              <th className="py-3">Code</th>
              <th className="py-3">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.outlet.code}-${index}`} className="border-b last:border-b-0">
                <td className="py-3">{row.outlet.name}</td>
                <td className="py-3">{row.outlet.code}</td>
                <td className="py-3 font-medium">{formatCurrency(row.totalRevenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
