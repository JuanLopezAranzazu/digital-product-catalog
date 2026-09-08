import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { Package, Tag, LogOut, ExternalLink } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/admin/products", label: "Productos", icon: Package },
  { to: "/admin/categories", label: "Categorías", icon: Tag },
]

export function AdminLayout() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate("/admin/login")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        {/* Logo */}
        <div className="shrink-0 border-b border-sidebar-border px-5 py-4">
          <p className="font-heading text-lg font-semibold">Mi Catálogo</p>

          <p className="text-xs text-sidebar-foreground/60">
            Panel de administración
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        {/* Public catalog */}
        <div className="shrink-0 border-t border-sidebar-border p-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
              "text-sidebar-foreground/70",
              "transition-colors",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <ExternalLink className="h-4 w-4" />
            Ver catálogo público
          </a>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile navigation */}
        <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-border bg-sidebar p-3 md:hidden">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4 md:px-6">
          <p className="text-sm text-muted-foreground">
            Hola{" "}
            <span className="font-medium text-foreground">{admin?.name}</span>
          </p>

          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2 py-1.5",
              "text-sm text-muted-foreground",
              "transition-colors",
              "hover:bg-destructive/10 hover:text-destructive"
            )}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </header>

        {/* Content */}
        <main className="min-h-0 flex-1 overflow-y-auto bg-muted/30 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
