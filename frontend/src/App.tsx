import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { CatalogPage } from "@/pages/CatalogPage"
import { ProductDetailPage } from "@/pages/ProductDetailPage"
import { LoginPage } from "@/pages/admin/LoginPage"
import { ProductsPage } from "@/pages/admin/ProductsPage"
import { CategoriesPage } from "@/pages/admin/CategoriesPage"

import { AuthProvider } from "@/context/AuthContext"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Público */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
          </Route>

          {/* Admin */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="products" replace />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
