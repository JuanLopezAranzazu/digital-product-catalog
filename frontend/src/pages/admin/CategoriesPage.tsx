import { useEffect, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"

import type { Category } from "@/types"
import { adminDeleteCategory, fetchCategories } from "@/lib/api"

import { CategoryFormDialog } from "@/components/admin/CategoryFormDialog"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  function loadCategories() {
    setIsLoading(true)

    fetchCategories()
      .then(setCategories)
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadCategories()
  }, [])

  function openCreateDialog() {
    setEditingCategory(null)
    setDialogOpen(true)
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category)
    setDialogOpen(true)
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `¿Eliminar la categoría "${category.name}"?`
    )

    if (!confirmed) return

    try {
      await adminDeleteCategory(category.id)

      toast.add({
        title: "Categoría eliminada",
        description: `"${category.name}" se quitó del catálogo.`,
      })

      loadCategories()
    } catch (err) {
      toast.add({
        title: "No se pudo eliminar",
        description:
          err instanceof Error ? err.message : "Ocurrió un error inesperado.",
        type: "error",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Categorías
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {categories.length}{" "}
            {categories.length === 1 ? "categoría" : "categorías"}
          </p>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Nueva categoría
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Aún no hay categorías. Crea la primera.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium text-foreground">
                    {category.name}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {category.slug}
                  </TableCell>

                  <TableCell>{category._count?.products ?? 0}</TableCell>

                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(category)}
                        aria-label={`Editar ${category.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category)}
                        aria-label={`Eliminar ${category.name}`}
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
        )}
      </div>

      {/* Category dialog */}
      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
        onSaved={loadCategories}
      />
    </div>
  )
}
