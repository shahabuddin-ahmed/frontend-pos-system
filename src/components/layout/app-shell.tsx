import Link from 'next/link';
import { PropsWithChildren } from 'react';

const nav = [
  { href: '/hq/dashboard', label: 'HQ Dashboard' },
  { href: '/hq/outlets', label: 'Outlets' },
  { href: '/hq/menu', label: 'Master Menu' },
  { href: '/hq/assignments', label: 'Assignments' },
  { href: '/hq/reports', label: 'Reports' },
  { href: '/outlet/pos', label: 'Outlet POS' },
  { href: '/outlet/inventory', label: 'Inventory' },
];

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r bg-white p-6 lg:block">
        <div className="mb-2 text-2xl font-bold">POS Control</div>
        <p className="mb-8 text-sm text-muted-foreground">HQ and outlet operations in one dashboard.</p>
        <nav className="space-y-2">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-72">
        <div className="mx-auto max-w-7xl p-6">{children}</div>
      </main>
    </div>
  );
}
