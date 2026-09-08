import { useState, type FormEvent } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { Lock } from "lucide-react"

import { useAuth } from "@/context/AuthContext"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginPage() {
  const { admin, login, isLoading } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!isLoading && admin) {
    return <Navigate to="/admin/products" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    setError(null)
    setSubmitting(true)

    try {
      await login(email, password)
      navigate("/admin/products")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo iniciar sesión."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-4 w-4 text-primary" />
          </div>

          <h1 className="text-center font-heading text-2xl font-semibold tracking-tight">
            Acceso administrador
          </h1>

          <p className="mt-1 text-center text-sm text-muted-foreground">
            Gestiona productos y categorías del catálogo.
          </p>
        </div>

        {/* Login form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>

            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@catalogo.com"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>

            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {/* Error */}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </div>
    </div>
  )
}
