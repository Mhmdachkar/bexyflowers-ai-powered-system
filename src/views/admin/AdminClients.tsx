import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from '@/lib/navigation-compat';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  ArrowLeft,
  Users,
  Package,
  Loader2,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  Mail,
  MessageSquare,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { getCheckoutOrders, importCheckoutOrders } from '@/lib/api/checkout';
import type { CartItem } from '@/types/cart';
import * as XLSX from 'xlsx';

const GOLD_COLOR = 'rgb(199, 158, 72)';
const DAY_MS = 24 * 60 * 60 * 1000;

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function orderItemsSummary(items: CartItem[]): string {
  if (!Array.isArray(items) || items.length === 0) return '—';
  const total = items.reduce((s, i) => s + (i.quantity ?? 1), 0);
  return items.length === 1 && total === 1
    ? '1 item'
    : `${items.length} items (${total} total)`;
}

function dateKeyLocal(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfWeekLocal(d: Date): Date {
  const start = new Date(d);
  const day = start.getDay();
  const diff = (day + 6) % 7;
  start.setDate(start.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function startOfMonthLocal(d: Date): Date {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  return start;
}

function normalizeHeader(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getRowValue(row: Record<string, any>, candidates: string[]): any {
  const entries = Object.entries(row);
  const normalized = new Map<string, any>();
  for (const [key, val] of entries) {
    normalized.set(normalizeHeader(String(key)), val);
  }
  for (const candidate of candidates) {
    const key = normalizeHeader(candidate);
    if (normalized.has(key)) return normalized.get(key);
  }
  return undefined;
}

const AdminClients = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isEmailOpen, setIsEmailOpen] = React.useState(false);
  const [isSmsOpen, setIsSmsOpen] = React.useState(false);
  const [emailSubject, setEmailSubject] = React.useState('');
  const [emailBody, setEmailBody] = React.useState('');
  const [smsBody, setSmsBody] = React.useState('');
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);
  const [isSendingSms, setIsSendingSms] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
  }, [navigate]);

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['checkout-orders'],
    queryFn: getCheckoutOrders,
    staleTime: 2 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const hasToastedErrorRef = useRef(false);
  useEffect(() => {
    if (!isError) {
      hasToastedErrorRef.current = false;
      return;
    }
    if (hasToastedErrorRef.current) return;
    hasToastedErrorRef.current = true;
    toast({
      title: 'Error loading orders',
      description: error instanceof Error ? error.message : 'Failed to fetch client orders.',
      variant: 'destructive',
    });
  }, [isError, error, toast]);

  const uniqueClients = useMemo(() => {
    const map = new Map<string, { fullName: string; email: string; phone: string; location: string }>();
    orders.forEach((order) => {
      const email = (order.email || '').trim().toLowerCase();
      const phone = (order.phone || '').trim();
      const key = email ? `email:${email}` : phone ? `phone:${phone}` : `order:${order.id}`;
      if (!map.has(key)) {
        map.set(key, {
          fullName: order.full_name || '',
          email,
          phone,
          location: order.location || '',
        });
      }
    });
    return Array.from(map.values());
  }, [orders]);

  const chartData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (viewMode === 'daily') {
      const buckets = new Map<string, { label: string; set: Set<string> }>();
      for (let i = 6; i >= 0; i -= 1) {
        const date = new Date(today.getTime() - i * DAY_MS);
        const key = dateKeyLocal(date);
        buckets.set(key, {
          label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          set: new Set(),
        });
      }
      orders.forEach((order) => {
        const created = new Date(order.created_at);
        if (Number.isNaN(created.getTime())) return;
        created.setHours(0, 0, 0, 0);
        const key = dateKeyLocal(created);
        const bucket = buckets.get(key);
        if (!bucket) return;
        const email = (order.email || '').trim().toLowerCase();
        const phone = (order.phone || '').trim();
        const clientKey = email ? `email:${email}` : phone ? `phone:${phone}` : `order:${order.id}`;
        bucket.set.add(clientKey);
      });
      return Array.from(buckets.values()).map((b) => ({ label: b.label, count: b.set.size }));
    }

    if (viewMode === 'weekly') {
      const buckets = new Map<string, { label: string; set: Set<string> }>();
      for (let i = 7; i >= 0; i -= 1) {
        const date = new Date(today.getTime() - i * 7 * DAY_MS);
        const weekStart = startOfWeekLocal(date);
        const key = dateKeyLocal(weekStart);
        buckets.set(key, {
          label: `Wk of ${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
          set: new Set(),
        });
      }
      orders.forEach((order) => {
        const created = new Date(order.created_at);
        if (Number.isNaN(created.getTime())) return;
        const weekStart = startOfWeekLocal(created);
        const key = dateKeyLocal(weekStart);
        const bucket = buckets.get(key);
        if (!bucket) return;
        const email = (order.email || '').trim().toLowerCase();
        const phone = (order.phone || '').trim();
        const clientKey = email ? `email:${email}` : phone ? `phone:${phone}` : `order:${order.id}`;
        bucket.set.add(clientKey);
      });
      return Array.from(buckets.values()).map((b) => ({ label: b.label, count: b.set.size }));
    }

    const buckets = new Map<string, { label: string; set: Set<string> }>();
    for (let i = 9; i >= 0; i -= 1) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStart = startOfMonthLocal(date);
      const key = `${monthStart.getFullYear()}-${monthStart.getMonth()}`;
      buckets.set(key, {
        label: monthStart.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
        set: new Set(),
      });
    }
    orders.forEach((order) => {
      const created = new Date(order.created_at);
      if (Number.isNaN(created.getTime())) return;
      const monthStart = startOfMonthLocal(created);
      const key = `${monthStart.getFullYear()}-${monthStart.getMonth()}`;
      const bucket = buckets.get(key);
      if (!bucket) return;
      const email = (order.email || '').trim().toLowerCase();
      const phone = (order.phone || '').trim();
      const clientKey = email ? `email:${email}` : phone ? `phone:${phone}` : `order:${order.id}`;
      bucket.set.add(clientKey);
    });
    return Array.from(buckets.values()).map((b) => ({ label: b.label, count: b.set.size }));
  }, [orders, viewMode]);

  const totalClientsInRange = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let rangeStart = new Date(today);

    if (viewMode === 'daily') {
      rangeStart = new Date(today.getTime() - 6 * DAY_MS);
    } else if (viewMode === 'weekly') {
      const date = new Date(today.getTime() - 7 * 7 * DAY_MS);
      rangeStart = startOfWeekLocal(date);
    } else {
      rangeStart = startOfMonthLocal(new Date(today.getFullYear(), today.getMonth() - 9, 1));
    }

    const unique = new Set<string>();
    orders.forEach((order) => {
      const created = new Date(order.created_at);
      if (Number.isNaN(created.getTime())) return;
      if (created < rangeStart || created > new Date()) return;
      const email = (order.email || '').trim().toLowerCase();
      const phone = (order.phone || '').trim();
      const clientKey = email ? `email:${email}` : phone ? `phone:${phone}` : `order:${order.id}`;
      unique.add(clientKey);
    });
    return unique.size;
  }, [orders, viewMode]);

  const handleExport = () => {
    if (!orders.length) return;
    const exportRows = orders.map((order) => ({
      'Order ID': order.id,
      'Created At': order.created_at,
      'Full Name': order.full_name,
      Phone: order.phone,
      Email: order.email,
      Location: order.location,
      Subtotal: Number(order.subtotal || 0),
      'Delivery Fee': Number(order.delivery_fee || 0),
      Total: Number(order.total || 0),
      'Order Items': JSON.stringify(order.order_items || []),
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    const filename = `clients-orders-${dateKeyLocal(new Date())}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        throw new Error('No sheet found in the Excel file.');
      }

      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
      if (!rows.length) {
        throw new Error('No rows found in the Excel file.');
      }

      const normalizedRows = rows.map((row) => {
        const fullName = String(getRowValue(row, ['full_name', 'full name', 'name']) || '').trim();
        const phone = String(getRowValue(row, ['phone', 'phone number', 'mobile']) || '').trim();
        const email = String(getRowValue(row, ['email', 'email address']) || '').trim();
        const location = String(getRowValue(row, ['location', 'address', 'delivery address']) || '').trim();

        const createdAtRaw = getRowValue(row, ['created_at', 'created at', 'date', 'order date']);
        let createdAt: string | undefined;
        if (createdAtRaw instanceof Date) {
          createdAt = createdAtRaw.toISOString();
        } else if (typeof createdAtRaw === 'number') {
          const parsed = XLSX.SSF.parse_date_code(createdAtRaw);
          if (parsed) {
            const parsedDate = new Date(parsed.y, parsed.m - 1, parsed.d, parsed.H, parsed.M, parsed.S);
            createdAt = parsedDate.toISOString();
          }
        } else if (typeof createdAtRaw === 'string' && createdAtRaw) {
          const parsedDate = new Date(createdAtRaw);
          if (!Number.isNaN(parsedDate.getTime())) {
            createdAt = parsedDate.toISOString();
          }
        }

        const subtotal = Number(getRowValue(row, ['subtotal', 'sub total']) || 0);
        const deliveryFee = Number(getRowValue(row, ['delivery_fee', 'delivery fee', 'shipping', 'shipping fee']) || 0);
        const total = Number(getRowValue(row, ['total', 'grand total', 'amount']) || 0);

        let orderItems: CartItem[] = [];
        const orderItemsRaw = getRowValue(row, ['order_items', 'order items', 'items']);
        if (Array.isArray(orderItemsRaw)) {
          orderItems = orderItemsRaw as CartItem[];
        } else if (typeof orderItemsRaw === 'string' && orderItemsRaw.trim()) {
          try {
            const parsed = JSON.parse(orderItemsRaw);
            if (Array.isArray(parsed)) orderItems = parsed as CartItem[];
          } catch {
            // Ignore invalid JSON
          }
        }

        return {
          fullName,
          phone,
          email,
          location,
          orderItems,
          subtotal,
          deliveryFee,
          total,
          createdAt,
        };
      });

      const validRows = normalizedRows.filter((row) => row.fullName && row.phone && row.email && row.location);
      const skipped = normalizedRows.length - validRows.length;

      const chunkSize = 100;
      for (let i = 0; i < validRows.length; i += chunkSize) {
        const chunk = validRows.slice(i, i + chunkSize);
        await importCheckoutOrders(chunk);
      }

      toast({
        title: 'Import complete',
        description: `Imported ${validRows.length} rows${skipped ? `, skipped ${skipped} incomplete rows` : ''}.`,
      });
      refetch();
    } catch (err) {
      toast({
        title: 'Import failed',
        description: err instanceof Error ? err.message : 'Failed to import Excel file.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast({
        title: 'Missing email content',
        description: 'Please enter a subject and message.',
        variant: 'destructive',
      });
      return;
    }
    const recipients = uniqueClients.map((client) => client.email).filter(Boolean);
    if (!recipients.length) return;
    setIsSendingEmail(true);
    try {
      const apiKey = import.meta.env.VITE_FRONTEND_API_KEY;
      const response = await fetch('/.netlify/functions/bulk-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'X-API-Key': apiKey } : {}),
        },
        body: JSON.stringify({
          subject: emailSubject.trim(),
          body: emailBody.trim(),
          recipients,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || data?.message || 'Bulk email failed.');
      }
      toast({
        title: 'Email sent',
        description: `Sent to ${recipients.length} clients.`,
      });
      setIsEmailOpen(false);
      setEmailSubject('');
      setEmailBody('');
    } catch (err) {
      toast({
        title: 'Email failed',
        description: err instanceof Error ? err.message : 'Unable to send bulk email.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSendSms = async () => {
    if (!smsBody.trim()) {
      toast({
        title: 'Missing SMS content',
        description: 'Please enter a message.',
        variant: 'destructive',
      });
      return;
    }
    const recipients = uniqueClients.map((client) => client.phone).filter(Boolean);
    if (!recipients.length) return;
    setIsSendingSms(true);
    try {
      const apiKey = import.meta.env.VITE_FRONTEND_API_KEY;
      const response = await fetch('/.netlify/functions/bulk-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'X-API-Key': apiKey } : {}),
        },
        body: JSON.stringify({
          message: smsBody.trim(),
          recipients,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || data?.message || 'Bulk SMS failed.');
      }
      toast({
        title: 'SMS sent',
        description: `Sent to ${recipients.length} clients.`,
      });
      setIsSmsOpen(false);
      setSmsBody('');
    } catch (err) {
      toast({
        title: 'SMS failed',
        description: err instanceof Error ? err.message : 'Unable to send bulk SMS.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingSms(false);
    }
  };

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full max-w-[1920px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="mb-2 -ml-2 text-gray-600 hover:text-gray-900"
                onClick={() => navigate('/admin/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-8 h-8" style={{ color: GOLD_COLOR }} />
                Clients & Orders
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Customer checkout information and order history
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEmailOpen(true)}
                disabled={!uniqueClients.length}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSmsOpen(true)}
                disabled={!uniqueClients.length}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send SMS
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={!orders.length}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isImporting ? 'Importing...' : 'Import Excel'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleImport}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total orders</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" style={{ color: GOLD_COLOR }}>
                  {orders.length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" style={{ color: GOLD_COLOR }}>
                  ${orders.reduce((s, o) => s + Number(o.total || 0), 0).toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Unique customers (email)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" style={{ color: GOLD_COLOR }}>
                  {new Set(orders.map((o) => (o.email || '').toLowerCase()).filter(Boolean)).size}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Client analytics */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-gray-600" />
                    Client Analytics
                  </CardTitle>
                  <CardDescription>
                    Unique clients per {viewMode === 'daily' ? 'day (last 7 days)' : viewMode === 'weekly' ? 'week (last 8 weeks)' : 'month (last 10 months)'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={viewMode === 'daily' ? 'default' : 'outline'}
                    onClick={() => setViewMode('daily')}
                  >
                    Daily
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'weekly' ? 'default' : 'outline'}
                    onClick={() => setViewMode('weekly')}
                  >
                    Weekly
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'monthly' ? 'default' : 'outline'}
                    onClick={() => setViewMode('monthly')}
                  >
                    Monthly
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500">
                    Total unique clients in range
                  </p>
                  <p className="text-2xl font-bold" style={{ color: GOLD_COLOR }}>
                    {totalClientsInRange}
                  </p>
                </div>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} angle={-20} height={50} />
                      <YAxis allowDecimals={false} />
                      <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                      <Bar dataKey="count" fill={GOLD_COLOR} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Orders table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
                <CardDescription>
                  All checkout orders with contact and delivery details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No orders yet.</p>
                    <p className="text-sm mt-1">Orders will appear here when customers complete checkout.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10" />
                          <TableHead>Date</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                          <TableHead className="text-right">Delivery</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <React.Fragment key={order.id}>
                            <TableRow
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() =>
                                setExpandedId((id) => (id === order.id ? null : order.id))
                              }
                            >
                              <TableCell>
                                {expandedId === order.id ? (
                                  <ChevronUp className="w-4 h-4 text-gray-500" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-gray-500" />
                                )}
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-sm text-gray-600">
                                {formatDate(order.created_at)}
                              </TableCell>
                              <TableCell className="font-medium">{order.full_name}</TableCell>
                              <TableCell className="text-sm">
                                <a
                                  href={`tel:${order.phone}`}
                                  className="text-primary hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {order.phone}
                                </a>
                              </TableCell>
                              <TableCell className="text-sm">
                                <a
                                  href={`mailto:${order.email}`}
                                  className="text-primary hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {order.email}
                                </a>
                              </TableCell>
                              <TableCell className="max-w-[180px] truncate text-sm text-gray-600" title={order.location}>
                                {order.location}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {orderItemsSummary(order.order_items)}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                ${Number(order.subtotal || 0).toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right text-gray-600">
                                ${Number(order.delivery_fee || 0).toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right font-bold" style={{ color: GOLD_COLOR }}>
                                ${Number(order.total || 0).toFixed(2)}
                              </TableCell>
                            </TableRow>
                            {expandedId === order.id && (
                              <TableRow className="bg-gray-50/80">
                                <TableCell colSpan={10} className="p-4">
                                  <OrderItemsDetail items={order.order_items} />
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Send Email to All Clients</DialogTitle>
            <DialogDescription>
              This sends a bulk email to {uniqueClients.filter((c) => c.email).length} clients.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="New collection update"
              />
            </div>
            <div>
              <Label htmlFor="email-body">Message</Label>
              <Textarea
                id="email-body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Write your message..."
                rows={6}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEmailOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail} disabled={isSendingEmail}>
                {isSendingEmail ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSmsOpen} onOpenChange={setIsSmsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Send SMS to All Clients</DialogTitle>
            <DialogDescription>
              This sends a bulk SMS to {uniqueClients.filter((c) => c.phone).length} clients.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sms-body">Message</Label>
              <Textarea
                id="sms-body"
                value={smsBody}
                onChange={(e) => setSmsBody(e.target.value)}
                placeholder="Write your SMS message..."
                rows={5}
              />
              <p className="text-xs text-gray-500 mt-1">
                Keep SMS under 160 characters for best delivery.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsSmsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendSms} disabled={isSendingSms}>
                {isSendingSms ? 'Sending...' : 'Send SMS'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

function OrderItemsDetail({ items }: { items: CartItem[] }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="text-sm text-gray-500">No items.</p>;
  }
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700 mb-2">Order details</p>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li
            key={`${item.id}-${item.size ?? ''}-${idx}`}
            className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0"
          >
            {item.image && (
              <img
                src={item.image}
                alt=""
                className="w-12 h-12 object-cover rounded-lg border border-gray-200"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{item.title}</p>
              {item.size && (
                <p className="text-xs text-gray-500">Size: {item.size}</p>
              )}
              {item.personalNote && (
                <p className="text-xs text-gray-600 mt-0.5">Note: {item.personalNote}</p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-medium">${Number(item.price || 0).toFixed(2)}</p>
              <p className="text-xs text-gray-500">× {item.quantity ?? 1}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminClients;
