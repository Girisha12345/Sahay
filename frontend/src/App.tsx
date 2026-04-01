import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { MainLayout } from "./components/layout/main-layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminCategoriesPage } from "./pages/admin/categories-page";
import { AdminDashboardPage } from "./pages/admin/dashboard-page";
import { AdminFlaggedChatsPage } from "./pages/admin/flagged-chats-page";
import { AdminProvidersPage } from "./pages/admin/providers-page";
import { LoginPage } from "./pages/auth/login-page";
import { RegisterPage } from "./pages/auth/register-page";
import { BookingPage } from "./pages/customer/booking-page";
import { CategoriesPage } from "./pages/customer/categories-page";
import { CustomerBookingsPage } from "./pages/customer/bookings-page";
import { CustomerChatPage } from "./pages/customer/chat-page";
import { CustomerDashboardPage } from "./pages/customer/dashboard-page";
import { HomePage } from "./pages/customer/home-page";
import { CustomerProfilePage } from "./pages/customer/profile-page";
import { ServicesPage } from "./pages/customer/services-page";
import { NotFoundPage } from "./pages/not-found-page";
import { ProviderBookingsPage } from "./pages/provider/bookings-page";
import { ProviderDashboardPage } from "./pages/provider/dashboard-page";
import { ProviderEarningsPage } from "./pages/provider/earnings-page";
import { ProviderProfilePage } from "./pages/provider/profile-page";
import { useAuthStore } from "./store/authStore";
import { useServiceStore } from "./store/serviceStore";

function App() {
  const { loadProfile } = useAuthStore();
  const { fetchCategories, fetchServices } = useServiceStore();

  useEffect(() => {
    void loadProfile();
    void fetchCategories();
    void fetchServices();
  }, [loadProfile, fetchCategories, fetchServices]);

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route
          path="/booking/:id"
          element={
            <ProtectedRoute roles={["CUSTOMER"]}>
              <BookingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute roles={["CUSTOMER"]}>
              <CustomerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/bookings"
          element={
            <ProtectedRoute roles={["CUSTOMER"]}>
              <CustomerBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute roles={["CUSTOMER"]}>
              <CustomerProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/chat/:bookingId"
          element={
            <ProtectedRoute roles={["CUSTOMER"]}>
              <CustomerChatPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/provider/dashboard"
          element={
            <ProtectedRoute roles={["PROVIDER"]}>
              <ProviderDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/bookings"
          element={
            <ProtectedRoute roles={["PROVIDER"]}>
              <ProviderBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/earnings"
          element={
            <ProtectedRoute roles={["PROVIDER"]}>
              <ProviderEarningsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/profile"
          element={
            <ProtectedRoute roles={["PROVIDER"]}>
              <ProviderProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminCategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/providers"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminProvidersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/flagged-chats"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminFlaggedChatsPage />
            </ProtectedRoute>
          }
        />

        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
