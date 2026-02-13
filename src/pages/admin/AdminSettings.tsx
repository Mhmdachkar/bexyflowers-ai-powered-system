import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  User,
  Mail,
  Lock,
  Bell,
  Palette,
  Shield,
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  MapPin,
  Phone,
  MessageCircle,
  Building,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

const GOLD_COLOR = "rgb(199, 158, 72)";

const AdminSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    currentEmail: "",
  });

  // Password Settings
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    orderAlerts: true,
    stockAlerts: true,
    reviewAlerts: false,
  });

  // Business Information Settings
  const [businessInfo, setBusinessInfo] = useState({
    whatsappUrl: "",
    googleMapsUrl: "",
    phoneNumber: "",
    address: "",
  });

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("adminAuthenticated");
    if (!isAuthenticated) {
      navigate("/admin/login");
      return;
    }

    // Load current admin data
    const adminName = localStorage.getItem("adminUsername") || "Admin";
    const adminEmail = localStorage.getItem("adminEmail") || "admin@bexyflowers.com";
    
    setProfileData({
      name: adminName,
      email: adminEmail,
      currentEmail: adminEmail,
    });

    // Load business information
    const savedBusinessInfo = localStorage.getItem("businessInfo");
    if (savedBusinessInfo) {
      try {
        setBusinessInfo(JSON.parse(savedBusinessInfo));
      } catch (e) {
        console.error("Failed to load business info", e);
      }
    }
  }, [navigate]);

  const handleProfileUpdate = async () => {
    if (!profileData.name || !profileData.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update localStorage
      localStorage.setItem("adminUsername", profileData.name);
      localStorage.setItem("adminEmail", profileData.email);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
      setProfileData(prev => ({ ...prev, currentEmail: profileData.email }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });
      
      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Save to localStorage
      localStorage.setItem("adminNotifications", JSON.stringify(notifications));
      
      toast({
        title: "Settings Saved",
        description: "Notification preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateWhatsAppUrl = (url: string): boolean => {
    if (!url) return true; // Empty is valid
    // WhatsApp click to chat URL format: https://wa.me/PHONENUMBER
    const whatsappPattern = /^https:\/\/wa\.me\/\d+(\?text=.*)?$/;
    return whatsappPattern.test(url);
  };

  const validateGoogleMapsUrl = (url: string): boolean => {
    if (!url) return true; // Empty is valid
    // Google Maps URL patterns
    const patternsArray = [
      /^https:\/\/(www\.)?google\.com\/maps/, // Google Maps link
      /^https:\/\/maps\.app\.goo\.gl/, // Short Google Maps link
      /^https:\/\/goo\.gl\/maps/, // Legacy short link
    ];
    return patternsArray.some(pattern => pattern.test(url));
  };

  const handleBusinessInfoUpdate = async () => {
    // Validate WhatsApp URL
    if (businessInfo.whatsappUrl && !validateWhatsAppUrl(businessInfo.whatsappUrl)) {
      toast({
        title: "Invalid WhatsApp URL",
        description: "WhatsApp URL should be in format: https://wa.me/PHONENUMBER",
        variant: "destructive",
      });
      return;
    }

    // Validate Google Maps URL
    if (businessInfo.googleMapsUrl && !validateGoogleMapsUrl(businessInfo.googleMapsUrl)) {
      toast({
        title: "Invalid Google Maps URL",
        description: "Please provide a valid Google Maps link",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Save to localStorage
      localStorage.setItem("businessInfo", JSON.stringify(businessInfo));
      
      toast({
        title: "Business Information Saved",
        description: "Your business details have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save business information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/dashboard")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
              <Separator orientation="vertical" className="h-8 hidden sm:block" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <Settings className="w-7 h-7" style={{ color: GOLD_COLOR }} />
                  Settings
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">Manage your account and preferences</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <CardTitle className="text-xl">Profile Information</CardTitle>
                </div>
                <CardDescription>Update your account profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      placeholder="admin@bexyflowers.com"
                      className="pl-10"
                    />
                  </div>
                  {profileData.email !== profileData.currentEmail && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Email will be updated after saving
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleProfileUpdate}
                    disabled={loading}
                    className="gap-2"
                    style={{
                      background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                      color: "white",
                    }}
                  >
                    <Save className="w-4 h-4" />
                    Save Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Password Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  <CardTitle className="text-xl">Change Password</CardTitle>
                </div>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordData.newPassword && passwordData.confirmPassword && (
                    <p className={`text-xs flex items-center gap-1 ${
                      passwordData.newPassword === passwordData.confirmPassword
                        ? "text-green-600"
                        : "text-red-600"
                    }`}>
                      {passwordData.newPassword === passwordData.confirmPassword ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Passwords match
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          Passwords do not match
                        </>
                      )}
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handlePasswordChange}
                    disabled={loading}
                    className="gap-2"
                    style={{
                      background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                      color: "white",
                    }}
                  >
                    <Shield className="w-4 h-4" />
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Business Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  <CardTitle className="text-xl">Business Information</CardTitle>
                </div>
                <CardDescription>Configure your business contact details and location</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsappUrl">WhatsApp Click to Chat URL</Label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="whatsappUrl"
                      type="url"
                      value={businessInfo.whatsappUrl}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, whatsappUrl: e.target.value })}
                      placeholder="https://wa.me/1234567890"
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Format: https://wa.me/PHONENUMBER (e.g., https://wa.me/9613123456)
                  </p>
                  {businessInfo.whatsappUrl && !validateWhatsAppUrl(businessInfo.whatsappUrl) && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Invalid WhatsApp click to chat link
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="googleMapsUrl">Google Maps Location URL</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="googleMapsUrl"
                      type="url"
                      value={businessInfo.googleMapsUrl}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, googleMapsUrl: e.target.value })}
                      placeholder="https://maps.app.goo.gl/..."
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Get this from Google Maps: Search your business → Click "Share" → Copy link
                  </p>
                  {businessInfo.googleMapsUrl && !validateGoogleMapsUrl(businessInfo.googleMapsUrl) && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Invalid Google Maps link
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Business Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={businessInfo.phoneNumber}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, phoneNumber: e.target.value })}
                      placeholder="+961 3 123 456"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="address"
                      value={businessInfo.address}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                      placeholder="123 Main Street, Beirut, Lebanon"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleBusinessInfoUpdate}
                    disabled={loading}
                    className="gap-2"
                    style={{
                      background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                      color: "white",
                    }}
                  >
                    <Save className="w-4 h-4" />
                    Save Business Info
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  <CardTitle className="text-xl">Notification Preferences</CardTitle>
                </div>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
                  <div>
                    <Label htmlFor="emailNotifications" className="font-medium cursor-pointer">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-gray-500">Receive email updates about your account</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
                  <div>
                    <Label htmlFor="orderAlerts" className="font-medium cursor-pointer">
                      Order Alerts
                    </Label>
                    <p className="text-sm text-gray-500">Get notified when new orders are placed</p>
                  </div>
                  <Switch
                    id="orderAlerts"
                    checked={notifications.orderAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, orderAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
                  <div>
                    <Label htmlFor="stockAlerts" className="font-medium cursor-pointer">
                      Stock Alerts
                    </Label>
                    <p className="text-sm text-gray-500">Receive alerts when products are low in stock</p>
                  </div>
                  <Switch
                    id="stockAlerts"
                    checked={notifications.stockAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, stockAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
                  <div>
                    <Label htmlFor="reviewAlerts" className="font-medium cursor-pointer">
                      Review Alerts
                    </Label>
                    <p className="text-sm text-gray-500">Get notified about new customer reviews</p>
                  </div>
                  <Switch
                    id="reviewAlerts"
                    checked={notifications.reviewAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, reviewAlerts: checked })}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleNotificationUpdate}
                    disabled={loading}
                    className="gap-2"
                    style={{
                      background: `linear-gradient(135deg, ${GOLD_COLOR} 0%, rgba(199, 158, 72, 0.9) 100%)`,
                      color: "white",
                    }}
                  >
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Security Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Security Tips</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Use a strong, unique password for your admin account</li>
                      <li>• Enable two-factor authentication for added security</li>
                      <li>• Never share your admin credentials with anyone</li>
                      <li>• Regularly review your account activity</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
    </AdminLayout>
  );
};

export default AdminSettings;
