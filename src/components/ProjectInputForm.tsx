import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Upload, FileDown, Play, AlertCircle } from 'lucide-react';
import { ParsedInput, JobOptions } from '@/types';
import { toast } from '@/hooks/use-toast';

interface ProjectInputFormProps {
  onSubmit: (items: ParsedInput[], options: JobOptions) => void;
  isLoading?: boolean;
}

export const ProjectInputForm = ({ onSubmit, isLoading = false }: ProjectInputFormProps) => {
  const [inputText, setInputText] = useState('');
  const [parsedInputs, setParsedInputs] = useState<ParsedInput[]>([]);
  const [options, setOptions] = useState<JobOptions>({
    vendorDedupe: false,
    lowestPrice: true,
    concurrentJobs: 3,
    delayMs: 1000,
    userAgentRotation: true,
  });

  const parseInput = (text: string): ParsedInput[] => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const parts = line.trim().split(/\s+/);
      const url = parts[0];
      const quantity = parseInt(parts[1]) || 1;
      
      const urlPattern = /^https?:\/\/.+/i;
      const isValid = urlPattern.test(url) && quantity > 0;
      
      return {
        url,
        quantity,
        isValid,
        error: !isValid ? 'Invalid URL or quantity' : undefined,
      };
    });
  };

  const handleInputChange = (text: string) => {
    setInputText(text);
    if (text.trim()) {
      setParsedInputs(parseInput(text));
    } else {
      setParsedInputs([]);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setInputText(text);
      setParsedInputs(parseInput(text));
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = `# StealthQuote CSV Template
# Format: URL <space> Quantity
https://example.com/product1 2
https://example.com/product2 1
https://example.com/product3 5`;
    
    const blob = new Blob([template], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stealthquote-template.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = () => {
    const validInputs = parsedInputs.filter(input => input.isValid);
    
    if (validInputs.length === 0) {
      toast({
        title: 'Invalid input',
        description: 'Please provide at least one valid product URL',
        variant: 'destructive',
      });
      return;
    }

    onSubmit(validInputs, options);
  };

  const validCount = parsedInputs.filter(i => i.isValid).length;
  const invalidCount = parsedInputs.length - validCount;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="input-text" className="text-base font-semibold">
              Product URLs & Quantities
            </Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                className="gap-2"
              >
                <FileDown className="h-4 w-4" />
                Template
              </Button>
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    Upload
                  </span>
                </Button>
              </Label>
              <input
                id="file-upload"
                type="file"
                accept=".txt,.csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          <Textarea
            id="input-text"
            placeholder="Paste product URLs with quantities (one per line)&#10;Example:&#10;https://example.com/product1 2&#10;https://example.com/product2 1"
            className="min-h-[200px] font-mono text-sm"
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
          />

          {parsedInputs.length > 0 && (
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Parsed inputs:</span>
                <div className="flex gap-4">
                  <span className="text-success font-medium">{validCount} valid</span>
                  {invalidCount > 0 && (
                    <span className="text-destructive font-medium">{invalidCount} invalid</span>
                  )}
                </div>
              </div>
              
              {invalidCount > 0 && (
                <div className="mt-3 space-y-1">
                  {parsedInputs
                    .filter(input => !input.isValid)
                    .map((input, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-destructive">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span className="break-all">{input.url}: {input.error}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold mb-4">Scraping Options</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="vendor-dedupe">Vendor Deduplication (LLM)</Label>
              <p className="text-xs text-muted-foreground">
                Use AI to identify duplicate products from different vendors
              </p>
            </div>
            <Switch
              id="vendor-dedupe"
              checked={options.vendorDedupe}
              onCheckedChange={(checked) =>
                setOptions({ ...options, vendorDedupe: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="lowest-price">Auto-select Lowest Price</Label>
              <p className="text-xs text-muted-foreground">
                Automatically choose the cheapest option for duplicate products
              </p>
            </div>
            <Switch
              id="lowest-price"
              checked={options.lowestPrice}
              onCheckedChange={(checked) =>
                setOptions({ ...options, lowestPrice: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ua-rotation">User-Agent Rotation</Label>
              <p className="text-xs text-muted-foreground">
                Rotate browser signatures to avoid detection
              </p>
            </div>
            <Switch
              id="ua-rotation"
              checked={options.userAgentRotation}
              onCheckedChange={(checked) =>
                setOptions({ ...options, userAgentRotation: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Concurrent Jobs: {options.concurrentJobs}</Label>
            <Slider
              value={[options.concurrentJobs]}
              onValueChange={([value]) =>
                setOptions({ ...options, concurrentJobs: value })
              }
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Delay Between Requests: {options.delayMs}ms</Label>
            <Slider
              value={[options.delayMs]}
              onValueChange={([value]) =>
                setOptions({ ...options, delayMs: value })
              }
              min={500}
              max={5000}
              step={100}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      <Button
        size="lg"
        className="w-full gap-2"
        onClick={handleSubmit}
        disabled={isLoading || validCount === 0}
      >
        <Play className="h-5 w-5" />
        {isLoading ? 'Starting Job...' : 'Start Job'}
      </Button>
    </div>
  );
};
