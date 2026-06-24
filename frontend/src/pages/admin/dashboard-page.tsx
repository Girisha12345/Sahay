import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  Clock,
  UserCheck,
  Users,
  Percent,
  CheckCircle2,
  XCircle,
  Download,
  Bell,
  Sun,
  Moon,
  Filter,
  AlertTriangle,
  ArrowUpRight,
  Shield,
  Activity,
  FileDown,
  Check,
  Ban,
  Loader2,
  FolderTree,
  Eye,
  ExternalLink,
  CreditCard,
  Layers,
} from "lucide-react";

import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import {
  adminService,
  type DashboardStats,
  type RevenueAnalytics,
  type BookingAnalytics,
  type ProviderAnalyticsRecord,
  type CustomerAnalytics,
  type PaymentAnalytics,
  type ChatAnalyticsRecord,
  type ServiceCategoryAnalyticsRecord,
  type FlaggedChatRecord,
} from "../../services/adminService";
import { notificationService } from "../../services/notificationService";
import { paymentService } from "../../services/paymentService";

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export type PaymentProof = {
  id: number;
  booking: number;
  customer: number;
  customer_email: string;
  booking_service_title: string;
  booking_customer_name: string;
  amount_expected: string;
  amount_paid: string;
  utr_number: string;
  screenshot: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "UNDERPAID" | "OVERPAID";
  created_at: string;
};

