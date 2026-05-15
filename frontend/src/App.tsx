import { useEffect } from "react";
import { Navigate, Outlet, Route, Routes, useParams } from "react-router-dom";

import { MainLayout } from "./components/layout/main-layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminCategoriesPage } from "./pages/admin/categories-page";
import { AdminDashboardPage } from "./pages/admin/dashboard-page";
import { AdminFlaggedChatsPage } from "./pages/admin/flagged-chats-page";
import { AdminProvidersPage } from "./pages/admin/providers-page";
import { LoginPage } from "./pages/auth/login-page";
import { RegisterPage } from "./pages/auth/register-page";
import { CustomerAddresses } from "./pages/customer/CustomerAddresses";
import { CustomerSupport } from "./pages/customer/CustomerSupport";
import { CategoriesPage } from "./pages/customer/categories-page";
import { CustomerBookingsPage } from "./pages/customer/bookings-page";
import { CustomerChatPage } from "./pages/customer/chat-page";
import { ChatLauncherPage } from "./pages/customer/chat-launcher-page";
import { CustomerDashboardPage } from "./pages/customer/dashboard-page";
import { HomePage } from "./pages/customer/home-page";
import { CustomerProfilePage } from "./pages/customer/profile-page";
import { PaymentPage } from "./pages/customer/PaymentPage";
import { PaymentSuccessPage } from "./pages/customer/PaymentSuccessPage";
import { PaymentsPage } from "./pages/Payments";
import { ServicesPage } from "./pages/customer/services-page";
import { ServiceDetailPage } from "./pages/customer/ServiceDetail";
import { NotFoundPage } from "./pages/not-found-page";
import { NotificationsPage } from "./pages/notifications/NotificationsPage";
import { SupportDashboardPage } from "./pages/support/SupportDashboardPage.tsx";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderSuccessPage } from "./pages/OrderSuccessPage";
import { ProviderOnboarding } from "./provider/pages/ProviderOnboarding.jsx";
import { ProviderDashboard } from "./provider/pages/ProviderDashboard.jsx";
import { ProviderBookings } from "./provider/pages/ProviderBookings.jsx";
import { AddService } from "./provider/pages/AddService.jsx";
import { ProviderEarnings } from "./provider/pages/ProviderEarnings.jsx";
import { ProviderMessages } from "./provider/pages/ProviderMessages.jsx";
import { ProviderAvailability } from "./provider/pages/ProviderAvailability.jsx";
import { ProviderReviews } from "./provider/pages/ProviderReviews.jsx";
import { ProviderProfile } from "./provider/pages/ProviderProfile.jsx";
import { ProviderPayments } from "./provider/pages/ProviderPayments.jsx";
import { ProviderSettings } from "./provider/pages/ProviderSettings.jsx";
import { ProviderServicesPage } from "./pages/provider/services-page";
import { useAuthStore } from "./store/authStore";
import { useServiceStore } from "./store/serviceStore";
import { getDashboardPathForRole } from "./utils/routes";

function App() {
  const { loadProfile } = useAuthStore();
  const { fetchCategories, fetchServices } = useServiceStore();

  useEffect(() => {
    void loadProfile();
    void fetchCategories();
    void fetchServices();
  }, [loadProfile, fetchCategories, fetchServices]);

  return (
    <Routes>
      <Route
        path="/provider/onboarding"
        element={
          <ProtectedRoute roles={["PROVIDER"]}>
            <ProviderOnboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/dashboard"
        element={
          <ProtectedRoute roles={["PROVIDER"]}>
            <ProviderDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/bookings"
        element={
          <ProtectedRoute roles={["PROVIDER"]}>
            <ProviderBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/services"
        element={
          <ProtectedRoute roles={["PROVIDER"]}>
            <ProviderServicesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/add-service"
        element={
          <ProtectedRoute roles={["PROVIDER"]}>
            <AddService />
          </ProtectedRoute>
        }
      />
      <Route path="/provider/services/new" element={<Navigate to="/provider/add-service" replace />} />
      <Route
        path="/provider/services/edit/:id"
        element={
          <ProtectedRoute roles={["PROVIDER"]}>
            <AddService />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/earnings"
        element={
          <ProtectedRoute roles={["PROVIDER"]}>
            <ProviderEarnings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/messages"
        element={
          <ProtectedRoute roles={["PROVIDER"]}>
            <ProviderMessages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/availability"
        element={
          <ProtectedRoute roles={["PROVIDER"]}>
            <ProviderAvailability />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/reviews"
        element={
          <ProtectedRoute roles={["PROVIDER"]}>
            <ProviderReviews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/profile"
        element={
          <ProtectedRoute roles={["PROVIDER"]}>
            <ProviderProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/payments"
        element={
          <ProtectedRoute roles={["PROVIDER"]}>
            <ProviderPayments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/settings"
        element={
          <ProtectedRoute roles={["PROVIDER"]}>
            <ProviderSettings />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <MainLayout>
            <Outlet />
          </MainLayout>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleDashboardRedirect />
            </ProtectedRoute>
          }
        />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServiceDetailPage />} />
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <PaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/:id"
          element={
            <ProtectedRoute>
              <LegacyBookingRedirect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/:bookingId"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/success"
          element={
            <ProtectedRoute>
              <PaymentSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success/:bookingId"
          element={
            <ProtectedRoute>
              <OrderSuccessPage />
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
          path="/customer/bookings/:id"
          element={
            <ProtectedRoute roles={["CUSTOMER"]}>
              <CustomerBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/addresses"
          element={
            <ProtectedRoute roles={["CUSTOMER"]}>
              <CustomerAddresses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/support"
          element={
            <ProtectedRoute roles={["CUSTOMER"]}>
              <CustomerSupport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute roles={["CUSTOMER"]}>
              <ChatLauncherPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/chat"
          element={
            <ProtectedRoute roles={["CUSTOMER"]}>
              <ChatLauncherPage />
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
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
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
        <Route
          path="/support/dashboard"
          element={
            <ProtectedRoute roles={["SUPPORT_AGENT", "ADMIN"]}>
              <SupportDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;

function RoleDashboardRedirect() {
      <Route
        path="/provider/chat"
        element={
          <ProtectedRoute roles={["PROVIDER"]}>
            <ProviderMessages />
          </ProtectedRoute>
        }
      />
  const { user } = useAuthStore();
  if (user?.role === "PROVIDER") {
    const key = `provider_onboarding_done_${localStorage.getItem("accessToken") || "default"}`;
    const completed = localStorage.getItem(key) === "true";
    return <Navigate to={completed ? "/provider/dashboard" : "/provider/onboarding"} replace />;
  }
  return <Navigate to={getDashboardPathForRole(user?.role)} replace />;
}

function LegacyBookingRedirect() {
  const { id } = useParams();
  if (!id) {
    return <Navigate to="/services" replace />;
  }
  return <Navigate to={`/checkout?serviceId=${id}`} replace />;
}
