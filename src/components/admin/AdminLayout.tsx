import React, { useCallback, memo, startTransition, useEffect } from "react";
import { useNavigate, useLocation, Link } from '@/lib/navigation-compat';
import { Button } from "@/components/ui/button";
import {
  Home,
  Package,
  Grid3x3,
  Star,
  Image as ImageIcon,
  Settings,
  LogOut,
  Flower2,
  Box,
  Sparkles,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAdminPrefetch } from "@/hooks/useAdminPrefetch";

const GOLD_COLOR = "rgb(199, 158, 72)";

interface NavItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  badge?: number;
}

const navigationItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, path: '/admin/dashboard' },
  { id: 'products', label: 'Products', icon: Package, path: '/admin/products' },
  { id: 'clients', label: 'Clients', icon: Users, path: '/admin/clients' },
  { id: 'signature', label: 'Signature', icon: Star, path: '/admin/signature-collection' },
  { id: 'eternal', label: 'Eternal Flowers', icon: Sparkles, path: '/admin/eternal-flowers' },
  { id: 'wedding', label: 'Wedding', icon: ImageIcon, path: '/admin/wedding-creations' },
  { id: 'flowers', label: 'Flowers', icon: Flower2, path: '/admin/flowers' },
  { id: 'boxes', label: 'Luxury Boxes', icon: Box, path: '/admin/boxes' },
  { id: 'accessories', label: 'Accessories', icon: Grid3x3, path: '/admin/accessories' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayoutComponent: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Enable route prefetching for faster navigation
  const { prefetchRoute } = useAdminPrefetch();

  // Expose prefetch function globally for navigation items
  useEffect(() => {
    (window as any).__adminPrefetch = prefetchRoute;
    return () => {
      delete (window as any).__adminPrefetch;
    };
  }, [prefetchRoute]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("adminAuthenticated");
    localStorage.removeItem("adminUsername");
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/admin/login");
  }, [navigate, toast]);

  const handleNavigation = useCallback((path: string, e: React.MouseEvent) => {
    // Prevent navigation if already on that page
    if (location.pathname === path) {
      e.preventDefault();
      return;
    }
    // Use startTransition for smoother navigation
    startTransition(() => {
      // React Router Link will handle the actual navigation
    });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 overflow-x-hidden">
      {/* Left Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col w-20 bg-white border-r border-gray-200 shadow-sm fixed h-screen z-50 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center justify-center h-20 border-b border-gray-200">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
            }}
            onClick={() => navigate('/admin/dashboard')}
          >
            <Flower2 className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col items-center py-8 space-y-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            // Improved active state detection for all admin routes
            const isActive = location.pathname === item.path ||
                           (item.path === '/admin/products' && location.pathname.startsWith('/admin/products')) ||
                           (item.path === '/admin/clients' && location.pathname.startsWith('/admin/clients')) ||
                           ((item.path !== '/admin/products' && item.path !== '/admin/clients') && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-150 group ${
                  isActive
                    ? 'bg-gradient-to-br from-primary/20 to-primary/10 shadow-md'
                    : 'hover:bg-gray-100 active:bg-gray-200'
                }`}
                onClick={(e) => handleNavigation(item.path, e)}
                onMouseEnter={() => {
                  // Prefetch route data on hover
                  const prefetchFn = (window as any).__adminPrefetch;
                  if (prefetchFn) prefetchFn(item.path);
                }}
                onFocus={() => {
                  // Prefetch route data on focus (keyboard navigation)
                  const prefetchFn = (window as any).__adminPrefetch;
                  if (prefetchFn) prefetchFn(item.path);
                }}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-primary' : 'text-gray-600 group-hover:text-primary'
                  }`}
                />
                {isActive && (
                  <div className="absolute left-0 w-1 h-8 bg-primary rounded-r-full" />
                )}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
                {/* Tooltip */}
                <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="flex items-center justify-center pb-8">
          <button
            onClick={handleLogout}
            className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-red-50 transition-colors duration-200 group"
          >
            <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
            <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
              Logout
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-20 w-full min-w-0 overflow-x-hidden">
        <div className="w-full h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const AdminLayout = memo(AdminLayoutComponent);
