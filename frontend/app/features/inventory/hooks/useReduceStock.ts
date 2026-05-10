'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../lib/axios';
import { ReduceStockRequest, ApiSuccessResponse, ReduceStockResponseData } from '../../../shared/types';
import { useInventoryStore } from '../store/inventory.store';

async function reduceStock(
  productId: number,
  payload: ReduceStockRequest,
): Promise<ApiSuccessResponse<ReduceStockResponseData>> {
  const { data } = await apiClient.patch<ApiSuccessResponse<ReduceStockResponseData>>(
    `/api/inventory/${productId}/reduce`,
    payload,
  );
  return data;
}

export function useReduceStock() {
  const queryClient = useQueryClient();
  const { setLoading, setSuccess, setError } = useInventoryStore();

  return useMutation({
    mutationFn: ({ productId, payload }: { productId: number; payload: ReduceStockRequest }) =>
      reduceStock(productId, payload),

    onMutate: () => {
      setLoading();
    },

    onSuccess: (data) => {
      setSuccess(data.message ?? 'Stock reduced successfully');
      // Invalidate report query so table auto-updates
      queryClient.invalidateQueries({ queryKey: ['inventory', 'report'] });
    },

    onError: (error: unknown) => {
      const err = error as { errorCode?: string; userMessage?: string };
      setError(
        err.errorCode ?? 'UNKNOWN_ERROR',
        err.userMessage ?? 'An unexpected error occurred',
      );
    },
  });
}
