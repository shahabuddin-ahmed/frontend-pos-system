'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/hooks/use-app-redux';
import { clearCart, updateQuantity } from '@/stores/slices/cart-slice';
import { api } from '@/lib/api';
import type { SaleResponse } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/format';

export function CartPanel({ outletId, onSaleComplete }: { outletId: number | null; onSaleComplete?: () => void }) {
  const items = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saleResult, setSaleResult] = useState<SaleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompleteSale = async () => {
    if (!outletId || items.length === 0) return;

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
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <div>
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-muted-foreground">{item.sku || 'No SKU'} • {formatCurrency(item.price)} each</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}>-</Button>
              <span className="w-8 text-center">{item.quantity}</span>
              <Button variant="outline" size="sm" onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}>+</Button>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between border-t pt-4 text-lg font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
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
          <Button className="flex-1" disabled={!outletId || items.length === 0 || isSubmitting} onClick={handleCompleteSale}>
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
