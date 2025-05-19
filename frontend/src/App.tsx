import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
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
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";

import EbooksPage from "./pages/EbooksPage";
import EbookDetailPage from "./pages/EbookDetailPage";
import AffiliateDashboardPage from "./pages/AffiliateDashboardPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import AffiliateProgramPage from "./pages/AffiliateProgramPage";
import CourseWatchPage from "./pages/CourseWatchPage";
import EbookViewPage from "./pages/EbookViewPage";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <MainLayout>
            <HomePage />
          </MainLayout>
        }
      />
      <Route
        path="/affiliate-program"
        element={
          <MainLayout>
            <AffiliateProgramPage />
          </MainLayout>
        }
      />
      <Route
        path="/courses"
        element={
          <MainLayout>
            <CoursesPage />
          </MainLayout>
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
        path="/ebooks"
        element={
          <MainLayout>
            <EbooksPage />
          </MainLayout>
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
        path="/ebook/:ebookId/read"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EbookViewPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={
          <MainLayout>
            <LoginPage />
          </MainLayout>
        }
      />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/courses"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CoursesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/ebooks"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EbooksPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/affiliate"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AffiliateDashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <Router>
          <Toaster position="top-right" />
          <LoadingScreen />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
