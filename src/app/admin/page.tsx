"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { AdminTabType, ToastMessage } from "@/types/admin";
import { 
  LayoutDashboard, 
  Settings, 
  ConciergeBell, 
  UtensilsCrossed, 
  MessageSquareQuote, 
  Image as ImageIcon, 
  LogOut, 
  Lock, 
  Loader2, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Menu, 
  X 
} from "lucide-react";

// Import modular dashboard tab views
import OverviewTab from "@/components/admin/OverviewTab";
import QuickContactTab from "@/components/admin/QuickContactTab";
import ServicesManagerTab from "@/components/admin/ServicesManagerTab";
import MenuManagerTab from "@/components/admin/MenuManagerTab";
import TestimonialModeratorTab from "@/components/admin/TestimonialModeratorTab";
import GalleryManagerTab from "@/components/admin/GalleryManagerTab";

export default function AdminRootPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTabType>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Real-time badge metrics
  const [metrics, setMetrics] = useState({
    pendingReviews: 0,
    totalMenuItems: 0,
    activeServices: 0,
    totalGalleryImages: 0,
  });

  // Toaster alert notifications
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // 1. Firebase Auth Guard (Handles loading gracefully to prevent UI flashing)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time metric tallies for Overview card badges
  useEffect(() => {
    if (!user) return;

    const unsubServices = onSnapshot(collection(db, "services"), (s) => 
      setMetrics((m) => ({ ...m, activeServices: s.docs.length })), () => {});
    
    const unsubMenu = onSnapshot(collection(db, "menu_items"), (s) => 
      setMetrics((m) => ({ ...m, totalMenuItems: s.docs.length })), () => {});
    
    const unsubGallery = onSnapshot(collection(db, "gallery"), (s) => 
      setMetrics((m) => ({ ...m, totalGalleryImages: s.docs.length })), () => {});
    
    const unsubReviews = onSnapshot(collection(db, "reviews"), (s) => {
      setMetrics((m) => ({ ...m, pendingReviews: s.docs.length }));
    }, () => {});

    return () => {
      unsubServices();
      unsubMenu();
      unsubGallery();
      unsubReviews();
    };
  }, [user]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast("success", "Authentication verified! Access granted to Admin Portal.");
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/user-not-found" || code === "auth/invalid-credential" || code === "auth/invalid-login-credentials") {
        setLoginError("Account not registered or incorrect password. Please make sure you added this user under Authentication -> Users in your Firebase Console.");
      } else if (code === "auth/wrong-password") {
        setLoginError("Incorrect password entered. Please double check your credentials.");
      } else if (code === "auth/too-many-requests") {
        setLoginError("Too many failed login attempts. Please try again later.");
      } else if (code === "auth/operation-not-allowed") {
        setLoginError("Email/Password sign-in is not enabled! Go to Firebase Console -> Authentication -> Sign-in method and enable Email/Password.");
      } else {
        setLoginError(err?.message || "Authentication failed. Please verify Firebase setup.");
      }
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    if (!confirm("Are you sure you want to sign out of the Admin Suite?")) return;
    await signOut(auth);
    showToast("info", "Signed out successfully.");
  };

  // Prevent UI flashing with clean loading screen during auth evaluation
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37] mb-4" />
        <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-bold animate-pulse">
          Verifying Security Credentials...
        </p>
      </div>
    );
  }

  // Unauthenticated -> Show Slick Admin Login Card
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative Luxury Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-[#18181B] border border-[#D4AF37]/40 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-black border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-4 text-[#D4AF37] shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Anna Caterers <span className="text-[#D4AF37] font-serif italic">Portal</span>
            </h1>
            <p className="text-gray-400 text-xs uppercase tracking-widest mt-2">Executive Admin Login</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-2">
                Administrator Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@annacaterers.com"
                className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors text-sm shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-2">
                Master Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors text-sm shadow-inner"
              />
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginSubmitting}
              className="w-full py-4 rounded-full bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-[0.15em] hover:bg-[#b5952f] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#D4AF37]/25 disabled:opacity-50 mt-2"
            >
              {loginSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              <span>Sign In to Dashboard</span>
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <Link href="/" className="text-xs text-gray-500 hover:text-[#D4AF37] transition-colors flex items-center justify-center gap-1.5">
              <span>← Return to public website</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "contact", label: "Quick Contact & Links", icon: Settings },
    { id: "services", label: "Services Manager", icon: ConciergeBell, badge: metrics.activeServices },
    { id: "menu", label: "Menu Manager", icon: UtensilsCrossed, badge: metrics.totalMenuItems },
    { id: "testimonials", label: "Testimonial Moderator", icon: MessageSquareQuote, badge: metrics.pendingReviews },
    { id: "gallery", label: "Gallery Manager", icon: ImageIcon, badge: metrics.totalGalleryImages },
  ];

  return (
    <div className="min-h-screen flex bg-[#0D0D0D]">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-bounce max-w-sm">
          <div className={`px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 ${
            toast.type === "success" ? "bg-green-900/90 border-green-400 text-white" :
            toast.type === "error" ? "bg-red-900/90 border-red-400 text-white" :
            "bg-[#18181B]/95 border-[#D4AF37] text-[#D4AF37]"
          }`}>
            {toast.type === "success" && <CheckCircle className="w-5 h-5 shrink-0 text-green-300" />}
            {toast.type === "error" && <AlertCircle className="w-5 h-5 shrink-0 text-red-300" />}
            {toast.type === "info" && <Info className="w-5 h-5 shrink-0 text-[#D4AF37]" />}
            <span className="text-xs font-bold leading-snug">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Mobile Menu Open/Close Bar */}
      <div className="lg:hidden fixed top-0 w-full z-40 bg-[#18181B]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg text-white">Anna Caterers <span className="text-[#D4AF37]">Suite</span></span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-[#D4AF37]">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Fixed Left Sidebar */}
      <aside className={`w-72 bg-[#18181B] border-r border-white/10 fixed h-full z-30 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
        mobileMenuOpen ? "translate-x-0 top-0" : "-translate-x-full"
      }`}>
        <div className="p-6">
          {/* Logo / Title */}
          <div className="mb-8 hidden lg:block">
            <span className="text-xs font-extrabold tracking-[0.2em] text-[#D4AF37] uppercase block mb-1">Executive Portal</span>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Anna Caterers
            </h1>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 pt-16 lg:pt-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as AdminTabType);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3.5 rounded-2xl font-semibold text-xs tracking-wide transition-all duration-200 active:scale-[0.97] flex items-center justify-between cursor-pointer ${
                    isActive
                      ? "bg-[#D4AF37] text-black font-extrabold shadow-lg shadow-[#D4AF37]/20"
                      : "text-gray-400 hover:text-[#D4AF37] hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-black stroke-[2.5]" : "text-[#D4AF37]"}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {/* Standard Badge */}
                  {typeof item.badge === "number" && item.badge > 0 && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? "bg-black/20 text-black" : "bg-white/10 text-gray-300"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Status & Sign Out */}
        <div className="p-6 border-t border-white/10 bg-black/40">
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Logged in as:</p>
            <p className="text-xs font-semibold text-[#D4AF37] truncate">{user.email || "Master Administrator"}</p>
          </div>

          <div className="space-y-2">
            <Link
              href="/"
              target="_blank"
              className="w-full py-2.5 px-4 rounded-xl bg-white/5 text-gray-300 hover:text-[#D4AF37] text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>View Public Website ↗</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-600 hover:text-white transition-all active:scale-[0.98] text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 min-h-screen p-6 sm:p-10 pt-20 lg:pt-10 max-w-7xl mx-auto w-full">
        <div key={activeTab} className="animate-in fade-in zoom-in-[0.99] duration-300 w-full">
          {activeTab === "overview" && <OverviewTab metrics={metrics} onSwitchTab={(tab) => setActiveTab(tab)} />}
          {activeTab === "contact" && <QuickContactTab showToast={showToast} />}
          {activeTab === "services" && <ServicesManagerTab showToast={showToast} />}
          {activeTab === "menu" && <MenuManagerTab showToast={showToast} />}
          {activeTab === "testimonials" && <TestimonialModeratorTab showToast={showToast} />}
          {activeTab === "gallery" && <GalleryManagerTab showToast={showToast} />}
        </div>
      </main>
    </div>
  );
}
