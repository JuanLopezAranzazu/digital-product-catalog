import type { Category, SortOption } from "@/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { cn } from "@/lib/utils"

export interface FiltersState {
  categorySlug: string
  minPrice: string
  maxPrice: string
  sort: SortOption
}

interface FiltersPanelProps {
  categories: Category[]
  filters: FiltersState
  onChange: (filters: FiltersState) => void
  onReset: () => void
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Más recientes" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "name_asc", label: "Nombre A–Z" },
]

export function FiltersPanel({
  categories,
  filters,
  onChange,
  onReset,
}: FiltersPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-2 block">Categoría</Label>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() =>
              onChange({
                ...filters,
                categorySlug: "",
              })
            }
            className={cn(
              "rounded-sm border px-2.5 py-1 text-xs transition-colors",
              filters.categorySlug === ""
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            Todas
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() =>
                onChange({
                  ...filters,
                  categorySlug: cat.slug,
                })
              }
              className={cn(
                "rounded-sm border px-2.5 py-1 text-xs transition-colors",
                filters.categorySlug === cat.slug
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Rango de precio</Label>

        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Mín"
            value={filters.minPrice}
            onChange={(e) =>
              onChange({
                ...filters,
                minPrice: e.target.value,
              })
            }
          />

          <span className="text-sm text-muted-foreground">—</span>

          <Input
            type="number"
            min={0}
            placeholder="Máx"
            value={filters.maxPrice}
            onChange={(e) =>
              onChange({
                ...filters,
                maxPrice: e.target.value,
              })
            }
          />
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Ordenar por</Label>

        <div className="flex flex-col gap-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                onChange({
                  ...filters,
                  sort: opt.value,
                })
              }
              className={cn(
                "rounded-sm px-2.5 py-1.5 text-left text-sm transition-colors",
                filters.sort === opt.value
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={onReset} className="w-full">
        Limpiar filtros
      </Button>
    </div>
  )
}
