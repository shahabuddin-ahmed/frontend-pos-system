'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/hooks/use-app-redux';
import { clearCart, updateQuantity } from '@/stores/slices/cart-slice';
import { api } from '@/lib/api';
import type { SaleResponse } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/format';

export function CartPanel({
  outletId,
  stockByItemId,
  onSaleComplete,
}: {
  outletId: number | null;
  stockByItemId: Record<number, number>;
  onSaleComplete?: () => void;
}) {
  const items = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saleResult, setSaleResult] = useState<SaleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const invalidItems = items
    .map((item) => {
      const availableStock = stockByItemId[item.id] ?? 0;
      return {
        ...item,
        availableStock,
        hasInsufficientStock: item.quantity > availableStock,
      };
    })
    .filter((item) => item.hasInsufficientStock);
  const hasInvalidStock = invalidItems.length > 0;

  const handleCompleteSale = async () => {
    if (!outletId || items.length === 0 || hasInvalidStock) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const result = await api.createSale({
        outletId,
        items: items.map((item) => ({ masterMenuItemId: item.id, quantity: item.quantity })),
      });
      setSaleResult(result);
      dispatch(clearCart());
      onSaleComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sale failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cart</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? <p className="text-sm text-muted-foreground">No items selected yet.</p> : null}
        {items.map((item) => {
          const availableStock = stockByItemId[item.id] ?? 0;
          const hasInsufficientStock = item.quantity > availableStock;

          return (
            <div
              key={item.id}
              className={`space-y-3 rounded-lg border p-3 ${hasInsufficientStock ? 'border-red-200 bg-red-50/60' : ''}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">{item.sku || 'No SKU'} • {formatCurrency(item.price)} each</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}>-</Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                    disabled={item.quantity >= availableStock}
                  >
                    +
                  </Button>
                </div>
              </div>
              {hasInsufficientStock ? (
                <p className="text-sm text-red-700">
                  {availableStock <= 0 ? `${item.name} is out of stock.` : `Only ${availableStock} available for ${item.name}. Reduce quantity to continue.`}
                </p>
              ) : null}
            </div>
          );
        })}
        <div className="flex items-center justify-between border-t pt-4 text-lg font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        {hasInvalidStock ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {invalidItems.length === 1 ? '1 item has insufficient stock.' : `${invalidItems.length} items have insufficient stock.`}
          </p>
        ) : null}
        {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        {saleResult ? (
          <div className="rounded-lg border bg-secondary/40 p-4 text-sm space-y-1">
            <div className="font-semibold">Sale completed</div>
            <div>Receipt: {saleResult.receiptNumber}</div>
            <div>Total: {formatCurrency(saleResult.totalAmount)}</div>
            <div>Created: {formatDateTime(saleResult.createdAt)}</div>
          </div>
        ) : null}
        <div className="flex gap-3">
          <Button className="flex-1" disabled={!outletId || items.length === 0 || isSubmitting || hasInvalidStock} onClick={handleCompleteSale}>
            {isSubmitting ? 'Completing...' : 'Complete sale'}
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => dispatch(clearCart())}>
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
