import Link from 'next/link';
import { PropsWithChildren } from 'react';

const nav = [
  { id: 1, href: '/hq/dashboard', label: 'HQ Dashboard' },
  { id: 2, href: '/hq/outlets', label: 'Outlets' },
  { id: 3, href: '/hq/menu', label: 'Master Menu' },
  { id: 4, href: '/hq/assignments', label: 'Assignments' },
  { id: 5, href: '/hq/reports', label: 'Reports' },
  { id: 6, href: '/outlet/pos', label: 'Outlet POS' },
  { id: 7, href: '/outlet/inventory', label: 'Inventory' },
];

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r bg-white p-6 lg:block">
        <div className="mb-2 text-2xl font-bold">POS Control</div>
        <p className="mb-8 text-sm text-muted-foreground">HQ and outlet operations in one dashboard.</p>
        <nav className="space-y-2">
          {nav.map((item) => (
            <Link key={item.id} href={item.href as any} className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100">
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
