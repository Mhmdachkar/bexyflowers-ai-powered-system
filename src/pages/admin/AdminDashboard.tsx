import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  DollarSign,
  ShoppingCart,
  Heart,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Flower2,
  Users,
  Image as ImageIcon,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Percent,
  CheckCircle,
  XCircle,
  Calendar,
  Star,
  Box,
  Sparkles,
  ArrowRight,
  Activity,
  BarChart3,
  Grid3x3,
  LayoutGrid,
  Home,
  Bell,
  Search,
  ChevronRight,
  Eye,
  Clock,
  Zap,
  Target,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { encodeImageUrl } from "@/lib/imageUtils";
import { useCollectionProducts } from "@/hooks/useCollectionProducts";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { getCheckoutOrders } from "@/lib/api/checkout";
import type { CartItem } from "@/types/cart";

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
  { id: 'collection', label: 'Collection', icon: Grid3x3, path: '/collection' },
  { id: 'signature', label: 'Signature', icon: Star, path: '/admin/signature-collection' },
  { id: 'wedding', label: 'Wedding', icon: ImageIcon, path: '/admin/wedding-creations' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStock: 0,
    outOfStock: 0,
    soldOut: 0,
    seasonal: 0,
    totalFavorites: 0,
    totalCartAdditions: 0,
    activeDiscounts: 0,
    totalRevenue: "0.00", // Total revenue from ALL orders
    totalOrders: 0, // Total orders count (all time)
    todayOrders: 0,
    todayRevenue: "0.00",
    activeUsers: 0, // Today's unique clients
    totalClients: 0, // Total unique clients (all time)
  });
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [adminName, setAdminName] = useState("Rebecca");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availabilitySchedule, setAvailabilitySchedule] = useState<Record<string, { start: string; end: string }>>({});
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // ⚡ PERFORMANCE: Only fetch minimal data needed for dashboard
  const { data: productsData, isLoading: loadingProducts } = useCollectionProducts({ 
    isActive: true 
  });
  const products = productsData ?? [];

  // ⚡ PERFORMANCE: Fetch orders with longer cache time for dashboard
  const { data: orders = [] } = useQuery({
    queryKey: ['checkout-orders'],
    queryFn: getCheckoutOrders,
    staleTime: 5 * 60 * 1000, // 5 minutes cache for dashboard
    gcTime: 10 * 60 * 1000, // Keep cached for 10 minutes
  });

  // Load availability schedule from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ownerAvailabilitySchedule');
    if (saved) {
      try {
        setAvailabilitySchedule(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load availability schedule', e);
      }
    }
  }, []);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("adminAuthenticated");
    if (!isAuthenticated) {
      navigate("/admin/login");
      return;
    }
    const storedName = localStorage.getItem("adminUsername");
    if (storedName) setAdminName(storedName);
  }, [navigate]);

  useEffect(() => {
    if (!productsData || !productsData.length) return;
    const totalProducts = productsData.length;
    const inStock = productsData.filter((p) => !p.is_out_of_stock).length;
    const outOfStock = productsData.filter((p) => p.is_out_of_stock).length;
    const activeDiscounts = productsData.filter((p) => p.discount_percentage && p.discount_percentage > 0).length;
    // Note: totalRevenue is now calculated from actual orders, not product prices

    // Get favorites and cart additions from localStorage
    let totalFavorites = 0;
    let totalCartAdditions = 0;
    
    try {
      const favoritesData = localStorage.getItem("favorites");
      if (favoritesData) {
        const favorites = JSON.parse(favoritesData);
        totalFavorites = Array.isArray(favorites) ? favorites.length : 0;
      }
    } catch (e) {
      // Ignore errors
    }
    
    try {
      const cartData = localStorage.getItem("cart");
      if (cartData) {
        const cart = JSON.parse(cartData);
        totalCartAdditions = Array.isArray(cart) ? cart.length : 0;
      }
    } catch (e) {
      // Ignore errors
    }

    const recent = [...productsData]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 5)
      .map((p) => {
        const imageUrl = p.image_urls?.[0];
        return {
          id: p.id,
          name: p.title,
          price: p.price,
          image: imageUrl ? encodeImageUrl(imageUrl) : '',
          category: p.category || '',
          displayCategory: p.display_category || '',
          discount: p.discount_percentage || null,
          outOfStock: p.is_out_of_stock || false,
          soldOut: false,
          seasonal: false,
        };
      });

    setRecentProducts(recent);
    
    // Update product-related stats (revenue comes from orders, not products)
    setStats(prev => ({
      ...prev,
      totalProducts,
      inStock,
      outOfStock,
      soldOut: 0,
      seasonal: 0,
      totalFavorites: totalFavorites || 0,
      totalCartAdditions: totalCartAdditions || 0,
      activeDiscounts,
      // Revenue and order stats are calculated from orders, not here
    }));
    
    // Mock recent activity
    setRecentActivity([
      { type: 'order', message: 'New order #1234 received', time: '5 min ago', icon: ShoppingCart },
      { type: 'product', message: 'Product "Rose Bouquet" updated', time: '15 min ago', icon: Package },
      { type: 'user', message: '3 new users registered', time: '1 hour ago', icon: Users },
      { type: 'review', message: 'New 5-star review received', time: '2 hours ago', icon: Star },
    ]);
  }, [productsData]);

  // Calculate COMPLETE sales analytics from ALL orders
  useEffect(() => {
    if (!orders || orders.length === 0) {
      setStats(prev => ({
        ...prev,
        totalRevenue: "0.00",
        totalOrders: 0,
        todayOrders: 0,
        todayRevenue: "0.00",
        activeUsers: 0,
        totalClients: 0,
      }));
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter today's orders
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });

    // ===== CALCULATE TOTAL REVENUE (ALL ORDERS) =====
    // Total revenue from ALL orders (subtotal - this is the actual sales amount before delivery)
    let totalAllTimeRevenue = 0;
    let totalAllTimeFlowerRevenue = 0;
    let totalAllTimeAddOnsRevenue = 0;

    orders.forEach(order => {
      // Use subtotal as the main revenue (actual product sales)
      const orderSubtotal = order.subtotal || 0;
      totalAllTimeRevenue += orderSubtotal;

      // Separate flowers from accessories/add-ons by analyzing order_items
      if (order.order_items && Array.isArray(order.order_items)) {
        order.order_items.forEach((item: CartItem) => {
          const itemTotal = (item.price || 0) * (item.quantity || 1);
          
          // If item has accessories, estimate that accessories are ~20% of price (adjustable)
          // Otherwise, it's a flower product
          if (item.accessories && Array.isArray(item.accessories) && item.accessories.length > 0) {
            // Item has accessories - split the revenue
            // Base flower price (80% of item price)
            totalAllTimeFlowerRevenue += itemTotal * 0.8;
            // Accessories/add-ons (20% of item price)
            totalAllTimeAddOnsRevenue += itemTotal * 0.2;
          } else {
            // Pure flower product - 100% flower revenue
            totalAllTimeFlowerRevenue += itemTotal;
          }
        });
      } else {
        // Fallback: if no order_items breakdown, treat as flower revenue
        totalAllTimeFlowerRevenue += orderSubtotal;
      }
    });

    // ===== CALCULATE TODAY'S REVENUE =====
    let todayFlowerRevenue = 0;
    let todayAddOnsRevenue = 0;
    let todayTotalRevenue = 0;

    todayOrders.forEach(order => {
      const orderSubtotal = order.subtotal || 0;
      todayTotalRevenue += orderSubtotal;

      if (order.order_items && Array.isArray(order.order_items)) {
        order.order_items.forEach((item: CartItem) => {
          const itemTotal = (item.price || 0) * (item.quantity || 1);
          
          if (item.accessories && Array.isArray(item.accessories) && item.accessories.length > 0) {
            todayFlowerRevenue += itemTotal * 0.8;
            todayAddOnsRevenue += itemTotal * 0.2;
          } else {
            todayFlowerRevenue += itemTotal;
          }
        });
      } else {
        todayFlowerRevenue += orderSubtotal;
      }
    });

    // ===== CALCULATE CLIENT METRICS =====
    // Total unique clients (all time)
    const totalUniqueClients = new Set(
      orders
        .map(order => order.email?.toLowerCase().trim())
        .filter(Boolean)
    ).size;

    // Today's unique clients
    const todayUniqueClients = new Set(
      todayOrders
        .map(order => order.email?.toLowerCase().trim())
        .filter(Boolean)
    ).size;

    // Update stats with REAL sales data
    setStats(prev => ({
      ...prev,
      // Total revenue from ALL sales (this replaces the product-based calculation)
      totalRevenue: totalAllTimeRevenue.toFixed(2),
      // Total orders count (all time)
      totalOrders: orders.length,
      // Today's metrics
      todayOrders: todayOrders.length,
      todayRevenue: todayTotalRevenue.toFixed(2),
      // Active users = today's unique clients
      activeUsers: todayUniqueClients,
      // Total unique clients (all time)
      totalClients: totalUniqueClients,
    }));

    // Store detailed analytics for potential future use
    // You can add these to state if needed for more detailed breakdowns
    console.log('Sales Analytics:', {
      totalOrders: orders.length,
      totalRevenue: totalAllTimeRevenue,
      totalFlowerRevenue: totalAllTimeFlowerRevenue,
      totalAddOnsRevenue: totalAllTimeAddOnsRevenue,
      todayOrders: todayOrders.length,
      todayRevenue: todayTotalRevenue,
      totalUniqueClients,
      todayUniqueClients,
    });
  }, [orders]);

  const loading = loadingProducts;

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    localStorage.removeItem("adminUsername");
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/admin/login");
  };

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      gradient: "from-blue-500 to-blue-600",
      description: undefined,
    },
    {
      title: "In Stock",
      value: stats.inStock,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      gradient: "from-green-500 to-green-600",
      description: undefined,
    },
    {
      title: "Total Revenue",
      value: `$${parseFloat(stats.totalRevenue).toLocaleString()}`,
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      gradient: "from-yellow-500 to-yellow-600",
      description: "Estimated from products",
    },
    {
      title: "Active Discounts",
      value: stats.activeDiscounts,
      icon: Percent,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      gradient: "from-purple-500 to-purple-600",
      description: undefined,
    },
    {
      title: "Favorites",
      value: stats.totalFavorites,
      icon: Heart,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      gradient: "from-pink-500 to-pink-600",
      description: "From user interactions",
    },
    {
      title: "Cart Additions",
      value: stats.totalCartAdditions,
      icon: ShoppingCart,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      gradient: "from-orange-500 to-orange-600",
      description: "From user interactions",
    },
  ];

  const statusStats = [
    { label: "Out of Stock", value: stats.outOfStock, icon: XCircle, color: "text-red-600", bgColor: "bg-red-50" },
  ];

  const quickActions = [
    {
      title: "Add Product",
      description: "Create a new product",
      icon: Plus,
      onClick: () => navigate("/admin/products/new"),
      gradient: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
      color: "white",
    },
    {
      title: "Manage Products",
      description: "Edit existing products",
      icon: Edit,
      onClick: () => navigate("/admin/products"),
      gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      color: "white",
    },
    {
      title: "Signature Collection",
      description: "Manage featured items",
      icon: Star,
      onClick: () => navigate("/admin/signature-collection"),
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      color: "white",
    },
    {
      title: "View Collection",
      description: "See all products",
      icon: Grid3x3,
      onClick: () => navigate("/collection"),
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      color: "white",
    },
  ];

  const managementSections = [
    {
      title: "Clients & Orders",
      description: "Customer orders and contact information",
      items: [
        { title: "Clients", icon: Users, path: "/admin/clients", description: "Orders & contact info" },
      ],
    },
    {
      title: "Customization",
      description: "Manage customization options",
      items: [
        { title: "Luxury Boxes", icon: Box, path: "/admin/boxes", description: "Boxes, colors & sizes" },
        { title: "Flowers", icon: Flower2, path: "/admin/flowers", description: "Flower types & colors" },
        { title: "Accessories", icon: Sparkles, path: "/admin/accessories", description: "Manage accessories" },
      ],
    },
    {
      title: "Content",
      description: "Manage page content",
      items: [
        { title: "Wedding Creations", icon: ImageIcon, path: "/admin/wedding-creations", description: "Gallery photos" },
      ],
    },
  ];

  return (
    <AdminLayout>
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40 w-full">
          <div className="px-4 sm:px-6 lg:px-8 py-4 w-full max-w-full overflow-x-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
              <div className="flex-1 min-w-0">
                <motion.h1
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl sm:text-3xl font-bold text-gray-900 truncate"
                >
                  Hi, {adminName}!
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm text-gray-500 mt-1"
                >
                  Let's take a look at your activity today
                </motion.p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search for health data"
                    className="pl-10 w-48 lg:w-64 bg-gray-50 border-gray-200"
                  />
                </div>
                <Button
                  className="bg-gray-900 hover:bg-gray-800 text-white hidden sm:inline-flex"
                >
                  Upgrade
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full max-w-[1920px] mx-auto">
          {/* Top Row: Analytics Cards and Activity Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {/* Left: Today's Analytics Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Your Activity Results for Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative min-h-[260px] overflow-visible py-6">
                    {/* Visualization circles - three large, separated bubbles */}
                    <div className="flex items-center justify-center gap-10 lg:gap-16 h-full">
                      {/* Orders circle */}
                      <motion.div
                        initial={{ scale: 0, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                        className="w-40 h-40 sm:w-52 sm:h-52 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-2xl"
                      >
                        <div className="text-center text-white px-2">
                          <div className="text-2xl sm:text-3xl font-bold">{stats.todayOrders}</div>
                          <div className="text-xs sm:text-sm mt-1">Orders</div>
                        </div>
                      </motion.div>
                      
                      {/* Revenue circle */}
                      <motion.div
                        initial={{ scale: 0, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                        className="w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-red-400 via-pink-400 to-pink-500 flex items-center justify-center shadow-2xl"
                      >
                        <div className="text-center text-white px-2">
                          <div className="text-2xl sm:text-3xl font-bold">${stats.todayRevenue}</div>
                          <div className="text-xs sm:text-sm mt-1">Revenue</div>
                        </div>
                      </motion.div>
                      
                      {/* Active users circle */}
                      <motion.div
                        initial={{ scale: 0, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                        className="w-40 h-40 sm:w-52 sm:h-52 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 flex items-center justify-center shadow-2xl"
                      >
                        <div className="text-center text-gray-900 px-2">
                          <div className="text-2xl sm:text-3xl font-bold">{stats.activeUsers}</div>
                          <div className="text-xs sm:text-sm mt-1">Active Users</div>
                        </div>
                      </motion.div>
                    </div>
                    
                    {/* Legend */}
                    <div className="absolute bottom-4 left-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <span className="text-gray-700">Active Users</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <span className="text-gray-700">Revenue Today</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full bg-gray-800" />
                        <span className="text-gray-700">Orders</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right: Activity Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-900 to-gray-800 text-white h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white">Activity Days</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newDate = new Date(currentDate);
                          newDate.setMonth(newDate.getMonth() - 1);
                          setCurrentDate(newDate);
                        }}
                        className="text-white hover:bg-gray-700 h-8 px-2"
                      >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                      </Button>
                      <span className="text-sm text-gray-400 min-w-[120px] text-center">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newDate = new Date(currentDate);
                          newDate.setMonth(newDate.getMonth() + 1);
                          setCurrentDate(newDate);
                        }}
                        className="text-white hover:bg-gray-700 h-8 px-2"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <Dialog open={isAvailabilityModalOpen} onOpenChange={setIsAvailabilityModalOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-gray-700 h-8 px-2"
                            title="Manage availability"
                          >
                            <Clock className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2 text-center text-xs mb-4">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                        <div key={i} className="text-gray-400 font-medium">{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {(() => {
                        const year = currentDate.getFullYear();
                        const month = currentDate.getMonth();
                        const firstDay = new Date(year, month, 1).getDay();
                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                        const today = new Date();
                        const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
                        
                        return Array.from({ length: firstDay }, (_, i) => (
                          <div key={`empty-${i}`} className="aspect-square" />
                        )).concat(
                          Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1;
                            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const date = new Date(year, month, day);
                            const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
                            const isSunday = dayOfWeek === 0;
                            const isToday = isCurrentMonth && day === today.getDate();
                            const schedule = availabilitySchedule[dateStr];
                            const hasAvailability = !!schedule && !isSunday;

                            return (
                              <motion.div
                                key={day}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 + i * 0.01 }}
                                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all cursor-pointer hover:scale-105 ${
                                  isToday
                                    ? 'bg-yellow-400 text-gray-900'
                                    : isSunday
                                    ? 'bg-red-900/50 text-red-300 opacity-50'
                                    : hasAvailability
                                    ? 'bg-green-600 text-white'
                                    : 'text-gray-500'
                                }`}
                                title={
                                  isSunday
                                    ? 'Sunday - Closed'
                                    : schedule
                                    ? `Available: ${schedule.start} - ${schedule.end}`
                                    : 'Not available'
                                }
                              >
                                <span>{day}</span>
                                {schedule && !isSunday && (
                                  <span className="text-[8px] mt-0.5 opacity-80">
                                    {schedule.start}
                                  </span>
                                )}
                              </motion.div>
                            );
                          })
                        );
                      })()}
                    </div>
                    
                    {/* Legend */}
                    <div className="flex items-center justify-center gap-4 text-xs pt-4 border-t border-gray-700 flex-wrap">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                        <span className="text-gray-400">Today</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-600" />
                        <span className="text-gray-400">Available</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-900/50" />
                        <span className="text-gray-400">Sunday (Closed)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 items-stretch">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="h-full"
              >
                <Card className="h-full border-0 shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between pb-3 flex-shrink-0">
                    <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      {stat.title}
                    </CardTitle>
                    <div className={`${stat.bgColor} p-2.5 rounded-xl shadow-sm flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="flex items-baseline justify-between">
                      <div className="text-3xl sm:text-4xl font-bold text-gray-900">
                        {stat.value}
                      </div>
                    </div>
                    {stat.description && (
                      <p className="text-xs text-gray-500 mt-2 flex-shrink-0">{stat.description}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

          {/* Recent Activity & Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Recent Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Recent Activity
                    </CardTitle>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => {
                      const Icon = activity.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Goals/Targets */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Today's Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Orders Goal */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Orders Target</span>
                        <span className="text-sm font-bold text-gray-900">{stats.todayOrders}/50</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stats.todayOrders / 50) * 100}%` }}
                          transition={{ delay: 0.6, duration: 0.8 }}
                          className="h-full bg-gradient-to-r from-green-400 to-green-600"
                        />
                      </div>
                    </div>

                    {/* Revenue Goal */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Revenue Target</span>
                        <span className="text-sm font-bold text-gray-900">${stats.todayRevenue}/$5,000</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(parseFloat(stats.todayRevenue) / 5000) * 100}%` }}
                          transition={{ delay: 0.7, duration: 0.8 }}
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                        />
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Stock Health</span>
                        <span className="text-sm font-bold text-gray-900">{stats.inStock}/{stats.totalProducts}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stats.inStock / stats.totalProducts) * 100}%` }}
                          transition={{ delay: 0.8, duration: 0.8 }}
                          className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Admin Management Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-6"
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Admin Management</CardTitle>
                </div>
                <CardDescription>Manage all aspects of your store</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                  {/* Products */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                    onClick={() => navigate('/admin/products')}
                    className="p-5 border-2 border-gray-200 rounded-xl hover:border-primary/30 hover:shadow-md transition-all text-left bg-white group h-full flex flex-col"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors flex-shrink-0">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 flex flex-col min-w-0">
                        <h3 className="font-semibold text-base mb-1">Products</h3>
                        <p className="text-xs text-gray-500 mb-2 flex-1">Manage product catalog</p>
                        <Badge className="bg-blue-100 text-blue-700 text-xs w-fit">{stats.totalProducts} items</Badge>
                      </div>
                    </div>
                  </motion.button>

                  {/* Collection */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.75 }}
                    onClick={() => navigate('/collection')}
                    className="p-5 border-2 border-gray-200 rounded-xl hover:border-primary/30 hover:shadow-md transition-all text-left bg-white group h-full flex flex-col"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-green-50 group-hover:bg-green-100 transition-colors flex-shrink-0">
                        <Grid3x3 className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1 flex flex-col min-w-0">
                        <h3 className="font-semibold text-base mb-1">Collection Page</h3>
                        <p className="text-xs text-gray-500 mb-2 flex-1">View public collection</p>
                        <Badge className="bg-green-100 text-green-700 text-xs w-fit">Live</Badge>
                      </div>
                    </div>
                  </motion.button>

                  {/* Signature Collection */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    onClick={() => navigate('/admin/signature-collection')}
                    className="p-5 border-2 border-gray-200 rounded-xl hover:border-primary/30 hover:shadow-md transition-all text-left bg-white group h-full flex flex-col"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors flex-shrink-0">
                        <Star className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1 flex flex-col min-w-0">
                        <h3 className="font-semibold text-base mb-1">Signature Collection</h3>
                        <p className="text-xs text-gray-500 mb-2 flex-1">Featured products</p>
                        <Badge className="bg-purple-100 text-purple-700 text-xs w-fit">Premium</Badge>
                      </div>
                    </div>
                  </motion.button>

                  {/* Wedding Creations */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.85 }}
                    onClick={() => navigate('/admin/wedding-creations')}
                    className="p-5 border-2 border-gray-200 rounded-xl hover:border-primary/30 hover:shadow-md transition-all text-left bg-white group h-full flex flex-col"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-pink-50 group-hover:bg-pink-100 transition-colors flex-shrink-0">
                        <ImageIcon className="w-6 h-6 text-pink-600" />
                      </div>
                      <div className="flex-1 flex flex-col min-w-0">
                        <h3 className="font-semibold text-base mb-1">Wedding Gallery</h3>
                        <p className="text-xs text-gray-500 mb-2 flex-1">Manage wedding photos</p>
                        <Badge className="bg-pink-100 text-pink-700 text-xs w-fit">Gallery</Badge>
                      </div>
                    </div>
                  </motion.button>

                  {/* Flowers */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                    onClick={() => navigate('/admin/flowers')}
                    className="p-5 border-2 border-gray-200 rounded-xl hover:border-primary/30 hover:shadow-md transition-all text-left bg-white group h-full flex flex-col"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-rose-50 group-hover:bg-rose-100 transition-colors flex-shrink-0">
                        <Flower2 className="w-6 h-6 text-rose-600" />
                      </div>
                      <div className="flex-1 flex flex-col min-w-0">
                        <h3 className="font-semibold text-base mb-1">Flowers</h3>
                        <p className="text-xs text-gray-500 mb-2 flex-1">Manage flower types</p>
                        <Badge className="bg-rose-100 text-rose-700 text-xs w-fit">Catalog</Badge>
                      </div>
                    </div>
                  </motion.button>

                  {/* Settings */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.95 }}
                    onClick={() => navigate('/admin/settings')}
                    className="p-5 border-2 border-gray-200 rounded-xl hover:border-primary/30 hover:shadow-md transition-all text-left bg-white group h-full flex flex-col"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors flex-shrink-0">
                        <Settings className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1 flex flex-col min-w-0">
                        <h3 className="font-semibold text-base mb-1">Settings</h3>
                        <p className="text-xs text-gray-500 mb-2 flex-1">Account & preferences</p>
                        <Badge className="bg-gray-200 text-gray-700 text-xs w-fit">Config</Badge>
                      </div>
                    </div>
                  </motion.button>
                </div>
              </CardContent>
            </Card>
          </motion.div>


        {/* Recent Products - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
              <div>
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-gray-600" />
                  Recent Products
                </CardTitle>
                <CardDescription className="mt-1">Latest products in your store</CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/admin/products")}
                className="gap-2 w-full sm:w-auto"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold">Image</TableHead>
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold">Price</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentProducts.map((product, index) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.05 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <TableCell>
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {product.displayCategory || product.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</span>
                            {product.discount && product.discount > 0 && (
                              <Badge className="bg-red-500 text-white text-xs">
                                {product.discount}% OFF
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.outOfStock ? (
                            <Badge variant="outline" className="text-xs border-red-300 text-red-600">Out of Stock</Badge>
                          ) : (
                            <Badge className="bg-green-500 text-white text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              In Stock
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/products/${product.id}`)}
                            className="gap-1 hover:bg-primary/10 hover:text-primary"
                          >
                            <Edit className="w-4 h-4" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        </main>

        {/* Availability Schedule Modal */}
        <Dialog open={isAvailabilityModalOpen} onOpenChange={setIsAvailabilityModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Availability Schedule</DialogTitle>
              <DialogDescription>
                Set your available dates and times. Sundays are automatically closed.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(availabilitySchedule)
                .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                .map(([dateStr, schedule]) => {
                  const date = new Date(dateStr);
                  const isSunday = date.getDay() === 0;
                  return (
                    <div key={dateStr} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">
                          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </div>
                        {!isSunday && schedule && (
                          <div className="text-sm text-gray-600">
                            {schedule.start} - {schedule.end}
                          </div>
                        )}
                        {isSunday && (
                          <div className="text-sm text-red-600">Sunday - Closed</div>
                        )}
                      </div>
                      {!isSunday && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newSchedule = { ...availabilitySchedule };
                            delete newSchedule[dateStr];
                            setAvailabilitySchedule(newSchedule);
                            localStorage.setItem('ownerAvailabilitySchedule', JSON.stringify(newSchedule));
                            toast({
                              title: 'Availability removed',
                              description: `Removed availability for ${date.toLocaleDateString()}`,
                            });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              
              {Object.keys(availabilitySchedule).length === 0 && (
                <p className="text-center text-gray-500 py-8">No availability scheduled. Add dates below.</p>
              )}
            </div>

            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold mb-4">Add New Availability</h4>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const date = formData.get('date') as string;
                  const start = formData.get('start') as string;
                  const end = formData.get('end') as string;
                  
                  if (!date || !start || !end) {
                    toast({
                      title: 'Missing fields',
                      description: 'Please fill in all fields',
                      variant: 'destructive',
                    });
                    return;
                  }

                  const selectedDate = new Date(date);
                  if (selectedDate.getDay() === 0) {
                    toast({
                      title: 'Sunday is closed',
                      description: 'Cannot set availability for Sunday',
                      variant: 'destructive',
                    });
                    return;
                  }

                  const newSchedule = {
                    ...availabilitySchedule,
                    [date]: { start, end },
                  };
                  setAvailabilitySchedule(newSchedule);
                  localStorage.setItem('ownerAvailabilitySchedule', JSON.stringify(newSchedule));
                  toast({
                    title: 'Availability added',
                    description: `Set availability for ${selectedDate.toLocaleDateString()} from ${start} to ${end}`,
                  });
                  
                  (e.target as HTMLFormElement).reset();
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="start">Start Time</Label>
                    <Input
                      id="start"
                      name="start"
                      type="time"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end">End Time</Label>
                    <Input
                      id="end"
                      name="end"
                      type="time"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAvailabilityModalOpen(false)}
                  >
                    Close
                  </Button>
                  <Button type="submit">Add Availability</Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
    </AdminLayout>
  );
};

export default AdminDashboard;
