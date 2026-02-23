import React, { useEffect, useState } from 'react';
import { useNavigate } from '@/lib/navigation-compat';
import { motion } from 'framer-motion';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQueryClient } from '@tanstack/react-query';
import { weddingQueryKeys } from '@/hooks/useWeddingCreations';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  Image as ImageIcon,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { encodeImageUrl } from '@/lib/imageUtils';
import {
  getWeddingCreations,
  createWeddingCreation,
  updateWeddingCreation,
  deleteWeddingCreation,
} from '@/lib/api/wedding-creations';

const GOLD_COLOR = 'rgb(199, 158, 72)';

const AdminWeddingCreations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [creations, setCreations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const [formData, setFormData] = useState({
    image_url: '',
    display_order: 0,
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    loadCreations();
  }, [navigate]);

  const loadCreations = async () => {
    try {
      setLoading(true);
      const data = await getWeddingCreations();
      setCreations(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load wedding creations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (creation: any) => {
    setEditingId(creation.id);
    setFormData({
      image_url: creation.image_url || '',
      display_order: creation.display_order || 0,
      is_active: creation.is_active,
    });
    setImageFile(null);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({
      image_url: '',
      display_order: creations.length > 0 ? Math.max(...creations.map(c => c.display_order || 0)) + 1 : 0,
      is_active: true,
    });
    setImageFile(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.image_url && !imageFile) {
      toast({
        title: 'Validation Error',
        description: 'Please upload an image',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        // When editing, only update image_url if a new file is uploaded
        // Otherwise, preserve the existing image_url
        await updateWeddingCreation(
          editingId,
          {
            display_order: formData.display_order,
            is_active: formData.is_active,
            ...(imageFile ? {} : { image_url: formData.image_url }), // Keep existing if no new file
          },
          imageFile || undefined,
          imageFile ? true : false
        );
        // CRITICAL: Invalidate React Query cache so frontend sees changes immediately
        await queryClient.invalidateQueries({ queryKey: weddingQueryKeys.all });
        queryClient.removeQueries({ queryKey: weddingQueryKeys.all });
        await queryClient.refetchQueries({ queryKey: weddingQueryKeys.lists() });
        toast({
          title: 'Success',
          description: 'Wedding creation updated successfully',
        });
      } else {
        if (!imageFile) {
          toast({
            title: 'Validation Error',
            description: 'Please upload an image',
            variant: 'destructive',
          });
          return;
        }
        await createWeddingCreation(
          {
            display_order: formData.display_order,
            is_active: formData.is_active,
          },
          imageFile
        );
        // CRITICAL: Invalidate React Query cache so frontend sees changes immediately
        await queryClient.invalidateQueries({ queryKey: weddingQueryKeys.all });
        queryClient.removeQueries({ queryKey: weddingQueryKeys.all });
        await queryClient.refetchQueries({ queryKey: weddingQueryKeys.lists() });
        toast({
          title: 'Success',
          description: 'Wedding creation added successfully',
        });
      }

      setShowForm(false);
      setEditingId(null);
      await loadCreations();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save wedding creation',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWeddingCreation(id);
      // CRITICAL: Invalidate React Query cache so frontend sees changes immediately
      await queryClient.invalidateQueries({ queryKey: weddingQueryKeys.all });
      queryClient.removeQueries({ queryKey: weddingQueryKeys.all });
      await queryClient.refetchQueries({ queryKey: weddingQueryKeys.lists() });
      toast({
        title: 'Success',
        description: 'Wedding creation deleted successfully',
      });
      await loadCreations();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete wedding creation',
        variant: 'destructive',
      });
    }
    setDeleteDialog({ open: false, id: null });
  };

  const handleMoveOrder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = creations.findIndex(c => c.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= creations.length) return;

    const currentCreation = creations[currentIndex];
    const targetCreation = creations[newIndex];

    try {
      // Swap display orders
      await Promise.all([
        updateWeddingCreation(currentCreation.id, { display_order: targetCreation.display_order }),
        updateWeddingCreation(targetCreation.id, { display_order: currentCreation.display_order }),
      ]);

      await loadCreations();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update order',
        variant: 'destructive',
      });
    }
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
                    Wedding Creations Management
                  </h1>
                  <p className="text-sm text-gray-500">Manage photos for the Wedding & Events page gallery</p>
                </div>
              </div>
              {!showForm && (
                <Button
                  onClick={handleNew}
                  className="gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                    color: 'white',
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add Photo
                </Button>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!showForm ? (
            <Card>
              <CardHeader>
                <CardTitle>Wedding Creations ({creations.length})</CardTitle>
                <CardDescription>Manage photos displayed in the "Our Wedding Creations" gallery</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : creations.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No wedding creation photos yet.</p>
                    <p className="text-sm mt-2">Add a photo to get started.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {creations.map((creation, index) => (
                      <motion.div
                        key={creation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="relative aspect-square">
                          <img
                            src={encodeImageUrl(creation.image_url)}
                            alt={`Wedding creation ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          {!creation.is_active && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Badge variant="secondary" className="bg-gray-600">
                                Hidden
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={creation.is_active ? 'default' : 'secondary'}
                                className={creation.is_active ? 'bg-green-500' : ''}
                              >
                                {creation.is_active ? (
                                  <>
                                    <Eye className="w-3 h-3 mr-1" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3 h-3 mr-1" />
                                    Hidden
                                  </>
                                )}
                              </Badge>
                              <span className="text-xs text-gray-500">Order: {creation.display_order}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMoveOrder(creation.id, 'up')}
                              disabled={index === 0}
                              className="flex-1"
                            >
                              <ArrowUp className="w-3 h-3 mr-1" />
                              Up
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMoveOrder(creation.id, 'down')}
                              disabled={index === creations.length - 1}
                              className="flex-1"
                            >
                              <ArrowDown className="w-3 h-3 mr-1" />
                              Down
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(creation)}
                              className="flex-1"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteDialog({ open: true, id: creation.id })}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{editingId ? 'Edit Wedding Creation' : 'Add New Wedding Creation'}</CardTitle>
                      <CardDescription>Upload and configure a photo for the gallery</CardDescription>
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
                    <ImageUpload
                      images={formData.image_url ? [formData.image_url] : []}
                      onImagesChange={(images) =>
                        setFormData({ ...formData, image_url: images[0] || '' })
                      }
                      onFilesChange={(files) => setImageFile(files[0] || null)}
                      maxImages={1}
                      multiple={false}
                      label="Wedding Creation Photo *"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="display_order">Display Order</Label>
                        <Input
                          id="display_order"
                          type="number"
                          value={formData.display_order}
                          onChange={(e) =>
                            setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                          }
                          placeholder="0"
                        />
                        <p className="text-xs text-gray-500">Lower numbers appear first in the gallery</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="is_active" className="font-medium cursor-pointer">
                          Active
                        </Label>
                        <p className="text-sm text-gray-500">Show on website</p>
                      </div>
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                    </div>

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
                            {editingId ? 'Update' : 'Create'} Photo
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
        <Dialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ open, id: null })}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Wedding Creation</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this photo? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-end gap-4 mt-4">
              <Button variant="outline" onClick={() => setDeleteDialog({ open: false, id: null })}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (deleteDialog.id) {
                    handleDelete(deleteDialog.id);
                  }
                }}
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

export default AdminWeddingCreations;
