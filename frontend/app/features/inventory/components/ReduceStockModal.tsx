'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../../../shared/types';
import { useReduceStock } from '../hooks/useReduceStock';
import { useInventoryStore } from '../store/inventory.store';

interface ReduceStockModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReduceStockModal({ product, isOpen, onClose }: ReduceStockModalProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [localError, setLocalError] = useState('');
  const amountInputRef = useRef<HTMLInputElement>(null);
  const { mutate: reduceStock, isPending } = useReduceStock();
  const { reset } = useInventoryStore();

  // Auto-focus amount input when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setNote('');
      setLocalError('');
      setTimeout(() => amountInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  if (!isOpen || !product) return null;

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseInt(amount, 10);

    if (!parsedAmount || parsedAmount <= 0) {
      setLocalError('Jumlah harus berupa angka positif');
      return;
    }
    if (parsedAmount > product!.stock) {
      setLocalError(`Jumlah tidak boleh melebihi stok saat ini (${product!.stock})`);
      return;
    }

    setLocalError('');
    reduceStock(
      { productId: product!.id, payload: { amount: parsedAmount, note: note || undefined } },
      { onSuccess: () => { onClose(); } },
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-white">Kurangi Stok</h2>
            <p className="mt-0.5 text-sm text-gray-400">{product.name}</p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
            aria-label="Tutup modal"
          >
            ✕
          </button>
        </div>

        <div className="mb-5 rounded-lg bg-gray-800 px-4 py-3">
          <p className="text-xs text-gray-400">Stok Saat Ini</p>
          <p className="mt-0.5 text-2xl font-bold font-mono text-emerald-400">{product.stock}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reduce-amount" className="mb-1.5 block text-sm font-medium text-gray-300">
              Jumlah Dikurangi <span className="text-red-400">*</span>
            </label>
            <input
              id="reduce-amount"
              ref={amountInputRef}
              type="number"
              min={1}
              max={product.stock}
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setLocalError(''); }}
              placeholder="Masukkan jumlah..."
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
            {localError && <p className="mt-1.5 text-xs text-red-400">{localError}</p>}
          </div>

          <div>
            <label htmlFor="reduce-note" className="mb-1.5 block text-sm font-medium text-gray-300">
              Catatan <span className="text-gray-500">(opsional)</span>
            </label>
            <input
              id="reduce-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={255}
              placeholder="Pengiriman ke cabang, dll..."
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700"
            >
              Batal
            </button>
            <button
              id="confirm-reduce-btn"
              type="submit"
              disabled={isPending || product.stock === 0}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-500"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Memproses...
                </span>
              ) : (
                'Konfirmasi Kurangi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
