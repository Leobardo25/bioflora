import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SiteConfigProvider } from './context/SiteConfigContext';

// Protected Routes Higher Order Components
import { ProtectedRoute, AdminRoute, PublicOnlyRoute } from './routes/ProtectedRoutes';

// Pages & Components Custom
import Landing from './pages/Landing';
import Shop from './pages/Shop';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminHome from './features/admin/AdminHome';
import InventoryList from './features/admin/InventoryList';
import ProductForm from './features/admin/ProductForm';
import OrdersList from './features/admin/OrdersList';
import CustomersList from './features/admin/CustomersList';
import LandingEditor from './features/admin/LandingEditor';
import SiteConfig from './features/admin/SiteConfig';
import SeedProducts from './pages/SeedProducts';
import InvoicePage from './pages/InvoicePage';
import PolicyPage from './pages/PolicyPage';
import { MovementsList } from './features/admin/inventory-movements';

function AppRoutes() {
  return (
    <Routes>
      {/* 1. Public Store & Landing Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/tienda" element={<Shop />} />
      <Route path="/seed" element={<SeedProducts />} />
      <Route path="/factura/:orderId" element={<InvoicePage />} />
      <Route path="/politica/:policyType" element={<PolicyPage />} />

      {/* 2. Authentication Pages (blocked if logged in) */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* 3. Protected Generic Routes (must be logged in) */}
      <Route element={<ProtectedRoute />}>
      </Route>

      {/* 4. Admin Only Routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<AdminHome />} />
          <Route path="inventory" element={<InventoryList />} />
          <Route path="movements" element={<MovementsList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="orders" element={<OrdersList />} />
          <Route path="customers" element={<CustomersList />} />
          <Route path="landing" element={<LandingEditor />} />
          <Route path="config" element={<Navigate to="/admin/landing" replace />} />
        </Route>
      </Route>

      {/* 5. Fallback 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { CartProvider } from './context/CartContext';
import { ProductDrawerProvider } from './context/ProductDrawerContext';
import { CheckoutDrawerProvider } from './context/CheckoutDrawerContext';
import CartDrawer from './components/ui/CartDrawer';
import ProductDrawer from './components/ui/ProductDrawer';
import CheckoutDrawer from './components/ui/CheckoutDrawer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SiteConfigProvider>
        <CartProvider>
          <ProductDrawerProvider>
            <CheckoutDrawerProvider>
              <AppRoutes />
              <CartDrawer />
              <ProductDrawer />
              <CheckoutDrawer />
              <ToastContainer 
                position="top-center" 
                autoClose={3000} 
                hideProgressBar={false} 
                theme="light" 
                toastClassName="bg-white text-gray-900 border border-gray-100 font-sans shadow-md rounded-xl"
              />
            </CheckoutDrawerProvider>
          </ProductDrawerProvider>
        </CartProvider>
        </SiteConfigProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
