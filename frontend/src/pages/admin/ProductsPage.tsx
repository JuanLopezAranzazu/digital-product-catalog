import { useEffect, useState } from "react"
import { ImageOff, Pencil, Plus, Search, Trash2 } from "lucide-react"

import type { Category, Product } from "@/types"

import {
  adminDeleteProduct,
  adminFetchProducts,
  fetchCategories,
  resolveImageUrl,
} from "@/lib/api"
import { formatPrice } from "@/lib/format"

import { ProductFormDialog } from "@/components/admin/ProductFormDialog"
import { Pagination } from "@/components/catalog/Pagination"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"

export function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState("")
  const [categoryId, setCategoryId] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {})
  }, [])

  function loadProducts() {
    setIsLoading(true)

    adminFetchProducts({
      query,
      categoryId: categoryId === "all" ? undefined : categoryId,
      page,
    })
      .then((res) => {
        setProducts(res.items)
        setTotal(res.total)
        setTotalPages(res.totalPages)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    loadProducts()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, categoryId, page])

  function openCreateDialog() {
    setEditingProduct(null)
    setDialogOpen(true)
  }

  function openEditDialog(product: Product) {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  async function confirmDelete() {
    if (!deleteTarget) return

    setIsDeleting(true)

    try {
      await adminDeleteProduct(deleteTarget.id)

      toast.add({
        title: "Producto eliminado",
        description: `"${deleteTarget.name}" se quitó del catálogo.`,
      })

      setDeleteTarget(null)
      loadProducts()
    } catch (err) {
      toast.add({
        title: "No se pudo eliminar",
        description:
          err instanceof Error ? err.message : "Ocurrió un error inesperado.",
        type: "error",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Productos
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {total} producto{total === 1 ? "" : "s"} en el catálogo
          </p>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative max-w-sm flex-1">
          <Search
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />

          <Input
            value={query}
            onChange={(e) => {
              setPage(1)
              setQuery(e.target.value)
            }}
            placeholder="Buscar por nombre o SKU..."
            className="pl-9"
          />
        </div>

        <Select
          value={categoryId}
          onValueChange={(value) => {
            setPage(1)
            setCategoryId(value)
          }}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>

            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No hay productos que coincidan con la búsqueda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    {/* Product */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                          {product.images[0] ? (
                            <img
                              src={resolveImageUrl(product.images[0].url)}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {product.name}
                          </p>

                          {product.sku && (
                            <p className="text-xs text-muted-foreground">
                              {product.sku}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell>{product.category.name}</TableCell>

                    {/* Price */}
                    <TableCell>{formatPrice(product.price)}</TableCell>

                    {/* Stock */}
                    <TableCell>{product.stock}</TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge variant={product.isActive ? "default" : "outline"}>
                        {product.isActive ? "Publicado" : "Oculto"}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(product)}
                          aria-label={`Editar ${product.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(product)}
                          aria-label={`Eliminar ${product.name}`}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Product dialog */}
      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        product={editingProduct}
        onSaved={loadProducts}
      />

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar producto</DialogTitle>
            <DialogDescription>
              ¿Seguro que quieres eliminar <strong>{deleteTarget?.name}</strong>
              ? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={confirmDelete}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
