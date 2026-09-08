export interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
}

export interface ProductImage {
  id: string;
  url: string;
  position: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  sku: string | null;
  isActive: boolean;
  categoryId: string;
  category: Category;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
}

export type SortOption = "recent" | "price_asc" | "price_desc" | "name_asc";

export interface ProductFilters {
  query?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
  page?: number;
}
