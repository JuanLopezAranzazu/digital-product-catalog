import { useEffect, useState, type FormEvent } from "react"
import { ImagePlus, X } from "lucide-react"

import type { Category, Product } from "@/types"

import { adminCreateProduct, adminUpdateProduct, resolveImageUrl } from "@/lib/api"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"

const MAX_IMAGES = 5

interface ExistingImage {
  id: string
  url: string
}

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  product?: Product | null
  onSaved: () => void
}

export function ProductFormDialog({
  open,
  onOpenChange,
  categories,
  product,
  onSaved,
}: ProductFormDialogProps) {
  const isEditing = Boolean(product)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("0")
  const [sku, setSku] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setName(product?.name ?? "")
      setDescription(product?.description ?? "")
      setPrice(product ? String(product.price) : "")
      setStock(product ? String(product.stock) : "0")
      setSku(product?.sku ?? "")
      setCategoryId(product?.categoryId ?? categories[0]?.id ?? "")
      setIsActive(product?.isActive ?? true)
      setExistingImages(
        product?.images.map((img) => ({
          id: img.id,
          url: img.url,
        })) ?? []
      )
      setNewFiles([])
      setError(null)
    }
  }, [open, product, categories])

  const totalImages = existingImages.length + newFiles.length

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    const room = MAX_IMAGES - existingImages.length - newFiles.length

    if (room <= 0) {
      toast.add({
        title: "Límite de imágenes alcanzado",
        description: `Ya tienes ${MAX_IMAGES} imágenes en este producto.`,
        type: "error",
      })

      e.target.value = ""
      return
    }

    setNewFiles((prev) => [...prev, ...selected.slice(0, room)])

    e.target.value = ""
  }

  function removeExistingImage(id: string) {
    setExistingImages((prev) => prev.filter((img) => img.id !== id))
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!categoryId) {
      setError("Selecciona una categoría.")
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        sku: sku || undefined,
        categoryId,
        isActive,
        newImages: newFiles,
        keepImageIds: existingImages.map((img) => img.id),
      }

      if (isEditing && product) {
        await adminUpdateProduct(product.id, payload)

        toast.add({
          title: "Producto actualizado",
          description: `"${name}" se guardó correctamente.`,
        })
      } else {
        await adminCreateProduct(payload)

        toast.add({
          title: "Producto creado",
          description: `"${name}" ya está en el catálogo.`,
        })
      }

      onSaved()
      onOpenChange(false)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar el producto."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[100dvh] w-screen max-w-none flex-col gap-0 rounded-none p-0 sm:h-auto sm:max-h-[85vh] sm:w-[calc(100%-2rem)] sm:max-w-2xl sm:rounded-lg">
        <div className="shrink-0 border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <DialogTitle>
            {isEditing ? "Editar producto" : "Nuevo producto"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Actualiza la información del producto."
              : "Agrega un nuevo producto al catálogo."}
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre</Label>

              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Descripción</Label>

              <Textarea
                id="description"
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="price">Precio</Label>

                <Input
                  id="price"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="1"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="stock">Stock</Label>

                <Input
                  id="stock"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step="1"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sku">SKU (opcional)</Label>

                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Categoría</Label>

                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>

                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <label className="flex items-center gap-2 py-1 text-sm text-foreground">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 shrink-0 accent-primary"
              />
              Producto visible en el catálogo público
            </label>

            <div className="space-y-1.5">
              <Label>
                Imágenes ({totalImages}/{MAX_IMAGES})
              </Label>

              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                {existingImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square overflow-hidden rounded-sm border border-border"
                  >
                    <img
                      src={resolveImageUrl(img.url)}
                      alt=""
                      className="h-full w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.id)}
                      aria-label="Eliminar imagen"
                      className="absolute top-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/70 text-background transition-colors hover:bg-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {newFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative aspect-square overflow-hidden rounded-sm border border-border"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="h-full w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeNewFile(index)}
                      aria-label="Eliminar imagen"
                      className="absolute top-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/70 text-background transition-colors hover:bg-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {totalImages < MAX_IMAGES && (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                    <ImagePlus className="h-5 w-5" />

                    <span className="text-[10px]">Agregar</span>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                )}
              </div>

              <p className="mt-1.5 text-xs text-muted-foreground">
                Máximo {MAX_IMAGES} imágenes, JPG/PNG/WEBP hasta 5MB cada una.
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div
            className="flex shrink-0 flex-col-reverse gap-2 border-t border-border px-4 py-3 sm:flex-row sm:justify-end sm:px-6"
            style={{
              paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
            }}
          >
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
