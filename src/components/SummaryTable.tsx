import { useState } from 'react';
import { ProductItem } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit2, Check, X } from 'lucide-react';

interface SummaryTableProps {
  items: ProductItem[];
  onItemUpdate?: (itemId: string, updates: Partial<ProductItem>) => void;
}

export const SummaryTable = ({ items, onItemUpdate }: SummaryTableProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ name: string; price: string }>({
    name: '',
    price: '',
  });

  const successItems = items.filter(item => item.status === 'success');

  const startEdit = (item: ProductItem) => {
    setEditingId(item.id);
    setEditValues({
      name: item.productName || '',
      price: item.unitPrice?.toString() || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ name: '', price: '' });
  };

  const saveEdit = (itemId: string) => {
    if (onItemUpdate) {
      onItemUpdate(itemId, {
        productName: editValues.name,
        unitPrice: parseFloat(editValues.price),
        totalPrice: parseFloat(editValues.price) * (items.find(i => i.id === itemId)?.quantity || 1),
      });
    }
    cancelEdit();
  };

  const grandTotal = successItems
    .filter(item => item.includeInPdf !== false)
    .reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Include</TableHead>
              <TableHead className="w-[80px]">Serial No.</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead className="w-[120px]">Unit Price</TableHead>
              <TableHead className="w-[100px]">Quantity</TableHead>
              <TableHead className="w-[120px]">Total</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {successItems.map((item, index) => {
              const isEditing = editingId === item.id;

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <Checkbox
                      checked={item.includeInPdf !== false}
                      onCheckedChange={(checked) =>
                        onItemUpdate?.(item.id, { includeInPdf: checked as boolean })
                      }
                      aria-label={`Include ${item.productName} in PDF`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={editValues.name}
                        onChange={(e) =>
                          setEditValues({ ...editValues, name: e.target.value })
                        }
                        className="h-8"
                      />
                    ) : (
                      <div className="space-y-1">
                        <div className="font-medium">{item.productName}</div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-foreground truncate block max-w-[300px]"
                        >
                          {item.url}
                        </a>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editValues.price}
                        onChange={(e) =>
                          setEditValues({ ...editValues, price: e.target.value })
                        }
                        className="h-8 w-full"
                      />
                    ) : (
                      <span className="font-medium">
                        ${item.unitPrice?.toFixed(2) || '0.00'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{item.quantity}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-primary">
                      ${item.totalPrice?.toFixed(2) || '0.00'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => saveEdit(item.id)}
                          className="h-7 w-7 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEdit}
                          className="h-7 w-7 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(item)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <div className="rounded-lg border border-border bg-muted/30 px-6 py-4 min-w-[300px]">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Grand Total:</span>
            <span className="text-primary">${grandTotal.toFixed(2)}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {successItems.filter(i => i.includeInPdf !== false).length} items included
          </div>
        </div>
      </div>
    </div>
  );
};
