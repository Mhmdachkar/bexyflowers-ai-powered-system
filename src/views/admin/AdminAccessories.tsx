import React, { useEffect, useState } from 'react';
import { useNavigate } from '@/lib/navigation-compat';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { accessoriesQueryKeys } from '@/hooks/useAccessories';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  DollarSign,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/admin/ImageUpload';
import {
  getAccessories,
  createAccessory,
  updateAccessory,
  deleteAccessory,
} from '@/lib/api/accessories';

const GOLD_COLOR = 'rgb(199, 158, 72)';

const AdminAccessories = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    description: '',
    image_url: '',
    quantity: 0,
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) navigate('/admin/login');
  }, [navigate]);

  // Cached data — no raw fetch on every visit
  const { data: accessories = [], isLoading: loading } = useQuery({
    queryKey: accessoriesQueryKeys.lists(),
    queryFn: getAccessories,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleEdit = (accessory: any) => {
    setEditingId(accessory.id);
    setFormData({
      name: accessory.name,
      price: accessory.price,
      description: accessory.description || '',
      image_url: accessory.image_url || '',
      quantity: accessory.quantity,
      is_active: accessory.is_active,
    });
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({
      name: '',
      price: 0,
      description: '',
      image_url: '',
      quantity: 0,
      is_active: true,
    });
    setImageFile(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in name and price',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await updateAccessory(editingId, formData, imageFile || undefined, !!imageFile);
        
        queryClient.invalidateQueries({ queryKey: accessoriesQueryKeys.all });
        
        toast({
          title: 'Success',
          description: 'Accessory updated successfully',
        });
      } else {
        await createAccessory(formData, imageFile || undefined);
        
        queryClient.invalidateQueries({ queryKey: accessoriesQueryKeys.all });
        
        toast({
          title: 'Success',
          description: 'Accessory created successfully',
        });
      }

      setShowForm(false);
      setEditingId(null);
      setImageFile(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save accessory',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAccessory(id);
      
      queryClient.invalidateQueries({ queryKey: accessoriesQueryKeys.all });
      toast({
        title: 'Success',
        description: 'Accessory deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete accessory',
        variant: 'destructive',
      });
    }
    setDeleteDialog({ open: false, id: null });
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/admin/dashboard')}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Dashboard
                </Button>
                <div>
                  <h1 className="text-2xl font-serif font-bold" style={{ color: '#1a1a1a' }}>
                    Accessories Management
                  </h1>
                  <p className="text-sm text-gray-500">Manage accessory items for custom bouquets</p>
                </div>
              </div>
              <Button
                onClick={handleNew}
                className="gap-2"
                style={{
                  background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                  color: 'white',
                }}
              >
                <Plus className="w-4 h-4" />
                Add Accessory
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!showForm ? (
            <Card>
              <CardHeader>
                <CardTitle>All Accessories ({accessories.length})</CardTitle>
                <CardDescription>Manage accessory items available for custom bouquets</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : accessories.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No accessories yet.</p>
                    <p className="text-sm mt-2">Add an accessory to get started.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accessories.map((accessory) => (
                        <TableRow key={accessory.id}>
                          <TableCell>
                            {accessory.image_url ? (
                              <img
                                src={accessory.image_url}
                                alt={accessory.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{accessory.name}</div>
                            {accessory.description && (
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {accessory.description}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>${accessory.price}</TableCell>
                          <TableCell>
                            <span className={accessory.quantity === 0 ? 'text-red-600 font-medium' : ''}>
                              {accessory.quantity}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={accessory.is_active ? 'text-green-600' : 'text-gray-400'}>
                              {accessory.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(accessory)}
                                className="gap-1"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteDialog({ open: true, id: accessory.id })}
                                className="gap-1 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{editingId ? 'Edit Accessory' : 'Add New Accessory'}</CardTitle>
                      <CardDescription>Manage accessory details and inventory</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowForm(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g., Teddy Bear"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">
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
                            className="pl-10"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Accessory description..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity in Stock</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
                        }
                        placeholder="0"
                      />
                    </div>

                    <ImageUpload
                      images={formData.image_url ? [formData.image_url] : []}
                      onImagesChange={(images) =>
                        setFormData({ ...formData, image_url: images[0] || '' })
                      }
                      onFilesChange={(files) => setImageFile(files[0] || null)}
                      maxImages={1}
                      multiple={false}
                      label="Accessory Image"
                    />

                    <div className="flex items-center justify-end gap-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setShowForm(false)}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
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
                            {editingId ? 'Update' : 'Create'} Accessory
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Accessory</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this accessory? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-end gap-4 mt-4">
              <Button variant="outline" onClick={() => setDeleteDialog({ open: false, id: null })}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteDialog.id && handleDelete(deleteDialog.id)}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminAccessories;
