import { ImageOff } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/format";
import {resolveImageUrl} from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product }: { product: Product }) {
  const cover = product.images[0];

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
        {cover ? (
          <img
            src={resolveImageUrl(cover.url)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-6 w-6" />
          </div>
        )}

        {product.stock <= 0 && (
          <div className="absolute left-2 top-2">
            <Badge variant="destructive">Agotado</Badge>
          </div>
        )}
      </div>

      <div className="mt-3">
        <p className="text-xs text-muted-foreground">
          {product.category.name}
        </p>

        <h3 className="mt-0.5 line-clamp-1 font-medium leading-snug text-foreground">
          {product.name}
        </h3>

        <p className="mt-1 text-sm text-foreground">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}