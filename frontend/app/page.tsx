'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInventory } from './features/inventory/hooks/useInventory';
import InventoryTable from './features/inventory/components/InventoryTable';
import ReduceStockModal from './features/inventory/components/ReduceStockModal';
import StockSyncIndicator from './features/inventory/components/StockSyncIndicator';
import { Product } from './shared/types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: true },
  },
});

function Dashboard() {
  const { data, isLoading, isError, refetch } = useInventory();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const products = data?.data ?? [];
  const meta = data?.meta;

  function handleReduceClick(product: Product) {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }

  function handleModalClose() {
    setIsModalOpen(false);
    setSelectedProduct(null);
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">📦 Inventory Control Center</h1>
              <p className="text-xs text-gray-400">Real-time stock management — mGanik</p>
            </div>
            <button
              onClick={() => refetch()}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Stats */}
        {meta && (
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
              <p className="text-xs text-gray-400">Total Produk</p>
              <p className="mt-1 text-3xl font-bold text-white">{meta.total}</p>
            </div>
            <div className="rounded-xl border border-amber-700/40 bg-amber-950/20 p-4">
              <p className="text-xs text-amber-400">Stok Menipis</p>
              <p className="mt-1 text-3xl font-bold text-amber-300">{meta.lowStockCount}</p>
            </div>
            <div className="rounded-xl border border-emerald-700/40 bg-emerald-950/20 p-4">
              <p className="text-xs text-emerald-400">Stok Normal</p>
              <p className="mt-1 text-3xl font-bold text-emerald-300">
                {meta.total - meta.lowStockCount}
              </p>
            </div>
          </div>
        )}

        {/* Sync Indicator */}
        <div className="mb-4">
          <StockSyncIndicator />
        </div>

        {/* Error state */}
        {isError && (
          <div className="mb-4 rounded-xl border border-red-700/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
            ❌ Gagal memuat data. Pastikan backend berjalan di localhost:3001.
          </div>
        )}

        {/* Table */}
        <InventoryTable
          products={products}
          isLoading={isLoading}
          onReduceClick={handleReduceClick}
        />
      </div>

      {/* Modal */}
      <ReduceStockModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </main>
  );
}

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}
