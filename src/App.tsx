import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Layout } from './components/Layout/Layout'
import { PageLoader } from './components/PageStatus/PageStatus'
import { ShopProvider } from './context/ShopProvider'
import { CartPage } from './pages/CartPage/CartPage'
import { CatalogPage } from './pages/CatalogPage/CatalogPage'
import { CheckoutPage } from './pages/CheckoutPage/CheckoutPage'
import { HomePage } from './pages/HomePage/HomePage'
import { NotFoundPage } from './pages/NotFoundPage/NotFoundPage'
import { OrderSuccessPage } from './pages/OrderSuccessPage/OrderSuccessPage'
import { ProductPage } from './pages/ProductPage/ProductPage'

// The map and the whole admin area load on demand, keeping the storefront bundle small.
const LocationPage = lazy(() => import('./pages/LocationPage/LocationPage').then((m) => ({ default: m.LocationPage })))
const AdminLayout = lazy(() => import('./admin/layout/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const LoginPage = lazy(() => import('./admin/pages/LoginPage/LoginPage').then((m) => ({ default: m.LoginPage })))
const DashboardPage = lazy(() =>
  import('./admin/pages/DashboardPage/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const OrdersPage = lazy(() => import('./admin/pages/OrdersPage/OrdersPage').then((m) => ({ default: m.OrdersPage })))
const OrderDetailPage = lazy(() =>
  import('./admin/pages/OrderDetailPage/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage })),
)
const ProductsPage = lazy(() =>
  import('./admin/pages/ProductsPage/ProductsPage').then((m) => ({ default: m.ProductsPage })),
)
const ProductFormPage = lazy(() =>
  import('./admin/pages/ProductFormPage/ProductFormPage').then((m) => ({ default: m.ProductFormPage })),
)
const InventoryPage = lazy(() =>
  import('./admin/pages/InventoryPage/InventoryPage').then((m) => ({ default: m.InventoryPage })),
)
const PreordersPage = lazy(() =>
  import('./admin/pages/PreordersPage/PreordersPage').then((m) => ({ default: m.PreordersPage })),
)
const SettingsPage = lazy(() =>
  import('./admin/pages/SettingsPage/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)

export function App() {
  return (
    <ShopProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="products" element={<CatalogPage />} />
              <Route path="product/:id" element={<ProductPage />} />
              <Route path="location" element={<LocationPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="order/success" element={<OrderSuccessPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route path="admin/login" element={<LoginPage />} />
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/new" element={<ProductFormPage />} />
              <Route path="products/:id" element={<ProductFormPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="preorders" element={<PreordersPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ShopProvider>
  )
}
