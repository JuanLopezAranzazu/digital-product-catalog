import { Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

export function AdminLayout() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate("/admin/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
