'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { addItem } from '@/stores/slices/cart-slice';
import { useAppDispatch } from '@/hooks/use-app-redux';
import { OutletMenuItem } from '@/types';
import { formatCurrency } from '@/lib/format';

export function MenuGrid({ items }: { items: OutletMenuItem[] }) {
  const dispatch = useAppDispatch();

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span>{item.masterMenuItem.name}</span>
              <span>{formatCurrency(item.effectivePrice)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">SKU: {item.masterMenuItem.sku}</div>
            <div className="text-sm text-muted-foreground">Base price: {formatCurrency(item.masterMenuItem.basePrice)}</div>
            <Button
              onClick={() =>
                dispatch(
                  addItem({
                    id: item.masterMenuItemId,
                    name: item.masterMenuItem.name,
                    sku: item.masterMenuItem.sku,
                    price: item.effectivePrice,
                    quantity: 1,
                  }),
                )
              }
              className="w-full"
            >
              Add to cart
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
