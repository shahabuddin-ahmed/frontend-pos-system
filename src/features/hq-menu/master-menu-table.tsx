import type { Dispatch, SetStateAction } from 'react';
import { MasterMenuItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/format';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type MenuFormState = {
  name: string;
  basePrice: string;
};

type MasterMenuTableProps = {
  items: MasterMenuItem[];
  editForm: MenuFormState;
  editingItemId: number | null;
  updatingItemId: number | null;
  onEditFormChange: Dispatch<SetStateAction<MenuFormState>>;
  onStartEdit: (item: MasterMenuItem) => void;
  onCancelEdit: () => void;
  onSaveEdit: (itemId: number) => void;
  onToggleStatus: (item: MasterMenuItem) => void;
};

export function MasterMenuTable({
  items,
  editForm,
  editingItemId,
  updatingItemId,
  onEditFormChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onToggleStatus,
}: MasterMenuTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Master menu items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-3">Item</th>
                <th className="py-3">SKU</th>
                <th className="py-3">Base Price</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isEditing = editingItemId === item.id;
                const isUpdating = updatingItemId === item.id;

                return (
                  <tr key={item.id} className="border-b last:border-b-0">
                    <td className="py-3 font-medium">
                      {isEditing ? (
                        <Input
                          value={editForm.name}
                          onChange={(event) => onEditFormChange((prev) => ({ ...prev, name: event.target.value }))}
                          disabled={isUpdating}
                        />
                      ) : (
                        item.name
                      )}
                    </td>
                    <td className="py-3">
                      {item.sku}
                    </td>
                    <td className="py-3">
                      {isEditing ? (
                        <Input
                          type="number"
                          min="1"
                          value={editForm.basePrice}
                          onChange={(event) => onEditFormChange((prev) => ({ ...prev, basePrice: event.target.value }))}
                          disabled={isUpdating}
                        />
                      ) : (
                        formatCurrency(item.basePrice)
                      )}
                    </td>
                    <td className="py-3">
                      <Badge variant={item.isActive ? 'default' : 'secondary'}>{item.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-2">
                        {isEditing ? (
                          <>
                            <Button type="button" size="sm" onClick={() => onSaveEdit(item.id)} disabled={isUpdating}>
                              {isUpdating ? 'Saving...' : 'Save'}
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={onCancelEdit} disabled={isUpdating}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button type="button" variant="outline" size="sm" onClick={() => onStartEdit(item)} disabled={isUpdating}>
                            Edit
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => onToggleStatus(item)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? 'Updating...' : item.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
