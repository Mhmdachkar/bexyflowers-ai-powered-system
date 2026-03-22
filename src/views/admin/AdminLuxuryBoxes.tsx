import React, { useEffect, useState } from 'react';
import { useNavigate } from '@/lib/navigation-compat';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { luxuryBoxesQueryKeys } from '@/hooks/useLuxuryBoxes';
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
  Palette,
  Ruler,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  getLuxuryBoxes,
  getLuxuryBoxWithDetails,
  createLuxuryBox,
  updateLuxuryBox,
  deleteLuxuryBox,
  createBoxColor,
  updateBoxColor,
  deleteBoxColor,
  createBoxSize,
  updateBoxSize,
  deleteBoxSize,
} from '@/lib/api/luxury-boxes';

const GOLD_COLOR = 'rgb(199, 158, 72)';

const AdminLuxuryBoxes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [boxes, setBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [selectedBoxDetails, setSelectedBoxDetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'colors' | 'sizes'>('colors');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null; type: 'box' | 'color' | 'size' | null }>({
    open: false,
    id: null,
    type: null,
  });

  // Box form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'box' as 'box' | 'wrap',
    price: 0,
    description: '',
    quantity: 0,
    is_active: true,
  });

  // Color form state
  const [colorFormData, setColorFormData] = useState({
    name: '',
    color_hex: '',
    gradient_css: '',
    quantity: 0,
  });
  const [editingColorId, setEditingColorId] = useState<string | null>(null);

  // Size form state
  const [sizeFormData, setSizeFormData] = useState({
    name: '',
    capacity: 0,
    price: 0,
    description: '',
  });
  const [editingSizeId, setEditingSizeId] = useState<string | null>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    loadBoxes();
  }, [navigate]);

  const loadBoxes = async () => {
    try {
      setLoading(true);
      const data = await getLuxuryBoxes();
      setBoxes(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load luxury boxes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBoxDetails = async (boxId: string) => {
    try {
      const details = await getLuxuryBoxWithDetails(boxId);
      setSelectedBoxDetails(details);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load box details',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (box: any) => {
    setEditingId(box.id);
    setFormData({
      name: box.name,
      type: box.type,
      price: box.price,
      description: box.description || '',
      quantity: box.quantity,
      is_active: box.is_active,
    });
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({
      name: '',
      type: 'box',
      price: 0,
      description: '',
      quantity: 0,
      is_active: true,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name || formData.price < 0) {
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
        await updateLuxuryBox(editingId, formData);
        
        queryClient.invalidateQueries({ queryKey: luxuryBoxesQueryKeys.all });
        
        toast({
          title: 'Success',
          description: 'Box updated successfully',
        });
      } else {
        await createLuxuryBox(formData);
        
        queryClient.invalidateQueries({ queryKey: luxuryBoxesQueryKeys.all });
        
        toast({
          title: 'Success',
          description: 'Box created successfully',
        });
      }

      setShowForm(false);
      setEditingId(null);
      await loadBoxes();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save box',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLuxuryBox(id);
      
      queryClient.invalidateQueries({ queryKey: luxuryBoxesQueryKeys.all });
      
      toast({
        title: 'Success',
        description: 'Box deleted successfully',
      });
      await loadBoxes();
      if (selectedBoxId === id) {
        setSelectedBoxId(null);
        setSelectedBoxDetails(null);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete box',
        variant: 'destructive',
      });
    }
    setDeleteDialog({ open: false, id: null, type: null });
  };

  const handleManageDetails = async (boxId: string) => {
    setSelectedBoxId(boxId);
    setActiveTab('colors');
    await loadBoxDetails(boxId);
  };

  const handleNewColor = () => {
    setEditingColorId(null);
    setColorFormData({
      name: '',
      color_hex: '',
      gradient_css: '',
      quantity: 0,
    });
  };

  const handleEditColor = (color: any) => {
    setEditingColorId(color.id);
    setColorFormData({
      name: color.name,
      color_hex: color.color_hex || '',
      gradient_css: color.gradient_css || '',
      quantity: color.quantity,
    });
  };

  const handleSaveColor = async () => {
    if (!selectedBoxId || !colorFormData.name) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in color name',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingColorId) {
        await updateBoxColor(editingColorId, colorFormData);
        
        queryClient.invalidateQueries({ queryKey: luxuryBoxesQueryKeys.all });
        
        toast({
          title: 'Success',
          description: 'Color updated successfully',
        });
      } else {
        await createBoxColor({
          box_id: selectedBoxId,
          ...colorFormData,
        });
        
        queryClient.invalidateQueries({ queryKey: luxuryBoxesQueryKeys.all });
        
        toast({
          title: 'Success',
          description: 'Color added successfully',
        });
      }

      setEditingColorId(null);
      setColorFormData({ name: '', color_hex: '', gradient_css: '', quantity: 0 });
      await loadBoxDetails(selectedBoxId);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save color',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteColor = async (colorId: string) => {
    if (!selectedBoxId) return;

    try {
      await deleteBoxColor(colorId);
      
      queryClient.invalidateQueries({ queryKey: luxuryBoxesQueryKeys.all });
      
      toast({
        title: 'Success',
        description: 'Color deleted successfully',
        });
      await loadBoxDetails(selectedBoxId);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete color',
        variant: 'destructive',
      });
    }
    setDeleteDialog({ open: false, id: null, type: null });
  };

  const handleNewSize = () => {
    setEditingSizeId(null);
    setSizeFormData({
      name: '',
      capacity: 0,
      price: 0,
      description: '',
    });
  };

  const handleEditSize = (size: any) => {
    setEditingSizeId(size.id);
    setSizeFormData({
      name: size.name,
      capacity: size.capacity,
      price: size.price,
      description: size.description || '',
    });
  };

  const handleSaveSize = async () => {
    if (!selectedBoxId || !sizeFormData.name || sizeFormData.capacity <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in name and capacity (must be > 0)',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingSizeId) {
        await updateBoxSize(editingSizeId, sizeFormData);
        
        queryClient.invalidateQueries({ queryKey: luxuryBoxesQueryKeys.all });
        
        toast({
          title: 'Success',
          description: 'Size updated successfully',
        });
      } else {
        await createBoxSize({
          box_id: selectedBoxId,
          ...sizeFormData,
        });
        
        queryClient.invalidateQueries({ queryKey: luxuryBoxesQueryKeys.all });
        
        toast({
          title: 'Success',
          description: 'Size added successfully',
        });
      }

      setEditingSizeId(null);
      setSizeFormData({ name: '', capacity: 0, price: 0, description: '' });
      await loadBoxDetails(selectedBoxId);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save size',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSize = async (sizeId: string) => {
    if (!selectedBoxId) return;

    try {
      await deleteBoxSize(sizeId);
      
      queryClient.invalidateQueries({ queryKey: luxuryBoxesQueryKeys.all });
      
      toast({
        title: 'Success',
        description: 'Size deleted successfully',
      });
      await loadBoxDetails(selectedBoxId);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete size',
        variant: 'destructive',
      });
    }
    setDeleteDialog({ open: false, id: null, type: null });
  };

  return (
    <AdminLayout>
    <div className="min-h-screen bg-gray-50">
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
                  Luxury Boxes Management
                </h1>
                <p className="text-sm text-gray-500">Manage boxes, colors, and sizes for custom bouquets</p>
              </div>
            </div>
            {!showForm && !selectedBoxId && (
              <Button
                onClick={handleNew}
                className="gap-2"
                style={{
                  background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                  color: 'white',
                }}
              >
                <Plus className="w-4 h-4" />
                Add Box
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showForm && !selectedBoxId ? (
          <Card>
            <CardHeader>
              <CardTitle>All Luxury Boxes ({boxes.length})</CardTitle>
              <CardDescription>Manage box types for custom bouquets</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : boxes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No boxes yet.</p>
                  <p className="text-sm mt-2">Add a box to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Boxes */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Boxes</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {boxes.filter(b => b.type === 'box').map((box) => (
                          <TableRow key={box.id}>
                            <TableCell className="font-medium">{box.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">Box</Badge>
                            </TableCell>
                            <TableCell>${box.price}</TableCell>
                            <TableCell>
                              <span className={box.quantity === 0 ? 'text-red-600 font-medium' : ''}>
                                {box.quantity}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={box.is_active ? 'default' : 'secondary'}
                                className={box.is_active ? 'bg-green-500' : ''}
                              >
                                {box.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleManageDetails(box.id)}
                                  className="gap-1"
                                >
                                  <Palette className="w-4 h-4" />
                                  Manage
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(box)}
                                  className="gap-1"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteDialog({ open: true, id: box.id, type: 'box' })}
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
                  </div>

                  {/* Wraps */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Wraps</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {boxes.filter(b => b.type === 'wrap').map((box) => (
                          <TableRow key={box.id}>
                            <TableCell className="font-medium">{box.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">Wrap</Badge>
                            </TableCell>
                            <TableCell>${box.price}</TableCell>
                            <TableCell>
                              <span className={box.quantity === 0 ? 'text-red-600 font-medium' : ''}>
                                {box.quantity}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={box.is_active ? 'default' : 'secondary'}
                                className={box.is_active ? 'bg-green-500' : ''}
                              >
                                {box.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleManageDetails(box.id)}
                                  className="gap-1"
                                >
                                  <Palette className="w-4 h-4" />
                                  Manage
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(box)}
                                  className="gap-1"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteDialog({ open: true, id: box.id, type: 'box' })}
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
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : showForm ? (
          /* Box Form */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{editingId ? 'Edit Box' : 'Add New Box'}</CardTitle>
                    <CardDescription>Manage box details</CardDescription>
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
                        Box Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Luxury Box"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">
                        Type <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.type} onValueChange={(value: 'box' | 'wrap') => setFormData({ ...formData, type: value })}>
                        <SelectTrigger id="type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="box">Box</SelectItem>
                          <SelectItem value="wrap">Wrap</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Box description..."
                      rows={3}
                    />
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
                          {editingId ? 'Update' : 'Create'} Box
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : selectedBoxId && selectedBoxDetails ? (
          /* Colors and Sizes Management */
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Manage: {selectedBoxDetails.name}</CardTitle>
                  <CardDescription>Manage colors and sizes for this box</CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedBoxId(null);
                    setSelectedBoxDetails(null);
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Boxes
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'colors' | 'sizes')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                  <TabsTrigger value="sizes">Sizes</TabsTrigger>
                </TabsList>

                <TabsContent value="colors" className="space-y-6">
                  {/* Color Form */}
                  {(editingColorId || (!editingColorId && colorFormData.name)) && (
                    <Card>
                      <CardHeader>
                        <CardTitle>{editingColorId ? 'Edit Color' : 'Add New Color'}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="color_name">Color Name *</Label>
                            <Input
                              id="color_name"
                              value={colorFormData.name}
                              onChange={(e) => setColorFormData({ ...colorFormData, name: e.target.value })}
                              placeholder="e.g., Red"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="color_hex">Color Hex</Label>
                            <Input
                              id="color_hex"
                              value={colorFormData.color_hex}
                              onChange={(e) => setColorFormData({ ...colorFormData, color_hex: e.target.value })}
                              placeholder="#FF0000"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="gradient_css">Gradient CSS</Label>
                            <Input
                              id="gradient_css"
                              value={colorFormData.gradient_css}
                              onChange={(e) => setColorFormData({ ...colorFormData, gradient_css: e.target.value })}
                              placeholder="linear-gradient(...)"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="color_quantity">Quantity</Label>
                            <Input
                              id="color_quantity"
                              type="number"
                              value={colorFormData.quantity}
                              onChange={(e) =>
                                setColorFormData({ ...colorFormData, quantity: parseInt(e.target.value) || 0 })
                              }
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-4 mt-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingColorId(null);
                              setColorFormData({ name: '', color_hex: '', gradient_css: '', quantity: 0 });
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSaveColor}
                            className="gap-2"
                            style={{
                              background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                              color: 'white',
                            }}
                          >
                            <Save className="w-4 h-4" />
                            {editingColorId ? 'Update' : 'Add'} Color
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {!editingColorId && !colorFormData.name && (
                    <Button
                      onClick={handleNewColor}
                      className="gap-2"
                      style={{
                        background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                        color: 'white',
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Color
                    </Button>
                  )}

                  {/* Colors List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Colors ({selectedBoxDetails.colors?.length || 0})</h3>
                    {selectedBoxDetails.colors?.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Palette className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>No colors added yet.</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Color Name</TableHead>
                            <TableHead>Hex</TableHead>
                            <TableHead>Gradient</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedBoxDetails.colors?.map((color: any) => (
                            <TableRow key={color.id}>
                              <TableCell className="font-medium">{color.name}</TableCell>
                              <TableCell>
                                {color.color_hex && (
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-6 h-6 rounded border"
                                      style={{ backgroundColor: color.color_hex }}
                                    />
                                    <span className="text-sm">{color.color_hex}</span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {color.gradient_css && (
                                  <div
                                    className="w-16 h-8 rounded border"
                                    style={{ background: color.gradient_css }}
                                  />
                                )}
                              </TableCell>
                              <TableCell>
                                <span className={color.quantity === 0 ? 'text-red-600 font-medium' : ''}>
                                  {color.quantity}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditColor(color)}
                                    className="gap-1"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setDeleteDialog({ open: true, id: color.id, type: 'color' })
                                    }
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
                  </div>
                </TabsContent>

                <TabsContent value="sizes" className="space-y-6">
                  {/* Size Form */}
                  {(editingSizeId || (!editingSizeId && sizeFormData.name)) && (
                    <Card>
                      <CardHeader>
                        <CardTitle>{editingSizeId ? 'Edit Size' : 'Add New Size'}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="size_name">Size Name *</Label>
                            <Input
                              id="size_name"
                              value={sizeFormData.name}
                              onChange={(e) => setSizeFormData({ ...sizeFormData, name: e.target.value })}
                              placeholder="e.g., Small"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="capacity">
                              Capacity (Max Flowers) * <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="capacity"
                              type="number"
                              value={sizeFormData.capacity}
                              onChange={(e) =>
                                setSizeFormData({ ...sizeFormData, capacity: parseInt(e.target.value) || 0 })
                              }
                              placeholder="15"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="size_price">Price ($)</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="size_price"
                                type="number"
                                step="0.01"
                                value={sizeFormData.price}
                                onChange={(e) =>
                                  setSizeFormData({ ...sizeFormData, price: parseFloat(e.target.value) || 0 })
                                }
                                className="pl-10"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="size_description">Description</Label>
                            <Input
                              id="size_description"
                              value={sizeFormData.description}
                              onChange={(e) => setSizeFormData({ ...sizeFormData, description: e.target.value })}
                              placeholder="e.g., ~15 flowers"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-4 mt-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingSizeId(null);
                              setSizeFormData({ name: '', capacity: 0, price: 0, description: '' });
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSaveSize}
                            className="gap-2"
                            style={{
                              background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                              color: 'white',
                            }}
                          >
                            <Save className="w-4 h-4" />
                            {editingSizeId ? 'Update' : 'Add'} Size
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {!editingSizeId && !sizeFormData.name && (
                    <Button
                      onClick={handleNewSize}
                      className="gap-2"
                      style={{
                        background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                        color: 'white',
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Size
                    </Button>
                  )}

                  {/* Sizes List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Sizes ({selectedBoxDetails.sizes?.length || 0})</h3>
                    {selectedBoxDetails.sizes?.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Ruler className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>No sizes added yet.</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Size Name</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedBoxDetails.sizes?.map((size: any) => (
                            <TableRow key={size.id}>
                              <TableCell className="font-medium">{size.name}</TableCell>
                              <TableCell>{size.capacity} flowers</TableCell>
                              <TableCell>${size.price}</TableCell>
                              <TableCell>{size.description || '-'}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditSize(size)}
                                    className="gap-1"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setDeleteDialog({ open: true, id: size.id, type: 'size' })
                                    }
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
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, id: null, type: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete {deleteDialog.type === 'box' ? 'Box' : deleteDialog.type === 'color' ? 'Color' : 'Size'}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {deleteDialog.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-4 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, id: null, type: null })}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteDialog.id && deleteDialog.type === 'box') {
                  handleDelete(deleteDialog.id);
                } else if (deleteDialog.id && deleteDialog.type === 'color') {
                  handleDeleteColor(deleteDialog.id);
                } else if (deleteDialog.id && deleteDialog.type === 'size') {
                  handleDeleteSize(deleteDialog.id);
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

export default AdminLuxuryBoxes;
