"use client";

import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  HelpCircle,
  Info,
  Lightbulb,
  Loader2,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wand2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type AuditIssue = {
  product_id: number;
  product_name?: string;
  part_number: string;
  issue_type: string;
  field: string;
  severity: "CRITICAL" | "WARNING" | "INFO" | string;
  description: string;
  recommendation: string;
  status: string;
};

type AuditResponse = {
  audit_status: string;
  ai_engine: string;
  products: Record<string, unknown>[];
  audit: {
    catalog_health: number;
    products_checked: number;
    issues_found: number;
    validated: number;
    needs_review: number;
    summary: string;
    issues: AuditIssue[];
  };
};

export default function AuditPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [error, setError] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Track issues fixed in real-time
  const [fixingId, setFixingId] = useState<string | null>(null);
  const [fixedIssueKeys, setFixedIssueKeys] = useState<Set<string>>(new Set());
  const [fixingAll, setFixingAll] = useState(false);

  const runAudit = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setFixedIssueKeys(new Set());

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        throw new Error("Authentication required. Please log in again.");
      }

      const res = await fetch("https://ezycomersia-backend.onrender.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.detail || "ezycomersia AI Audit could not process the request."
        );
      }

      setResult(data);

      // Sync latest score to dashboard
      localStorage.setItem("ezy_catalog_health", data.audit.catalog_health.toString());
      const prevAudits = Number(localStorage.getItem("ezy_audit_count") || 0);
      localStorage.setItem("ezy_audit_count", (prevAudits + 1).toString());
    } catch (err) {
      console.error("Audit error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while running the ezycomersia AI audit."
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔹 ONE-CLICK AI AUTO-FIX FUNCTION
  const handleAutoFix = async (issue: AuditIssue, issueKey: string) => {
    setFixingId(issueKey);
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) throw new Error("Authentication required.");

      const res = await fetch("https://ezycomersia-backend.onrender.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          product_id: issue.product_id,
          field: issue.field,
          recommendation: issue.recommendation,
          issue_type: issue.issue_type,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Could not fix issue.");
      }

      // Mark this issue as fixed
      setFixedIssueKeys((prev) => new Set(prev).add(issueKey));

      // Dynamically improve health score
      if (result) {
        const newHealth = Math.min(100, result.audit.catalog_health + 4);
        setResult({
          ...result,
          audit: {
            ...result.audit,
            catalog_health: newHealth,
            issues_found: Math.max(0, result.audit.issues_found - 1),
          },
        });
        localStorage.setItem("ezy_catalog_health", newHealth.toString());
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to fix issue.");
    } finally {
      setFixingId(null);
    }
  };

  // 🔹 FIX ALL AUTOMATED ISSUES IN BATCH
  const handleFixAll = async () => {
    if (!result?.audit?.issues.length) return;
    setFixingAll(true);

    const issuesToFix = result.audit.issues.filter(
      (iss, idx) => !fixedIssueKeys.has(`${iss.product_id}-${iss.field}-${idx}`)
    );

    for (let i = 0; i < issuesToFix.length; i++) {
      const iss = issuesToFix[i];
      const key = `${iss.product_id}-${iss.field}-${i}`;
      try {
        await handleAutoFix(iss, key);
      } catch (e) {
        console.error("Batch fix error:", e);
      }
    }
    setFixingAll(false);
  };

  // 🔹 EXPORT CLEAN CATALOG TO CSV
  const handleExportCSV = () => {
    if (!result?.products?.length) return;

    const headers = [
      "ID",
      "Product Name",
      "Part Number",
      "Category",
      "Material",
      "Dimensions",
      "Raw Input",
    ];

    const rows = result.products.map((p) => [
      p.id ?? "",
      `"${String(p.product_name || "").replace(/"/g, '""')}"`,
      `"${String(p.part_number || "").replace(/"/g, '""')}"`,
      `"${String(p.category || "").replace(/"/g, '""')}"`,
      `"${String(p.material || "").replace(/"/g, '""')}"`,
      `"${String(p.dimensions || "").replace(/"/g, '""')}"`,
      `"${String(p.raw_input || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `ezycomersia_clean_catalog_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter issues
  const filteredIssues = useMemo(() => {
    if (!result?.audit?.issues) return [];

    return result.audit.issues.filter((issue) => {
      const matchesSeverity =
        severityFilter === "ALL" ||
        issue.severity.toUpperCase() === severityFilter.toUpperCase();

      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        issue.part_number.toLowerCase().includes(searchLower) ||
        (issue.product_name &&
          issue.product_name.toLowerCase().includes(searchLower)) ||
        issue.field.toLowerCase().includes(searchLower) ||
        issue.description.toLowerCase().includes(searchLower);

      return matchesSeverity && matchesSearch;
    });
  }, [result, severityFilter, searchQuery]);

  return (
    <main className="min-h-screen bg-[#f8fbfe] text-slate-800">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-[-140px] h-[520px] w-[520px] rounded-full bg-cyan-200/40 blur-[130px]" />
        <div className="absolute right-[-100px] top-1/4 h-[500px] w-[500px] rounded-full bg-blue-200/35 blur-[130px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-cyan-100 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 shadow-sm shadow-cyan-100/50">
              <Sparkles className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-slate-900">
                ezycomersia
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-600">
                AI Commerce Intelligence
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {result && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-2 rounded-xl border border-cyan-200 bg-white px-4 py-2 text-xs font-semibold text-cyan-700 shadow-sm transition hover:bg-cyan-50"
              >
                <Download className="h-3.5 w-3.5" />
                Export Clean Catalog (CSV)
              </button>
            )}

            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50/50 hover:text-cyan-900"
            >
              <ArrowLeft className="h-4 w-4 text-slate-500" />
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 shadow-sm shadow-cyan-100/50">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-600" />
              ezycomersia Quality Engine
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Catalog Health & Audit
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Autonomous catalog inspection by ezycomersia AI. Scans inventory
              records to identify incomplete attributes, formatting defects, and
              normalization anomalies.
            </p>
          </div>

          <button
            type="button"
            onClick={runAudit}
            disabled={loading}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 text-sm font-semibold text-white shadow-md shadow-cyan-500/25 transition hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                Auditing Catalog...
              </>
            ) : result ? (
              <>
                <RefreshCw className="h-4 w-4" />
                Run Re-Audit
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Start AI Catalog Audit
              </>
            )}
          </button>
        </div>

        {/* Loading Scanner */}
        {loading && <EzycomersiaAuditAnimation />}

        {/* Error */}
        {error && (
          <div className="mt-6 flex items-start gap-3.5 rounded-2xl border border-red-200 bg-red-50/80 p-5 shadow-sm">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-900">
                Audit Execution Error
              </p>
              <p className="mt-1 text-xs leading-5 text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Initial View */}
        {!loading && !result && !error && (
          <div className="mt-6 rounded-2xl border border-cyan-100 bg-white/90 p-12 text-center shadow-sm backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-600 shadow-sm shadow-cyan-100">
              <ClipboardCheck className="h-8 w-8" />
            </div>
            <h2 className="mt-5 text-lg font-bold text-slate-900">
              Your catalog is ready for inspection
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Click &quot;Start AI Catalog Audit&quot; to inspect your products
              against enterprise standards for completeness, materials,
              dimensions, and SKU compliance.
            </p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="mt-8 space-y-6">
            {/* Top 5 KPI Metrics Grid with Weighted Score */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {/* 1. Catalog Health */}
              <div className="rounded-2xl border border-cyan-200 bg-white p-5 shadow-sm shadow-cyan-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Catalogue Health
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      result.audit.catalog_health >= 80
                        ? "bg-emerald-50 text-emerald-700"
                        : result.audit.catalog_health >= 60
                        ? "bg-amber-50 text-amber-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {result.audit.catalog_health >= 80
                      ? "Healthy"
                      : result.audit.catalog_health >= 60
                      ? "Fair"
                      : "Critical"}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {result.audit.catalog_health}%
                  </span>
                  <TrendingUp className="h-4 w-4 text-cyan-600" />
                </div>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      result.audit.catalog_health >= 80
                        ? "bg-gradient-to-r from-cyan-500 to-emerald-500"
                        : result.audit.catalog_health >= 60
                        ? "bg-gradient-to-r from-amber-400 to-amber-500"
                        : "bg-gradient-to-r from-rose-500 to-red-500"
                    }`}
                    style={{ width: `${result.audit.catalog_health}%` }}
                  />
                </div>
              </div>

              {/* 2. Products Checked */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Products Checked
                  </span>
                  <Package className="h-4 w-4 text-cyan-600" />
                </div>
                <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
                  {result.audit.products_checked}
                </p>
                <p className="mt-2 text-xs text-slate-400">Total items active</p>
              </div>

              {/* 3. Validated */}
              <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                    Validated
                  </span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="mt-3 text-3xl font-extrabold tracking-tight text-emerald-700">
                  {result.audit.validated}
                </p>
                <p className="mt-2 text-xs text-slate-400">High quality items</p>
              </div>

              {/* 4. Needs Review */}
              <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm shadow-amber-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                    Needs Review
                  </span>
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                </div>
                <p className="mt-3 text-3xl font-extrabold tracking-tight text-amber-700">
                  {result.audit.needs_review}
                </p>
                <p className="mt-2 text-xs text-slate-400">Items with defects</p>
              </div>

              {/* 5. Issues Found */}
              <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm shadow-rose-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">
                    Issues Found
                  </span>
                  <AlertCircle className="h-4 w-4 text-rose-600" />
                </div>
                <p className="mt-3 text-3xl font-extrabold tracking-tight text-rose-700">
                  {result.audit.issues_found}
                </p>
                <p className="mt-2 text-xs text-slate-400">Quality issues flagged</p>
              </div>
            </div>

            {/* Assessment Banner */}
            <div className="flex items-start gap-3.5 rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-sm shadow-cyan-300">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-900">
                  ezycomersia AI Audit Assessment
                </p>
                <p className="mt-1 text-sm font-medium leading-relaxed text-slate-700">
                  {result.audit.summary}
                </p>
              </div>
            </div>

            {/* Audit Findings Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              {/* Controls */}
              <div className="border-b border-slate-100 bg-slate-50/50 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Audit Findings & Actions
                    </h2>
                    <p className="text-xs text-slate-500">
                      Fix identified defects instantly using the AI auto-repair
                      engine.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Batch Fix All Button */}
                    <button
                      type="button"
                      onClick={handleFixAll}
                      disabled={fixingAll || filteredIssues.length === 0}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 text-xs font-bold text-white shadow-xs transition hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50"
                    >
                      {fixingAll ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Fixing All...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-3 w-3" />
                          Auto-Fix All Issues
                        </>
                      )}
                    </button>

                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search product or SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 w-48 rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>

                    {/* Filters */}
                    <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-xs">
                      {["ALL", "CRITICAL", "WARNING", "INFO"].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setSeverityFilter(filter)}
                          className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                            severityFilter === filter
                              ? "bg-cyan-600 text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {filter === "ALL" ? "All" : filter}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="px-5 py-3.5">Product Reference</th>
                      <th className="px-5 py-3.5">Problematic Field</th>
                      <th className="px-5 py-3.5">Severity</th>
                      <th className="px-5 py-3.5">Recommendation</th>
                      <th className="px-5 py-3.5 text-right">Instant AI Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredIssues.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center">
                          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
                          <p className="mt-3 text-sm font-semibold text-slate-800">
                            No issues match your current filter
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            The catalog records are validated for the selected criteria.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredIssues.map((issue, idx) => {
                        const issueKey = `${issue.product_id}-${issue.field}-${idx}`;
                        const isFixed = fixedIssueKeys.has(issueKey);
                        const isFixing = fixingId === issueKey;

                        return (
                          <tr
                            key={issueKey}
                            className={`transition ${
                              isFixed ? "bg-emerald-50/40" : "hover:bg-cyan-50/30"
                            }`}
                          >
                            {/* Product Reference */}
                            <td className="px-5 py-4">
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {issue.product_name || "Unnamed Product"}
                                </p>
                                <p className="mt-0.5 font-mono text-xs text-cyan-700">
                                  {issue.part_number}
                                </p>
                              </div>
                            </td>

                            {/* Problematic Field */}
                            <td className="px-5 py-4">
                              <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
                                {issue.field.replace(/_/g, " ")}
                              </span>
                            </td>

                            {/* Severity */}
                            <td className="px-5 py-4">
                              <SeverityBadge severity={issue.severity} />
                            </td>

                            {/* Recommendation */}
                            <td className="max-w-md px-5 py-4">
                              <div className="flex items-start gap-2 rounded-xl border border-cyan-200 bg-cyan-50/70 p-2.5 text-xs text-cyan-950">
                                <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-600" />
                                <span className="leading-5">
                                  {issue.recommendation}
                                </span>
                              </div>
                            </td>

                            {/* 🔹 Action: One-Click AI Fix */}
                            <td className="px-5 py-4 text-right">
                              {isFixed ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                  Fixed
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAutoFix(issue, issueKey)}
                                  disabled={isFixing || fixingAll}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-cyan-500 disabled:opacity-50"
                                >
                                  {isFixing ? (
                                    <>
                                      <Loader2 className="h-3 w-3 animate-spin text-white" />
                                      Fixing...
                                    </>
                                  ) : (
                                    <>
                                      <Wand2 className="h-3 w-3 text-cyan-200" />
                                      Auto-Fix with AI
                                    </>
                                  )}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Advice Footer */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500 shadow-xs">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-cyan-600" />
                <span>
                  Audit results and auto-fixes are applied directly to your database
                  via ezycomersia AI.
                </span>
              </div>
              <Link
                href="/inventory"
                className="flex items-center gap-1 font-semibold text-cyan-600 hover:text-cyan-700"
              >
                Go to Inventory <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

/* =========================================================
   SEVERITY BADGE COMPONENT
========================================================= */
function SeverityBadge({ severity }: { severity: string }) {
  const normalized = severity.toUpperCase();

  if (normalized === "CRITICAL") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-700">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
        Critical
      </span>
    );
  }

  if (normalized === "WARNING") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Warning
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-700">
      <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
      Info
    </span>
  );
}

/* =========================================================
   LIGHT EZYCOMERSIA PROCESSING ANIMATION
========================================================= */
function EzycomersiaAuditAnimation() {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-cyan-200 bg-white p-10 text-center shadow-md shadow-cyan-100/50">
      <div className="flex flex-col items-center justify-center">
        <div className="relative flex h-40 w-40 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full border border-cyan-200/70" />
          <div className="absolute inset-4 animate-[spin_6s_linear_infinite] rounded-full border border-dashed border-cyan-400" />
          <div className="absolute inset-8 animate-pulse rounded-full border border-cyan-100 bg-cyan-50/50" />

          <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-200 bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-300">
            <Bot className="h-10 w-10" />
          </div>
        </div>

        <h2 className="mt-6 text-xl font-bold text-slate-900">
          ezycomersia AI Audit in Progress
          <span className="inline-flex text-cyan-600">
            <span className="animate-pulse">.</span>
            <span className="animate-pulse delay-150">.</span>
            <span className="animate-pulse delay-300">.</span>
          </span>
        </h2>

        <p className="mt-2 max-w-md text-sm text-slate-500">
          ezycomersia Intelligence Engine is inspecting your products for missing
          attributes, formatting issues, and catalog compliance.
        </p>

        <div className="mt-8 w-full max-w-md space-y-2.5 text-left">
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Connecting to inventory database</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-cyan-200 bg-cyan-50/70 px-4 py-3 text-xs font-semibold text-cyan-900">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />
            <span>Analyzing fields (dimensions, materials, categories)</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-400">
            <HelpCircle className="h-4 w-4 text-slate-300" />
            <span>Calculating weighted catalogue health score</span>
          </div>
        </div>
      </div>
    </div>
  );
}