import { create } from 'zustand';

export type SyncStatus = 'idle' | 'loading' | 'success' | 'error';

interface SyncState {
  status: SyncStatus;
  errorCode: string | null;
  errorMessage: string | null;
  successMessage: string | null;
  setLoading: () => void;
  setSuccess: (message: string) => void;
  setError: (errorCode: string, message: string) => void;
  reset: () => void;
}

export const useInventoryStore = create<SyncState>((set) => ({
  status: 'idle',
  errorCode: null,
  errorMessage: null,
  successMessage: null,

  setLoading: () =>
    set({ status: 'loading', errorCode: null, errorMessage: null, successMessage: null }),

  setSuccess: (message) =>
    set({ status: 'success', successMessage: message, errorCode: null, errorMessage: null }),

  setError: (errorCode, message) =>
    set({ status: 'error', errorCode, errorMessage: message, successMessage: null }),

  reset: () =>
    set({ status: 'idle', errorCode: null, errorMessage: null, successMessage: null }),
}));
