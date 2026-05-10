// Domain Entity — Product
export interface ProductEntity {
  id: number;
  name: string;
  stock: number;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
}
