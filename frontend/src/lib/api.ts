import type {
  Category,
  PaginatedResponse,
  Product,
  ProductFilters,
  AdminUser,
} from "@/types"

const API_BASE = "/api"
const TOKEN_KEY = "catalog_admin_token"

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(options.headers)

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (res.status === 204) {
    return undefined as T
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.message || "Ocurrió un error inesperado.")
  }

  return data as T
}

// ---------- Público ----------

export function fetchProducts(
  filters: ProductFilters
): Promise<PaginatedResponse<Product>> {
  const params = new URLSearchParams()
  if (filters.query) params.set("query", filters.query)
  if (filters.categorySlug) params.set("categorySlug", filters.categorySlug)
  if (filters.minPrice) params.set("minPrice", String(filters.minPrice))
  if (filters.maxPrice) params.set("maxPrice", String(filters.maxPrice))
  if (filters.sort) params.set("sort", filters.sort)
  if (filters.page) params.set("page", String(filters.page))
  return request(`/products?${params.toString()}`)
}

export function fetchProductBySlug(slug: string): Promise<Product> {
  return request(`/products/slug/${slug}`)
}

export function fetchCategories(): Promise<Category[]> {
  return request("/categories")
}

// ---------- Auth ----------

export function login(
  email: string,
  password: string
): Promise<{ token: string; admin: AdminUser }> {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export function fetchMe(): Promise<{ admin: AdminUser }> {
  return request("/auth/me")
}

// ---------- Admin: categorías ----------

export function adminCreateCategory(name: string): Promise<Category> {
  return request("/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  })
}

export function adminUpdateCategory(
  id: string,
  name: string
): Promise<Category> {
  return request(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  })
}

export function adminDeleteCategory(id: string): Promise<void> {
  return request(`/categories/${id}`, { method: "DELETE" })
}

// ---------- Admin: productos ----------

export function adminFetchProducts(params: {
  query?: string
  categoryId?: string
  page?: number
}): Promise<PaginatedResponse<Product>> {
  const search = new URLSearchParams()
  if (params.query) search.set("query", params.query)
  if (params.categoryId) search.set("categoryId", params.categoryId)
  if (params.page) search.set("page", String(params.page))
  return request(`/products/admin/list?${search.toString()}`)
}

export function adminFetchProductById(id: string): Promise<Product> {
  return request(`/products/admin/${id}`)
}

export interface ProductFormPayload {
  name: string
  description: string
  price: number
  stock: number
  sku?: string
  categoryId: string
  isActive: boolean
  newImages: File[]
  keepImageIds?: string[]
}

function buildProductFormData(payload: ProductFormPayload): FormData {
  const form = new FormData()
  form.set("name", payload.name)
  form.set("description", payload.description)
  form.set("price", String(payload.price))
  form.set("stock", String(payload.stock))
  form.set("sku", payload.sku ?? "")
  form.set("categoryId", payload.categoryId)
  form.set("isActive", String(payload.isActive))
  if (payload.keepImageIds) {
    form.set("keepImageIds", JSON.stringify(payload.keepImageIds))
  }
  payload.newImages.forEach((file) => form.append("images", file))
  return form
}

export function adminCreateProduct(
  payload: ProductFormPayload
): Promise<Product> {
  return request("/products", {
    method: "POST",
    body: buildProductFormData(payload),
  })
}

export function adminUpdateProduct(
  id: string,
  payload: ProductFormPayload
): Promise<Product> {
  return request(`/products/${id}`, {
    method: "PUT",
    body: buildProductFormData(payload),
  })
}

export function adminDeleteProduct(id: string): Promise<void> {
  return request(`/products/${id}`, { method: "DELETE" })
}
