import { useEffect, useState, type FormEvent } from "react"
import type { Category } from "@/types"
import { adminCreateCategory, adminUpdateCategory } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
  onSaved: () => void
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSaved,
}: CategoryFormDialogProps) {
  const isEditing = Boolean(category)
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setName(category?.name ?? "")
      setError(null)
    }
  }, [open, category])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (isEditing && category) {
        await adminUpdateCategory(category.id, name)
        toast.add({
          title: "Categoría actualizada",
          description: `"${name}" se guardó correctamente.`,
        })
      } else {
        await adminCreateCategory(name)
        toast.add({
          title: "Categoría creada",
          description: `"${name}" ya está disponible.`,
        })
      }
      onSaved()
      onOpenChange(false)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar la categoría."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>
          {isEditing ? "Editar categoría" : "Nueva categoría"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Actualiza el nombre de la categoría."
            : "Las categorías organizan los productos del catálogo."}
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="category-name">Nombre</Label>
            <Input
              id="category-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={submitting}
            >
              {submitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
