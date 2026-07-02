/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Header'; 
import Footer from './components/Footer';
import SearchPage from './pages/search';
import Blog from './pages/Blog';
import BlogPostPage from './pages/BlogPostPage';
import DynamicPage from './pages/DynamicPage';
import AdminLayout from './pages/admin/AdminLayout';
import HomePage from './pages/HomePage'; 
import CheckoutPage from './pages/CheckoutPage';
import CartPage from './pages/CartPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import MyReservationsPage from './pages/customer/MyReservationsPage';
import VendorLogin from './pages/vendor/VendorLogin';
import VendorDashboard from './pages/vendor/VendorDashboard';
import { homePage } from './data/pages/home'; 
import { pageService } from './services/pageService'; // 💡 引入 service 來讀取動態資料

// ==================== 後台管理組件引入 ====================
import AdminDashboard from './pages/admin/AdminDashboard'; 
import NavigationEditor from './pages/admin/NavigationEditor'; 
import PageList from './pages/admin/PageList'; 
import PageEditor from './pages/admin/PageEditor'; 
import ArticleList from './pages/admin/ArticleList';
import ArticleEditor from './pages/admin/ArticleEditor';
import FormList from './pages/admin/FormList'; 
import FormEditor from './pages/admin/FormEditor'; 
import FormSubmissions from './pages/admin/FormSubmissions'; 
import AppointmentManagement from './pages/admin/AppointmentManagement';
import ConsultationRecords from './pages/admin/ConsultationRecords';
import UserManagement from './pages/admin/UserManagement';
import VendorManagement from './pages/admin/VendorManagement';
import VendorApplicationManagement from './pages/admin/VendorApplicationManagement';
import VendorEditor from './pages/admin/VendorEditor';
import FinanceManagement from './pages/admin/FinanceManagement';
import ProductList from './pages/admin/ProductList';
import ProductEditor from './pages/admin/ProductEditor';
import OrderList from './pages/admin/OrderList';
import OrderDetail from './pages/admin/OrderDetail';
import PermissionManagement from './pages/admin/PermissionManagement';
import PermissionEditor from './pages/admin/editors/PermissionEditor';
import SystemSettings from './pages/admin/SystemSettings';
import EmailManagement from './pages/admin/EmailManagement';
import EmailEditor from './pages/admin/editors/EmailEditor';
import MediaLibrary from './pages/admin/MediaLibrary';
import PermissionGuard from './components/PermissionGuard';

// 前台佈局
const MainLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Header /> 
    <main className="flex-grow">
      <Outlet /> 
    </main>
    <Footer />
  </div>
);

// 💡 建立一個包裝組件，確保首頁能讀取到後台儲存的資料
const HomePageWrapper = () => {
  // 優先從 pageService 抓取資料
  const allPages = pageService.getAll();
  const dynamicHomeData = allPages.find(p => p.template === 'HOME');
  
  // 如果後台有存過首頁資料就用後台的，否則用預設的靜態檔
  return <HomePage page={dynamicHomeData || homePage} />;
};

import FormPage from './pages/FormPage';
import ProtectedRoute from './components/ProtectedRoute';
import PaymentPage from './pages/customer/PaymentPage';
import EasyCardPartnerPage from './pages/partner/EasyCardPartnerPage';

