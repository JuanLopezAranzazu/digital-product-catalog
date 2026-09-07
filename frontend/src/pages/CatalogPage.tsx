import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { PackageSearch, Search, SlidersHorizontal } from "lucide-react"

import { fetchCategories, fetchProducts } from "@/lib/api"
import type { Category, Product } from "@/types"

import { ProductCard } from "@/components/catalog/ProductCard"
import {
  FiltersPanel,
  type FiltersState,
} from "@/components/catalog/FiltersPanel"
import { Pagination } from "@/components/catalog/Pagination"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const [searchInput, setSearchInput] = useState(
    searchParams.get("query") || ""
  )

  const filters: FiltersState = {
    categorySlug: searchParams.get("categorySlug") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: (searchParams.get("sort") as FiltersState["sort"]) || "recent",
  }

  const page = Number(searchParams.get("page")) || 1
  const query = searchParams.get("query") || ""

  // Cargar categorías
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {})
  }, [])

  // Cargar productos
  useEffect(() => {
    setIsLoading(true)

    fetchProducts({
      query,
      categorySlug: filters.categorySlug || undefined,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      sort: filters.sort,
      page,
    })
      .then((res) => {
        setProducts(res.items)
        setTotalPages(res.totalPages)
        setTotal(res.total)
      })
      .finally(() => {
        setIsLoading(false)
      })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    query,
    filters.categorySlug,
    filters.minPrice,
    filters.maxPrice,
    filters.sort,
    page,
  ])

  function updateParams(
    next: Partial<{ query: string; page: number } & FiltersState>
  ) {
    const params = new URLSearchParams(searchParams)

    const merged = {
      query,
      page: 1,
      ...filters,
      ...next,
    }

    Object.entries(merged).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value))
      } else {
        params.delete(key)
      }
    })

    setSearchParams(params)
  }

  function handleFiltersChange(next: FiltersState) {
    updateParams({
      ...next,
      page: 1,
    })
  }

  function handleReset() {
    setSearchInput("")
    setSearchParams(new URLSearchParams())
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="max-w-2xl">
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
          Piezas para vivir despacio
        </h1>

        <p className="mt-2 text-muted-foreground">
          Cerámica, textiles e iluminación hechos a mano, en pequeños lotes,
          para espacios con carácter.
        </p>
      </div>

      {/* Search */}
      <form
        className="mt-8 flex max-w-xl gap-2"
        onSubmit={(e) => {
          e.preventDefault()

          updateParams({
            query: searchInput,
            page: 1,
          })
        }}
      >
        <div className="relative flex-1">
          <Search
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />

          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar productos..."
            className="pl-9"
          />
        </div>

        <Button type="submit">Buscar</Button>

        {/* Mobile filters */}
        <Sheet>
          <SheetTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="lg:hidden"
                aria-label="Abrir filtros"
              />
            }
          >
            <SlidersHorizontal className="h-4 w-4" />
          </SheetTrigger>

          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filtrar productos</SheetTitle>
            </SheetHeader>

            <div className="px-6 pb-6">
              <FiltersPanel
                categories={categories}
                filters={filters}
                onChange={handleFiltersChange}
                onReset={handleReset}
              />
            </div>
          </SheetContent>
        </Sheet>
      </form>

      {/* Products + filters */}
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <FiltersPanel
            categories={categories}
            filters={filters}
            onChange={handleFiltersChange}
            onReset={handleReset}
          />
        </aside>

        {/* Products */}
        <div className="min-w-0">
          <p className="mb-4 text-sm text-muted-foreground">
            {isLoading
              ? "Buscando..."
              : `${total} producto${total === 1 ? "" : "s"} encontrados`}
          </p>

          {isLoading ? (
            <div className="flex justify-center py-24">
              <Spinner />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
              <PackageSearch className="mb-3 h-8 w-8" />

              <p>No encontramos productos con esos filtros.</p>

              <Button variant="link" onClick={handleReset} className="mt-2">
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => updateParams({ page: p })}
          />
        </div>
      </div>
    </div>
  )
}
