"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bot,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  LogOut,
  Package,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

type UserData = {
  id: number;
  full_name: string;
  company: string;
  email: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);

  // Live Real Data State
  const [stats, setStats] = useState({
    products: 0,
    normalized: 0,
    audits: 0,
    accuracy: "—",
  });

  useEffect(() => {
    // 1. Read stored user
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        console.error("Unable to read stored user data.");
      }
    }

    // 2. Fetch Live Real Data from Backend
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const res = await fetch("http://127.0.0.1:8000/api/inventory", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data.products || [];

          const totalProducts = items.length;

          // Normalized: count of products having structured attributes
          const normalizedCount = items.filter(
            (p: { category?: string; material?: string; dimensions?: string; raw_input?: string }) =>
              p.category || p.material || p.dimensions || p.raw_input
          ).length;

          // Read latest audit scores if available
          const storedHealth = localStorage.getItem("ezy_catalog_health");
          const storedAudits = localStorage.getItem("ezy_audit_count");
          const auditCount = storedAudits ? parseInt(storedAudits, 10) : 0;

          // Quality Score / Accuracy
          let qualityScore = "—";
          if (storedHealth) {
            qualityScore = `${storedHealth}%`;
          } else if (totalProducts > 0) {
            let filledPoints = 0;
            const totalPoints = totalProducts * 4;
            items.forEach((p: { product_name?: string; category?: string; material?: string; dimensions?: string }) => {
              if (p.product_name) filledPoints++;
              if (p.category) filledPoints++;
              if (p.material) filledPoints++;
              if (p.dimensions) filledPoints++;
            });
            qualityScore = `${Math.round((filledPoints / totalPoints) * 100)}%`;
          }

          setStats({
            products: totalProducts,
            normalized: normalizedCount,
            audits: auditCount,
            accuracy: qualityScore,
          });
        }
      } catch (err) {
        console.error("Failed to load inventory stats:", err);
      }
    };

    fetchDashboardStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  return (
    <main className="min-h-screen bg-[#05070b] text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-[-180px] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute right-[-100px] top-1/3 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/10">
              <Sparkles className="h-5 w-5 text-cyan-300" />
            </div>

            <div>
              <div className="text-lg font-semibold tracking-tight">
                ezycomersia
              </div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                AI Commerce Intelligence
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-white/90">
                {user?.full_name || "User"}
              </p>
              <p className="text-xs text-white/40">
                {user?.company || "ezycomersia"}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white/60 transition hover:border-red-300/20 hover:bg-red-400/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Welcome */}
        <div className="mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/5 px-3 py-1.5 text-xs text-cyan-200/80">
            <Activity className="h-3.5 w-3.5" />
            AI system online
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome back
            {user?.full_name ? `, ${user.full_name}` : ""}.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">
            Manage your product intelligence, normalize supplier data, and
            audit your catalog using the ezycomersia AI engine.
          </p>
        </div>

        {/* Stats — Connected to live real data */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Package className="h-5 w-5" />}
            label="Products"
            value={stats.products.toString()}
            description="Ready to process"
          />

          <StatCard
            icon={<Boxes className="h-5 w-5" />}
            label="Normalized"
            value={stats.normalized.toString()}
            description="AI-normalized products"
          />

          <StatCard
            icon={<ClipboardCheck className="h-5 w-5" />}
            label="Audits"
            value={stats.audits.toString()}
            description="Catalog audits"
          />

          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Accuracy"
            value={stats.accuracy}
            description="AI quality score"
          />
        </div>

        {/* 4 Main Action Cards */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. AI Agent */}
          <DashboardCard
            href="/agent"
            icon={<Bot className="h-6 w-6" />}
            title="AI Agent"
            description="Upload messy product text and let the AI engine analyze, normalize, and structure it."
            action="Open AI Agent"
            featured
          />

          {/* 2. PDF to CSV (NEW) */}
          <DashboardCard
            href="/pdf-normalizer"
            icon={<FileText className="h-6 w-6" />}
            title="PDF to CSV"
            description="Drop messy supplier PDF catalogs or spec sheets and convert them directly into clean, normalized CSV files."
            action="Open PDF Tool"
          />

          {/* 3. Inventory */}
          <DashboardCard
            href="/inventory"
            icon={<Package className="h-6 w-6" />}
            title="Inventory"
            description="View and manage your normalized product catalog in one structured workspace."
            action="View Inventory"
          />

          {/* 4. Audit */}
          <DashboardCard
            href="/audit"
            icon={<ClipboardCheck className="h-6 w-6" />}
            title="Audit"
            description="Review AI decisions, validation results, and catalog quality information."
            action="Open Audit"
          />
        </div>

        {/* Account information */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-6 backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
              <User className="h-5 w-5 text-white/60" />
            </div>

            <div>
              <h2 className="font-semibold">Account</h2>
              <p className="text-xs text-white/40">
                Your ezycomersia workspace
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <InfoItem label="Name" value={user?.full_name || "—"} />

            <InfoItem label="Company" value={user?.company || "—"} />

            <InfoItem label="Email" value={user?.email || "—"} />
          </div>
        </div>

        {/* System status */}
        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.025] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            </div>

            <div>
              <p className="text-sm font-medium text-white/85">
                Authentication active
              </p>
              <p className="text-xs text-white/40">
                Your session is ready for AI processing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-300/70">
            <ShieldCheck className="h-4 w-4" />
            Secure session
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------- Components ---------- */

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl transition hover:border-white/15 hover:bg-white/[0.04]">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-cyan-300">
          {icon}
        </div>

        <span className="text-xs text-white/25">LIVE</span>
      </div>

      <p className="text-xs uppercase tracking-wider text-white/35">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold">{value}</p>

      <p className="mt-1 text-xs text-white/35">{description}</p>
    </div>
  );
}

function DashboardCard({
  href,
  icon,
  title,
  description,
  action,
  featured = false,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  featured?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-2xl border p-6 transition ${
        featured
          ? "border-cyan-300/20 bg-cyan-300/[0.045] hover:border-cyan-300/35 hover:bg-cyan-300/[0.07]"
          : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.045]"
      }`}
    >
      {featured && (
        <div className="absolute right-5 top-5 rounded-full border border-cyan-300/15 bg-cyan-300/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-cyan-200">
          Recommended
        </div>
      )}

      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-cyan-300">
        {icon}
      </div>

      <h2 className="mt-6 text-xl font-semibold">{title}</h2>

      <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/45">
        {description}
      </p>

      <div className="mt-6 flex items-center gap-2 text-sm font-medium text-white/65 transition group-hover:text-white">
        {action}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-white/30">
        {label}
      </p>
      <p className="mt-2 truncate text-sm text-white/75">{value}</p>
    </div>
  );
}