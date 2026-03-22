import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from '@/lib/navigation-compat';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit,
  Save,
  X,
  Image as ImageIcon,
  DollarSign,
  Percent,
  Tag,
  Star,
  AlertCircle,
  Loader2,
  Download,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  RotateCw,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  getSignatureCollections,
  addToSignatureCollection,
  removeFromSignatureCollection,
  reorderSignatureCollections,
  updateSignatureCollection,
  createCustomSignatureProduct,
  type SignatureCollectionWithProduct,
} from '@/lib/api/signature-collection';
import { signatureQueryKeys } from '@/hooks/useSignatureCollection';
import { getCollectionProducts } from '@/lib/api/collection-products';
import { migrateSignatureCollection } from '@/lib/migrateSignatureCollection';
import { encodeImageUrl } from '@/lib/imageUtils';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { uploadMultipleImages, deleteImage, extractPathFromUrl } from '@/lib/supabase-storage';

const GOLD_COLOR = 'rgb(199, 158, 72)';

const AdminSignatureCollection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [collections, setCollections] = useState<SignatureCollectionWithProduct[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingProduct, setAddingProduct] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [addMode, setAddMode] = useState<'select' | 'custom'>('select');
  const [customProductDialog, setCustomProductDialog] = useState(false);
  const [customProductData, setCustomProductData] = useState({
    title: '',
    description: '',
    price: 0,
    category: 'signature',
    display_category: 'Signature Collection',
    tags: [] as string[],
  });
  const [customProductImages, setCustomProductImages] = useState<File[]>([]);
  const [customProductNewTag, setCustomProductNewTag] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [editingItem, setEditingItem] = useState<SignatureCollectionWithProduct | null>(null);
  const [editFormData, setEditFormData] = useState<any>({
    custom_title: '',
    custom_description: '',
    custom_price: null,
    discount_percentage: null,
    is_out_of_stock: false,
    is_best_selling: false,
    tags: [],
    custom_image_urls: [],
    image_rotations: {}, // Store rotation angles for each image
  });
  const [newTag, setNewTag] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [collectionsData, productsData] = await Promise.all([
        getSignatureCollections(),
        getCollectionProducts({ isActive: true }),
      ]);
      setCollections(collectionsData);
      setAvailableProducts(productsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [navigate, loadData]);

  const handleAddProduct = async () => {
    if (!selectedProductId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a product',
        variant: 'destructive',
      });
      return;
    }

    if (collections.some((c) => c.product_id === selectedProductId)) {
      toast({
        title: 'Error',
        description: 'This product is already in the signature collection',
        variant: 'destructive',
      });
      return;
    }

    try {
      setAddingProduct(true);
      const maxOrder = collections.length > 0 
        ? Math.max(...collections.map(c => c.display_order)) + 1 
        : 0;
      
      await addToSignatureCollection(selectedProductId, maxOrder);
      queryClient.invalidateQueries({ queryKey: signatureQueryKeys.all });
      toast({
        title: 'Success',
        description: 'Product added to signature collection',
      });
      setSelectedProductId('');
      await loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add product',
        variant: 'destructive',
      });
    } finally {
      setAddingProduct(false);
    }
  };

  const handleCreateCustomProduct = async () => {
    if (!customProductData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a product title',
        variant: 'destructive',
      });
      return;
    }

    if (customProductData.price < 0) {
      toast({
        title: 'Validation Error',
        description: 'Price must be greater than or equal to 0',
        variant: 'destructive',
      });
      return;
    }

    if (customProductImages.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please upload at least one image',
        variant: 'destructive',
      });
      return;
    }

    try {
      setAddingProduct(true);
      await createCustomSignatureProduct(
        {
          ...customProductData,
          imageFiles: customProductImages,
        }
      );
      queryClient.invalidateQueries({ queryKey: signatureQueryKeys.all });
      toast({
        title: 'Success',
        description: 'Custom product created and added to signature collection',
      });
      setCustomProductDialog(false);
      setCustomProductData({
        title: '',
        description: '',
        price: 0,
        category: 'signature',
        display_category: 'Signature Collection',
        tags: [],
      });
      setCustomProductImages([]);
      setCustomProductNewTag('');
      await loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create custom product',
        variant: 'destructive',
      });
    } finally {
      setAddingProduct(false);
    }
  };

  const handleAddCustomTag = () => {
    if (customProductNewTag && !customProductData.tags.includes(customProductNewTag)) {
      setCustomProductData({
        ...customProductData,
        tags: [...customProductData.tags, customProductNewTag],
      });
      setCustomProductNewTag('');
    }
  };

  const handleRemoveCustomTag = (tag: string) => {
    setCustomProductData({
      ...customProductData,
      tags: customProductData.tags.filter((t) => t !== tag),
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await removeFromSignatureCollection(id);
      queryClient.invalidateQueries({ queryKey: signatureQueryKeys.all });
      toast({
        title: 'Success',
        description: 'Product removed from signature collection',
      });
      setDeleteDialog({ open: false, id: null });
      await loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove product',
        variant: 'destructive',
      });
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    
    const items = [...collections];
    const temp = items[index].display_order;
    items[index].display_order = items[index - 1].display_order;
    items[index - 1].display_order = temp;

    try {
      await reorderSignatureCollections(
        items.map((item) => ({ id: item.id, display_order: item.display_order }))
      );
      queryClient.invalidateQueries({ queryKey: signatureQueryKeys.all });
      await loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reorder',
        variant: 'destructive',
      });
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === collections.length - 1) return;
    
    const items = [...collections];
    const temp = items[index].display_order;
    items[index].display_order = items[index + 1].display_order;
    items[index + 1].display_order = temp;

    try {
      await reorderSignatureCollections(
        items.map((item) => ({ id: item.id, display_order: item.display_order }))
      );
      queryClient.invalidateQueries({ queryKey: signatureQueryKeys.all });
      await loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reorder',
        variant: 'destructive',
      });
    }
  };

  const handleSwapProduct = async (id: string, newProductId: string) => {
    try {
      await updateSignatureCollection(id, { product_id: newProductId });
      queryClient.invalidateQueries({ queryKey: signatureQueryKeys.all });
      toast({
        title: 'Success',
        description: 'Product swapped successfully',
      });
      await loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to swap product',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (item: SignatureCollectionWithProduct) => {
    setEditingItem(item);
    setEditFormData({
      custom_title: item.custom_title || '',
      custom_description: item.custom_description || '',
      custom_price: item.custom_price || null,
      discount_percentage: item.discount_percentage || null,
      is_out_of_stock: item.is_out_of_stock || false,
      is_best_selling: item.is_best_selling || false,
      tags: item.tags || [],
      custom_image_urls: item.custom_image_urls || [],
      image_rotations: (item as any).image_rotations || {},
    });
    setImageFiles([]);
    setImagesToDelete([]);
  };

  const handleImagesChange = (images: string[]) => {
    if (!editingItem) return;
    
    // Track deleted images
    const originalImages = editFormData.custom_image_urls || [];
    const deleted = originalImages.filter((url: string) => !images.includes(url));
    setImagesToDelete([...imagesToDelete, ...deleted]);
    
    setEditFormData({ ...editFormData, custom_image_urls: images });
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    try {
      setSaving(true);
      const updates: any = { ...editFormData };

      // Upload new images if any
      if (imageFiles.length > 0) {
        const uploadedUrls = await uploadMultipleImages('product-images', imageFiles, 'signature-collection');
        updates.custom_image_urls = [...editFormData.custom_image_urls, ...uploadedUrls];
      }

      // Delete old images if any
      if (imagesToDelete.length > 0) {
        for (const url of imagesToDelete) {
          try {
            const path = extractPathFromUrl(url, 'product-images');
            await deleteImage('product-images', path);
          } catch (error) {
            console.error('Failed to delete image:', error);
          }
        }
        updates.custom_image_urls = updates.custom_image_urls.filter(
          (url: string) => !imagesToDelete.includes(url)
        );
      }

      await updateSignatureCollection(editingItem.id, updates);
      queryClient.invalidateQueries({ queryKey: signatureQueryKeys.all });
      toast({
        title: 'Success',
        description: 'Discount updated! Refresh the website (F5) to see changes immediately.',
      });
      setEditingItem(null);
      setImagesToDelete([]);
      await loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    if (newTag && !editFormData.tags.includes(newTag)) {
      setEditFormData({
        ...editFormData,
        tags: [...editFormData.tags, newTag],
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setEditFormData({
      ...editFormData,
      tags: editFormData.tags.filter((t: string) => t !== tag),
    });
  };

  const handleMigrate = async () => {
    const confirmed = window.confirm(
      "This will import the 6 signature collection products from your codebase into Supabase. Continue?"
    );
    if (!confirmed) return;

    try {
      setMigrating(true);
      const result = await migrateSignatureCollection();
      
      toast({
        title: "Migration Complete",
        description: `Successfully migrated ${result.success} products. ${result.failed > 0 ? `${result.failed} failed.` : ''}`,
      });

      await loadData();
    } catch (error) {
      toast({
        title: "Migration Error",
        description: error instanceof Error ? error.message : "Failed to migrate signature collection",
        variant: "destructive",
      });
    } finally {
      setMigrating(false);
    }
  };

  const availableProductsFiltered = availableProducts.filter(
    (product) => !collections.some((c) => c.product_id === product.id)
  );

  // Helper function to get display values
  const getDisplayTitle = (item: SignatureCollectionWithProduct) => 
    item.custom_title || item.product?.title || 'Unknown';
  
  const getDisplayDescription = (item: SignatureCollectionWithProduct) => 
    item.custom_description || item.product?.description || '';
  
  const getDisplayPrice = (item: SignatureCollectionWithProduct) => 
    item.custom_price ?? item.product?.price ?? 0;
  
  const getDisplayImages = (item: SignatureCollectionWithProduct) => 
    item.custom_image_urls.length > 0 
      ? item.custom_image_urls 
      : (item.product?.image_urls || []);

  return (
    <AdminLayout>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/dashboard')}
                className="gap-2 shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-serif font-bold truncate" style={{ color: '#1a1a1a' }}>
                  Signature Collection
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Manage featured bouquets on home page</p>
              </div>
            </div>
            {collections.length === 0 && (
              <Button
                onClick={handleMigrate}
                disabled={migrating}
                variant="outline"
                size="sm"
                className="gap-2"
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
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Add Product Section */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Add Product to Signature Collection</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Select an existing product or create a custom product to feature on the home page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mode Toggle */}
            <div className="flex gap-2 border rounded-lg p-1 bg-gray-50">
              <Button
                variant={addMode === 'select' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setAddMode('select')}
                className="flex-1"
                style={addMode === 'select' ? {
                  background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                  color: 'white',
                } : {}}
              >
                Select Existing
              </Button>
              <Button
                variant={addMode === 'custom' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setAddMode('custom')}
                className="flex-1"
                style={addMode === 'custom' ? {
                  background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                  color: 'white',
                } : {}}
              >
                Create Custom
              </Button>
            </div>

            {/* Select Existing Mode */}
            {addMode === 'select' && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProductsFiltered.length === 0 ? (
                      <SelectItem value="no-products" disabled>
                        No available products
                      </SelectItem>
                    ) : (
                      availableProductsFiltered.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.title} - ${(product.price || 0).toFixed(2)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddProduct}
                  disabled={!selectedProductId || addingProduct}
                  className="gap-2 flex-1 sm:flex-none"
                  style={{
                    background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                    color: 'white',
                  }}
                >
                  {addingProduct ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="hidden sm:inline">Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add Product</span>
                      <span className="sm:hidden">Add</span>
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Create Custom Mode */}
            {addMode === 'custom' && (
              <Button
                onClick={() => setCustomProductDialog(true)}
                className="w-full gap-2"
                style={{
                  background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                  color: 'white',
                }}
              >
                <Plus className="w-4 h-4" />
                Create Custom Product
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Signature Collection Items */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : collections.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">No products in signature collection yet.</p>
              <Button
                onClick={handleMigrate}
                disabled={migrating}
                className="gap-2"
                style={{
                  background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                  color: 'white',
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
                    Import Signature Products
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {collections.map((item, index) => {
              const displayTitle = getDisplayTitle(item);
              const displayPrice = getDisplayPrice(item);
              const displayImages = getDisplayImages(item);
              const finalPrice = item.discount_percentage && item.discount_percentage > 0
                ? displayPrice * (1 - item.discount_percentage / 100)
                : displayPrice;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-600 text-white font-bold">
                            #{index + 1}
                          </Badge>
                          {item.is_best_selling && (
                            <Badge className="bg-yellow-500 text-white">
                              <Star className="w-3 h-3 mr-1" />
                              Best Selling
                            </Badge>
                          )}
                          {item.is_out_of_stock && (
                            <Badge variant="destructive">Out of Stock</Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(item)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteDialog({ open: true, id: item.id })}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Image */}
                      <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                        {displayImages[0] ? (
                          <img
                            src={encodeImageUrl(displayImages[0])}
                            alt={displayTitle}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        {item.discount_percentage && item.discount_percentage > 0 && (
                          <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                            {item.discount_percentage}% OFF
                          </Badge>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-sm sm:text-base line-clamp-2">{displayTitle}</h3>

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        {item.discount_percentage && item.discount_percentage > 0 ? (
                          <>
                            <span className="text-sm line-through text-gray-400">
                              ${displayPrice.toFixed(2)}
                            </span>
                            <span className="text-lg font-bold text-red-600">
                              ${finalPrice.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold">${displayPrice.toFixed(2)}</span>
                        )}
                      </div>

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="flex-1"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === collections.length - 1}
                          className="flex-1"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Select
                          value={item.product_id}
                          onValueChange={(newProductId) => handleSwapProduct(item.id, newProductId)}
                        >
                          <SelectTrigger className="flex-1 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProducts.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editingItem !== null} onOpenChange={(open) => !open && setEditingItem(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Signature Collection Item</DialogTitle>
              <DialogDescription>
                Customize this item's display information. Leave fields empty to use product defaults.
              </DialogDescription>
            </DialogHeader>
            
            {editingItem && (
              <div className="space-y-4 sm:space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-700 border-b pb-2">
                    Basic Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="custom_title" className="text-sm">
                      Custom Title (leave empty to use product title)
                    </Label>
                    <Input
                      id="custom_title"
                      value={editFormData.custom_title}
                      onChange={(e) => setEditFormData({ ...editFormData, custom_title: e.target.value })}
                      placeholder={editingItem.product?.title || 'Product title'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom_description" className="text-sm">Custom Description</Label>
                    <Textarea
                      id="custom_description"
                      value={editFormData.custom_description}
                      onChange={(e) => setEditFormData({ ...editFormData, custom_description: e.target.value })}
                      placeholder={editingItem.product?.description || 'Product description'}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="custom_price" className="text-sm">
                        Custom Price (leave empty to use product price)
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="custom_price"
                          type="number"
                          step="0.01"
                          value={editFormData.custom_price || ''}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              custom_price: e.target.value ? parseFloat(e.target.value) : null,
                            })
                          }
                          className="pl-10"
                          placeholder={editingItem.product?.price.toString() || '0.00'}
                        />
                      </div>
                    </div>

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
                          value={editFormData.discount_percentage || ''}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              discount_percentage: e.target.value ? parseFloat(e.target.value) : null,
                            })
                          }
                          className="pl-10"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Images with Rotation Control */}
                <div className="space-y-4">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-700 border-b pb-2">
                    Custom Images (leave empty to use product images)
                  </h3>
                  
                  {/* Upload Button */}
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setImageFiles([...imageFiles, ...files]);
                      }}
                      className="flex-1"
                    />
                  </div>

                  {/* Image Grid with Rotation Controls */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {/* Existing Images */}
                    {editFormData.custom_image_urls.map((url: string, index: number) => {
                      const rotation = editFormData.image_rotations[url] || 0;
                      return (
                        <div key={url} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                            <img
                              src={encodeImageUrl(url)}
                              alt={`Image ${index + 1}`}
                              className="w-full h-full object-cover transition-transform"
                              style={{ transform: `rotate(${rotation}deg)` }}
                            />
                          </div>
                          {/* Controls */}
                          <div className="absolute top-2 right-2 flex gap-1">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-7 w-7 p-0 bg-white/90 hover:bg-white"
                              onClick={() => {
                                const newRotation = (rotation + 90) % 360;
                                setEditFormData({
                                  ...editFormData,
                                  image_rotations: {
                                    ...editFormData.image_rotations,
                                    [url]: newRotation,
                                  },
                                });
                              }}
                              title="Rotate 90°"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 w-7 p-0"
                              onClick={() => {
                                handleImagesChange(editFormData.custom_image_urls.filter((u: string) => u !== url));
                                // Remove rotation data for deleted image
                                const newRotations = { ...editFormData.image_rotations };
                                delete newRotations[url];
                                setEditFormData({
                                  ...editFormData,
                                  image_rotations: newRotations,
                                });
                              }}
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                          {rotation !== 0 && (
                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {rotation}°
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* New Images (Preview) */}
                    {imageFiles.map((file, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border-2 border-blue-300 bg-gray-50">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute top-2 right-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 w-7 p-0"
                            onClick={() => {
                              setImageFiles(imageFiles.filter((_, i) => i !== index));
                            }}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          New
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Click the rotate button to rotate images by 90°. Rotation is applied when you save.
                  </p>
                </div>

                {/* Tags */}
                <div className="space-y-4">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-700 border-b pb-2">
                    Tags
                  </h3>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Add tag..."
                      className="flex-1"
                    />
                    <Button onClick={handleAddTag} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editFormData.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Switches */}
                <div className="space-y-3">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-700 border-b pb-2">
                    Status & Features
                  </h3>
                  
                  <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg bg-white">
                    <div>
                      <Label htmlFor="is_out_of_stock" className="font-medium cursor-pointer text-sm sm:text-base">
                        Out of Stock
                      </Label>
                      <p className="text-xs sm:text-sm text-gray-500">Mark as unavailable</p>
                    </div>
                    <Switch
                      id="is_out_of_stock"
                      checked={editFormData.is_out_of_stock}
                      onCheckedChange={(checked) =>
                        setEditFormData({ ...editFormData, is_out_of_stock: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg bg-white">
                    <div>
                      <Label htmlFor="is_best_selling" className="font-medium cursor-pointer text-sm sm:text-base">
                        Best Selling
                      </Label>
                      <p className="text-xs sm:text-sm text-gray-500">Mark as best selling</p>
                    </div>
                    <Switch
                      id="is_best_selling"
                      checked={editFormData.is_best_selling}
                      onCheckedChange={(checked) =>
                        setEditFormData({ ...editFormData, is_best_selling: checked })
                      }
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setEditingItem(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="gap-2"
                    style={{
                      background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                      color: 'white',
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
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Custom Product Dialog */}
        <Dialog open={customProductDialog} onOpenChange={setCustomProductDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Custom Product</DialogTitle>
              <DialogDescription>
                Create a new custom product and add it to the signature collection
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 sm:space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm sm:text-base font-semibold text-gray-700 border-b pb-2">
                  Basic Information
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="custom_title" className="text-sm">
                    Product Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="custom_title"
                    value={customProductData.title}
                    onChange={(e) => setCustomProductData({ ...customProductData, title: e.target.value })}
                    placeholder="Enter product title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom_description" className="text-sm">Description</Label>
                  <Textarea
                    id="custom_description"
                    value={customProductData.description}
                    onChange={(e) => setCustomProductData({ ...customProductData, description: e.target.value })}
                    placeholder="Enter product description"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom_price" className="text-sm">
                      Price ($) <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="custom_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={customProductData.price || ''}
                        onChange={(e) =>
                          setCustomProductData({
                            ...customProductData,
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="pl-10"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom_category" className="text-sm">Category</Label>
                    <Input
                      id="custom_category"
                      value={customProductData.category}
                      onChange={(e) => setCustomProductData({ ...customProductData, category: e.target.value })}
                      placeholder="signature"
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-sm sm:text-base font-semibold text-gray-700 border-b pb-2">
                  Product Images <span className="text-red-500">*</span>
                </h3>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setCustomProductImages(files);
                    }}
                    className="cursor-pointer"
                  />
                  {customProductImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {customProductImages.map((file, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Upload at least one image. Multiple images are supported.
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-4">
                <h3 className="text-sm sm:text-base font-semibold text-gray-700 border-b pb-2">
                  Tags
                </h3>
                <div className="flex gap-2">
                  <Input
                    value={customProductNewTag}
                    onChange={(e) => setCustomProductNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                    placeholder="Add tag..."
                    className="flex-1"
                  />
                  <Button onClick={handleAddCustomTag} variant="outline" type="button">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {customProductData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        onClick={() => handleRemoveCustomTag(tag)}
                        className="ml-1 hover:text-red-600"
                        type="button"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setCustomProductDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCustomProduct}
                  disabled={addingProduct || !customProductData.title.trim() || customProductImages.length === 0}
                  className="gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                    color: 'white',
                  }}
                >
                  {addingProduct ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Create Product
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove from Signature Collection</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove this product from the signature collection? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setDeleteDialog({ open: false, id: null })}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteDialog.id && handleDelete(deleteDialog.id)}
              >
                Remove
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </AdminLayout>
  );
};

export default AdminSignatureCollection;
