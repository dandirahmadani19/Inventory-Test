'use client';

import { useEffect } from 'react';
import { useInventoryStore } from '../store/inventory.store';

const ERROR_MESSAGES: Record<string, string> = {
  INSUFFICIENT_STOCK: '⚠ Stok tidak mencukupi untuk operasi ini.',
  CONCURRENCY_ERROR: '⚠ Gagal — stok baru saja berubah oleh user lain. Coba lagi.',
  NOT_FOUND: 'Produk tidak ditemukan.',
  VALIDATION_ERROR: 'Data yang dimasukkan tidak valid.',
  NETWORK_ERROR: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
  TIMEOUT: 'Permintaan memakan terlalu lama. Silakan coba lagi.',
};

export default function StockSyncIndicator() {
  const { status, errorCode, errorMessage, successMessage, reset } = useInventoryStore();

  // Auto-dismiss after 4s
  useEffect(() => {
    if (status === 'success' || status === 'error') {
      const timer = setTimeout(reset, 4000);
      return () => clearTimeout(timer);
    }
  }, [status, reset]);

  if (status === 'idle' || status === 'loading') return null;

  const displayMessage =
    status === 'success'
      ? successMessage
      : errorCode
      ? (ERROR_MESSAGES[errorCode] ?? errorMessage)
      : errorMessage;

  const isSuccess = status === 'success';

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-all ${
        isSuccess
          ? 'border-emerald-700/50 bg-emerald-950/50 text-emerald-300'
          : 'border-red-700/50 bg-red-950/50 text-red-300'
      }`}
    >
      <span className="mt-0.5 shrink-0 text-base">{isSuccess ? '✅' : '❌'}</span>
      <div className="flex-1">
        <p className="font-medium">{isSuccess ? 'Berhasil' : 'Gagal'}</p>
        <p className="mt-0.5 text-xs opacity-80">{displayMessage}</p>
      </div>
      <button
        onClick={reset}
        className="shrink-0 opacity-60 hover:opacity-100"
        aria-label="Tutup notifikasi"
      >
        ✕
      </button>
    </div>
  );
}
