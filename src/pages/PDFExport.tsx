import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useJobStore } from '@/store/jobStore';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Download, Loader2, FileText, Image, Shield } from 'lucide-react';

export default function PDFExport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentJob } = useJobStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeAppendix: true,
    watermark: true,
    includeAuditLog: false,
  });

  const successItems = currentJob?.items.filter(
    item => item.status === 'success' && item.includeInPdf !== false
  ) || [];

  const estimatedPages = 1 + (exportOptions.includeAppendix ? successItems.length : 0);

  const handleExport = async () => {
    if (!id) return;

    setIsExporting(true);
    try {
      const { exportId } = await api.requestPDFExport({
        jobId: id,
        ...exportOptions,
      });

      // Simulate PDF generation
      setTimeout(async () => {
        const downloadUrl = await api.getPDFDownloadUrl(id, exportId);
        
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `BOM-${id}.pdf`;
        a.click();

        toast({
          title: 'PDF generated successfully',
          description: 'Your download should start automatically',
        });

        navigate(`/jobs/${id}`);
      }, 2000);
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      setIsExporting(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/jobs/${id}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Export PDF</h1>
              <p className="text-muted-foreground">Configure your PDF export options</p>
            </div>
          </div>

          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Export Options</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="appendix" className="flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        Include Verification Appendix
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Add detailed verification pages with screenshots for each item
                      </p>
                    </div>
                    <Switch
                      id="appendix"
                      checked={exportOptions.includeAppendix}
                      onCheckedChange={(checked) =>
                        setExportOptions({ ...exportOptions, includeAppendix: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="watermark" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Add Watermark
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Include job ID watermark for document traceability
                      </p>
                    </div>
                    <Switch
                      id="watermark"
                      checked={exportOptions.watermark}
                      onCheckedChange={(checked) =>
                        setExportOptions({ ...exportOptions, watermark: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="audit" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Include Audit Log
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Append detailed scraping metadata and timestamps
                      </p>
                    </div>
                    <Switch
                      id="audit"
                      checked={exportOptions.includeAuditLog}
                      onCheckedChange={(checked) =>
                        setExportOptions({ ...exportOptions, includeAuditLog: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <h4 className="font-semibold mb-2">Export Preview</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Items:</span>{' '}
                    <span className="font-medium">{successItems.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estimated Pages:</span>{' '}
                    <span className="font-medium">{estimatedPages}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Grand Total:</span>{' '}
                    <span className="font-medium text-primary">
                      ${currentJob.grandTotal?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Format:</span>{' '}
                    <span className="font-medium">PDF</span>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full gap-2"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Generate & Download PDF
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
