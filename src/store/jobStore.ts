import { create } from 'zustand';
import { Job, ProductItem } from '@/types';

interface JobStore {
  jobs: Job[];
  currentJob: Job | null;
  isLoading: boolean;
  error: string | null;
  
  setJobs: (jobs: Job[]) => void;
  addJob: (job: Job) => void;
  updateJob: (jobId: string, updates: Partial<Job>) => void;
  setCurrentJob: (job: Job | null) => void;
  updateItem: (jobId: string, itemId: string, updates: Partial<ProductItem>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useJobStore = create<JobStore>((set) => ({
  jobs: [],
  currentJob: null,
  isLoading: false,
  error: null,

  setJobs: (jobs) => set({ jobs }),
  
  addJob: (job) => set((state) => ({ 
    jobs: [job, ...state.jobs] 
  })),
  
  updateJob: (jobId, updates) => set((state) => ({
    jobs: state.jobs.map(job => 
      job.id === jobId ? { ...job, ...updates } : job
    ),
    currentJob: state.currentJob?.id === jobId 
      ? { ...state.currentJob, ...updates } 
      : state.currentJob,
  })),
  
  setCurrentJob: (job) => set({ currentJob: job }),
  
  updateItem: (jobId, itemId, updates) => set((state) => {
    const updateJobItems = (job: Job) => ({
      ...job,
      items: job.items.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    });

    return {
      jobs: state.jobs.map(job =>
        job.id === jobId ? updateJobItems(job) : job
      ),
      currentJob: state.currentJob?.id === jobId
        ? updateJobItems(state.currentJob)
        : state.currentJob,
    };
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
}));
