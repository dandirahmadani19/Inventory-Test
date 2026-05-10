'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../lib/axios';
import { ApiListResponse, Product } from '../../../shared/types';

const QUERY_KEY = ['inventory', 'report'] as const;

async function fetchInventoryReport(): Promise<ApiListResponse<Product>> {
  const { data } = await apiClient.get<ApiListResponse<Product>>('/api/inventory/report');
  return data;
}

export function useInventory() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchInventoryReport,
    staleTime: 30_000,      // consider fresh for 30s
    refetchInterval: 30_000, // auto-refetch every 30s for real-time feel
    refetchIntervalInBackground: false,
  });
}
