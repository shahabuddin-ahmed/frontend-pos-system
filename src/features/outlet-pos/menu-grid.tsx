'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { addItem } from '@/stores/slices/cart-slice';
import { useAppDispatch, useAppSelector } from '@/hooks/use-app-redux';
import { OutletMenuItem } from '@/types';
import { formatCurrency } from '@/lib/format';

export function MenuGrid({ items, stockByItemId }: { items: OutletMenuItem[]; stockByItemId: Record<number, number> }) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const stock = stockByItemId[item.masterMenuItemId] ?? 0;
        const cartQuantity = cartItems.find((cartItem) => cartItem.id === item.masterMenuItemId)?.quantity ?? 0;
        const isOutOfStock = stock <= 0;
        const isAtStockLimit = cartQuantity >= stock;

        return (
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
              <div className="text-sm text-muted-foreground">
                Stock: {stock}
              </div>
              {isOutOfStock ? <p className="text-sm text-red-700">Out of stock</p> : null}
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
                disabled={isOutOfStock || isAtStockLimit}
              >
                {isAtStockLimit ? 'Max stock reached' : 'Add to cart'}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
