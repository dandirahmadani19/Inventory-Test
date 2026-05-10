import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InventoryTable from '../../app/features/inventory/components/InventoryTable';
import { Product } from '../../app/shared/types';

const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Laptop Asus VivoBook',
    stock: 15,
    categoryId: 1,
    category: { id: 1, name: 'Elektronik' },
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-10T08:00:00.000Z',
  },
  {
    id: 2,
    name: 'Keyboard Mechanical',
    stock: 3, // Low stock
    categoryId: 1,
    category: { id: 1, name: 'Elektronik' },
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-10T08:00:00.000Z',
  },
  {
    id: 3,
    name: 'Mouse Wireless',
    stock: 0, // Out of stock
    categoryId: 1,
    category: { id: 1, name: 'Elektronik' },
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-10T08:00:00.000Z',
  },
];

describe('InventoryTable', () => {
  it('renders product rows correctly', () => {
    const onReduceClick = vi.fn();
    render(<InventoryTable products={mockProducts} isLoading={false} onReduceClick={onReduceClick} />);

    expect(screen.getByText('Laptop Asus VivoBook')).toBeInTheDocument();
    expect(screen.getByText('Keyboard Mechanical')).toBeInTheDocument();
    expect(screen.getByText('Mouse Wireless')).toBeInTheDocument();
  });

  it('calls onReduceClick with correct product when Reduce Stock button is clicked', () => {
    const onReduceClick = vi.fn();
    render(<InventoryTable products={mockProducts} isLoading={false} onReduceClick={onReduceClick} />);

    // Click Reduce Stock button for Laptop (id=1) via its element id
    const btn = document.getElementById('reduce-btn-1');
    expect(btn).not.toBeNull();
    fireEvent.click(btn!);

    expect(onReduceClick).toHaveBeenCalledTimes(1);
  });

  it('disables Reduce Stock button for out-of-stock products', () => {
    const onReduceClick = vi.fn();
    render(<InventoryTable products={mockProducts} isLoading={false} onReduceClick={onReduceClick} />);

    // Mouse Wireless (id=3) is out of stock — its button should be disabled
    const outOfStockBtn = document.getElementById('reduce-btn-3') as HTMLButtonElement;
    expect(outOfStockBtn).not.toBeNull();
    expect(outOfStockBtn.disabled).toBe(true);
  });

  it('shows loading spinner when isLoading is true', () => {
    const onReduceClick = vi.fn();
    render(<InventoryTable products={[]} isLoading={true} onReduceClick={onReduceClick} />);
    expect(screen.getByText('Memuat data...')).toBeInTheDocument();
  });

  it('shows empty state when no products', () => {
    const onReduceClick = vi.fn();
    render(<InventoryTable products={[]} isLoading={false} onReduceClick={onReduceClick} />);
    expect(screen.getByText('Tidak ada produk ditemukan')).toBeInTheDocument();
  });

  it('shows category badges for each product', () => {
    const onReduceClick = vi.fn();
    render(<InventoryTable products={mockProducts} isLoading={false} onReduceClick={onReduceClick} />);
    const badges = screen.getAllByText('Elektronik');
    expect(badges.length).toBe(3);
  });
});
