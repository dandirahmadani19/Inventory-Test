'use client';

import React, { memo, useMemo } from 'react';
import { Product, LOW_STOCK_THRESHOLD } from '../../../shared/types';

interface InventoryTableProps {
  products: Product[];
  isLoading: boolean;
  onReduceClick: (product: Product) => void;
}

const InventoryRow = memo(function InventoryRow({
  product,
  onReduceClick,
}: {
  product: Product;
  onReduceClick: (product: Product) => void;
}) {
  const isLowStock = product.stock <= LOW_STOCK_THRESHOLD;
  const isOutOfStock = product.stock === 0;

  return (
    <tr className={`border-b border-gray-700 transition-colors hover:bg-gray-800/50 ${isLowStock ? 'bg-red-950/20' : ''}`}>
      <td className="px-4 py-3 font-medium text-gray-100">{product.name}</td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center rounded-full bg-indigo-900/50 px-2.5 py-0.5 text-xs font-medium text-indigo-300 ring-1 ring-inset ring-indigo-700/50">
          {product.category.name}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={`font-mono text-sm font-semibold ${
            isOutOfStock
              ? 'text-red-400'
              : isLowStock
              ? 'text-amber-400'
              : 'text-emerald-400'
          }`}
        >
          {isOutOfStock ? 'Habis' : product.stock}
          {isLowStock && !isOutOfStock && (
            <span className="ml-1.5 text-xs font-normal text-amber-500">⚠ Low</span>
          )}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">
        {new Date(product.updatedAt).toLocaleString('id-ID', {
          dateStyle: 'short',
          timeStyle: 'short',
        })}
      </td>
      <td className="px-4 py-3">
        <button
          id={`reduce-btn-${product.id}`}
          onClick={() => onReduceClick(product)}
          disabled={isOutOfStock}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-500"
        >
          Reduce Stock
        </button>
      </td>
    </tr>
  );
});

export default function InventoryTable({ products, isLoading, onReduceClick }: InventoryTableProps) {
  // Sort: low-stock first, then alphabetical — memoized to avoid re-sort on every render
  const sortedProducts = useMemo(
    () =>
      [...products].sort((a, b) => {
        if (a.stock <= LOW_STOCK_THRESHOLD && b.stock > LOW_STOCK_THRESHOLD) return -1;
        if (a.stock > LOW_STOCK_THRESHOLD && b.stock <= LOW_STOCK_THRESHOLD) return 1;
        return a.name.localeCompare(b.name);
      }),
    [products],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        <span className="ml-3 text-gray-400">Memuat data...</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-16 text-center text-gray-500">
        <p className="text-lg">Tidak ada produk ditemukan</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700 bg-gray-800/80 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
            <th className="px-4 py-3">Nama Produk</th>
            <th className="px-4 py-3">Kategori</th>
            <th className="px-4 py-3">Stok</th>
            <th className="px-4 py-3">Terakhir Update</th>
            <th className="px-4 py-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {sortedProducts.map((product) => (
            <InventoryRow
              key={product.id}
              product={product}
              onReduceClick={onReduceClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
