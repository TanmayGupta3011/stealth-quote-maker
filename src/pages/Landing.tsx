import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { ProjectInputForm } from '@/components/ProjectInputForm';
import { ParsedInput, JobOptions } from '@/types';
import { api } from '@/lib/api';
import { useJobStore } from '@/store/jobStore';
import { toast } from '@/hooks/use-toast';

export default function Landing() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addJob } = useJobStore();

  const handleSubmit = async (items: ParsedInput[], options: JobOptions) => {
    setIsSubmitting(true);
    
    try {
      const job = await api.createJob(
        items.map(({ url, quantity }) => ({ url, quantity })),
        options
      );
      
      addJob(job);
      
      toast({
        title: 'Job created successfully',
        description: `Processing ${items.length} items`,
      });
      
      navigate(`/jobs/${job.id}`);
    } catch (error) {
      toast({
        title: 'Failed to create job',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">
              Create New BOM Project
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Generate professional Bill of Materials with automated price extraction,
              visual proof, and anti-bot stealth technology
            </p>
          </div>

          <ProjectInputForm onSubmit={handleSubmit} isLoading={isSubmitting} />
        </div>
      </main>
    </div>
  );
}
