import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from '@/lib/navigation-compat';
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Save,
  DollarSign,
  Percent,
  Image as ImageIcon,
  Package,
  Home,
  Star,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Download,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { generatedCategories } from "@/data/generatedBouquets";
import { ImageUpload } from "@/components/admin/ImageUpload";
import {
  useCollectionProducts,
  useCollectionProduct,
  useCreateCollectionProduct,
  useUpdateCollectionProduct,
  useDeleteCollectionProduct,
  useCollectionTags,
  collectionQueryKeys,
} from "@/hooks/useCollectionProducts";
import {
  useSignatureCollection,
} from "@/hooks/useSignatureCollection";
import { migrateProductsToSupabase } from "@/lib/migrateProducts";
import { encodeImageUrl } from "@/lib/imageUtils";

const GOLD_COLOR = "rgb(199, 158, 72)";

const AdminProducts = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = id && id !== "new";
  const isCreating = id === "new";

  // ⚡ PERFORMANCE: React Query hooks with optimized caching
  const { data: products = [], isLoading: loadingProducts } = useCollectionProducts();
  const { data: signatureProducts = [], isLoading: loadingSignature } = useSignatureCollection();
  const { data: allTags = [] } = useCollectionTags();
  // Only fetch individual product data when editing
  const { data: selectedProductData } = useCollectionProduct(
    id && id !== "new" ? id : undefined
  );

  // Mutation hooks
  const createProductMutation = useCreateCollectionProduct();
  const updateProductMutation = useUpdateCollectionProduct();
  const deleteProductMutation = useDeleteCollectionProduct();

  const [saving, setSaving] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const loading = loadingProducts || loadingSignature;
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [flowerTypeFilter, setFlowerTypeFilter] = useState<string>("all");
  const [showProductForm, setShowProductForm] = useState(isEditing || isCreating);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; product: any | null }>({
    open: false,
    product: null,
  });

  // Form state
  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    price: 0,
    category: "",
    display_category: "",
    featured: false,
    tags: [],
    image_urls: [],
    is_active: true,
    is_out_of_stock: false,
    discount_percentage: null,
    flower_type: "real", // Default to real flowers
    collection_year: new Date().getFullYear(), // Default to current year
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("adminAuthenticated");
    if (!isAuthenticated) {
      navigate("/admin/login");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (isEditing && selectedProductData) {
      setFormData({
        title: selectedProductData.title || "",
        description: selectedProductData.description || "",
        price: selectedProductData.price || 0,
        category: selectedProductData.category || "",
        display_category: selectedProductData.display_category || "",
        featured: selectedProductData.featured || false,
        tags: selectedProductData.tags || [],
        image_urls: selectedProductData.image_urls || [],
        is_active: selectedProductData.is_active !== false,
        is_out_of_stock: selectedProductData.is_out_of_stock || false,
        discount_percentage: selectedProductData.discount_percentage || null,
        flower_type: selectedProductData.flower_type || "real",
        collection_year: selectedProductData.collection_year || new Date().getFullYear(),
      });
      setSelectedProduct(selectedProductData);
      setShowProductForm(true);
    } else if (isCreating) {
      setFormData({
        title: "",
        description: "",
        price: 0,
        category: "",
        display_category: "",
        featured: false,
        tags: [],
        image_urls: [],
        is_active: true,
        is_out_of_stock: false,
        discount_percentage: null,
        flower_type: "real",
        collection_year: new Date().getFullYear(),
      });
      setShowProductForm(true);
    }
  }, [id, isEditing, isCreating, selectedProductData]);

  const signatureProductIds = useMemo(
    () => new Set((signatureProducts ?? []).map((p) => p.product_id)),
    [signatureProducts]
  );
  const collectionProducts = useMemo(
    () => (products ?? []).filter((p) => !signatureProductIds.has(p.id)),
    [products, signatureProductIds]
  );
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return collectionProducts.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(q) ||
        product.description?.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.is_active) ||
        (statusFilter === "inactive" && !product.is_active);
      const matchesFlowerType = 
        flowerTypeFilter === "all" || 
        product.flower_type === flowerTypeFilter ||
        (!product.flower_type && flowerTypeFilter === "real"); // Default to real if not set
      return matchesSearch && matchesCategory && matchesStatus && matchesFlowerType;
    });
  }, [collectionProducts, searchQuery, categoryFilter, statusFilter, flowerTypeFilter]);
  const recentProducts = useMemo(
    () =>
      [...collectionProducts]
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        .slice(0, 5),
    [collectionProducts]
  );
  const outOfStockProducts = useMemo(
    () => collectionProducts.filter((p) => p.is_out_of_stock),
    [collectionProducts]
  );

  // Handle product save
  const handleSave = async () => {
    if (!formData.title || !formData.price || (formData.image_urls.length === 0 && imageFiles.length === 0)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (title, price, at least one image).",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      if (isEditing && selectedProduct) {
        await updateProductMutation.mutateAsync({
          id: selectedProduct.id,
          updates: formData,
          newImages: imageFiles,
          imagesToDelete,
        });
        toast({
          title: "Product Updated",
          description: `${formData.title} has been updated successfully.`,
        });
      } else {
        await createProductMutation.mutateAsync({
          product: formData,
          images: imageFiles,
        });
        toast({
          title: "Product Created",
          description: `${formData.title} has been created successfully.`,
        });
      }

      setShowProductForm(false);
      setSelectedProduct(null);
      setImageFiles([]);
      setImagesToDelete([]);
      navigate("/admin/products");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle product delete
  const handleDelete = async (product: any) => {
    try {
      await deleteProductMutation.mutateAsync(product.id);
      toast({
        title: "Product Deleted",
        description: `${product.title} has been deleted.`,
      });
      setDeleteDialog({ open: false, product: null });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  // Handle image changes
  const handleImagesChange = (images: string[]) => {
    setFormData({ ...formData, image_urls: images });
  };

  const handleFilesChange = (files: File[]) => {
    setImageFiles(files);
  };

  // Handle tag management
  const handleAddTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({ ...formData, tags: [...formData.tags, newTag] });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t: string) => t !== tag),
    });
  };

  // Handle migration
  const handleMigrate = async () => {
    const confirmed = window.confirm(
      "This will import all existing products from your codebase into Supabase. Continue?"
    );
    if (!confirmed) return;

    try {
      setMigrating(true);
      const { generatedBouquets } = await import("@/data/generatedBouquets");
      const result = await migrateProductsToSupabase(generatedBouquets);
      
      toast({
        title: "Migration Complete",
        description: `Successfully migrated ${result.success} products. ${result.failed > 0 ? `${result.failed} failed.` : ''}`,
      });

      queryClient.invalidateQueries({ queryKey: collectionQueryKeys.all });
    } catch (error) {
      toast({
        title: "Migration Error",
        description: error instanceof Error ? error.message : "Failed to migrate products",
        variant: "destructive",
      });
    } finally {
      setMigrating(false);
    }
  };

  // Quick action: Toggle stock status
  const handleQuickToggleStock = async (product: any) => {
    try {
      await updateProductMutation.mutateAsync({
        id: product.id,
        updates: {
          is_out_of_stock: !product.is_out_of_stock
        }
      });
      toast({
        title: "Stock Updated",
        description: `${product.title} is now ${!product.is_out_of_stock ? 'out of stock' : 'in stock'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update stock",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile-Friendly Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/dashboard")}
                className="gap-2 shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-serif font-bold truncate" style={{ color: "#1a1a1a" }}>
                  Products
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Manage your collection</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {products.length === 0 && (
                <Button
                  onClick={handleMigrate}
                  disabled={migrating}
                  variant="outline"
                  size="sm"
                  className="gap-2 flex-1 sm:flex-none"
                >
                  {migrating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="hidden sm:inline">Migrating...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Import Products</span>
                      <span className="sm:hidden">Import</span>
                    </>
                  )}
                </Button>
              )}
              <Button
                onClick={() => {
                  navigate("/admin/products/new");
                  setShowProductForm(true);
                }}
                className="gap-2 flex-1 sm:flex-none shadow-md hover:shadow-lg transition-shadow"
                style={{
                  background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                  color: "white",
                }}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Product</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {!showProductForm ? (
          <>
            {/* Quick Actions Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500" onClick={() => navigate("/collection")}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Collection Page</p>
                      <p className="text-sm font-semibold">View Products</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/")}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Home className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Homepage</p>
                      <p className="text-sm font-semibold">View Site</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/admin/signature-collection")}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Star className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Signature</p>
                      <p className="text-sm font-semibold">Collection</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter(statusFilter === "all" ? "active" : "all")}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Out of Stock</p>
                      <p className="text-sm font-semibold">{outOfStockProducts.length} items</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters - Mobile Optimized */}
            <Card className="mb-4 sm:mb-6">
              <CardContent className="pt-4 sm:pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {generatedCategories
                        .filter((c) => c.id !== "all")
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={flowerTypeFilter} onValueChange={setFlowerTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Flower Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Flower Types</SelectItem>
                      <SelectItem value="real">🌸 Real Flowers</SelectItem>
                      <SelectItem value="eternal">✨ Eternal Flowers</SelectItem>
                      <SelectItem value="mixed">🌺 Mixed Flowers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Out of Stock Alert Section */}
            {outOfStockProducts.length > 0 && (
              <Card className="mb-4 sm:mb-6 border-orange-200 bg-orange-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <CardTitle className="text-base sm:text-lg text-orange-900">
                        Out of Stock ({outOfStockProducts.length})
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStatusFilter("all")}
                      className="text-xs sm:text-sm"
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {outOfStockProducts.slice(0, 3).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-200"
                      >
                        {product.image_urls?.[0] && (
                          <img
                            src={encodeImageUrl(product.image_urls[0])}
                            alt={product.title}
                            className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.title}</p>
                          <p className="text-xs text-gray-500">${(product.price || 0).toFixed(2)}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickToggleStock(product)}
                          className="shrink-0"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Signature Collection Section */}
            {signatureProducts.length > 0 && (
              <Card className="mb-4 sm:mb-6 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Star className="w-5 h-5 text-purple-600" />
                        Signature Collection
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Featured products on homepage ({signatureProducts.length} items)
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/admin/signature-collection")}
                      className="text-xs sm:text-sm"
                    >
                      Manage
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                    {signatureProducts.map((item, index) => (
                      <motion.div
                        key={item.id}
                        className="group cursor-pointer"
                        onClick={() => navigate(`/admin/products/${item.product_id}`)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -4 }}
                      >
                        <div className="bg-white rounded-lg border-2 border-purple-200 overflow-hidden hover:shadow-lg transition-all relative">
                          {/* Position Badge */}
                          <div className="absolute top-2 left-2 z-10">
                            <Badge className="bg-purple-600 text-white text-xs font-bold">
                              #{index + 1}
                            </Badge>
                          </div>
                          
                          <div className="aspect-square relative">
                            {item.product?.image_urls?.[0] ? (
                              <img
                                src={encodeImageUrl(item.product.image_urls[0])}
                                alt={item.product.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                            
                            {/* Stock & Discount Badges */}
                            <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1">
                              {item.product?.is_out_of_stock && (
                                <Badge variant="destructive" className="text-xs font-bold w-fit">Out</Badge>
                              )}
                              {!item.product?.is_out_of_stock && (
                                <Badge className="bg-green-600 text-white text-xs font-bold w-fit">In Stock</Badge>
                              )}
                              {item.product?.discount_percentage && item.product.discount_percentage > 0 && (
                                <Badge className="bg-red-500 text-white text-xs font-bold w-fit">
                                  {item.product.discount_percentage}% OFF
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="p-2 sm:p-3">
                            <p className="text-xs sm:text-sm font-medium truncate mb-1">{item.product?.title}</p>
                            <div className="flex flex-col gap-1">
                              {item.product?.discount_percentage && item.product.discount_percentage > 0 && item.product.price ? (
                                <div>
                                  <span className="text-xs line-through text-gray-400">${item.product.price.toFixed(2)}</span>
                                  <span className="text-xs sm:text-sm font-bold text-red-600 ml-1">
                                    ${(item.product.price * (1 - item.product.discount_percentage / 100)).toFixed(2)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs sm:text-sm font-semibold">${(item.product?.price || 0).toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Products Section */}
            {recentProducts.length > 0 && (
              <Card className="mb-4 sm:mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Recent Products</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Last 5 added products</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                    {recentProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        className="group cursor-pointer"
                        onClick={() => navigate(`/admin/products/${product.id}`)}
                        whileHover={{ y: -4 }}
                      >
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                          <div className="aspect-square relative">
                            {product.image_urls?.[0] ? (
                              <img
                                src={encodeImageUrl(product.image_urls[0])}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-1">
                              {product.is_out_of_stock && (
                                <Badge variant="destructive" className="text-xs">Out</Badge>
                              )}
                              {product.discount_percentage && product.discount_percentage > 0 && (
                                <Badge className="bg-red-500 text-xs">{product.discount_percentage}%</Badge>
                              )}
                            </div>
                          </div>
                          <div className="p-3">
                            <p className="text-xs sm:text-sm font-medium truncate mb-1">{product.title}</p>
                            <div className="flex items-center justify-between">
                              {product.discount_percentage && product.discount_percentage > 0 && product.price ? (
                                <div>
                                  <span className="text-xs line-through text-gray-400">${product.price.toFixed(2)}</span>
                                  <span className="text-xs sm:text-sm font-bold text-red-600 ml-1">
                                    ${(product.price * (1 - product.discount_percentage / 100)).toFixed(2)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs sm:text-sm font-semibold">${(product.price || 0).toFixed(2)}</span>
                              )}
                              <Badge variant={product.is_active ? "default" : "secondary"} className="text-xs">
                                {product.is_active ? (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                ) : (
                                  <XCircle className="w-3 h-3 mr-1" />
                                )}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Collection Products Grid - Mobile Friendly */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      Collection Page Products
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      All products displayed on the collection page ({filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''})
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    {searchQuery || categoryFilter !== "all" || statusFilter !== "all" ? (
                      <>
                        <p className="text-gray-500">No products found.</p>
                        <p className="text-sm mt-2 text-gray-400">Try adjusting your filters.</p>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-500 mb-4">No products in database yet.</p>
                        <Button
                          onClick={handleMigrate}
                          disabled={migrating}
                          className="gap-2"
                          style={{
                            background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                            color: "white",
                          }}
                        >
                          {migrating ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Migrating...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              Import Existing Products
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {filteredProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4 }}
                      >
                        {/* Image Section */}
                        <div className="relative aspect-square bg-gray-100">
                          {product.image_urls?.[0] ? (
                            <img
                              src={encodeImageUrl(product.image_urls[0])}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                          
                          {/* Badges */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {/* Flower Type Badge */}
                            {product.flower_type === 'eternal' && (
                              <Badge className="bg-purple-500 text-white text-xs font-semibold">
                                ✨ Eternal
                              </Badge>
                            )}
                            {product.flower_type === 'real' && (
                              <Badge className="bg-emerald-500 text-white text-xs font-semibold">
                                🌸 Real
                              </Badge>
                            )}
                            {product.flower_type === 'mixed' && (
                              <Badge className="bg-blue-500 text-white text-xs font-semibold">
                                🌺 Mixed
                              </Badge>
                            )}
                            {product.is_out_of_stock && (
                              <Badge variant="destructive" className="text-xs font-semibold">
                                <XCircle className="w-3 h-3 mr-1" />
                                Out of Stock
                              </Badge>
                            )}
                            {!product.is_out_of_stock && (
                              <Badge className="bg-green-500 text-white text-xs font-semibold">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                In Stock
                              </Badge>
                            )}
                            {product.discount_percentage && product.discount_percentage > 0 && (
                              <Badge className="bg-red-500 text-white text-xs font-semibold">
                                {product.discount_percentage}% OFF
                              </Badge>
                            )}
                            {product.featured && (
                              <Badge className="bg-yellow-500 text-white text-xs font-semibold">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>

                          {/* Quick Actions */}
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-7 w-7 p-0 bg-white/90 hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/products/${product.id}`);
                              }}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-7 w-7 p-0 bg-white/90 hover:bg-red-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteDialog({ open: true, product });
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                            </Button>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-3 sm:p-4">
                          <h3 className="font-semibold text-sm sm:text-base mb-2 line-clamp-2 min-h-[2.5rem]">
                            {product.title}
                          </h3>
                          
                          <div className="flex items-center justify-between mb-2">
                            {product.discount_percentage && product.discount_percentage > 0 && product.price ? (
                              <div>
                                <span className="text-xs line-through text-gray-400">${product.price.toFixed(2)}</span>
                                <span className="text-base sm:text-lg font-bold text-red-600 ml-2">
                                  ${(product.price * (1 - product.discount_percentage / 100)).toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-base sm:text-lg font-bold">${(product.price || 0).toFixed(2)}</span>
                            )}
                            <Badge
                              variant={product.is_active ? "default" : "secondary"}
                              className={product.is_active ? "bg-green-500" : ""}
                            >
                              {product.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-xs text-gray-500 truncate">
                              {product.display_category || product.category || "Uncategorized"}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickToggleStock(product);
                                }}
                              >
                                {product.is_out_of_stock ? (
                                  <>
                                    <Eye className="w-3 h-3 mr-1" />
                                    <span className="hidden sm:inline">In Stock</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3 h-3 mr-1" />
                                    <span className="hidden sm:inline">Out</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          /* Product Form - Simplified and Mobile Friendly */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">
                      {isEditing ? "Edit Product" : "Create New Product"}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      {isEditing ? "Update product details" : "Add a new product to your collection"}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowProductForm(false);
                      navigate("/admin/products");
                    }}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Cancel</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-700 border-b pb-2">
                    Basic Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm">
                      Product Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter product name"
                      className="text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter product description"
                      rows={3}
                      className="text-sm sm:text-base"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => {
                          const selectedCat = generatedCategories.find(c => c.id === value);
                          setFormData({
                            ...formData,
                            category: value,
                            display_category: selectedCat?.name || "",
                          });
                        }}
                      >
                        <SelectTrigger className="text-sm sm:text-base">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {generatedCategories
                            .filter((c) => c.id !== "all")
                            .map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-sm">
                        Price ($) <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                          }
                          className="pl-10 text-sm sm:text-base"
                          placeholder="0.00"
                        />
                      </div>
                      {formData.discount_percentage && formData.discount_percentage > 0 && (
                        <div className="text-xs sm:text-sm text-gray-600 mt-1">
                          <span className="line-through">${formData.price.toFixed(2)}</span>
                          <span className="ml-2 font-bold text-red-600">
                            ${(formData.price * (1 - formData.discount_percentage / 100)).toFixed(2)}
                          </span>
                          <span className="ml-2 text-red-600">
                            ({formData.discount_percentage}% off)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Flower Type & Collection Year */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="flower_type" className="text-sm">Flower Type</Label>
                      <Select
                        value={formData.flower_type}
                        onValueChange={(value) => setFormData({ ...formData, flower_type: value })}
                      >
                        <SelectTrigger className="text-sm sm:text-base">
                          <SelectValue placeholder="Select flower type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="real">🌸 Real (Fresh Flowers)</SelectItem>
                          <SelectItem value="eternal">✨ Eternal (Preserved Flowers)</SelectItem>
                          <SelectItem value="mixed">🌺 Mixed (Both Types)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">Choose between real, eternal, or mixed flowers</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="collection_year" className="text-sm">Collection Year</Label>
                      <Input
                        id="collection_year"
                        type="number"
                        min="2020"
                        max="2030"
                        value={formData.collection_year || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            collection_year: e.target.value ? parseInt(e.target.value) : null,
                          })
                        }
                        className="text-sm sm:text-base"
                        placeholder="e.g., 2025"
                      />
                      <p className="text-xs text-gray-500">Year this collection was created</p>
                    </div>
                  </div>
                </div>

                {/* Images Section */}
                <div className="space-y-4">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-700 border-b pb-2">
                    Product Images
                  </h3>
                  <ImageUpload
                    images={formData.image_urls}
                    onImagesChange={handleImagesChange}
                    onFilesChange={handleFilesChange}
                    maxImages={10}
                    multiple={true}
                    label="Upload product images (first image is primary)"
                  />
                </div>

                {/* Stock & Pricing */}
                <div className="space-y-4">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-700 border-b pb-2">
                    Stock & Pricing
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discount_percentage" className="text-sm">Discount (%)</Label>
                      <div className="relative">
                        <Percent className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="discount_percentage"
                          type="number"
                          min="0"
                          max="100"
                          step="5"
                          value={formData.discount_percentage || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              discount_percentage: e.target.value ? parseFloat(e.target.value) : null,
                            })
                          }
                          className="pl-10 text-sm sm:text-base"
                          placeholder="0"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Enter discount (0-100)</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg bg-white">
                      <div>
                        <Label htmlFor="is_out_of_stock" className="font-medium cursor-pointer text-sm sm:text-base">
                          Out of Stock
                        </Label>
                        <p className="text-xs sm:text-sm text-gray-500">Mark as unavailable</p>
                      </div>
                      <Switch
                        id="is_out_of_stock"
                        checked={formData.is_out_of_stock}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_out_of_stock: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg bg-white">
                      <div>
                        <Label htmlFor="is_active" className="font-medium cursor-pointer text-sm sm:text-base">
                          Active
                        </Label>
                        <p className="text-xs sm:text-sm text-gray-500">Show on website</p>
                      </div>
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg bg-white">
                      <div>
                        <Label htmlFor="featured" className="font-medium cursor-pointer text-sm sm:text-base">
                          Featured Product
                        </Label>
                        <p className="text-xs sm:text-sm text-gray-500">Display prominently</p>
                      </div>
                      <Switch
                        id="featured"
                        checked={formData.featured}
                        onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowProductForm(false);
                      navigate("/admin/products");
                    }}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full sm:w-auto gap-2"
                    style={{
                      background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                      color: "white",
                    }}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {isEditing ? "Update Product" : "Create Product"}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, product: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Product</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{deleteDialog.product?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setDeleteDialog({ open: false, product: null })}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteDialog.product && handleDelete(deleteDialog.product)}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </AdminLayout>
  );
};

export default AdminProducts;
