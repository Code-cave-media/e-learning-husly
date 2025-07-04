import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
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
import EbookViewPage from "./pages/userDashboard/EbookViewPage";
import toast, { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import AdminDashboard from "./pages/adminDashboard/Dashboard";
import EbooksManagement from "./pages/adminDashboard/EbooksManagement";
import CoursesManagement from "./pages/adminDashboard/CoursesManagement";
import WithdrawalsManagement from "./pages/adminDashboard/WithdrawalsManagement";
import UsersManagement from "./pages/adminDashboard/UsersManagement";
import TransactionsManagement from "./pages/adminDashboard/TransactionsManagement";
import PurchasesManagement from "./pages/adminDashboard/PurchasesManagement";
import UserCourseDetailPage from "./pages/userDashboard/CourseDetailPage";
import AdminEbookDetailPage from "./pages/adminDashboard/EbookDetailPage";
import LandingPage from "./pages/Landing";
import CouponsManagement from "./pages/adminDashboard/CouponsManagement";
import Checkout from "./pages/Checkout";
import { useAPICall } from "./hooks/useApiCall";
import { API_ENDPOINT } from "./config/backend";
import LearningPage from "./pages/LearningPage";
import { ConfirmDialog } from "primereact/confirmdialog";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css"; // Required base CSS
import "primeicons/primeicons.css"; // Required for icons
import UserDashboardCoursesPage from "./pages/userDashboard/CoursesPage";
import UserDashboardEbooksPage from "./pages/userDashboard/EbooksPage";
import PaymentVerification from "./pages/PaymentVerification";

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
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/user/dashboard" replace />;
  }
  return <>{children}</>;
};

// Public Route component - redirects to dashboard if authenticated
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const pathname = useLocation().pathname;
  if (isAuthenticated) {
    return <Navigate to="/user/dashboard" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isCheckedUser } = useAuth();
  useEffect(() => {
    // const script = document.createElement("script");
    // script.src = "https://checkout.razorpay.com/v1/checkout.js";
    // script.async = true;
    // document.body.appendChild(script);
    // const script = document.createElement("script");
    // script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    // script.async = true;
    // script.onload = () => {
    //   console.log("Cashfree v3 SDK loaded");
    // };
    // script.onerror = () => {
    //   toast.error("Failed to load Cashfree payment system.");
    // };
    // document.body.appendChild(script);
    // console.log(new window.Cashfree);
  }, []);
  console.log(isCheckedUser);
  if (!isCheckedUser) {
    console.log('enter')
    return <LoadingScreen />;
  }
  console.log('reenter');
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
      {/* <Route
        path="/affiliate-program"
        element={
          <PublicRoute>
            <MainLayout>
              <AffiliateProgramPage />
            </MainLayout>
          </PublicRoute>
        }
      /> */}
      <Route
        path="/learning"
        element={
          <PublicRoute>
            <MainLayout>
              <LearningPage />
            </MainLayout>
          </PublicRoute>
        }
      />
      {/* <Route
        path="/course/:id"
        element={
          <MainLayout>
            <CourseDetailPage />
          </MainLayout>
        }
      /> */}
      {/* <Route
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
      /> */}
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
      <Route path="/landing/:type/:id" element={<LandingPage />} />
      <Route path="/checkout/:type/:id" element={<Checkout />} />
      <Route path="/payment-verification" element={<PaymentVerification />} />

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
            <UserCourseDetailPage />
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
              <UserDashboardCoursesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/dashboard/ebooks"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <UserDashboardEbooksPage />
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
        path="/course/watch/:courseId"
        element={
          <ProtectedRoute>
            
            <CourseWatchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ebook/read/:ebookId"
        element={
          <ProtectedRoute>
            <EbookViewPage />
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
        path="/admin/dashboard/coupons"
        element={
          <AdminRoute>
            <AdminLayout>
              <CouponsManagement />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/dashboard/course/:id"
        element={
          <AdminRoute>
            <AdminCourseDetailPage />
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
        path="/admin/dashboard/ebook/:id"
        element={
          <AdminRoute>
            <AdminEbookDetailPage />
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

const UserVerification = ({ children }) => {
  const navigate = useNavigate();
  const { makeApiCall } = useAPICall();
  const [fetching, setFetching] = useState(false);
  const { authToken, login, setIsCheckedUser } = useAuth();
  useEffect(() => {
    const checkUser = async () => {
      if (authToken) {
        const response = await makeApiCall(
          "GET",
          API_ENDPOINT.VERIFY_USER,
          null,
          "application/json",
          authToken
        );
        if (response.status === 200) {
          const user = response.data;
          login(user);
        } else {
          // if (
          //   !(
          //     pathname in
          //     [
          //       "/",
          //       "/login",
          //       "/learning",
          //       "/landing/:type/:id",
          //       "/checkout/:type/:id",
          //     ]
          //   )
          // ) {
          //   navigate("/login");
          // }
        }
      }
      setIsCheckedUser(true);
      setFetching(false);
    };
    checkUser();
  }, []);
  if (fetching) {
    return <LoadingScreen />;
  }
  return <>{children}</>;
};
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-center" />
      <AuthProvider>
        <Router>
          <UserVerification>
            <ConfirmDialog draggable={false} />
            <AppRoutes />
          </UserVerification>
        </Router>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
