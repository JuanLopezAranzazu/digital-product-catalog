import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, ImageOff } from "lucide-react"

import type { Product } from "@/types"

import { fetchProductBySlug } from "@/lib/api"
import { formatPrice } from "@/lib/format"

import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

import { cn } from "@/lib/utils"

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  const [product, setProduct] = useState<Product | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return

    setIsLoading(true)
    setNotFound(false)

    fetchProductBySlug(slug)
      .then((data) => {
        setProduct(data)
        setActiveImage(0)
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false))
  }, [slug])

  if (isLoading) {
    return (
      <div className="flex justify-center py-32">
        <Spinner />
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center sm:px-6">
        <p className="mb-2 font-heading text-lg">
          No encontramos este producto
        </p>

        <p className="mb-6 text-muted-foreground">
          Puede que ya no esté disponible o el enlace sea incorrecto.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>
      </div>
    )
  }

  const images = product.images

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Images */}
        <div>
          <div className="aspect-square w-full overflow-hidden rounded-md bg-muted">
            {images[activeImage] ? (
              <img
                src={images[activeImage].url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ImageOff className="h-8 w-8" />
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((img, index) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Ver imagen ${index + 1} de ${images.length}`}
                  aria-current={index === activeImage}
                  className={cn(
                    "h-16 w-16 shrink-0 overflow-hidden rounded-sm border-2 transition-colors",
                    index === activeImage
                      ? "border-primary"
                      : "border-transparent"
                  )}
                >
                  <img
                    src={img.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product information */}
        <div className="max-w-md">
          <p className="mb-2 text-sm text-muted-foreground">
            {product.category.name}
          </p>

          <h1 className="font-heading text-3xl leading-tight font-medium">
            {product.name}
          </h1>

          <p className="mt-4 text-2xl font-medium">
            {formatPrice(product.price)}
          </p>

          <div className="mt-4">
            {product.stock > 0 ? (
              <Badge>En stock · {product.stock} disponibles</Badge>
            ) : (
              <Badge variant="destructive">Agotado</Badge>
            )}
          </div>

          <p className="mt-6 leading-relaxed whitespace-pre-line text-foreground/80">
            {product.description}
          </p>

          {product.sku && (
            <p className="mt-6 text-xs text-muted-foreground">
              SKU: {product.sku}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
