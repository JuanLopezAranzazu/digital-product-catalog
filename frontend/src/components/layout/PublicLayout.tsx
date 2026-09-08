import { Link, Outlet } from "react-router-dom"
import { ShieldCheck } from "lucide-react"

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-heading text-xl font-semibold">
              Mi Catálogo
            </span>

            <span className="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground sm:inline">
              catálogo
            </span>
          </Link>

          <Link
            to="/admin/login"
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ShieldCheck className="h-4 w-4" />

            <span className="hidden sm:inline">Acceso admin</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-background py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 text-sm text-muted-foreground sm:flex-row">
          <p>Mi Catálogo — descubre nuestros productos.</p>

          <p>&copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}
