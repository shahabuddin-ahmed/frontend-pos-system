'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { MasterMenuTable } from '@/features/hq-menu/master-menu-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageState } from '@/components/shared/page-state';
import { api } from '@/lib/api';
import type { MasterMenuItem } from '@/types';

const initialForm = { name: '', sku: '', basePrice: '' };
const initialEditForm = { name: '', basePrice: '' };

export default function MasterMenuPage() {
  const [items, setItems] = useState<MasterMenuItem[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      setItems(await api.getHqMenu());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = items.filter((item) => {
    const q = search.trim().toLowerCase();
    return !q || item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q);
  });

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await api.createMasterMenuItem({
        name: form.name,
        sku: form.sku,
        basePrice: Number(form.basePrice),
        isActive: true,
      });
      setForm(initialForm);
      setSuccess('Menu item created successfully.');
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create menu item');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (item: MasterMenuItem) => {
    setEditingItemId(item.id);
    setEditForm({
      name: item.name,
      basePrice: String(item.basePrice),
    });
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditForm(initialEditForm);
  };

  const handleUpdate = async (itemId: number) => {
    const basePrice = Number(editForm.basePrice);

    if (!editForm.name.trim() || Number.isNaN(basePrice) || basePrice <= 0) {
      setError('Enter a valid name and base price.');
      setSuccess(null);
      return;
    }

    try {
      setUpdatingItemId(itemId);
      setError(null);
      setSuccess(null);
      await api.updateMasterMenuItem(itemId, {
        name: editForm.name.trim(),
        basePrice,
      });
      setEditingItemId(null);
      setEditForm(initialEditForm);
      setSuccess('Menu item updated successfully.');
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update menu item');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleToggleStatus = async (item: MasterMenuItem) => {
    try {
      setUpdatingItemId(item.id);
      setError(null);
      setSuccess(null);
      await api.updateMasterMenuItem(item.id, { isActive: !item.isActive });
      setSuccess(`Menu item ${item.isActive ? 'deactivated' : 'activated'} successfully.`);
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item status');
    } finally {
      setUpdatingItemId(null);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Master Menu</h1>
            <p className="text-muted-foreground">Create global food and beverage items here.</p>
          </div>
          <Input
            placeholder="Search by name or SKU"
            className="w-64"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <form onSubmit={handleCreate} className="grid gap-4 rounded-xl border bg-white p-6 shadow-sm md:grid-cols-4">
          <Input
            placeholder="Item name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <Input
            placeholder="SKU"
            value={form.sku}
            onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
            required
          />
          <Input
            placeholder="Base price"
            type="number"
            min="1"
            value={form.basePrice}
            onChange={(event) => setForm((prev) => ({ ...prev, basePrice: event.target.value }))}
            required
          />
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add item'}</Button>
        </form>

        {success ? <PageState message={success} /> : null}
        {error ? <PageState message={error} error /> : null}
        {loading ? (
          <PageState message="Loading menu items..." />
        ) : (
          <MasterMenuTable
            items={filteredItems}
            editForm={editForm}
            editingItemId={editingItemId}
            updatingItemId={updatingItemId}
            onEditFormChange={setEditForm}
            onStartEdit={handleStartEdit}
            onCancelEdit={handleCancelEdit}
            onSaveEdit={handleUpdate}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </div>
    </AppShell>
  );
}
