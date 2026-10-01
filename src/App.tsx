import React from 'react';
import { RouterProvider, useRouter } from './context/RouterContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { SellerProvider } from './context/SellerContext';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { OrderProvider } from './context/OrderContext';
import { ReviewProvider } from './context/ReviewContext';
import { SupportProvider } from './context/SupportContext';
import { BrowsingHistoryProvider } from './context/BrowsingHistoryContext';
import { NotificationProvider } from './context/NotificationContext';
import { Layout } from './components/layout/Layout';

// Pages
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SearchPage } from './pages/SearchPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { WishlistPage } from './pages/WishlistPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AccountPage } from './pages/AccountPage';
import { CustomerServicePage } from './pages/CustomerServicePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { SellLandingPage } from './pages/SellLandingPage';
import { SellerRegisterPage } from './pages/SellerRegisterPage';
import { SellerLoginPage } from './pages/SellerLoginPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { OrderVerifyPage } from './pages/OrderVerifyPage';

import { AdminSettingsProvider } from './context/AdminSettingsContext';

const AppContent: React.FC = () => {
  const { path } = useRouter();

  // Parse paths
  const renderRoute = () => {
    // 1. Home
    if (path === '/' || path === '') {
      return <HomePage />;
    }

    // 2. All Products
    if (path === '/products') {
      return <ProductsPage />;
    }

    // 3. Category Page: /category/[categorySlug]
    if (path.startsWith('/category/')) {
      const slug = path.replace('/category/', '').split('/')[0];
      return <CategoryPage categorySlug={slug} />;
    }

    // 4. Product Details: /products/[slug]
    if (path.startsWith('/products/')) {
      const slug = path.replace('/products/', '').split('/')[0];
      return <ProductDetailPage slug={slug} />;
    }

    // 5. Search
    if (path === '/search') {
      return <SearchPage />;
    }

    // 6. Cart
    if (path === '/cart') {
      return <CartPage />;
    }

    // 7. Checkout
    if (path === '/checkout') {
      return <CheckoutPage />;
    }

    // 8. Order Success
    if (path === '/order-success') {
      return <OrderSuccessPage />;
    }

    // 8b. Order QR Verification
    if (path.startsWith('/order/verify')) {
      return <OrderVerifyPage />;
    }

    // 9. Wishlist
    if (path === '/wishlist') {
      return <WishlistPage />;
    }

    // 10. Customer Login & Register
    if (path === '/login') {
      return <LoginPage />;
    }
    if (path === '/register') {
      return <RegisterPage />;
    }

    // 11. Customer Account
    if (path === '/account') {
      return <AccountPage initialTab="overview" />;
    }
    if (path === '/account/orders') {
      return <AccountPage initialTab="orders" />;
    }
    if (path === '/account/addresses') {
      return <AccountPage initialTab="addresses" />;
    }

    // 12. Sell on CARTPLUS Portal
    if (path === '/seller' || path === '/sell') {
      return <SellLandingPage />;
    }
    if (path === '/seller/register') {
      return <SellerRegisterPage />;
    }
    if (path === '/seller/login') {
      return <SellerLoginPage />;
    }
    if (path === '/seller/dashboard') {
      return <SellerDashboardPage />;
    }

    // 13. Customer Service & Support Requests
    if (path === '/customer-service' || path.startsWith('/customer-service/')) {
      return <CustomerServicePage />;
    }

    // 14. Admin / Staff Portal
    if (path === '/admin/login') {
      return <AdminLoginPage />;
    }
    if (path === '/admin' || path.startsWith('/admin/')) {
      return <AdminDashboardPage />;
    }

    // Default Fallback
    return <HomePage />;
  };

  return <Layout>{renderRoute()}</Layout>;
};

export default function App() {
  return (
    <RouterProvider>
      <ToastProvider>
        <AuthProvider>
          <AdminSettingsProvider>
            <SellerProvider>
              <ProductProvider>
                <CartProvider>
                  <WishlistProvider>
                    <OrderProvider>
                      <ReviewProvider>
                        <SupportProvider>
                          <BrowsingHistoryProvider>
                            <NotificationProvider>
                              <AppContent />
                            </NotificationProvider>
                          </BrowsingHistoryProvider>
                        </SupportProvider>
                      </ReviewProvider>
                    </OrderProvider>
                  </WishlistProvider>
                </CartProvider>
              </ProductProvider>
            </SellerProvider>
          </AdminSettingsProvider>
        </AuthProvider>
      </ToastProvider>
    </RouterProvider>
  );
}
