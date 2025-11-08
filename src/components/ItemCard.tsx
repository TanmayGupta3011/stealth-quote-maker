import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductItem } from '@/types';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Edit,
  RotateCw,
  Link as LinkIcon,
} from 'lucide-react';

interface ItemCardProps {
  item: ProductItem;
  onRetry?: (itemId: string) => void;
  onEdit?: (itemId: string) => void;
}

const statusConfig = {
  pending: { icon: Clock, label: 'Pending', variant: 'secondary' as const, color: 'text-muted-foreground' },
  scraping: { icon: Loader2, label: 'Scraping', variant: 'default' as const, color: 'text-primary' },
  success: { icon: CheckCircle2, label: 'Success', variant: 'success' as const, color: 'text-success' },
  failed: { icon: XCircle, label: 'Failed', variant: 'destructive' as const, color: 'text-destructive' },
  'anti-bot': { icon: AlertTriangle, label: 'Anti-Bot', variant: 'warning' as const, color: 'text-warning' },
  duplicate: { icon: AlertTriangle, label: 'Duplicate', variant: 'secondary' as const, color: 'text-muted-foreground' },
};

export const ItemCard = ({ item, onRetry, onEdit }: ItemCardProps) => {
  const statusInfo = statusConfig[item.status];
  const StatusIcon = statusInfo.icon;

  return (
    <Card className="p-4 transition-shadow hover:shadow-md">
      <div className="space-y-4">
        <div className="flex gap-4">
          {item.thumbnail ? (
            <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-muted">
              <img
                src={item.thumbnail}
                alt={item.productName || 'Product'}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="flex-shrink-0 w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
              <LinkIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">
                  {item.productName || 'Loading...'}
                </h4>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground truncate block"
                >
                  {item.url}
                </a>
              </div>
              <Badge variant={statusInfo.variant} className="flex-shrink-0">
                <StatusIcon className={`h-3 w-3 mr-1 ${statusInfo.icon === Loader2 ? 'animate-spin' : ''}`} />
                {statusInfo.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Quantity:</span>{' '}
                <span className="font-medium">{item.quantity}</span>
              </div>
              {item.unitPrice !== undefined && (
                <div>
                  <span className="text-muted-foreground">Price:</span>{' '}
                  <span className="font-medium">${item.unitPrice.toFixed(2)}</span>
                </div>
              )}
              {item.totalPrice !== undefined && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Total:</span>{' '}
                  <span className="font-semibold text-primary">${item.totalPrice.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {item.status === 'anti-bot' && (
          <div className="rounded-lg bg-warning/10 border border-warning/20 p-3 text-sm">
            <p className="text-warning-foreground font-medium mb-1">Anti-bot challenge detected</p>
            <p className="text-xs text-muted-foreground">
              Try increasing delay or enabling user-agent rotation
            </p>
          </div>
        )}

        {(item.status === 'failed' || item.status === 'anti-bot') && item.metadata?.errorMessage && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm">
            <p className="text-xs text-muted-foreground">{item.metadata.errorMessage}</p>
          </div>
        )}

        {(item.status === 'failed' || item.status === 'anti-bot') && (
          <div className="flex gap-2">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                onClick={() => onRetry(item.id)}
              >
                <RotateCw className="h-3.5 w-3.5" />
                Retry
              </Button>
            )}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                onClick={() => onEdit(item.id)}
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
