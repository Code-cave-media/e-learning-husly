import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import DashboardLayout from "./components/layout/DashboardLayout";
import AdminLayout from "./components/layout/AdminLayout";
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import AdminCourseDetailPage from "./pages/adminDashboard/CourseDetailPage";

import EbooksPage from "./pages/EbooksPage";
import EbookDetailPage from "./pages/EbookDetailPage";
import AffiliateDashboardPage from "./pages/userDashboard/AffiliateDashboardPage";
import DashboardPage from "./pages/userDashboard/DashboardPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import AffiliateProgramPage from "./pages/AffiliateProgramPage";
import CourseWatchPage from "./pages/userDashboard/CourseWatchPage";
import EbookViewPage from "./pages/EbookViewPage";
import { Toast } from "@radix-ui/react-toast";
import toast, { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import AdminDashboard from "./pages/adminDashboard/Dashboard";
import EbooksManagement from "./pages/adminDashboard/EbooksManagement";
import CoursesManagement from "./pages/adminDashboard/CoursesManagement";
import WithdrawalsManagement from "./pages/adminDashboard/WithdrawalsManagement";
import UsersManagement from "./pages/adminDashboard/UsersManagement";
import TransactionsManagement from "./pages/adminDashboard/TransactionsManagement";
import PurchasesManagement from "./pages/adminDashboard/PurchasesManagement";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Admin Route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Public Route component - redirects to dashboard if authenticated
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <MainLayout>
              <HomePage />
            </MainLayout>
          </PublicRoute>
        }
      />
      <Route
        path="/affiliate-program"
        element={
          <PublicRoute>
            <MainLayout>
              <AffiliateProgramPage />
            </MainLayout>
          </PublicRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <PublicRoute>
            <MainLayout>
              <CoursesPage />
            </MainLayout>
          </PublicRoute>
        }
      />
      <Route
        path="/course/:id"
        element={
          <MainLayout>
            <CourseDetailPage />
          </MainLayout>
        }
      />
      <Route
        path="/ebooks"
        element={
          <PublicRoute>
            <MainLayout>
              <EbooksPage />
            </MainLayout>
          </PublicRoute>
        }
      />
      <Route
        path="/ebook/:id"
        element={
          <MainLayout>
            <EbookDetailPage />
          </MainLayout>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <MainLayout>
              <LoginPage />
            </MainLayout>
          </PublicRoute>
        }
      />

      {/* Protected Dashboard Routes */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/dashboard/course/:id"
        element={
          <ProtectedRoute>
            <CourseDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/dashboard/ebook/:id"
        element={
          <ProtectedRoute>
            <EbookDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/dashboard/courses"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CoursesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/dashboard/ebooks"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EbooksPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/dashboard/affiliate"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AffiliateDashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/course/:courseId/watch/:chapterId"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CourseWatchPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ebook/:ebookId/read"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EbookViewPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/dashboard/courses"
        element={
          <AdminRoute>
            <AdminLayout>
              <CoursesManagement />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/dashboard/course/:id"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminCourseDetailPage />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/dashboard/ebooks"
        element={
          <AdminRoute>
            <AdminLayout>
              <EbooksManagement />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/dashboard/withdrawals"
        element={
          <AdminRoute>
            <AdminLayout>
              <WithdrawalsManagement />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/dashboard/users"
        element={
          <AdminRoute>
            <AdminLayout>
              <UsersManagement />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/dashboard/transactions"
        element={
          <AdminRoute>
            <AdminLayout>
              <TransactionsManagement />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/dashboard/purchases"
        element={
          <AdminRoute>
            <AdminLayout>
              <PurchasesManagement />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-center" />
      <AuthProvider>
        <Router>
          <LoadingScreen />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
