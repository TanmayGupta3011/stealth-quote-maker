import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { ItemCard } from '@/components/ItemCard';
import { RealTimeTimeline } from '@/components/RealTimeTimeline';
import { SummaryTable } from '@/components/SummaryTable';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useJobStore } from '@/store/jobStore';
import { api } from '@/lib/api';
import { createWebSocketClient } from '@/lib/websocket';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Download, FileDown, RotateCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentJob, setCurrentJob, updateItem } = useJobStore();
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadJob = async () => {
      try {
        const job = await api.getJob(id);
        setCurrentJob(job);
      } catch (error) {
        toast({
          title: 'Failed to load job',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();

    const ws = createWebSocketClient();
    ws.connect(id);

    const unsubscribe = ws.subscribe((message) => {
      setTimelineEvents(prev => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
          type: message.type,
          itemId: message.itemId,
          message: `${message.type}: ${JSON.stringify(message.data)}`,
          variant: message.type.includes('failed') ? 'destructive' :
                   message.type.includes('completed') ? 'success' :
                   message.type.includes('anti-bot') ? 'warning' : 'default',
        },
      ]);
    });

    return () => {
      unsubscribe();
      ws.disconnect();
    };
  }, [id, setCurrentJob]);

  const handleRetry = async (itemId?: string) => {
    if (!id) return;
    
    try {
      const job = await api.retryJob(id, itemId ? [itemId] : undefined);
      setCurrentJob(job);
      toast({
        title: 'Retry initiated',
        description: itemId ? 'Retrying item' : 'Retrying failed items',
      });
    } catch (error) {
      toast({
        title: 'Retry failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleItemUpdate = async (itemId: string, updates: any) => {
    if (!id) return;
    
    try {
      await api.updateItem(id, itemId, updates);
      updateItem(id, itemId, updates);
      toast({
        title: 'Item updated',
        description: 'Changes saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleExportCSV = async () => {
    if (!id) return;
    
    try {
      const blob = await api.exportCSV(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bom-${id}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handlePDFExport = () => {
    navigate(`/jobs/${id}/export`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-[400px]" />
          </div>
        </main>
      </div>
    );
  }

  if (!currentJob) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Job not found</p>
          </div>
        </main>
      </div>
    );
  }

  const failedItems = currentJob.items.filter(i => i.status === 'failed' || i.status === 'anti-bot');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{currentJob.name}</h1>
                <p className="text-muted-foreground">
                  {new Date(currentJob.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={
                currentJob.status === 'complete' ? 'success' :
                currentJob.status === 'failed' ? 'destructive' :
                currentJob.status === 'partial' ? 'warning' : 'default'
              }>
                {currentJob.status}
              </Badge>
              {failedItems.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => handleRetry()}>
                  <RotateCw className="h-4 w-4 mr-2" />
                  Retry Failed ({failedItems.length})
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <FileDown className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button size="sm" onClick={handlePDFExport}>
                <Download className="h-4 w-4 mr-2" />
                Generate PDF
              </Button>
            </div>
          </div>

          <Tabs defaultValue="items" className="space-y-6">
            <TabsList>
              <TabsTrigger value="items">Items ({currentJob.items.length})</TabsTrigger>
              <TabsTrigger value="summary">Summary Table</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="items" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {currentJob.items.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onRetry={handleRetry}
                    onEdit={(itemId) => console.log('Edit', itemId)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="summary">
              <SummaryTable items={currentJob.items} onItemUpdate={handleItemUpdate} />
            </TabsContent>

            <TabsContent value="timeline">
              <RealTimeTimeline events={timelineEvents} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
