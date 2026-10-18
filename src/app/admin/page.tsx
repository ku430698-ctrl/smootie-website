"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import MarketBrandLogo from "@/components/MarketBrandLogo";
import {
  Users, BarChart2, ShieldCheck, Mail, Phone, ExternalLink,
  Search, Filter, CheckCircle2, Clock, Trash2, Edit3, Plus,
  Database, RefreshCw, Lock, LogOut, Download, AlertCircle,
  TrendingUp, Sparkles, Eye, EyeOff, X, BookOpen, Layers, Check,
  Menu, ChevronRight, Activity, ArrowUpRight, ArrowUp, ArrowDown,
  Save, Globe, Settings, Briefcase, Layout, Award, HelpCircle, FileText
} from "lucide-react";
import {
  EXPERT_INFO,
  DEFAULT_GLOBAL_SETTINGS,
  DEFAULT_HOME_CONTENT,
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_CONTACT_CONTENT,
  DEFAULT_SERVICES_CMS,
  DEFAULT_PORTFOLIO_CMS,
} from "@/lib/data";
import {
  Inquiry,
  Subscriber,
  ServiceItem,
  PortfolioItem,
  GlobalSettings,
  HomePageContent,
  AboutPageContent,
  ContactPageContent,
} from "@/lib/types";

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "home" | "about" | "services" | "portfolio" | "contact" | "subscribers" | "settings"
  >("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data States
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES_CMS);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(DEFAULT_PORTFOLIO_CMS);
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULT_GLOBAL_SETTINGS);
  const [homeContent, setHomeContent] = useState<HomePageContent>(DEFAULT_HOME_CONTENT);
  const [aboutContent, setAboutContent] = useState<AboutPageContent>(DEFAULT_ABOUT_CONTENT);
  const [contactContent, setContactContent] = useState<ContactPageContent>(DEFAULT_CONTACT_CONTENT);

  const [stats, setStats] = useState({
    totalInquiries: 0,
    pendingInquiries: 0,
    contactedInquiries: 0,
    enrolledInquiries: 0,
    totalSubscribers: 0,
    totalInsights: 0,
    isMongo: false,
  });

  // Filter & Search States (Inquiries)
  const [inquirySearch, setInquirySearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // Portfolio Filter
  const [portfolioCategoryFilter, setPortfolioCategoryFilter] = useState("All");

  // Service Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceFormError, setServiceFormError] = useState("");
  const [serviceFormSaving, setServiceFormSaving] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    title: "",
    subtitle: "",
    slug: "",
    scope: "",
    description: "",
    featuresText: "",
    image: "",
    published: true,
  });

  // Portfolio Modal State
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [editingPortfolioId, setEditingPortfolioId] = useState<string | null>(null);
  const [portfolioFormError, setPortfolioFormError] = useState("");
  const [portfolioFormSaving, setPortfolioFormSaving] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({
    title: "",
    slug: "",
    category: "Index Analysis",
    subtitle: "Educational Case Study",
    summary: "",
    description: "",
    projectUrl: "",
    tagsText: "Technical Analysis, Price Action",
    date: "Educational Guide",
    readTime: "5 min read",
    contentText: "",
    image: "",
    published: true,
    featured: false,
  });

  // Check auth session
  useEffect(() => {
    const token = localStorage.getItem("kv_admin_session");
    if (token) {
      setIsAuthenticated(true);
      fetchAdminData();
    }
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("kv_admin_session", data.token);
        setIsAuthenticated(true);
        fetchAdminData();
      } else {
        setAuthError(data.error || "Invalid Passcode");
      }
    } catch {
      setAuthError("Failed to authenticate. Please try again.");
    }
  };

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("kv_admin_session") : null;
    const headers = new Headers(options.headers || {});
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "same-origin",
    });
    if (response.status === 401) {
      localStorage.removeItem("kv_admin_session");
      setIsAuthenticated(false);
    }
    return response;
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } catch {}
    localStorage.removeItem("kv_admin_session");
    setIsAuthenticated(false);
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [
        resInq,
        resSubs,
        resServ,
        resPort,
        resStats,
        resSett,
        resHome,
        resAbout,
        resContact,
      ] = await Promise.all([
        authFetch("/api/admin/inquiries"),
        authFetch("/api/admin/subscribers"),
        authFetch("/api/admin/services"),
        authFetch("/api/admin/portfolio"),
        authFetch("/api/admin/stats"),
        authFetch("/api/admin/settings"),
        authFetch("/api/admin/page-content?page=home"),
        authFetch("/api/admin/page-content?page=about"),
        authFetch("/api/admin/page-content?page=contact"),
      ]);

      if (resInq.ok) {
        const data = await resInq.json();
        setInquiries(data.data || []);
      }
      if (resSubs.ok) {
        const data = await resSubs.json();
        setSubscribers(data.data || []);
      }
      if (resServ.ok) {
        const data = await resServ.json();
        if (data.data && data.data.length > 0) setServices(data.data);
      }
      if (resPort.ok) {
        const data = await resPort.json();
        if (data.data && data.data.length > 0) setPortfolio(data.data);
      }
      if (resStats.ok) {
        const data = await resStats.json();
        setStats(data.data || stats);
      }
      if (resSett.ok) {
        const data = await resSett.json();
        if (data.data) setSettings(data.data);
      }
      if (resHome.ok) {
        const data = await resHome.json();
        if (data.data) setHomeContent(data.data);
      }
      if (resAbout.ok) {
        const data = await resAbout.json();
        if (data.data) setAboutContent(data.data);
      }
      if (resContact.ok) {
        const data = await resContact.json();
        if (data.data) setContactContent(data.data);
      }
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const notifyContentUpdated = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("site-content-updated"));
      try {
        localStorage.setItem("site-content-updated", Date.now().toString());
      } catch {}
    }
  };

  /* ==================== SERVICES CMS ACTIONS ==================== */
  const handleOpenCreateService = () => {
    setEditingServiceId(null);
    setServiceFormError("");
    setServiceForm({
      title: "",
      subtitle: "",
      slug: "",
      scope: "",
      description: "",
      featuresText: "Core market mechanics and order execution\nPrice action analysis & candlestick patterns\nStructured risk rules & trade journaling",
      image: "",
      published: true,
    });
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (svc: ServiceItem) => {
    setEditingServiceId(svc.id);
    setServiceFormError("");
    setServiceForm({
      title: svc.title,
      subtitle: svc.subtitle || "",
      slug: svc.slug || "",
      scope: svc.scope || "",
      description: svc.description,
      featuresText: Array.isArray(svc.features) ? svc.features.join("\n") : "",
      image: svc.image || "",
      published: svc.published ?? true,
    });
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setServiceFormError("");
    setServiceFormSaving(true);
    try {
      const features = serviceForm.featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      const res = await authFetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingServiceId || undefined,
          ...serviceForm,
          features,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsServiceModalOpen(false);
        showToast(editingServiceId ? "Service updated in MongoDB" : "Service created in MongoDB");
        notifyContentUpdated();
        await fetchAdminData();
      } else {
        setServiceFormError(data.error || "Failed to save service.");
      }
    } catch (err) {
      setServiceFormError((err as Error).message || "An unexpected error occurred.");
    } finally {
      setServiceFormSaving(false);
    }
  };

  const handleDeleteService = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete the service "${title}"?`)) return;
    try {
      const res = await authFetch(`/api/admin/services?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Service deleted from database.");
        notifyContentUpdated();
        fetchAdminData();
      } else {
        alert(data.error || "Failed to delete service.");
      }
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleTogglePublishService = async (id: string, current: boolean) => {
    try {
      const res = await authFetch("/api/admin/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, published: !current }),
      });
      if (res.ok) {
        showToast(!current ? "Service published" : "Service moved to drafts");
        notifyContentUpdated();
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveService = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= services.length) return;

    const newServices = [...services];
    const [moved] = newServices.splice(index, 1);
    newServices.splice(targetIndex, 0, moved);
    setServices(newServices);

    try {
      await authFetch("/api/admin/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reorder", orderedIds: newServices.map((s) => s.id) }),
      });
      showToast("Services order updated");
      notifyContentUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  /* ==================== PORTFOLIO CMS ACTIONS ==================== */
  const handleOpenCreatePortfolio = () => {
    setEditingPortfolioId(null);
    setPortfolioFormError("");
    setPortfolioForm({
      title: "",
      slug: "",
      category: "Index Analysis",
      subtitle: "Case Study & Analysis",
      summary: "",
      description: "",
      projectUrl: "",
      tagsText: "Technical Analysis, Price Action, Strategy",
      date: "Educational Guide",
      readTime: "5 min read",
      contentText: "At its core, market structure represents order flow and institutional positioning.\n\nDefine clear support and resistance invalidation zones before entering any trade.\n\nRisk management and strict position limits ensure long-term portfolio survival.",
      image: "",
      published: true,
      featured: false,
    });
    setIsPortfolioModalOpen(true);
  };

  const handleOpenEditPortfolio = (item: PortfolioItem) => {
    setEditingPortfolioId(item.id);
    setPortfolioFormError("");
    setPortfolioForm({
      title: item.title,
      slug: item.slug || "",
      category: item.category || "Index Analysis",
      subtitle: item.subtitle || item.date || "",
      summary: item.summary,
      description: item.description || item.summary,
      projectUrl: item.projectUrl || "",
      tagsText: Array.isArray(item.tags) ? item.tags.join(", ") : "",
      date: item.date || "Educational Guide",
      readTime: item.readTime || "5 min read",
      contentText: Array.isArray(item.content) ? item.content.join("\n\n") : "",
      image: item.image || "",
      published: item.published ?? true,
      featured: item.featured ?? false,
    });
    setIsPortfolioModalOpen(true);
  };

  const handleSavePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    setPortfolioFormError("");
    setPortfolioFormSaving(true);
    try {
      const tags = portfolioForm.tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const content = portfolioForm.contentText
        .split("\n\n")
        .map((p) => p.trim())
        .filter(Boolean);

      const res = await authFetch("/api/admin/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPortfolioId || undefined,
          ...portfolioForm,
          tags,
          content,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsPortfolioModalOpen(false);
        showToast(editingPortfolioId ? "Portfolio item updated in MongoDB" : "Portfolio item published to MongoDB");
        notifyContentUpdated();
        await fetchAdminData();
      } else {
        setPortfolioFormError(data.error || "Failed to save portfolio item.");
      }
    } catch (err) {
      setPortfolioFormError((err as Error).message || "An unexpected error occurred.");
    } finally {
      setPortfolioFormSaving(false);
    }
  };

  const handleDeletePortfolio = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      const res = await authFetch(`/api/admin/portfolio?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Portfolio item deleted.");
        notifyContentUpdated();
        fetchAdminData();
      } else {
        alert(data.error || "Failed to delete item.");
      }
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleTogglePublishPortfolio = async (id: string, current: boolean) => {
    try {
      const res = await authFetch("/api/admin/portfolio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, published: !current }),
      });
      if (res.ok) {
        showToast(!current ? "Item published to public website" : "Item moved to drafts");
        notifyContentUpdated();
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMovePortfolio = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= portfolio.length) return;

    const newPortfolio = [...portfolio];
    const [moved] = newPortfolio.splice(index, 1);
    newPortfolio.splice(targetIndex, 0, moved);
    setPortfolio(newPortfolio);

    try {
      await authFetch("/api/admin/portfolio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reorder", orderedIds: newPortfolio.map((p) => p.id) }),
      });
      showToast("Portfolio order updated");
      notifyContentUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  /* ==================== PAGE CONTENT SAVES ==================== */
  const handleSaveHomeContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const res = await authFetch("/api/admin/page-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: "home", ...homeContent }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Home page content saved to MongoDB!");
        notifyContentUpdated();
      } else {
        showToast(data.error || "Failed to save home page content.", "error");
      }
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveAboutContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const res = await authFetch("/api/admin/page-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: "about", ...aboutContent }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("About page content saved to MongoDB!");
        notifyContentUpdated();
      } else {
        showToast(data.error || "Failed to save about content.", "error");
      }
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveContactContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const res = await authFetch("/api/admin/page-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: "contact", ...contactContent }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Contact page content saved to MongoDB!");
        notifyContentUpdated();
      } else {
        showToast(data.error || "Failed to save contact content.", "error");
      }
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveGlobalSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const res = await authFetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Global settings & SEO metadata saved to MongoDB!");
        notifyContentUpdated();
      } else {
        showToast(data.error || "Failed to save settings.", "error");
      }
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setSaveLoading(false);
    }
  };

  /* ==================== INQUIRIES ACTIONS ==================== */
  const handleStatusChange = async (id: string, status: "pending" | "contacted" | "enrolled") => {
    try {
      const res = await authFetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
        );
        showToast(`Lead marked as ${status}`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this lead?")) return;
    try {
      const res = await authFetch(`/api/admin/inquiries?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setInquiries((prev) => prev.filter((inq) => inq.id !== id));
        showToast("Lead deleted.");
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const exportInquiriesCSV = () => {
    const headers = ["Name,Phone,Email,Status,Program,Experience,Capital,Date,Message"];
    const rows = inquiries.map(
      (i) =>
        `"${i.name}","${i.phone}","${i.email}","${i.status}","${i.serviceInterest}","${i.experienceLevel}","${i.tradingCapital}","${i.createdAt}","${(i.message || "").replace(/"/g, '""')}"`
    );
    const csv = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `kamal_verma_leads_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const exportSubscribersCSV = () => {
    const headers = ["Email,Subscribed At,Source"];
    const rows = subscribers.map((s) => `"${s.email}","${s.subscribedAt}","${s.source || "website"}"`);
    const csv = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchSearch =
      inq.name.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.email.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.phone.includes(inquirySearch) ||
      inq.serviceInterest.toLowerCase().includes(inquirySearch.toLowerCase());
    const matchStatus = statusFilter === "all" || inq.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredPortfolio = portfolioCategoryFilter === "All"
    ? portfolio
    : portfolio.filter((p) => p.category === portfolioCategoryFilter);

  /* ==================== LOGIN SCREEN ==================== */
  if (!isAuthenticated) {
    return (
      <div
        className="admin-desk"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(ellipse 90% 60% at 50% 0%, #0d1527 0%, #07090e 100%)",
          padding: "20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Soft Radial Ambient Blue Spotlight */}
        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(30, 58, 138, 0.10) 50%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        <div
          className="glass-card"
          style={{
            maxWidth: "440px",
            width: "100%",
            padding: "44px 36px",
            borderRadius: "28px",
            background: "rgba(10, 14, 24, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.10)",
            boxShadow: "0 24px 70px rgba(0, 0, 0, 0.70)",
            textAlign: "center",
            position: "relative",
            zIndex: 2,
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Executive Suit Avatar with Online Halo */}
          <div style={{ position: "relative", width: 88, height: 88, margin: "0 auto 18px" }}>
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: "50%",
                overflow: "hidden",
                border: "3px solid #3b82f6",
                boxShadow: "0 0 24px rgba(59, 130, 246, 0.45)",
                position: "relative",
              }}
            >
              <Image
                src="/images/kamal-verma-suit.jpg"
                alt="Kamal Verma"
                fill
                priority
                sizes="88px"
                style={{ objectFit: "cover", objectPosition: "center 15%" }}
              />
            </div>
            {/* Green Online Dot */}
            <span
              style={{
                position: "absolute",
                bottom: 2,
                right: 4,
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#10b981",
                border: "3px solid #07090e",
                boxShadow: "0 0 8px #10b981",
              }}
            />
          </div>

          <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "#ffffff", marginBottom: "4px", letterSpacing: "-0.02em" }}>
            Kamal Verma
          </h1>
          <div
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#3b82f6",
              marginBottom: "28px",
            }}
          >
            Trading Desk & Content CMS Control
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <input
                type="password"
                placeholder="Enter Administrator Passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255, 255, 255, 0.14)",
                  background: "rgba(15, 22, 36, 0.90)",
                  color: "#ffffff",
                  fontSize: "1rem",
                  outline: "none",
                  textAlign: "center",
                  letterSpacing: "0.15em",
                }}
              />
            </div>

            {authError && (
              <div
                style={{
                  color: "#fb7185",
                  fontSize: "0.82rem",
                  background: "rgba(244, 63, 94, 0.15)",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  padding: "10px 14px",
                  borderRadius: "10px",
                }}
              >
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                background: "#2563eb",
                fontWeight: 700,
                fontSize: "0.95rem",
                boxShadow: "0 8px 24px rgba(37, 99, 235, 0.4)",
              }}
            >
              Unlock Dashboard
            </button>

            <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "12px" }}>
              Default Passcode: <code style={{ fontWeight: 700, color: "#3b82f6" }}>kamal2026</code>
            </div>
          </form>
        </div>
      </div>
    );
  }

  /* ==================== NAVIGATION CONFIGURATION ==================== */
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <BarChart2 size={18} />, badge: null },
    { id: "home", label: "Home Page (CMS)", icon: <Layout size={18} />, badge: null },
    { id: "about", label: "About Page (CMS)", icon: <Award size={18} />, badge: null },
    { id: "services", label: "Services (CMS)", icon: <Layers size={18} />, badge: services.length },
    { id: "portfolio", label: "Portfolio (CMS)", icon: <Briefcase size={18} />, badge: portfolio.length },
    { id: "contact", label: "Contact & Leads", icon: <Users size={18} />, badge: inquiries.length },
    { id: "subscribers", label: "Subscribers", icon: <Mail size={18} />, badge: subscribers.length },
    { id: "settings", label: "Settings & SEO", icon: <Settings size={18} />, badge: null },
  ];

  return (
    <div
      className="admin-desk"
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#07090e",
        color: "#f8fafc",
        position: "relative",
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            background: toastType === "success" ? "#0f172a" : "#e11d48",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "14px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.86rem",
            fontWeight: 600,
          }}
        >
          {toastType === "success" ? <CheckCircle2 size={18} color="#10b981" /> : <AlertCircle size={18} />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.70)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            zIndex: 990,
          }}
        />
      )}

      {/* ==================== LEFT SIDEBAR ==================== */}
      <aside
        className={`admin-sidebar ${mobileMenuOpen ? "open" : ""}`}
        style={{
          width: "270px",
          background: "rgba(10, 14, 24, 0.96)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 1000,
          overflowY: "auto",
        }}
      >
        <div>
          {/* Brand Header */}
          <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <MarketBrandLogo size={42} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: "1.02rem", color: "#ffffff", letterSpacing: "-0.01em" }}>
                    {settings.websiteName}
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: 500 }}>
                    Trading Desk Control Panel
                  </div>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="admin-mobile-toggle"
                style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "8px",
                  padding: "6px",
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* DB Status Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "var(--radius-full)",
                background: stats.isMongo ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                color: stats.isMongo ? "#34d399" : "#fbbf24",
                border: stats.isMongo ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(245, 158, 11, 0.3)",
                fontSize: "0.72rem",
                fontWeight: 700,
                width: "100%",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: stats.isMongo ? "#10b981" : "#f59e0b",
                }}
              />
              {stats.isMongo ? "MongoDB Connected" : "In-Memory Fallback Active"}
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "6px 12px", marginBottom: "2px" }}>
              Content Management
            </div>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    border: "none",
                    background: isActive ? "rgba(37, 99, 235, 0.18)" : "transparent",
                    color: isActive ? "#60a5fa" : "var(--text-secondary)",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ color: isActive ? "#60a5fa" : "var(--text-muted)" }}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: "var(--radius-full)",
                        background: isActive ? "#2563eb" : "rgba(148, 163, 184, 0.16)",
                        color: isActive ? "#ffffff" : "var(--text-muted)",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar: Action & Profile */}
        <div style={{ padding: "16px 12px 20px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <Link
            href="/"
            target="_blank"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "9px 12px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#ffffff",
              fontSize: "0.78rem",
              fontWeight: 600,
              textDecoration: "none",
              marginBottom: "12px",
            }}
          >
            <span>Preview Live Site</span>
            <ArrowUpRight size={14} />
          </Link>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              borderRadius: "14px",
              background: "rgba(15, 22, 36, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  position: "relative",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "2px solid #3b82f6",
                  flexShrink: 0,
                }}
              >
                <Image
                  src="/images/kamal-verma-suit.jpg"
                  alt="Kamal Verma"
                  fill
                  sizes="36px"
                  style={{ objectFit: "cover", objectPosition: "center 15%" }}
                />
              </div>
              <div>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#ffffff" }}>{settings.websiteName}</div>
                <div style={{ fontSize: "0.68rem", color: "#3b82f6", fontWeight: 600 }}>Trading Mentor</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              style={{
                background: "transparent",
                border: "none",
                color: "#fb7185",
                cursor: "pointer",
                padding: "6px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ==================== RIGHT MAIN CONTENT AREA ==================== */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          background: "radial-gradient(ellipse 90% 60% at 50% 0%, #0d1527 0%, #07090e 100%)",
        }}
      >
        {/* Top Navbar Header */}
        <header
          style={{
            padding: "14px 24px",
            background: "rgba(10, 14, 24, 0.88)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 50,
            color: "#ffffff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="admin-mobile-toggle"
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "10px",
                padding: "8px",
                color: "#ffffff",
                cursor: "pointer",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Toggle navigation drawer"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div>
              <h1 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, textTransform: "capitalize", color: "#ffffff" }}>
                {activeTab === "dashboard" && "Desk Overview"}
                {activeTab === "home" && "Home Page (CMS)"}
                {activeTab === "about" && "About Page (CMS)"}
                {activeTab === "services" && "Services (CMS)"}
                {activeTab === "portfolio" && "Portfolio (CMS)"}
                {activeTab === "contact" && "Leads & CRM"}
                {activeTab === "subscribers" && "Subscribers"}
                {activeTab === "settings" && "Global Settings"}
              </h1>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Kamal Verma Trading Platform
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="btn-ghost"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.76rem",
                padding: "7px 12px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#f8fafc",
                borderRadius: "10px",
              }}
            >
              <RefreshCw size={13} className={loading ? "spin" : ""} />
              <span className="desktop-only-text">{loading ? "Syncing..." : "Sync DB"}</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="btn-ghost"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.76rem",
                padding: "7px 12px",
                background: "rgba(37, 99, 235, 0.15)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                color: "#60a5fa",
                borderRadius: "10px",
                textDecoration: "none",
              }}
              title="Preview Live Site"
            >
              <Globe size={13} />
              <span className="desktop-only-text">Live Site</span>
            </Link>

            <button
              onClick={handleLogout}
              className="btn-ghost admin-mobile-logout"
              style={{
                padding: "7px 10px",
                background: "rgba(244, 63, 94, 0.12)",
                border: "1px solid rgba(244, 63, 94, 0.25)",
                color: "#fb7185",
                borderRadius: "10px",
                cursor: "pointer",
              }}
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </header>

        {/* Horizontal Mobile Swipeable Tabs Bar */}
        <div className="admin-mobile-tabs-container">
          <div className="admin-mobile-tabs-track">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`admin-mobile-tab-btn ${isActive ? "active" : ""}`}
                >
                  <span style={{ color: isActive ? "#60a5fa" : "var(--text-muted)", display: "flex", alignItems: "center" }}>
                    {item.icon}
                  </span>
                  <span>{item.label.replace(" (CMS)", "").replace(" & Leads", "")}</span>
                  {item.badge !== null && item.badge > 0 && (
                    <span className="admin-mobile-tab-badge">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Body Content */}
        <div className="admin-tab-content-pad" style={{ padding: "32px", flex: 1 }}>
          {/* ========== TAB 1: DASHBOARD OVERVIEW ========== */}
          {activeTab === "dashboard" && (
            <div>
              {/* Metric Stat Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "20px",
                  marginBottom: "32px",
                }}
              >
                {[
                  {
                    label: "Consultation Inquiries",
                    value: stats.totalInquiries,
                    badge: `${stats.pendingInquiries} Pending`,
                    badgeColor: "#fbbf24",
                    badgeBg: "rgba(245, 158, 11, 0.15)",
                    icon: <Users size={20} color="#3b82f6" />,
                    iconBg: "rgba(37, 99, 235, 0.15)",
                    iconBorder: "rgba(37, 99, 235, 0.3)",
                    tab: "contact",
                  },
                  {
                    label: "Published Services",
                    value: services.length,
                    badge: "Curriculum",
                    badgeColor: "#34d399",
                    badgeBg: "rgba(16, 185, 129, 0.15)",
                    icon: <Layers size={20} color="#10b981" />,
                    iconBg: "rgba(16, 185, 129, 0.15)",
                    iconBorder: "rgba(16, 185, 129, 0.3)",
                    tab: "services",
                  },
                  {
                    label: "Portfolio Case Studies",
                    value: portfolio.length,
                    badge: "Educational",
                    badgeColor: "#c084fc",
                    badgeBg: "rgba(139, 92, 246, 0.15)",
                    icon: <Briefcase size={20} color="#a855f7" />,
                    iconBg: "rgba(139, 92, 246, 0.15)",
                    iconBorder: "rgba(139, 92, 246, 0.3)",
                    tab: "portfolio",
                  },
                  {
                    label: "Newsletter Audience",
                    value: stats.totalSubscribers,
                    badge: "Subscribers",
                    badgeColor: "#60a5fa",
                    badgeBg: "rgba(59, 130, 246, 0.15)",
                    icon: <Mail size={20} color="#38bdf8" />,
                    iconBg: "rgba(14, 165, 233, 0.15)",
                    iconBorder: "rgba(14, 165, 233, 0.3)",
                    tab: "subscribers",
                  },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveTab(stat.tab as any)}
                    className="glass-card"
                    style={{
                      padding: "24px",
                      borderRadius: "20px",
                      background: "rgba(15, 22, 36, 0.75)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      cursor: "pointer",
                      transition: "transform 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "12px",
                          background: stat.iconBg,
                          border: `1px solid ${stat.iconBorder}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {stat.icon}
                      </div>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: "var(--radius-full)",
                          background: stat.badgeBg,
                          color: stat.badgeColor,
                        }}
                      >
                        {stat.badge}
                      </span>
                    </div>

                    <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions & Desk Summary */}
              <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "24px" }}>
                {/* Recent Leads Preview */}
                <div className="glass-card" style={{ padding: "28px", borderRadius: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#ffffff" }}>Recent Consultation Inquiries</h3>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Prospective students and market traders</div>
                    </div>
                    <button
                      onClick={() => setActiveTab("contact")}
                      className="btn-ghost"
                      style={{ fontSize: "0.78rem", padding: "6px 14px", background: "rgba(255, 255, 255, 0.06)", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#ffffff" }}
                    >
                      View All
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {inquiries.slice(0, 4).map((inq) => (
                      <div
                        key={inq.id}
                        style={{
                          padding: "14px 18px",
                          background: "rgba(10, 14, 24, 0.65)",
                          borderRadius: "14px",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#ffffff" }}>{inq.name}</div>
                          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                            {inq.phone} • {inq.serviceInterest}
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: "6px",
                              background:
                                inq.status === "pending"
                                  ? "rgba(245, 158, 11, 0.15)"
                                  : inq.status === "contacted"
                                  ? "rgba(59, 91, 219, 0.15)"
                                  : "rgba(16, 185, 129, 0.15)",
                              color:
                                inq.status === "pending"
                                  ? "#fbbf24"
                                  : inq.status === "contacted"
                                  ? "#60a5fa"
                                  : "#34d399",
                              textTransform: "capitalize",
                            }}
                          >
                            {inq.status}
                          </span>

                          <a
                            href={`https://wa.me/91${inq.phone}?text=Hello%20${encodeURIComponent(inq.name)},%20this%20is%20Kamal%20Verma%20regarding%20your%20trading%20mentorship%20inquiry.`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              background: "#25D366",
                              color: "#fff",
                              padding: "5px 10px",
                              borderRadius: "var(--radius-full)",
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              textDecoration: "none",
                            }}
                          >
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kamal Verma Quick Desk Actions */}
                <div className="glass-card" style={{ padding: "28px", borderRadius: "24px" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px", color: "#ffffff" }}>
                    Desk Quick Actions
                  </h3>

                  <div style={{ padding: "16px", background: "rgba(37, 99, 235, 0.08)", borderRadius: "16px", border: "1px solid rgba(37, 99, 235, 0.20)", marginBottom: "20px" }}>
                    <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                      Active Helpline
                    </div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#3b82f6", marginTop: "4px" }}>
                      +91 {settings.phone}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "6px" }}>
                      Direct mentor consultation routing.
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button
                      onClick={handleOpenCreateService}
                      className="btn-primary"
                      style={{
                        width: "100%",
                        padding: "12px",
                        fontSize: "0.86rem",
                        borderRadius: "12px",
                        background: "#2563eb",
                        boxShadow: "0 4px 16px rgba(37, 99, 235, 0.35)",
                      }}
                    >
                      <Plus size={15} /> Create New Service
                    </button>
                    <button
                      onClick={handleOpenCreatePortfolio}
                      className="btn-ghost"
                      style={{
                        width: "100%",
                        padding: "12px",
                        fontSize: "0.86rem",
                        borderRadius: "12px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#ffffff",
                      }}
                    >
                      <Plus size={15} /> Publish Portfolio Item
                    </button>
                    <button
                      onClick={exportInquiriesCSV}
                      className="btn-ghost"
                      style={{
                        width: "100%",
                        padding: "12px",
                        fontSize: "0.86rem",
                        borderRadius: "12px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#ffffff",
                      }}
                    >
                      <Download size={15} /> Export Leads to CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== TAB 2: HOME PAGE CMS ========== */}
          {activeTab === "home" && (
            <div className="glass-card" style={{ padding: "32px", borderRadius: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                  <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0 }}>Home Page Content</h2>
                  <div style={{ fontSize: "0.80rem", color: "var(--text-muted)" }}>
                    Manage hero headline, CTA buttons, metrics, and primary section introductions
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Link
                    href="/"
                    target="_blank"
                    className="btn-ghost"
                    style={{ padding: "10px 16px", fontSize: "0.84rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <span>View Live Home</span> <ExternalLink size={14} />
                  </Link>
                  <button
                    onClick={handleSaveHomeContent}
                    disabled={saveLoading}
                    className="btn-primary"
                    style={{ padding: "10px 20px", fontSize: "0.84rem" }}
                  >
                    <Save size={15} /> {saveLoading ? "Saving to MongoDB..." : "Save Changes"}
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveHomeContent} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Executive Hero Portrait Live Status */}
                <div style={{ padding: "20px 24px", background: "rgba(15, 22, 36, 0.75)", borderRadius: "18px", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                  <div style={{ position: "relative", width: 72, height: 86, borderRadius: "12px", overflow: "hidden", border: "2px solid #3b82f6", flexShrink: 0, background: "#07090e" }}>
                    <Image src="/images/kamal-verma-hero.jpg" alt="Kamal Verma" fill sizes="72px" style={{ objectFit: "cover", objectPosition: "center 15%" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: "220px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <h4 style={{ fontSize: "0.96rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>Executive Hero Portrait</h4>
                      <span className="badge badge-blue">Synchronized</span>
                    </div>
                    <p style={{ fontSize: "0.80rem", color: "var(--text-muted)", margin: 0 }}>
                      Active asset: <code>/images/kamal-verma-hero.jpg</code>. Executive navy blazer seated in chair with institutional multi-screen trading command desk setup.
                    </p>
                  </div>
                </div>

                {/* Hero Section Card */}
                <div style={{ padding: "24px", background: "rgba(15, 22, 36, 0.75)", borderRadius: "18px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "16px", color: "#60a5fa" }}>
                    Hero Section
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Hero Badge</label>
                      <input
                        type="text"
                        value={homeContent.heroBadge}
                        onChange={(e) => setHomeContent({ ...homeContent, heroBadge: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Main Headline (H1)</label>
                      <input
                        type="text"
                        value={homeContent.heroTitle}
                        onChange={(e) => setHomeContent({ ...homeContent, heroTitle: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px", fontWeight: 700 }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Hero Subtitle</label>
                      <textarea
                        rows={3}
                        value={homeContent.heroSubtitle}
                        onChange={(e) => setHomeContent({ ...homeContent, heroSubtitle: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Primary CTA Button Label</label>
                        <input
                          type="text"
                          value={homeContent.heroPrimaryCtaText}
                          onChange={(e) => setHomeContent({ ...homeContent, heroPrimaryCtaText: e.target.value })}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Secondary CTA Button Label</label>
                        <input
                          type="text"
                          value={homeContent.heroSecondaryCtaText}
                          onChange={(e) => setHomeContent({ ...homeContent, heroSecondaryCtaText: e.target.value })}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Homepage Metric Highlights */}
                <div style={{ padding: "24px", background: "rgba(15, 22, 36, 0.75)", borderRadius: "18px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "16px", color: "#60a5fa" }}>
                    Hero Metric Badges
                  </h3>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                    {homeContent.stats.map((st, idx) => (
                      <div key={idx} style={{ padding: "14px", background: "rgba(10, 14, 24, 0.65)", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                        <label style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--text-muted)" }}>Metric {idx + 1} Value</label>
                        <input
                          type="text"
                          value={st.value}
                          onChange={(e) => {
                            const newStats = [...homeContent.stats];
                            newStats[idx].value = e.target.value;
                            setHomeContent({ ...homeContent, stats: newStats });
                          }}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px", marginBottom: "8px", fontWeight: 700 }}
                        />
                        <label style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--text-muted)" }}>Metric {idx + 1} Label</label>
                        <input
                          type="text"
                          value={st.label}
                          onChange={(e) => {
                            const newStats = [...homeContent.stats];
                            newStats[idx].label = e.target.value;
                            setHomeContent({ ...homeContent, stats: newStats });
                          }}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section Descriptions */}
                <div style={{ padding: "24px", background: "rgba(15, 22, 36, 0.75)", borderRadius: "18px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "16px", color: "#60a5fa" }}>
                    Section Headings
                  </h3>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Specialties Section Title</label>
                      <input
                        type="text"
                        value={homeContent.specialtiesTitle}
                        onChange={(e) => setHomeContent({ ...homeContent, specialtiesTitle: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px", marginBottom: "10px" }}
                      />
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Specialties Description</label>
                      <textarea
                        rows={2}
                        value={homeContent.specialtiesDesc}
                        onChange={(e) => setHomeContent({ ...homeContent, specialtiesDesc: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Pillars Section Title</label>
                      <input
                        type="text"
                        value={homeContent.pillarsTitle}
                        onChange={(e) => setHomeContent({ ...homeContent, pillarsTitle: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px", marginBottom: "10px" }}
                      />
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Pillars Description</label>
                      <textarea
                        rows={2}
                        value={homeContent.pillarsDesc}
                        onChange={(e) => setHomeContent({ ...homeContent, pillarsDesc: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="btn-primary"
                    style={{ padding: "12px 28px", fontSize: "0.86rem" }}
                  >
                    <Save size={16} /> {saveLoading ? "Saving to MongoDB..." : "Save Changes to Database"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========== TAB 3: ABOUT PAGE CMS ========== */}
          {activeTab === "about" && (
            <div className="glass-card" style={{ padding: "32px", borderRadius: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                  <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0 }}>About Page Content</h2>
                  <div style={{ fontSize: "0.80rem", color: "var(--text-muted)" }}>
                    Update professional biography, stated experience, mission, vision, and core educational values
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Link
                    href="/about"
                    target="_blank"
                    className="btn-ghost"
                    style={{ padding: "10px 16px", fontSize: "0.84rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <span>View Live About</span> <ExternalLink size={14} />
                  </Link>
                  <button
                    onClick={handleSaveAboutContent}
                    disabled={saveLoading}
                    className="btn-primary"
                    style={{ padding: "10px 20px", fontSize: "0.84rem" }}
                  >
                    <Save size={15} /> {saveLoading ? "Saving to MongoDB..." : "Save Changes"}
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveAboutContent} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Executive About Portrait Live Status */}
                <div style={{ padding: "20px 24px", background: "rgba(15, 22, 36, 0.75)", borderRadius: "18px", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                  <div style={{ position: "relative", width: 72, height: 86, borderRadius: "12px", overflow: "hidden", border: "2px solid #3b82f6", flexShrink: 0, background: "#07090e" }}>
                    <Image src="/images/kamal-verma-suit.jpg" alt="Kamal Verma" fill sizes="72px" style={{ objectFit: "cover", objectPosition: "center 15%" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: "220px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <h4 style={{ fontSize: "0.96rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>Executive About Portrait (380px Stage)</h4>
                      <span className="badge badge-blue">Synchronized</span>
                    </div>
                    <p style={{ fontSize: "0.80rem", color: "var(--text-muted)", margin: 0 }}>
                      Active asset: <code>/images/kamal-verma-suit.jpg</code>. Synchronized across both Front Page Hero & About Page Card.
                    </p>
                  </div>
                </div>

                {/* Heading & Profile */}
                <div style={{ padding: "24px", background: "rgba(15, 22, 36, 0.75)", borderRadius: "18px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "16px", color: "#60a5fa" }}>
                    Profile & Experience
                  </h3>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Page Heading</label>
                      <input
                        type="text"
                        value={aboutContent.heading}
                        onChange={(e) => setAboutContent({ ...aboutContent, heading: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Professional Title / Subheading</label>
                      <input
                        type="text"
                        value={aboutContent.subheading}
                        onChange={(e) => setAboutContent({ ...aboutContent, subheading: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Experience (Years)</label>
                      <input
                        type="text"
                        value={String(aboutContent.experienceYears)}
                        onChange={(e) => setAboutContent({ ...aboutContent, experienceYears: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Students Guided & Taught</label>
                      <input
                        type="text"
                        value={aboutContent.studentsCount}
                        onChange={(e) => setAboutContent({ ...aboutContent, studentsCount: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Profile Image Path</label>
                      <input
                        type="text"
                        value={aboutContent.profileImageUrl || ""}
                        onChange={(e) => setAboutContent({ ...aboutContent, profileImageUrl: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Biography & Mission */}
                <div style={{ padding: "24px", background: "rgba(15, 22, 36, 0.75)", borderRadius: "18px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "16px", color: "#60a5fa" }}>
                    Narrative & Philosophy
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Professional Biography</label>
                      <textarea
                        rows={4}
                        value={aboutContent.bioIntro}
                        onChange={(e) => setAboutContent({ ...aboutContent, bioIntro: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Educational Mission</label>
                      <textarea
                        rows={2}
                        value={aboutContent.mission}
                        onChange={(e) => setAboutContent({ ...aboutContent, mission: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Vision Statement</label>
                      <textarea
                        rows={2}
                        value={aboutContent.vision}
                        onChange={(e) => setAboutContent({ ...aboutContent, vision: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", marginTop: "4px" }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="btn-primary"
                    style={{ padding: "12px 28px", fontSize: "0.86rem" }}
                  >
                    <Save size={16} /> {saveLoading ? "Saving to MongoDB..." : "Save Changes to Database"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========== TAB 4: SERVICES CMS ========== */}
          {activeTab === "services" && (
            <div className="glass-card" style={{ padding: "32px", borderRadius: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0 }}>Services & Curriculum (CMS)</h2>
                  <div style={{ fontSize: "0.80rem", color: "var(--text-muted)" }}>
                    Create, edit, publish/unpublish, reorder, and delete trading educational offerings
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Link
                    href="/services"
                    target="_blank"
                    className="btn-ghost"
                    style={{ padding: "9px 16px", fontSize: "0.84rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <span>View Live Services</span> <ExternalLink size={14} />
                  </Link>
                  <button
                    onClick={handleOpenCreateService}
                    className="btn-primary"
                    style={{ padding: "9px 18px", fontSize: "0.84rem" }}
                  >
                    <Plus size={16} /> Create New Service
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {services.length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", background: "rgba(15, 22, 36, 0.75)", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    No services found. Click &quot;Create New Service&quot; to add one.
                  </div>
                ) : (
                  services.map((svc, idx) => (
                    <div
                      key={svc.id}
                      style={{
                        padding: "20px 24px",
                        background: "rgba(15, 22, 36, 0.75)",
                        borderRadius: "18px",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "16px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: "280px", flex: 1 }}>
                        {/* Reorder Buttons */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <button
                            onClick={() => handleMoveService(idx, "up")}
                            disabled={idx === 0}
                            style={{
                              background: "rgba(255, 255, 255, 0.06)",
                              border: "1px solid rgba(255, 255, 255, 0.10)",
                              color: "#ffffff",
                              borderRadius: "4px",
                              padding: "4px 6px",
                              cursor: idx === 0 ? "not-allowed" : "pointer",
                              opacity: idx === 0 ? 0.3 : 1,
                            }}
                            title="Move Up"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            onClick={() => handleMoveService(idx, "down")}
                            disabled={idx === services.length - 1}
                            style={{
                              background: "rgba(255, 255, 255, 0.06)",
                              border: "1px solid rgba(255, 255, 255, 0.10)",
                              color: "#ffffff",
                              borderRadius: "4px",
                              padding: "4px 6px",
                              cursor: idx === services.length - 1 ? "not-allowed" : "pointer",
                              opacity: idx === services.length - 1 ? 0.3 : 1,
                            }}
                            title="Move Down"
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>

                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span className="badge badge-blue">{svc.subtitle || "Curriculum"}</span>
                            <span
                              style={{
                                fontSize: "0.70rem",
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: "4px",
                                background: svc.published ? "rgba(16, 185, 129, 0.15)" : "rgba(148, 163, 184, 0.15)",
                                color: svc.published ? "#34d399" : "#94a3b8",
                              }}
                            >
                              {svc.published ? "Published" : "Draft"}
                            </span>
                            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                              Slug: <code>{svc.slug}</code>
                            </span>
                          </div>
                          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "2px 0", color: "#ffffff" }}>{svc.title}</h3>
                          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0, maxWidth: "600px" }}>
                            {svc.description}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button
                          onClick={() => handleTogglePublishService(svc.id, Boolean(svc.published))}
                          className="btn-ghost"
                          style={{ padding: "6px 12px", fontSize: "0.76rem", background: "rgba(255, 255, 255, 0.06)", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#ffffff" }}
                          title={svc.published ? "Unpublish" : "Publish"}
                        >
                          {svc.published ? <EyeOff size={14} /> : <Eye size={14} />}
                          <span>{svc.published ? "Unpublish" : "Publish"}</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditService(svc)}
                          style={{
                            background: "rgba(59, 91, 219, 0.1)",
                            color: "#3b5bdb",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "0.76rem",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <Edit3 size={14} /> Edit
                        </button>

                        <button
                          onClick={() => handleDeleteService(svc.id, svc.title)}
                          style={{
                            background: "rgba(244, 63, 94, 0.1)",
                            color: "#e11d48",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "0.76rem",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========== TAB 5: PORTFOLIO CMS ========== */}
          {activeTab === "portfolio" && (
            <div className="glass-card" style={{ padding: "32px", borderRadius: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0 }}>Portfolio & Case Studies (CMS)</h2>
                  <div style={{ fontSize: "0.80rem", color: "var(--text-muted)" }}>
                    Manage technical case studies, track record breakdowns, and asset class frameworks
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Link
                    href="/portfolio"
                    target="_blank"
                    className="btn-ghost"
                    style={{ padding: "9px 16px", fontSize: "0.84rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <span>View Live Portfolio</span> <ExternalLink size={14} />
                  </Link>
                  <button
                    onClick={handleOpenCreatePortfolio}
                    className="btn-primary"
                    style={{ padding: "9px 18px", fontSize: "0.84rem" }}
                  >
                    <Plus size={16} /> Publish Portfolio Item
                  </button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
                {["All", "Index Analysis", "Options Strategies", "Swing Trading", "Trading Psychology"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPortfolioCategoryFilter(cat)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "var(--radius-full)",
                      border: "1px solid",
                      borderColor: portfolioCategoryFilter === cat ? "var(--brand-primary)" : "rgba(255, 255, 255, 0.12)",
                      background: portfolioCategoryFilter === cat ? "var(--brand-primary)" : "rgba(255, 255, 255, 0.05)",
                      color: portfolioCategoryFilter === cat ? "#ffffff" : "var(--text-secondary)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {filteredPortfolio.length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", background: "rgba(15, 22, 36, 0.75)", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    No portfolio items match this category filter.
                  </div>
                ) : (
                  filteredPortfolio.map((item, idx) => (
                    <div
                      key={item.id}
                      style={{
                        padding: "20px 24px",
                        background: "rgba(15, 22, 36, 0.75)",
                        borderRadius: "18px",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "16px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: "280px", flex: 1 }}>
                        {/* Reorder Buttons */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <button
                            onClick={() => handleMovePortfolio(idx, "up")}
                            disabled={idx === 0}
                            style={{
                              background: "rgba(255, 255, 255, 0.06)",
                              border: "1px solid rgba(255, 255, 255, 0.10)",
                              color: "#ffffff",
                              borderRadius: "4px",
                              padding: "4px 6px",
                              cursor: idx === 0 ? "not-allowed" : "pointer",
                              opacity: idx === 0 ? 0.3 : 1,
                            }}
                            title="Move Up"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            onClick={() => handleMovePortfolio(idx, "down")}
                            disabled={idx === filteredPortfolio.length - 1}
                            style={{
                              background: "rgba(255, 255, 255, 0.06)",
                              border: "1px solid rgba(255, 255, 255, 0.10)",
                              color: "#ffffff",
                              borderRadius: "4px",
                              padding: "4px 6px",
                              cursor: idx === filteredPortfolio.length - 1 ? "not-allowed" : "pointer",
                              opacity: idx === filteredPortfolio.length - 1 ? 0.3 : 1,
                            }}
                            title="Move Down"
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>

                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span className="badge badge-blue">{item.category}</span>
                            <span
                              style={{
                                fontSize: "0.70rem",
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: "4px",
                                background: item.published ? "rgba(16, 185, 129, 0.15)" : "rgba(148, 163, 184, 0.15)",
                                color: item.published ? "#34d399" : "#94a3b8",
                              }}
                            >
                              {item.published ? "Published" : "Draft"}
                            </span>
                            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{item.readTime}</span>
                          </div>
                          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "2px 0", color: "#ffffff" }}>{item.title}</h3>
                          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0, maxWidth: "600px" }}>
                            {item.summary}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Link
                          href={`/portfolio#${item.slug}`}
                          target="_blank"
                          className="btn-ghost"
                          style={{ padding: "6px 10px", fontSize: "0.74rem", background: "rgba(255, 255, 255, 0.06)", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#ffffff" }}
                        >
                          Preview
                        </Link>

                        <button
                          onClick={() => handleTogglePublishPortfolio(item.id, Boolean(item.published))}
                          className="btn-ghost"
                          style={{ padding: "6px 12px", fontSize: "0.76rem", background: "rgba(255, 255, 255, 0.06)", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#ffffff" }}
                          title={item.published ? "Move to drafts" : "Publish"}
                        >
                          {item.published ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>

                        <button
                          onClick={() => handleOpenEditPortfolio(item)}
                          style={{
                            background: "rgba(59, 91, 219, 0.1)",
                            color: "#3b5bdb",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "0.76rem",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <Edit3 size={14} /> Edit
                        </button>

                        <button
                          onClick={() => handleDeletePortfolio(item.id, item.title)}
                          style={{
                            background: "rgba(244, 63, 94, 0.1)",
                            color: "#e11d48",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "0.76rem",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========== TAB 6: CONTACT & LEADS CRM ========== */}
          {activeTab === "contact" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              {/* Contact Page Text & Settings */}
              <div className="glass-card" style={{ padding: "32px", borderRadius: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0 }}>Contact Page Settings</h2>
                    <div style={{ fontSize: "0.80rem", color: "var(--text-muted)" }}>
                      Direct helpline details, response expectation, and public disclaimer
                    </div>
                  </div>
                  <button
                    onClick={handleSaveContactContent}
                    disabled={saveLoading}
                    className="btn-primary"
                    style={{ padding: "10px 20px", fontSize: "0.84rem" }}
                  >
                    <Save size={15} /> {saveLoading ? "Saving..." : "Save Contact Info"}
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Page Title</label>
                    <input
                      type="text"
                      value={contactContent.heading}
                      onChange={(e) => setContactContent({ ...contactContent, heading: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", marginTop: "4px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Direct Helpline Phone</label>
                    <input
                      type="text"
                      value={contactContent.phone}
                      onChange={(e) => setContactContent({ ...contactContent, phone: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", marginTop: "4px" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Contact Email</label>
                    <input
                      type="text"
                      value={contactContent.email}
                      onChange={(e) => setContactContent({ ...contactContent, email: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", marginTop: "4px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Response Expectation</label>
                    <input
                      type="text"
                      value={contactContent.responseTime}
                      onChange={(e) => setContactContent({ ...contactContent, responseTime: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", marginTop: "4px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Office Region / Location</label>
                    <input
                      type="text"
                      value={contactContent.officeLocation}
                      onChange={(e) => setContactContent({ ...contactContent, officeLocation: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", marginTop: "4px" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Compliance Disclaimer Text</label>
                  <textarea
                    rows={2}
                    value={contactContent.disclaimerText}
                    onChange={(e) => setContactContent({ ...contactContent, disclaimerText: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", marginTop: "4px" }}
                  />
                </div>
              </div>

              {/* Consultation Leads Table */}
              <div className="glass-card" style={{ padding: "32px", borderRadius: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0 }}>Consultation Form Submissions</h2>
                    <div style={{ fontSize: "0.80rem", color: "var(--text-muted)" }}>
                      Showing {filteredInquiries.length} of {inquiries.length} total student inquiries
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <div style={{ position: "relative" }}>
                      <Search size={15} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted)" }} />
                      <input
                        type="text"
                        placeholder="Search name, phone, program..."
                        value={inquirySearch}
                        onChange={(e) => setInquirySearch(e.target.value)}
                        style={{
                          padding: "8px 12px 8px 36px",
                          borderRadius: "10px",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          fontSize: "0.84rem",
                          width: "240px",
                          background: "rgba(10, 14, 24, 0.85)",
                          color: "#ffffff",
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", gap: "4px" }}>
                      {["all", "pending", "contacted", "enrolled"].map((status) => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            border: "1px solid",
                            borderColor: statusFilter === status ? "var(--brand-primary)" : "rgba(255, 255, 255, 0.12)",
                            background: statusFilter === status ? "var(--brand-primary)" : "rgba(255, 255, 255, 0.05)",
                            color: statusFilter === status ? "#ffffff" : "var(--text-secondary)",
                            fontSize: "0.76rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            textTransform: "capitalize",
                          }}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    <Link
                      href="/contact"
                      target="_blank"
                      className="btn-ghost"
                      style={{ padding: "8px 14px", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                      <span>View Live Contact</span> <ExternalLink size={14} />
                    </Link>

                    <button
                      onClick={exportInquiriesCSV}
                      className="btn-primary"
                      style={{ padding: "8px 14px", fontSize: "0.82rem" }}
                    >
                      <Download size={14} /> Export CSV
                    </button>
                  </div>
                </div>

                {/* Mobile Leads Card View (< 768px) */}
                <div className="admin-mobile-leads-list" style={{ display: "none", flexDirection: "column", gap: "12px", marginTop: "14px" }}>
                  {filteredInquiries.length === 0 ? (
                    <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      No inquiries match the current filter.
                    </div>
                  ) : (
                    filteredInquiries.map((inq) => (
                      <div
                        key={inq.id}
                        style={{
                          background: "rgba(10, 14, 24, 0.75)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "16px",
                          padding: "16px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: "0.98rem", color: "#ffffff" }}>{inq.name}</div>
                            <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "2px" }}>
                              {inq.phone} • {new Date(inq.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <select
                            value={inq.status}
                            onChange={(e) => handleStatusChange(inq.id!, e.target.value as any)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "8px",
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              border: "none",
                              background:
                                inq.status === "pending"
                                  ? "rgba(245, 158, 11, 0.20)"
                                  : inq.status === "contacted"
                                  ? "rgba(59, 91, 219, 0.20)"
                                  : "rgba(16, 185, 129, 0.20)",
                              color:
                                inq.status === "pending"
                                  ? "#fbbf24"
                                  : inq.status === "contacted"
                                  ? "#60a5fa"
                                  : "#34d399",
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="contacted">Contacted</option>
                            <option value="enrolled">Enrolled</option>
                          </select>
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          <span className="badge badge-blue" style={{ fontSize: "0.72rem" }}>{inq.serviceInterest}</span>
                          <span className="badge" style={{ fontSize: "0.72rem", background: "rgba(255,255,255,0.06)", color: "#cbd5e1" }}>Exp: {inq.experienceLevel}</span>
                          <span className="badge" style={{ fontSize: "0.72rem", background: "rgba(255,255,255,0.06)", color: "#cbd5e1" }}>Cap: {inq.tradingCapital}</span>
                        </div>

                        {inq.message && (
                          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", background: "rgba(255,255,255,0.03)", padding: "8px 10px", borderRadius: "8px" }}>
                            "{inq.message.slice(0, 100)}{inq.message.length > 100 ? "..." : ""}"
                          </div>
                        )}

                        <div style={{ display: "flex", gap: "8px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          <a
                            href={`tel:${inq.phone}`}
                            className="btn-ghost"
                            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", padding: "8px", fontSize: "0.78rem", textDecoration: "none" }}
                          >
                            <Phone size={13} color="var(--brand-primary)" /> Call
                          </a>

                          <a
                            href={`https://wa.me/91${inq.phone}?text=Hello%20${encodeURIComponent(inq.name)},%20this%20is%20Kamal%20Verma%20regarding%20your%20trading%20mentorship%20inquiry.`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "5px",
                              background: "#25D366",
                              color: "#fff",
                              padding: "8px",
                              borderRadius: "10px",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              textDecoration: "none",
                            }}
                          >
                            WhatsApp
                          </a>

                          <button
                            onClick={() => setSelectedInquiry(inq)}
                            className="btn-ghost"
                            style={{ padding: "8px 10px" }}
                            title="View Full Lead Details"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            onClick={() => handleDeleteInquiry(inq.id!)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#fb7185",
                              cursor: "pointer",
                              padding: "8px",
                            }}
                            title="Delete Lead"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop Table View (>= 768px) */}
                <div className="admin-desktop-table-view" style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-card)", textAlign: "left", color: "var(--text-muted)" }}>
                        <th style={{ padding: "12px 16px" }}>Candidate</th>
                        <th style={{ padding: "12px 16px" }}>Program Focus</th>
                        <th style={{ padding: "12px 16px" }}>Experience & Capital</th>
                        <th style={{ padding: "12px 16px" }}>Status</th>
                        <th style={{ padding: "12px 16px" }}>Submitted</th>
                        <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInquiries.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                            No inquiries match the current filter.
                          </td>
                        </tr>
                      ) : (
                        filteredInquiries.map((inq) => (
                          <tr key={inq.id} style={{ borderBottom: "1px solid rgba(226, 232, 240, 0.6)" }}>
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{inq.name}</div>
                              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                                {inq.phone} • {inq.email}
                              </div>
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <span className="badge badge-blue">{inq.serviceInterest}</span>
                            </td>
                            <td style={{ padding: "14px 16px", color: "var(--text-secondary)", fontSize: "0.80rem" }}>
                              <div>Exp: <strong>{inq.experienceLevel}</strong></div>
                              <div>Cap: {inq.tradingCapital}</div>
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <select
                                value={inq.status}
                                onChange={(e) => handleStatusChange(inq.id!, e.target.value as any)}
                                style={{
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  fontSize: "0.74rem",
                                  fontWeight: 700,
                                  border: "none",
                                  background:
                                    inq.status === "pending"
                                      ? "rgba(245, 158, 11, 0.15)"
                                      : inq.status === "contacted"
                                      ? "rgba(59, 91, 219, 0.15)"
                                      : "rgba(16, 185, 129, 0.15)",
                                  color:
                                    inq.status === "pending"
                                      ? "#b45309"
                                      : inq.status === "contacted"
                                      ? "#3b5bdb"
                                      : "#059669",
                                }}
                              >
                                <option value="pending">Pending</option>
                                <option value="contacted">Contacted</option>
                                <option value="enrolled">Enrolled</option>
                              </select>
                            </td>
                            <td style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: "0.76rem" }}>
                              {new Date(inq.createdAt).toLocaleDateString()}
                            </td>
                            <td style={{ padding: "14px 16px", textAlign: "right" }}>
                              <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                                <button
                                  onClick={() => setSelectedInquiry(inq)}
                                  className="btn-ghost"
                                  style={{ padding: "4px 8px", fontSize: "0.75rem", background: "rgba(255, 255, 255, 0.06)", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#ffffff" }}
                                  title="View lead details"
                                >
                                  <Eye size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteInquiry(inq.id!)}
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "#e11d48",
                                    cursor: "pointer",
                                    padding: "4px 8px",
                                  }}
                                  title="Delete lead"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========== TAB 7: SUBSCRIBERS ========== */}
          {activeTab === "subscribers" && (
            <div className="glass-card" style={{ padding: "32px", borderRadius: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                  <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0 }}>Newsletter Subscribers</h2>
                  <div style={{ fontSize: "0.80rem", color: "var(--text-muted)" }}>
                    Verified audience subscribed for weekly educational commentary
                  </div>
                </div>

                <button
                  onClick={exportSubscribersCSV}
                  className="btn-primary"
                  style={{ padding: "8px 16px", fontSize: "0.82rem" }}
                >
                  <Download size={14} /> Export CSV
                </button>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-card)", textAlign: "left", color: "var(--text-muted)" }}>
                      <th style={{ padding: "12px 16px" }}>Subscriber Email</th>
                      <th style={{ padding: "12px 16px" }}>Source Location</th>
                      <th style={{ padding: "12px 16px" }}>Subscribed Date</th>
                      <th style={{ padding: "12px 16px", textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                          No subscribers recorded yet.
                        </td>
                      </tr>
                    ) : (
                      subscribers.map((sub) => (
                        <tr key={sub.id || sub.email} style={{ borderBottom: "1px solid rgba(226, 232, 240, 0.6)" }}>
                          <td style={{ padding: "14px 16px", fontWeight: 600 }}>{sub.email}</td>
                          <td style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: "0.78rem" }}>
                            {sub.source || "Website Footer"}
                          </td>
                          <td style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: "0.78rem" }}>
                            {new Date(sub.subscribedAt).toLocaleString()}
                          </td>
                          <td style={{ padding: "14px 16px", textAlign: "right" }}>
                            <button
                              onClick={async () => {
                                if (!confirm("Remove this subscriber?")) return;
                                await authFetch(`/api/admin/subscribers?id=${sub.id || sub.email}`, { method: "DELETE" });
                                showToast("Subscriber removed");
                                fetchAdminData();
                              }}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "#e11d48",
                                cursor: "pointer",
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========== TAB 8: GLOBAL SETTINGS & SEO ========== */}
          {activeTab === "settings" && (
            <div className="glass-card" style={{ padding: "32px", borderRadius: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                  <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0 }}>Global Settings & SEO Management</h2>
                  <div style={{ fontSize: "0.80rem", color: "var(--text-muted)" }}>
                    Website branding, contact info, social channels, footer, and page-level SEO meta tags
                  </div>
                </div>
                <button
                  onClick={handleSaveGlobalSettings}
                  disabled={saveLoading}
                  className="btn-primary"
                  style={{ padding: "10px 20px", fontSize: "0.84rem" }}
                >
                  <Save size={15} /> {saveLoading ? "Saving to MongoDB..." : "Save Settings"}
                </button>
              </div>

              <form onSubmit={handleSaveGlobalSettings} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Brand & Identity */}
                <div style={{ padding: "24px", background: "rgba(15, 22, 36, 0.75)", borderRadius: "18px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "16px", color: "#60a5fa" }}>
                    Brand & Helpline
                  </h3>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Website Brand Name</label>
                      <input
                        type="text"
                        value={settings.websiteName}
                        onChange={(e) => setSettings({ ...settings, websiteName: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Direct Helpline Phone</label>
                      <input
                        type="text"
                        value={settings.phone}
                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Primary Contact Email</label>
                      <input
                        type="text"
                        value={settings.email}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>WhatsApp Number</label>
                      <input
                        type="text"
                        value={settings.whatsapp}
                        onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Office / Region</label>
                      <input
                        type="text"
                        value={settings.location}
                        onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div style={{ padding: "24px", background: "rgba(15, 22, 36, 0.75)", borderRadius: "18px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "16px", color: "#60a5fa" }}>
                    Social Media Channels
                  </h3>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Twitter / X URL</label>
                      <input
                        type="text"
                        value={settings.socialLinks.twitter}
                        onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, twitter: e.target.value } })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>LinkedIn URL</label>
                      <input
                        type="text"
                        value={settings.socialLinks.linkedin}
                        onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, linkedin: e.target.value } })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Telegram Channel</label>
                      <input
                        type="text"
                        value={settings.socialLinks.telegram}
                        onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, telegram: e.target.value } })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>YouTube Channel</label>
                      <input
                        type="text"
                        value={settings.socialLinks.youtube}
                        onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, youtube: e.target.value } })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Instagram Profile</label>
                      <input
                        type="text"
                        value={settings.socialLinks.instagram}
                        onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, instagram: e.target.value } })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Content */}
                <div style={{ padding: "24px", background: "rgba(15, 22, 36, 0.75)", borderRadius: "18px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "16px", color: "#60a5fa" }}>
                    Footer Narrative
                  </h3>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Footer Description Text</label>
                    <textarea
                      rows={2}
                      value={settings.footerText}
                      onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                    />
                  </div>
                </div>

                {/* Page-Level SEO Titles & Descriptions */}
                <div style={{ padding: "24px", background: "rgba(15, 22, 36, 0.75)", borderRadius: "18px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "16px", color: "#60a5fa" }}>
                    Page-Level SEO Meta Tags
                  </h3>

                  {(["home", "about", "services", "portfolio", "contact"] as const).map((pageKey) => (
                    <div key={pageKey} style={{ marginBottom: "18px", paddingBottom: "16px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                      <div style={{ fontWeight: 700, fontSize: "0.86rem", textTransform: "capitalize", marginBottom: "8px", color: "#ffffff" }}>
                        {pageKey} Page SEO
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "12px" }}>
                        <div>
                          <label style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--text-muted)" }}>Meta Title</label>
                          <input
                            type="text"
                            value={settings.seo[pageKey]?.title || ""}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                seo: {
                                  ...settings.seo,
                                  [pageKey]: { ...settings.seo[pageKey], title: e.target.value },
                                },
                              })
                            }
                            style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--text-muted)" }}>Meta Description</label>
                          <input
                            type="text"
                            value={settings.seo[pageKey]?.description || ""}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                seo: {
                                  ...settings.seo,
                                  [pageKey]: { ...settings.seo[pageKey], description: e.target.value },
                                },
                              })
                            }
                            style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(10, 14, 24, 0.85)", color: "#ffffff", marginTop: "4px" }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="btn-primary"
                    style={{ padding: "12px 28px", fontSize: "0.86rem" }}
                  >
                    <Save size={16} /> {saveLoading ? "Saving to MongoDB..." : "Save Settings to Database"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ========== MODAL: VIEW INQUIRY DETAILS ========== */}
        {selectedInquiry && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.5)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px",
            }}
          >
            <div
              className="glass-card modal-box"
              style={{
                maxWidth: "500px",
                width: "100%",
                padding: "32px",
                borderRadius: "24px",
                background: "#0d1527",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
                color: "#ffffff",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <div>
                  <span className="badge badge-blue">Lead Details</span>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginTop: "6px", marginBottom: "2px", color: "#ffffff" }}>
                    {selectedInquiry.name}
                  </h3>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Submitted {new Date(selectedInquiry.createdAt).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                <div style={{ padding: "10px 14px", background: "rgba(10, 14, 24, 0.65)", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)", fontSize: "0.85rem", color: "#ffffff" }}>
                  <strong style={{ color: "#60a5fa" }}>Phone:</strong> {selectedInquiry.phone}
                </div>
                <div style={{ padding: "10px 14px", background: "rgba(10, 14, 24, 0.65)", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)", fontSize: "0.85rem", color: "#ffffff" }}>
                  <strong style={{ color: "#60a5fa" }}>Email:</strong> {selectedInquiry.email}
                </div>
                <div style={{ padding: "10px 14px", background: "rgba(10, 14, 24, 0.65)", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)", fontSize: "0.85rem", color: "#ffffff" }}>
                  <strong style={{ color: "#60a5fa" }}>Program Interest:</strong> {selectedInquiry.serviceInterest}
                </div>
                <div style={{ padding: "10px 14px", background: "rgba(10, 14, 24, 0.65)", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)", fontSize: "0.85rem", color: "#ffffff" }}>
                  <strong style={{ color: "#60a5fa" }}>Experience:</strong> {selectedInquiry.experienceLevel} | <strong style={{ color: "#60a5fa" }}>Capital:</strong> {selectedInquiry.tradingCapital}
                </div>
                {selectedInquiry.message && (
                  <div style={{ padding: "12px 14px", background: "rgba(10, 14, 24, 0.65)", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)", fontSize: "0.85rem", color: "#ffffff" }}>
                    <strong style={{ color: "#60a5fa" }}>Message / Goals:</strong>
                    <p style={{ marginTop: "4px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      {selectedInquiry.message}
                    </p>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <a
                  href={`https://wa.me/91${selectedInquiry.phone}?text=Hello%20${encodeURIComponent(selectedInquiry.name)},%20this%20is%20Kamal%20Verma%20following%20up%20on%20your%20trading%20mentorship%20inquiry.`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1,
                    background: "#25D366",
                    color: "#fff",
                    padding: "12px",
                    borderRadius: "var(--radius-full)",
                    textAlign: "center",
                    fontWeight: 700,
                    fontSize: "0.86rem",
                    textDecoration: "none",
                  }}
                >
                  Chat on WhatsApp
                </a>
                <a
                  href={`tel:${selectedInquiry.phone}`}
                  style={{
                    flex: 1,
                    background: "var(--brand-primary)",
                    color: "#fff",
                    padding: "12px",
                    borderRadius: "var(--radius-full)",
                    textAlign: "center",
                    fontWeight: 700,
                    fontSize: "0.86rem",
                    textDecoration: "none",
                  }}
                >
                  Call Directly
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ========== MODAL: CREATE / EDIT SERVICE ========== */}
        {isServiceModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.5)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px",
            }}
          >
            <div
              className="glass-card modal-box"
              style={{
                maxWidth: "600px",
                width: "100%",
                padding: "32px",
                borderRadius: "24px",
                background: "#0d1527",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
                color: "#ffffff",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0, color: "#ffffff" }}>
                  {editingServiceId ? "Edit Educational Service" : "Create New Educational Service"}
                </h3>
                <button
                  onClick={() => setIsServiceModalOpen(false)}
                  style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>

              {serviceFormError && (
                <div
                  style={{
                    background: "rgba(244, 63, 94, 0.12)",
                    color: "#e11d48",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    fontSize: "0.82rem",
                    marginBottom: "16px",
                    fontWeight: 600,
                  }}
                >
                  {serviceFormError}
                </div>
              )}

              <form onSubmit={handleSaveService} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Service Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1-on-1 Trading Mentorship"
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", marginTop: "4px" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Subtitle / Badge</label>
                    <input
                      type="text"
                      placeholder="e.g. Stock, Forex & Crypto"
                      value={serviceForm.subtitle}
                      onChange={(e) => setServiceForm({ ...serviceForm, subtitle: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", marginTop: "4px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Scope / Target Level</label>
                    <input
                      type="text"
                      placeholder="e.g. Foundations & Structured Execution"
                      value={serviceForm.scope}
                      onChange={(e) => setServiceForm({ ...serviceForm, scope: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", marginTop: "4px" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Custom URL Slug (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. mentorship-program (auto-generated from title if blank)"
                    value={serviceForm.slug}
                    onChange={(e) => setServiceForm({ ...serviceForm, slug: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", marginTop: "4px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Comprehensive overview of this mentorship program..."
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", marginTop: "4px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Curriculum Highlights (One per line)</label>
                  <textarea
                    rows={4}
                    placeholder="Core market mechanics&#10;Price action & candlestick patterns&#10;Stop-loss discipline & risk rules"
                    value={serviceForm.featuresText}
                    onChange={(e) => setServiceForm({ ...serviceForm, featuresText: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", marginTop: "4px" }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="checkbox"
                    id="servicePublished"
                    checked={serviceForm.published}
                    onChange={(e) => setServiceForm({ ...serviceForm, published: e.target.checked })}
                    style={{ width: "18px", height: "18px" }}
                  />
                  <label htmlFor="servicePublished" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    Publish to public website immediately
                  </label>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                  <button
                    type="submit"
                    disabled={serviceFormSaving}
                    className="btn-primary"
                    style={{ flex: 1, padding: "12px" }}
                  >
                    {serviceFormSaving ? "Saving..." : (editingServiceId ? "Save Changes" : "Create Service")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsServiceModalOpen(false)}
                    className="btn-ghost"
                    style={{ padding: "12px 20px" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========== MODAL: CREATE / EDIT PORTFOLIO ITEM ========== */}
        {isPortfolioModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.5)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px",
            }}
          >
            <div
              className="glass-card modal-box"
              style={{
                maxWidth: "640px",
                width: "100%",
                padding: "32px",
                borderRadius: "24px",
                background: "#0d1527",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
                color: "#ffffff",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0, color: "#ffffff" }}>
                  {editingPortfolioId ? "Edit Portfolio Case Study" : "Publish Portfolio Case Study"}
                </h3>
                <button
                  onClick={() => setIsPortfolioModalOpen(false)}
                  style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>

              {portfolioFormError && (
                <div
                  style={{
                    background: "rgba(244, 63, 94, 0.12)",
                    color: "#e11d48",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    fontSize: "0.82rem",
                    marginBottom: "16px",
                    fontWeight: 600,
                  }}
                >
                  {portfolioFormError}
                </div>
              )}

              <form onSubmit={handleSavePortfolio} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Understanding Price Action & Market Structure"
                    value={portfolioForm.title}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", marginTop: "4px" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Category</label>
                    <select
                      value={portfolioForm.category}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, category: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", marginTop: "4px" }}
                    >
                      <option value="Index Analysis">Index Analysis</option>
                      <option value="Swing Trading">Swing Trading</option>
                      <option value="Options Strategies">Options Strategies</option>
                      <option value="Trading Psychology">Trading Psychology</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Read Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 6 min read"
                      value={portfolioForm.readTime}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, readTime: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", marginTop: "4px" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Date / Subtitle Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. Educational Guide"
                      value={portfolioForm.date}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, date: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", marginTop: "4px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Custom Slug (Optional)</label>
                    <input
                      type="text"
                      placeholder="auto-generated from title if blank"
                      value={portfolioForm.slug}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, slug: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", marginTop: "4px" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Executive Summary</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Brief 1-2 sentence overview of the setup or concept..."
                    value={portfolioForm.summary}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, summary: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", marginTop: "4px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Full Content Paragraphs (Separate with blank line)</label>
                  <textarea
                    rows={5}
                    placeholder="Write detailed analysis or setup parameters here..."
                    value={portfolioForm.contentText}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, contentText: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", marginTop: "4px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Tags (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="PriceAction, TechnicalAnalysis, RiskManagement"
                    value={portfolioForm.tagsText}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, tagsText: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-card)", marginTop: "4px" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="checkbox"
                      id="portfolioPublished"
                      checked={portfolioForm.published}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, published: e.target.checked })}
                      style={{ width: "18px", height: "18px" }}
                    />
                    <label htmlFor="portfolioPublished" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      Published on website
                    </label>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="checkbox"
                      id="portfolioFeatured"
                      checked={portfolioForm.featured}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, featured: e.target.checked })}
                      style={{ width: "18px", height: "18px" }}
                    />
                    <label htmlFor="portfolioFeatured" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      Featured spotlight
                    </label>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                  <button
                    type="submit"
                    disabled={portfolioFormSaving}
                    className="btn-primary"
                    style={{ flex: 1, padding: "12px" }}
                  >
                    {portfolioFormSaving ? "Saving..." : (editingPortfolioId ? "Save Changes" : "Publish to Portfolio")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPortfolioModalOpen(false)}
                    className="btn-ghost"
                    style={{ padding: "12px 20px" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
