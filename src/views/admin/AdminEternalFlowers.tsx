import React, { useEffect, useState } from 'react';
import { useNavigate } from '@/lib/navigation-compat';
import { motion } from 'framer-motion';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  ArrowLeft,
  Plus,
  Trash2,
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
  Eye,
  EyeOff,
  Upload,
  Calendar,
  Sparkles,
  Flower2,
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
  getEternalFlowers,
  getRealFlowers,
  getAvailableCollectionYears,
  createEternalFlowerProduct,
  updateEternalFlowerProduct,
  deleteEternalFlowerProduct,
  type EternalFlowerProduct,
  type FlowerType,
} from '@/lib/api/eternal-flowers';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { uploadMultipleImages, deleteImage, extractPathFromUrl } from '@/lib/supabase-storage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const GOLD_COLOR = 'rgb(199, 158, 72)';
const CURRENT_YEAR = new Date().getFullYear();
const AVAILABLE_YEARS = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1, CURRENT_YEAR + 2];

const AdminEternalFlowers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'eternal' | 'real'>('eternal');
  const [eternalProducts, setEternalProducts] = useState<EternalFlowerProduct[]>([]);
  const [realProducts, setRealProducts] = useState<EternalFlowerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  
  const [formData, setFormData] = useState<Partial<EternalFlowerProduct>>({
    title: '',
    description: '',
    price: 0,
    category: '',
    display_category: '',
    flower_type: 'eternal',
    collection_year: CURRENT_YEAR,
    image_urls: [],
    featured: false,
    is_out_of_stock: false,
    discount_percentage: null,
    tags: [],
  });
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<EternalFlowerProduct | null>(null);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    loadProducts();
    loadAvailableYears();
  }, [activeTab, selectedYear]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const year = selectedYear === 'all' ? undefined : selectedYear;
      
      if (activeTab === 'eternal') {
        const data = await getEternalFlowers(year);
        setEternalProducts(data);
      } else {
        const data = await getRealFlowers(year);
        setRealProducts(data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableYears = async () => {
    try {
      const years = await getAvailableCollectionYears(activeTab);
      setAvailableYears(years);
    } catch (error) {
      console.error('Error loading years:', error);
    }
  };

  const handleCreate = () => {
    setFormData({
      title: '',
      description: '',
      price: 0,
      category: activeTab === 'eternal' ? 'eternal-roses' : 'real-roses',
      display_category: activeTab === 'eternal' ? 'Eternal Roses' : 'Real Roses',
      flower_type: activeTab,
      collection_year: CURRENT_YEAR,
      image_urls: [],
      featured: false,
      is_out_of_stock: false,
      discount_percentage: null,
      tags: [],
    });
    setImageFiles([]);
    setImagesToDelete([]);
    setEditingProduct(null);
    setCreateDialog(true);
  };

  const handleEdit = (product: EternalFlowerProduct) => {
    setFormData(product);
    setImageFiles([]);
    setImagesToDelete([]);
    setEditingProduct(product);
    setEditDialog(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let imageUrls = [...(formData.image_urls || [])];

      if (imagesToDelete.length > 0) {
        for (const url of imagesToDelete) {
          const path = extractPathFromUrl(url, 'product-images');
          if (path) {
            await deleteImage('product-images', path);
          }
        }
        imageUrls = imageUrls.filter(url => !imagesToDelete.includes(url));
      }

      if (imageFiles.length > 0) {
        const uploadedUrls = await uploadMultipleImages('product-images', imageFiles, 'products');
        imageUrls = [...imageUrls, ...uploadedUrls];
      }

      const productData = {
        ...formData,
        image_urls: imageUrls,
        flower_type: activeTab,
      };

      if (editingProduct) {
        await updateEternalFlowerProduct(editingProduct.id, productData);
        toast({
          title: 'Success',
          description: 'Product updated successfully',
        });
      } else {
        await createEternalFlowerProduct(productData as Omit<EternalFlowerProduct, 'id' | 'created_at' | 'updated_at'>);
        toast({
          title: 'Success',
          description: 'Product created successfully',
        });
      }

      setCreateDialog(false);
      setEditDialog(false);
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: 'Failed to save product',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;

    try {
      await deleteEternalFlowerProduct(deleteDialog.id);
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
      setDeleteDialog({ open: false, id: null });
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && formData.tags) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToRemove) || [],
    });
  };

  const currentProducts = activeTab === 'eternal' ? eternalProducts : realProducts;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: GOLD_COLOR }}>
                Flower Collections Manager
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage eternal and real flower collections by year
              </p>
            </div>
          </div>
          <Button onClick={handleCreate} className="gap-2" style={{ backgroundColor: GOLD_COLOR }}>
            <Plus className="w-4 h-4" />
            Add {activeTab === 'eternal' ? 'Eternal' : 'Real'} Flower
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'eternal' | 'real')}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="eternal" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Eternal Flowers
              </TabsTrigger>
              <TabsTrigger value="real" className="gap-2">
                <Flower2 className="w-4 h-4" />
                Real Flowers
              </TabsTrigger>
            </TabsList>

            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(value === 'all' ? 'all' : parseInt(value))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {AVAILABLE_YEARS.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year} Collection
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="eternal" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: GOLD_COLOR }} />
              </div>
            ) : currentProducts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No eternal flowers found</p>
                  <Button onClick={handleCreate} className="mt-4" style={{ backgroundColor: GOLD_COLOR }}>
                    Add Your First Eternal Flower
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={handleEdit}
                    onDelete={(id) => setDeleteDialog({ open: true, id })}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="real" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: GOLD_COLOR }} />
              </div>
            ) : currentProducts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Flower2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No real flowers found</p>
                  <Button onClick={handleCreate} className="mt-4" style={{ backgroundColor: GOLD_COLOR }}>
                    Add Your First Real Flower
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={handleEdit}
                    onDelete={(id) => setDeleteDialog({ open: true, id })}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={createDialog || editDialog} onOpenChange={(open) => {
          setCreateDialog(open);
          setEditDialog(open);
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit' : 'Create'} {activeTab === 'eternal' ? 'Eternal' : 'Real'} Flower
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Update the details below' : 'Fill in the details below to create a new product'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Product title"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <Label>Collection Year</Label>
                  <Select
                    value={formData.collection_year?.toString()}
                    onValueChange={(value) => setFormData({ ...formData, collection_year: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_YEARS.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., eternal-roses"
                  />
                </div>

                <div>
                  <Label>Display Category</Label>
                  <Input
                    value={formData.display_category}
                    onChange={(e) => setFormData({ ...formData, display_category: e.target.value })}
                    placeholder="e.g., Eternal Roses"
                  />
                </div>
              </div>

              <div>
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  value={formData.discount_percentage || ''}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Optional"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                  <Label>Featured</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_out_of_stock}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_out_of_stock: checked })}
                  />
                  <Label>Out of Stock</Label>
                </div>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button type="button" onClick={handleAddTag} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags?.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Images</Label>
                <ImageUpload
                  images={formData.image_urls || []}
                  onImagesChange={(urls) => setFormData({ ...formData, image_urls: urls })}
                  onFilesChange={setImageFiles}
                  onDeleteImage={(url) => setImagesToDelete([...imagesToDelete, url])}
                  maxImages={5}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreateDialog(false);
                    setEditDialog(false);
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  style={{ backgroundColor: GOLD_COLOR }}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this product? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteDialog({ open: false, id: null })}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

const ProductCard: React.FC<{
  product: EternalFlowerProduct;
  onEdit: (product: EternalFlowerProduct) => void;
  onDelete: (id: string) => void;
}> = ({ product, onEdit, onDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-square relative">
          {product.image_urls && product.image_urls.length > 0 ? (
            <img
              src={product.image_urls[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          {product.featured && (
            <Badge className="absolute top-2 right-2" style={{ backgroundColor: GOLD_COLOR }}>
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          {product.is_out_of_stock && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              Out of Stock
            </Badge>
          )}
        </div>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-1">{product.title}</CardTitle>
              <CardDescription className="line-clamp-2 mt-1">
                {product.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">
              <Calendar className="w-3 h-3 mr-1" />
              {product.collection_year}
            </Badge>
            {product.discount_percentage && (
              <Badge variant="secondary">
                {product.discount_percentage}% OFF
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold" style={{ color: GOLD_COLOR }}>
              ${product.price.toFixed(2)}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(product)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(product.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminEternalFlowers;
