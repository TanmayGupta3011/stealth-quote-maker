import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { WebSocketMessage } from '@/types';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Camera,
  DollarSign,
  Play,
  Clock,
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  timestamp: string;
  type: WebSocketMessage['type'];
  itemId?: string;
  message: string;
  variant: 'default' | 'success' | 'warning' | 'destructive';
}

interface RealTimeTimelineProps {
  events: TimelineEvent[];
}

const eventConfig = {
  'item.started': { icon: Play, label: 'Started', variant: 'default' as const },
  'item.progress': { icon: Clock, label: 'Progress', variant: 'default' as const },
  'item.completed': { icon: CheckCircle2, label: 'Completed', variant: 'success' as const },
  'item.failed': { icon: XCircle, label: 'Failed', variant: 'destructive' as const },
  'anti-bot.detected': { icon: AlertTriangle, label: 'Anti-Bot', variant: 'warning' as const },
  'job.progress': { icon: DollarSign, label: 'Progress', variant: 'default' as const },
};

export const RealTimeTimeline = ({ events }: RealTimeTimelineProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-lg">Live Activity</h3>
        <Badge variant="default" className="animate-pulse">
          Live
        </Badge>
      </div>

      <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Waiting for activity...
            </div>
          ) : (
            events.map((event) => {
              const config = eventConfig[event.type];
              const Icon = config?.icon || Clock;

              return (
                <div
                  key={event.id}
                  className="flex gap-3 items-start pb-3 border-b border-border last:border-0 last:pb-0"
                >
                  <div className={`mt-0.5 flex-shrink-0 ${
                    event.variant === 'success' ? 'text-success' :
                    event.variant === 'destructive' ? 'text-destructive' :
                    event.variant === 'warning' ? 'text-warning' :
                    'text-primary'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={event.variant} className="text-xs">
                        {config?.label || 'Event'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{event.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};
