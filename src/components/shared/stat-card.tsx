import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function StatCard({ title, value, helper }: { title: string; value: string; helper?: string }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
        {helper ? <p className="mt-2 text-sm text-muted-foreground">{helper}</p> : null}
      </CardContent>
    </Card>
  );
}
