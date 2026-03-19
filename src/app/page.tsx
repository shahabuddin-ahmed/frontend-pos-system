import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
      <div className="w-full space-y-10">
        <div className="max-w-3xl space-y-4">
          <div className="text-sm font-medium uppercase tracking-[0.25em] text-muted-foreground">Technical Assessment</div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Multi-outlet POS frontend</h1>
          <p className="text-lg text-muted-foreground">
            A final Next.js frontend package for HQ operations, outlet inventory, and cashier sales flow.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>HQ Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Manage outlets, master menu, item assignments, and reports.</p>
              <Link href="/hq/dashboard" className={buttonVariants()}>
                Open HQ panel
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Outlet POS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Sell assigned menu items and generate sequential receipts.</p>
              <Link href="/outlet/pos" className={buttonVariants()}>
                Open POS
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Set stock per outlet and monitor current quantity quickly.</p>
              <Link href="/outlet/inventory" className={buttonVariants()}>
                Open inventory
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
