import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  X,
  Home,
  BookOpen,
  FileText,
  Users,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/user/dashboard", icon: Home },
  { name: "Trainings", href: "/user/dashboard/courses", icon: BookOpen },
  { name: "BluePrints", href: "/user/dashboard/ebooks", icon: FileText },
  { name: "Affiliate", href: "/user/dashboard/affiliate", icon: Users },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { logout, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b">
        <h1 className="text-xl font-bold">Learn & Grow</h1>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = window.location.pathname === item.href;
            return (
              <Button
                key={item.name}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2 ",
                  isActive && "bg-blue-600 text-white hover:bg-blue-600"
                )}
                onClick={() => {
                  navigate(item.href);
                  setIsMobileMenuOpen(false);
                }}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Button>
            );
          })}

          {/* Admin Dashboard Button */}
          {isAdmin && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              onClick={() => {
                navigate("/admin/dashboard");
                setIsMobileMenuOpen(false);
              }}
            >
              <Shield className="w-5 h-5" />
              Admin Dashboard
            </Button>
          )}
        </nav>
      </ScrollArea>

      {/* Logout Button */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between h-16 px-4 border-b">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <NavContent />
          </SheetContent>
        </Sheet>
        <h1 className="text-xl font-bold">Learn & Grow</h1>
        <div className="w-10" /> {/* Spacer for balance */}
      </header>

      <div className="flex h-[calc(100vh-4rem)] lg:h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r">
          <NavContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container px-4 mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