export default function App() {
  return (
    <Routes>
      {/* 1. 後台管理：保持高優先權 */}
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<PermissionGuard permission="users"><UserManagement /></PermissionGuard>} />
        <Route path="vendors" element={<PermissionGuard permission="vendors"><VendorManagement /></PermissionGuard>} />
        <Route path="vendor-applications" element={<PermissionGuard permission="vendors"><VendorApplicationManagement /></PermissionGuard>} />
        <Route path="vendors/:id" element={<PermissionGuard permission="vendors"><VendorEditor /></PermissionGuard>} />
        <Route path="finance" element={<PermissionGuard permission="finance"><FinanceManagement /></PermissionGuard>} />
        <Route path="permissions" element={<PermissionGuard permission="permissions"><PermissionManagement /></PermissionGuard>} />
        <Route path="permissions/:id" element={<PermissionGuard permission="permissions"><PermissionEditor /></PermissionGuard>} />
        <Route path="navigation" element={<PermissionGuard permission="navigation"><NavigationEditor /></PermissionGuard>} />

        <Route path="pages" element={<PermissionGuard permission="pages"><PageList /></PermissionGuard>} />
        <Route path="pages/:slug" element={<PermissionGuard permission="pages"><PageEditor /></PermissionGuard>} /> 
        <Route path="pages/new" element={<PermissionGuard permission="pages"><PageEditor /></PermissionGuard>} />

        <Route path="products" element={<PermissionGuard permission="products"><ProductList /></PermissionGuard>} />
        <Route path="products/:id" element={<PermissionGuard permission="products"><ProductEditor /></PermissionGuard>} />
        <Route path="products/new" element={<PermissionGuard permission="products"><ProductEditor /></PermissionGuard>} />
        <Route path="orders" element={<PermissionGuard permission="orders"><OrderList /></PermissionGuard>} />
        <Route path="orders/:id" element={<PermissionGuard permission="orders"><OrderDetail /></PermissionGuard>} />

        <Route path="articles" element={<PermissionGuard permission="articles"><ArticleList /></PermissionGuard>} />
        <Route path="articles/:slug" element={<PermissionGuard permission="articles"><ArticleEditor /></PermissionGuard>} />
        <Route path="articles/new" element={<PermissionGuard permission="articles"><ArticleEditor /></PermissionGuard>} />

        <Route path="forms" element={<PermissionGuard permission="forms"><FormList /></PermissionGuard>} />
        <Route path="forms/:id" element={<PermissionGuard permission="forms"><FormEditor /></PermissionGuard>} />
        <Route path="forms/new" element={<PermissionGuard permission="forms"><FormEditor /></PermissionGuard>} />

        <Route path="appointments" element={<PermissionGuard permission="appointments"><AppointmentManagement /></PermissionGuard>} />
        <Route path="consultations" element={<PermissionGuard permission="consultations"><ConsultationRecords /></PermissionGuard>} />
        <Route path="bookings" element={<PermissionGuard permission="forms"><FormSubmissions /></PermissionGuard>} />
        <Route path="media" element={<PermissionGuard permission="media"><MediaLibrary /></PermissionGuard>} />
        <Route path="settings" element={<PermissionGuard permission="settings"><SystemSettings /></PermissionGuard>} />
        <Route path="emails" element={<PermissionGuard permission="emails"><EmailManagement /></PermissionGuard>} />
        <Route path="emails/:id" element={<PermissionGuard permission="emails"><EmailEditor /></PermissionGuard>} />
      </Route>

      {/* 廠商專區路由 - 獨立於 MainLayout */}
      <Route path="/vendor/login" element={<VendorLogin />} />
      <Route path="/vendor/:vendorId" element={<VendorDashboard />} />

      {/* 合作夥伴專屬隱藏頁面 - 獨立於 MainLayout */}
      <Route path="/partner/easycard" element={<EasyCardPartnerPage />} />

      {/* 2. 前台路由 */}
      <Route element={<MainLayout />}>
        {/* 💡 修改這裡：將原本的 homePage 換成動態的 HomePageWrapper */}
        <Route path="/" element={<HomePageWrapper />} />
        
        {/* 獨立表單頁面 */}
        <Route path="/forms/:formId" element={<FormPage />} />
        
        {/* 專屬付款頁面 */}
        <Route path="/payment/:orderId" element={<PaymentPage />} />

        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
        <Route path="/profile/orders" element={<OrderHistoryPage />} />
        <Route path="/profile/reservations" element={<MyReservationsPage />} />
        <Route path="/profile/settings" element={<ProfileSettingsPage />} />
        
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/search" element={<SearchPage />} />

        <Route path="/:slug" element={<DynamicPage />} />
        <Route path="/:category/:slug" element={<DynamicPage />} />
      </Route>
    </Routes>
  );
}