export function AdminDashboardPage() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("adminTheme") === "dark";
  });

  const [dateRange, setDateRange] = useState("30days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customRange, setCustomRange] = useState(false);

  // States for stats and analytics
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueAnalytics | null>(null);
  const [bookingData, setBookingData] = useState<BookingAnalytics | null>(null);
  const [providers, setProviders] = useState<ProviderAnalyticsRecord[]>([]);
  const [customersData, setCustomersData] = useState<CustomerAnalytics | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentAnalytics | null>(null);
  const [chatData, setChatData] = useState<ChatAnalyticsRecord[]>([]);
  const [serviceData, setServiceData] = useState<ServiceCategoryAnalyticsRecord[]>([]);
  const [flaggedChats, setFlaggedChats] = useState<FlaggedChatRecord[]>([]);
  const [allProofs, setAllProofs] = useState<PaymentProof[]>([]);
  const [proofFilter, setProofFilter] = useState<"awaiting" | "all">("awaiting");

  // UI state
  const [loading, setLoading] = useState(true);
  const [revenueInterval, setRevenueInterval] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [bookingInterval, setBookingInterval] = useState<"daily" | "weekly" | "monthly">("daily");
  const [verifyingProofId, setVerifyingProofId] = useState<number | null>(null);

  // Modal State for Image View
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; type: string; time: string }>>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Reports
  const [reportType, setReportType] = useState("revenue");
  const [reportFormat, setReportFormat] = useState("pdf");

  const socketRef = useRef<WebSocket | null>(null);

  // Effect to apply theme
  useEffect(() => {
    localStorage.setItem("adminTheme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Load dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { range: dateRange };
      if (dateRange === "custom") {
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
      }

      const [
        statsRes,
        revRes,
        bookRes,
        provRes,
        custRes,
        payRes,
        chatRes,
        srvRes,
        flaggedRes,
        proofsRes,
      ] = await Promise.all([
        adminService.getDashboardStats(params),
        adminService.getRevenueAnalyticsData(params),
        adminService.getBookingAnalytics(params),
        adminService.getProviderAnalytics(params),
        adminService.getCustomerAnalytics(params),
        adminService.getPaymentAnalytics(params),
        adminService.getChatAnalytics(params),
        adminService.getServiceAnalytics(params),
        adminService.getFlaggedChats(),
        paymentService.listProofs(),
      ]);

      setStats(statsRes.data);
      setRevenueData(revRes.data);
      setBookingData(bookRes.data);
      setProviders(provRes.data);
      setCustomersData(custRes.data);
      setPaymentData(payRes.data);
      setChatData(chatRes.data);
      setServiceData(srvRes.data);
      setFlaggedChats(flaggedRes.data.filter(chat => chat.status !== "RESOLVED" && chat.status !== "DISMISSED"));
      setAllProofs(proofsRes.data as PaymentProof[]);
    } catch (error) {
      console.error("Error loading admin dashboard analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboardData();
  }, [dateRange, startDate, endDate]);

  // Establish WebSocket connection for real-time notifications
  useEffect(() => {
    try {
      const ws = notificationService.connectSocket();
      socketRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const allowedTypes = [
            "NEW_PROVIDER_REGISTRATION",
            "CHAT_REPORTED",
            "SERVICE_COMPLAINT",
            "PAYMENT_RECEIVED",
            "BOOKING_CREATED",
          ];

          if (allowedTypes.includes(payload.notification_type || payload.type)) {
            const newNotif = {
              id: payload.id || Math.random().toString(),
              title: payload.title || "Admin Update",
              message: payload.message || "Something updated in the marketplace.",
              type: payload.notification_type || payload.type,
              time: new Date().toLocaleTimeString(),
            };

            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((c) => c + 1);

            // Refresh data
            void loadDashboardData();
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onerror = (err) => console.error("Admin notification socket error:", err);
      ws.onclose = () => console.log("Admin notification socket closed");

      return () => {
        ws.close();
      };
    } catch (e) {
      console.error("Failed to connect admin notifications socket:", e);
    }
  }, []);

  const handleFilterChange = (val: string) => {
    setDateRange(val);
    if (val === "custom") {
      setCustomRange(true);
    } else {
      setCustomRange(false);
      setStartDate("");
      setEndDate("");
    }
  };

  const handleResolveChat = async (id: number, action: "resolve" | "dismiss") => {
    try {
      await adminService.resolveFlaggedChat(id, action);
      setFlaggedChats((prev) => prev.filter((chat) => chat.id !== id));
      
      const params: Record<string, string> = { range: dateRange };
      if (dateRange === "custom") {
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
      }
      const chatRes = await adminService.getChatAnalytics(params);
      setChatData(chatRes.data);
    } catch (error) {
      console.error("Error resolving flagged chat:", error);
    }
  };

  const handleVerifyProof = async (proofId: number, status: "APPROVED" | "REJECTED") => {
    setVerifyingProofId(proofId);
    try {
      await paymentService.verifyProof(proofId, status);
      setAllProofs((prev) =>
        prev.map((p) => (p.id === proofId ? { ...p, status } : p))
      );
      void loadDashboardData();
    } catch (error) {
      console.error("Error verifying payment proof:", error);
    } finally {
      setVerifyingProofId(null);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const params: Record<string, string> = { range: dateRange };
      if (dateRange === "custom") {
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
      }
      const response = await adminService.downloadReport(reportType, reportFormat, params);
      
      const fileExt = reportFormat === "excel" ? "xlsx" : reportFormat;
      const filename = `report_${reportType}_${new Date().toISOString().slice(0, 10)}_${new Date().toTimeString().slice(0, 8).replace(/:/g, "")}.${fileExt}`;
      
      const blob = new Blob([response.data], { type: response.headers["content-type"] || "application/octet-stream" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Failed to download report: " + ((error as Error).message || "Unknown error"));
    }
  };

  const renderKpi = (value: number | undefined, isCurrency = false) => {
    if (value === undefined) return "...";
    return isCurrency ? `₹${value.toLocaleString("en-IN")}` : value.toLocaleString("en-IN");
  };

  if (loading && !stats) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-sky-500" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading marketplace intelligence...</p>
        </div>
      </div>
    );
  }

  const revenueTrendData = (() => {
    if (!revenueData) return [];
    if (revenueInterval === "daily") return revenueData.daily_trend;
    if (revenueInterval === "weekly") return revenueData.weekly_trend;
    if (revenueInterval === "yearly") return revenueData.yearly_trend;
    return revenueData.monthly_trend;
  })();

  const bookingTrendData = (() => {
    if (!bookingData) return [];
    if (bookingInterval === "weekly") return bookingData.weekly_trend;
    if (bookingInterval === "monthly") return bookingData.monthly_trend;
    return bookingData.daily_trend;
  })();

  const displayedProofs = proofFilter === "awaiting"
    ? allProofs.filter(p => ["PENDING", "UNDERPAID", "OVERPAID"].includes(p.status))
    : allProofs;

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-4 sm:p-6 transition-colors duration-300 font-sans">
        
        {/* Upper Header Control Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 bg-clip-text text-transparent">
              Sahāy Marketplace Control
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real-time administrative operations, intelligence overview & moderate dashboards
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-indigo-600" />}
            </button>

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setUnreadCount(0);
                }}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Real-time Notifications Panel Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 shadow-xl z-50">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800 mb-2">
                    <h4 className="font-bold text-sm">Real-time Admin Alerts</h4>
                    <button
                      onClick={() => setNotifications([])}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">No new live notifications.</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 text-xs"
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-semibold text-slate-900 dark:text-white">{notif.title}</span>
                            <span className="text-[10px] text-slate-400">{notif.time}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 mt-0.5">{notif.message}</p>
                          <span className="inline-block mt-1.5 px-1.5 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-400 text-[9px] font-medium tracking-wide">
                            {notif.type.replace(/_/g, " ")}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm mb-6 transition duration-200">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Filter className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Date Filters</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-grow">
            {["today", "7days", "30days", "6months", "1year", "custom"].map((item) => (
              <button
                key={item}
                onClick={() => handleFilterChange(item)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  dateRange === item
                    ? "bg-sky-500 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {item === "7days" ? "7 Days" : item === "30days" ? "30 Days" : item === "6months" ? "6 Months" : item === "1year" ? "1 Year" : item}
              </button>
            ))}

            {/* Custom Dates Inputs */}
            {customRange && (
              <div className="flex items-center gap-2 ml-auto">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2 py-1 text-xs border border-slate-200 dark:border-slate-800 rounded bg-transparent focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <span className="text-xs text-slate-400">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2 py-1 text-xs border border-slate-200 dark:border-slate-800 rounded bg-transparent focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              title: "Total Revenue",
              value: renderKpi(stats?.total_revenue, true),
              icon: TrendingUp,
              color: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20",
              growth: stats?.monthly_growth_percent !== undefined ? `${stats.monthly_growth_percent}%` : null,
              growthDesc: "MoM Growth",
            },
            {
              title: "Total Bookings",
              value: renderKpi(stats?.total_bookings),
              icon: Calendar,
              color: "text-sky-500 bg-sky-500/10 dark:bg-sky-500/20",
            },
            {
              title: "Completed Jobs",
              value: renderKpi(stats?.completed_bookings),
              icon: CheckCircle2,
              color: "text-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20",
            },
            {
              title: "Cancelled Bookings",
              value: renderKpi(stats?.cancelled_bookings),
              icon: XCircle,
              color: "text-rose-500 bg-rose-500/10 dark:bg-rose-500/20",
            },
            {
              title: "Pending Bookings",
              value: renderKpi(stats?.pending_bookings),
              icon: Clock,
              color: "text-amber-500 bg-amber-500/10 dark:bg-amber-500/20",
            },
            {
              title: "Active Providers",
              value: renderKpi(stats?.active_providers),
              icon: UserCheck,
              color: "text-teal-500 bg-teal-500/10 dark:bg-teal-500/20",
            },
            {
              title: "Active Customers",
              value: renderKpi(stats?.active_customers),
              icon: Users,
              color: "text-violet-500 bg-violet-500/10 dark:bg-violet-500/20",
            },
            {
              title: "Monthly Growth",
              value: stats?.monthly_growth_percent !== undefined ? `${stats.monthly_growth_percent}%` : "...",
              icon: Percent,
              color: "text-pink-500 bg-pink-500/10 dark:bg-pink-500/20",
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <Card
                key={i}
                className="group relative overflow-hidden backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl hover:shadow-md transition duration-300 transform hover:-translate-y-0.5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      {card.title}
                    </span>
                    <h3 className="text-2xl font-bold mt-2 tracking-tight group-hover:text-sky-500 transition-colors">
                      {card.value}
                    </h3>
                  </div>
                  <div className={`p-2.5 rounded-xl ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                {card.growth && (
                  <div className="flex items-center gap-1.5 mt-3 text-xs">
                    <span
                      className={`font-semibold px-1.5 py-0.5 rounded ${
                        parseFloat(card.growth) >= 0 ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400"
                      }`}
                    >
                      {parseFloat(card.growth) >= 0 ? "▲" : "▼"} {card.growth}
                    </span>
                    <span className="text-slate-400">{card.growthDesc}</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Shortcuts Panel Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Link
            to="/admin/categories"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 transition hover:border-sky-500 hover:bg-sky-50/10 dark:hover:bg-sky-950/20 shadow-sm"
          >
            <div className="rounded-xl bg-sky-50 dark:bg-sky-950 p-2 text-sky-600 dark:text-sky-400">
              <FolderTree className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Categories</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Manage Service Taxonomy</p>
            </div>
          </Link>

          <Link
            to="/admin/providers"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 transition hover:border-emerald-500 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/20 shadow-sm"
          >
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950 p-2 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Verify Partners</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Approve Pending Providers</p>
            </div>
          </Link>

          <Link
            to="/admin/flagged-chats"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 transition hover:border-rose-500 hover:bg-rose-50/10 dark:hover:bg-rose-950/20 shadow-sm"
          >
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950 p-2 text-rose-600 dark:text-rose-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Flagged Chats</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Moderate In-app Messages</p>
            </div>
          </Link>

          <Link
            to="/admin/payments"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 transition hover:border-amber-500 hover:bg-amber-50/10 dark:hover:bg-amber-950/20 shadow-sm"
          >
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950 p-2 text-amber-600 dark:text-amber-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Verify Payments</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Accept/Reject UPI Receipts</p>
            </div>
          </Link>
        </div>

        {/* Row 1: Revenue Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Revenue Trend Chart */}
          <Card className="lg:col-span-2 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div>
                <h3 className="text-lg font-bold">Revenue Analytics Trend</h3>
                <p className="text-xs text-slate-500">Gross revenue earnings over selected intervals</p>
              </div>

              <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                {["daily", "weekly", "monthly", "yearly"].map((interval) => (
                  <button
                    key={interval}
                    onClick={() => setRevenueInterval(interval as any)}
                    className={`px-3 py-1 rounded text-xs font-semibold capitalize transition ${
                      revenueInterval === interval
                        ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    {interval}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                  <XAxis
                    dataKey={revenueInterval === "daily" ? "date" : revenueInterval === "weekly" ? "week" : revenueInterval === "yearly" ? "year" : "month"}
                    stroke="#94A3B8"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none" }}
                    className="dark:bg-slate-900"
                    formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Revenue By Category */}
          <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl">
            <h3 className="text-lg font-bold">Revenue by Category</h3>
            <p className="text-xs text-slate-500 mb-4">Earnings distribution across top services</p>

            <div className="h-64 w-full relative">
              {revenueData?.category_breakdown.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">No revenue records found</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueData?.category_breakdown ?? []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {(revenueData?.category_breakdown ?? []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Legends */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {(revenueData?.category_breakdown ?? []).slice(0, 4).map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="truncate text-slate-500 dark:text-slate-400 font-semibold">{entry.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Row 2: Revenue Comparisons & Booking status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Revenue Comparison Bar Chart */}
          <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl">
            <h3 className="text-lg font-bold">Revenue Comparison</h3>
            <p className="text-xs text-slate-500 mb-4">Current vs Previous periods comparison</p>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData?.comparison.monthly ?? []}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <Tooltip formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                    {(revenueData?.comparison.monthly ?? []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#94A3B8" : "#3b82f6"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Booking Status distribution donut */}
          <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl">
            <h3 className="text-lg font-bold">Booking Status</h3>
            <p className="text-xs text-slate-500 mb-4">Marketplace booking lifecycle status</p>

            <div className="h-64">
              {bookingData?.status_distribution.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">No bookings placed</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bookingData?.status_distribution ?? []}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {(bookingData?.status_distribution ?? []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={10} wrapperStyle={{ fontSize: "10px" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Booking trends Area Chart */}
          <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold">Booking Volume</h3>
                <p className="text-xs text-slate-500">Trend of incoming service orders</p>
              </div>

              <select
                value={bookingInterval}
                onChange={(e) => setBookingInterval(e.target.value as any)}
                className="text-xs bg-slate-100 dark:bg-slate-800 border-none outline-none rounded p-1 font-semibold"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingTrendData}>
                  <defs>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey={bookingInterval === "daily" ? "date" : bookingInterval === "weekly" ? "week" : "month"}
                    stroke="#94A3B8"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBookings)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Row 3: Provider Performance & Customer Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Top Providers Table */}
          <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl">
            <h3 className="text-lg font-bold mb-1">Top Providers</h3>
            <p className="text-xs text-slate-500 mb-4">Partner performance, rating, jobs completed & revenues</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                    <th className="pb-2 font-semibold">Provider</th>
                    <th className="pb-2 font-semibold">City / Skill</th>
                    <th className="pb-2 font-semibold text-center">Rating</th>
                    <th className="pb-2 font-semibold text-center">Jobs</th>
                    <th className="pb-2 font-semibold text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {providers.slice(0, 5).map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 transition duration-150">
                      <td className="py-2.5 font-bold text-slate-950 dark:text-white">{p.name}</td>
                      <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">
                        {p.services.slice(0, 2).join(", ") || "Partner"}
                      </td>
                      <td className="py-2.5 text-center text-amber-500 font-extrabold">★ {p.rating.toFixed(1)}</td>
                      <td className="py-2.5 text-center font-bold">{p.completed_jobs}</td>
                      <td className="py-2.5 text-right font-extrabold text-sky-500">₹{p.revenue.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                  {providers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">No active provider statistics</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Customer growth line and Spenders table */}
          <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl">
            <h3 className="text-lg font-bold mb-1">Customer Growth</h3>
            <p className="text-xs text-slate-500 mb-4">Registration rates, active clients & returning users</p>

            <div className="h-60">
              {customersData?.growth_trend.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">No customer growth data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={customersData?.growth_trend ?? []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: "9px" }} />
                    <Line type="monotone" name="New Registrations" dataKey="new_registrations" stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" name="Active Customers" dataKey="active_customers" stroke="#ec4899" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        {/* Row 4: Customer spends & Payment Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Top Customers Spend */}
          <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl">
            <h3 className="text-lg font-bold mb-1">Top Spend Customers</h3>
            <p className="text-xs text-slate-500 mb-4">Customers with the highest marketplace spends</p>

            <div className="overflow-y-auto max-h-64">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                    <th className="pb-2 font-semibold">Customer</th>
                    <th className="pb-2 font-semibold text-center">Bookings</th>
                    <th className="pb-2 font-semibold text-right">Spends</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {(customersData?.top_customers ?? []).slice(0, 5).map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 transition">
                      <td className="py-2 font-bold text-slate-950 dark:text-white">{c.name}</td>
                      <td className="py-2 text-center font-bold">{c.total_bookings}</td>
                      <td className="py-2 text-right font-extrabold text-emerald-500">₹{c.total_spend.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                  {(customersData?.top_customers ?? []).length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400">No spend records on file</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Payment Methods */}
          <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl">
            <h3 className="text-lg font-bold">Payment Methods</h3>
            <p className="text-xs text-slate-500 mb-4">Volume share across payment integrations</p>

            <div className="h-56">
              {paymentData?.methods_share.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">No payment transaction records</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentData?.methods_share ?? []}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {(paymentData?.methods_share ?? []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: "9px" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Payment Success vs Fail rate */}
          <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl">
            <h3 className="text-lg font-bold">Payment Statuses</h3>
            <p className="text-xs text-slate-500 mb-4">Transaction outcomes success rates</p>

            <div className="h-56">
              {paymentData?.status_trends.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">No transaction statuses</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentData?.status_trends ?? []}>
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]}>
                      {(paymentData?.status_trends ?? []).map((entry, index) => {
                        const fill = entry.name === "PAID" ? "#10b981" : entry.name === "FAILED" ? "#ef4444" : "#f59e0b";
                        return <Cell key={`cell-${index}`} fill={fill} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        {/* Row 5: Chat moderation trends, flagged chats queue */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Chat moderation line chart */}
          <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl">
            <h3 className="text-lg font-bold">Chat Policy Violations</h3>
            <p className="text-xs text-slate-500 mb-4">Trends of flagged logs, pending reviews and moderation</p>

            <div className="h-56">
              {chatData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">No flagged logs recorded</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chatData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: "9px" }} />
                    <Line type="monotone" name="Flagged Chats" dataKey="flagged" stroke="#f43f5e" strokeWidth={2} dot={false} />
                    <Line type="monotone" name="Resolved" dataKey="resolved" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" name="Pending" dataKey="pending" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Active Flagged Chats moderation table queue */}
          <Card className="lg:col-span-2 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold">Flagged Conversations Review</h3>
                <p className="text-xs text-slate-500">Live feed of conversation logs flagged for contact sharing details</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 text-xs font-semibold">
                {flaggedChats.length} Action Needed
              </span>
            </div>

            <div className="overflow-x-auto max-h-56">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                    <th className="pb-2 font-semibold">Booking ID</th>
                    <th className="pb-2 font-semibold">Sender</th>
                    <th className="pb-2 font-semibold">Raw Content</th>
                    <th className="pb-2 font-semibold text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {flaggedChats.map((chat) => (
                    <tr key={chat.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 transition duration-150">
                      <td className="py-2.5 font-semibold">#{chat.booking_id || "N/A"}</td>
                      <td className="py-2.5 font-medium text-slate-500 dark:text-slate-400">{chat.sender_email}</td>
                      <td className="py-2.5 italic text-slate-700 dark:text-slate-300 font-bold max-w-[200px] truncate" title={chat.raw_content}>
                        "{chat.raw_content}"
                      </td>
                      <td className="py-2.5 text-right flex justify-end gap-1.5 mt-0.5">
                        <button
                          onClick={() => handleResolveChat(chat.id, "resolve")}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-700 dark:text-emerald-400 dark:hover:text-white transition duration-150 font-bold cursor-pointer"
                        >
                          <Check className="h-3 w-3" /> Resolve
                        </button>
                        <button
                          onClick={() => handleResolveChat(chat.id, "dismiss")}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-700 dark:text-rose-400 dark:hover:text-white transition duration-150 font-bold cursor-pointer"
                        >
                          <Ban className="h-3 w-3" /> Dismiss
                        </button>
                      </td>
                    </tr>
                  ))}
                  {flaggedChats.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">Perfect policy compliance! No flagged logs.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Row 6: Pending Manual UPI Payments Verification (Accept / Reject) */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold">Manual UPI Payments Verification</h3>
                <p className="text-xs text-slate-500">Review pending manual receipt uploads and approve or reject transactions</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                  <button
                    onClick={() => setProofFilter("awaiting")}
                    className={`px-3 py-1 rounded text-xs font-semibold capitalize transition ${
                      proofFilter === "awaiting"
                        ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    Awaiting ({allProofs.filter(p => ["PENDING", "UNDERPAID", "OVERPAID"].includes(p.status)).length})
                  </button>
                  <button
                    onClick={() => setProofFilter("all")}
                    className={`px-3 py-1 rounded text-xs font-semibold capitalize transition ${
                      proofFilter === "all"
                        ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    All ({allProofs.length})
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                    <th className="pb-2 font-semibold">Booking ID</th>
                    <th className="pb-2 font-semibold">Customer</th>
                    <th className="pb-2 font-semibold">Amount Expected</th>
                    <th className="pb-2 font-semibold">Amount Paid</th>
                    <th className="pb-2 font-semibold">Difference</th>
                    <th className="pb-2 font-semibold">UTR ID</th>
                    <th className="pb-2 font-semibold">Screenshot</th>
                    <th className="pb-2 font-semibold">Status</th>
                    <th className="pb-2 font-semibold text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {displayedProofs.map((proof) => (
                    <tr key={proof.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 transition duration-150">
                      <td className="py-2.5 font-bold">#{proof.booking}</td>
                      <td className="py-2.5">
                        <div className="font-semibold text-slate-850 dark:text-white">{proof.booking_customer_name}</div>
                        <div className="text-[10px] text-slate-400">{proof.customer_email}</div>
                      </td>
                      <td className="py-2.5 font-bold">₹{Number(proof.amount_expected).toLocaleString("en-IN")}</td>
                      <td className="py-2.5 font-black text-emerald-600 dark:text-emerald-450">₹{Number(proof.amount_paid).toLocaleString("en-IN")}</td>
                      <td className="py-2.5">
                        {(() => {
                          const diff = Number(proof.amount_paid) - Number(proof.amount_expected);
                          return (
                            <span className={`font-bold ${diff < 0 ? "text-rose-500" : diff > 0 ? "text-indigo-500" : "text-slate-400"}`}>
                              {diff > 0 ? "+" : ""}{diff.toLocaleString("en-IN")}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-2.5 font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded w-fit">{proof.utr_number}</td>
                      <td className="py-2.5">
                        {proof.screenshot ? (
                          <button
                            onClick={() => setSelectedImage(proof.screenshot)}
                            className="flex items-center gap-1 font-bold text-sky-500 hover:text-sky-600 cursor-pointer"
                          >
                            <Eye className="h-3 w-3" /> View Image
                          </button>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                      <td className="py-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          proof.status === "UNDERPAID"
                            ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400"
                            : proof.status === "OVERPAID"
                            ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400"
                            : proof.status === "APPROVED"
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-450"
                            : proof.status === "REJECTED"
                            ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-455"
                            : "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400"
                        }`}>
                          {proof.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right flex justify-end gap-1.5 mt-0.5">
                        {["PENDING", "UNDERPAID", "OVERPAID"].includes(proof.status) ? (
                          <>
                            <button
                              disabled={verifyingProofId !== null}
                              onClick={() => handleVerifyProof(proof.id, "APPROVED")}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-700 dark:text-emerald-400 dark:hover:text-white transition duration-150 font-bold cursor-pointer disabled:opacity-50"
                            >
                              {verifyingProofId === proof.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Approve
                            </button>
                            <button
                              disabled={verifyingProofId !== null}
                              onClick={() => handleVerifyProof(proof.id, "REJECTED")}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-700 dark:text-rose-400 dark:hover:text-white transition duration-150 font-bold cursor-pointer disabled:opacity-50"
                            >
                              <XCircle className="h-3 w-3" /> Reject
                            </button>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold">
                            {proof.status === "APPROVED" ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-rose-500" />
                            )}{" "}
                            {proof.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {displayedProofs.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        {proofFilter === "awaiting" ? "All payment proof submissions verified!" : "No payment proof submissions found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Row 7: Service popularity & Downloads Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Services Category popularity Bar Chart */}
          <Card className="lg:col-span-2 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl">
            <h3 className="text-lg font-bold">Service Category Popularity</h3>
            <p className="text-xs text-slate-500 mb-4">Bookings placed per service sector</p>

            <div className="h-64">
              {serviceData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">No category statistics on record</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#a78bfa" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Download Reports Panel */}
          <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileDown className="h-5 w-5 text-sky-500" />
                <h3 className="text-lg font-bold">Generate Reports</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Download structured data exports matching active global filters.
              </p>

              <div className="space-y-3.5 mb-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Report Section
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none outline-none font-semibold text-slate-700 dark:text-slate-300"
                  >
                    <option value="revenue">Revenue & Earnings Report</option>
                    <option value="booking">Marketplace Booking List</option>
                    <option value="provider">Provider Performance List</option>
                    <option value="customer">Customer Spends & Growth</option>
                    <option value="payment">Stripe & Manual Payment Proofs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Export Format
                  </label>
                  <div className="flex gap-2">
                    {["pdf", "excel", "csv"].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setReportFormat(fmt)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                          reportFormat === fmt
                            ? "bg-sky-500 text-white shadow-sm"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadReport}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold text-xs hover:from-sky-600 hover:to-indigo-600 shadow-md transition duration-200"
            >
              <Download className="h-4 w-4" /> Download Report
            </button>
          </Card>
        </div>

      </div>

      {/* Lightbox / Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 transition-opacity">
          <div className="relative max-w-4xl bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-4 flex flex-col items-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 p-2 text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              <XCircle className="h-5 w-5" />
            </button>
            <div className="max-h-[70vh] max-w-full overflow-auto mt-6 flex justify-center">
              <img
                src={selectedImage}
                alt="Payment Receipt UTR Screenshot"
                className="max-h-[65vh] object-contain rounded-lg border dark:border-slate-800 shadow-inner"
              />
            </div>
            <div className="mt-4 flex gap-4 w-full justify-between items-center border-t dark:border-slate-800 pt-3">
              <span className="text-xs text-slate-400">Payment Screenshot Verification Link</span>
              <a
                href={selectedImage}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-500 hover:text-sky-600 hover:underline"
              >
                Open in new tab
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
