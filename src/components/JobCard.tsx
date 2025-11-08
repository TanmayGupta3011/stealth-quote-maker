import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Job } from '@/types';
import { Clock, Package, DollarSign, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface JobCardProps {
  job: Job;
}

const statusConfig = {
  queued: { label: 'Queued', variant: 'secondary' as const },
  running: { label: 'Running', variant: 'default' as const },
  partial: { label: 'Partial', variant: 'warning' as const },
  complete: { label: 'Complete', variant: 'success' as const },
  failed: { label: 'Failed', variant: 'destructive' as const },
};

export const JobCard = ({ job }: JobCardProps) => {
  const navigate = useNavigate();
  const statusInfo = statusConfig[job.status];

  return (
    <Card className="p-6 transition-shadow hover:shadow-md">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{job.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {new Date(job.createdAt).toLocaleString()}
            </div>
          </div>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {job.itemsProcessed} / {job.totalItems} items
            </span>
          </div>
          <Progress value={job.progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Items:</span>
            <span className="font-medium">{job.totalItems}</span>
          </div>
          {job.grandTotal !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Total:</span>
              <span className="font-medium">${job.grandTotal.toFixed(2)}</span>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => navigate(`/jobs/${job.id}`)}
        >
          <Eye className="h-4 w-4" />
          View Details
        </Button>
      </div>
    </Card>
  );
};
