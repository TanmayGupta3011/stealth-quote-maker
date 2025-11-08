import { useEffect } from 'react';
import { Header } from '@/components/Header';
import { JobsList } from '@/components/JobsList';
import { useJobStore } from '@/store/jobStore';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Jobs() {
  const { jobs, isLoading, error, setJobs, setLoading, setError } = useJobStore();

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const jobsData = await api.getJobs();
        setJobs(jobsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [setJobs, setLoading, setError]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Jobs Dashboard</h2>
            <p className="text-muted-foreground mt-2">
              Track and manage your BOM generation jobs
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-[250px] rounded-lg" />
              ))}
            </div>
          ) : (
            <JobsList jobs={jobs} />
          )}
        </div>
      </main>
    </div>
  );
}
