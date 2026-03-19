'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageState } from '@/components/shared/page-state';
import { api } from '@/lib/api';
import type { Outlet } from '@/types';

const initialForm = {
  name: '',
  code: '',
  location: '',
};
const initialEditForm = {
  name: '',
  location: '',
};

export default function OutletsPage() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [editingOutletId, setEditingOutletId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingOutletId, setUpdatingOutletId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadOutlets = async () => {
    try {
      setLoading(true);
      setError(null);
      setOutlets(await api.getOutlets());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load outlets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOutlets();
  }, []);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await api.createOutlet({
        name: form.name,
        code: form.code,
        location: form.location || undefined,
        isActive: true,
      });
      setForm(initialForm);
      setSuccess('Outlet created successfully.');
      await loadOutlets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create outlet');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (outlet: Outlet) => {
    setEditingOutletId(outlet.id);
    setEditForm({
      name: outlet.name,
      location: outlet.location ?? '',
    });
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingOutletId(null);
    setEditForm(initialEditForm);
  };

  const handleUpdate = async (outletId: number) => {
    if (!editForm.name.trim()) {
      setError('Enter a valid outlet name.');
      setSuccess(null);
      return;
    }

    try {
      setUpdatingOutletId(outletId);
      setError(null);
      setSuccess(null);
      await api.updateOutlet(outletId, {
        name: editForm.name.trim(),
        location: editForm.location.trim() || undefined,
      });
      setEditingOutletId(null);
      setEditForm(initialEditForm);
      setSuccess('Outlet updated successfully.');
      await loadOutlets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update outlet');
    } finally {
      setUpdatingOutletId(null);
    }
  };

  const handleToggleStatus = async (outlet: Outlet) => {
    try {
      setUpdatingOutletId(outlet.id);
      setError(null);
      setSuccess(null);
      await api.updateOutlet(outlet.id, { isActive: !outlet.isActive });
      setSuccess(`Outlet ${outlet.isActive ? 'deactivated' : 'activated'} successfully.`);
      await loadOutlets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update outlet status');
    } finally {
      setUpdatingOutletId(null);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Outlets</h1>
          <p className="text-muted-foreground">Create and review store branches used by HQ, inventory, and POS.</p>
        </div>

        <form onSubmit={handleCreate} className="grid gap-4 rounded-xl border bg-white p-6 shadow-sm md:grid-cols-4">
          <Input
            placeholder="Outlet name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <Input
            placeholder="Outlet code"
            value={form.code}
            onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
            required
          />
          <Input
            placeholder="Location"
            value={form.location}
            onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
          />
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add outlet'}</Button>
        </form>

        {success ? <PageState message={success} /> : null}
        {error ? <PageState message={error} error /> : null}
        {loading ? <PageState message="Loading outlets..." /> : null}

        {!loading ? (
          <Card>
            <CardHeader>
              <CardTitle>Registered outlets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {outlets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No outlets created yet.</p>
                ) : (
                  outlets.map((outlet) => {
                    const isEditing = editingOutletId === outlet.id;
                    const isUpdating = updatingOutletId === outlet.id;

                    return (
                    <div key={outlet.id} className="flex flex-col gap-4 rounded-xl border p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex items-center gap-2 font-medium">
                          {isEditing ? (
                            <Input
                              value={editForm.name}
                              onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                              disabled={isUpdating}
                              className="max-w-xs"
                            />
                          ) : (
                            <span>{outlet.name}</span>
                          )}
                          <Badge variant={outlet.isActive ? 'default' : 'secondary'}>{outlet.isActive ? 'Active' : 'Inactive'}</Badge>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span>Code: {outlet.code}</span>
                          <span> • </span>
                          {isEditing ? (
                            <Input
                              value={editForm.location}
                              onChange={(event) => setEditForm((prev) => ({ ...prev, location: event.target.value }))}
                              disabled={isUpdating}
                              placeholder="Location"
                              className="mt-2 max-w-xs"
                            />
                          ) : (
                            <span>{outlet.location || 'No location added'}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-3 md:items-end">
                        <div className="text-sm text-muted-foreground">Outlet ID: {outlet.id}</div>
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <Button type="button" size="sm" onClick={() => handleUpdate(outlet.id)} disabled={isUpdating}>
                                {isUpdating ? 'Saving...' : 'Save'}
                              </Button>
                              <Button type="button" variant="outline" size="sm" onClick={handleCancelEdit} disabled={isUpdating}>
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button type="button" variant="outline" size="sm" onClick={() => handleStartEdit(outlet)} disabled={isUpdating}>
                              Edit
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleToggleStatus(outlet)}
                            disabled={isUpdating}
                          >
                            {isUpdating ? 'Updating...' : outlet.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
