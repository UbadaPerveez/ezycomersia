"use client";

import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Download,
  FileText,
  FileUp,
  Loader2,
  Package,
  Save,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";

type NormalizedItem = {
  product_name: string;
  brand: string | null;
  model: string | null;
  manufacturer: string | null;
  category: string | null;
  part_number: string | null;
  material: string | null;
  dimensions: string | null;
};

export default function PDFNormalizerPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<NormalizedItem[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savingToInventory, setSavingToInventory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setError("Please select a valid .pdf file.");
        return;
      }
      setSelectedFile(file);
      setError("");
      setProducts([]);
      setSavedSuccess(false);
    }
  };

  const handleUploadAndNormalize = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError("");
    setProducts([]);
    setSavedSuccess(false);

    try {
      const accessToken = localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("http://127.0.0.1:8000/api/pdf/normalize", {
        method: "POST",
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to normalize PDF.");
      }

      setProducts(data.products || []);
    } catch (err) {
      console.error("PDF Normalization error:", err);
      setError(err instanceof Error ? err.message : "PDF Processing failed.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 DIRECT DOWNLOAD CLEAN CSV / EXCEL
  const handleDownloadCSV = () => {
    if (products.length === 0) return;

    const headers = [
      "Product Name",
      "Brand",
      "Model",
      "Manufacturer",
      "Category",
      "Part Number (SKU)",
      "Material",
      "Dimensions",
    ];

    const rows = products.map((p) => [
      `"${(p.product_name || "").replace(/"/g, '""')}"`,
      `"${(p.brand || "").replace(/"/g, '""')}"`,
      `"${(p.model || "").replace(/"/g, '""')}"`,
      `"${(p.manufacturer || "").replace(/"/g, '""')}"`,
      `"${(p.category || "").replace(/"/g, '""')}"`,
      `"${(p.part_number || "").replace(/"/g, '""')}"`,
      `"${(p.material || "").replace(/"/g, '""')}"`,
      `"${(p.dimensions || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const cleanName = selectedFile
      ? selectedFile.name.replace(/\.[^/.]+$/, "")
      : "catalog";
    link.setAttribute("download", `ezycomersia_normalized_${cleanName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🔹 OPTIONAL: BULK SAVE TO CATALOG INVENTORY
  const handleBulkSave = async () => {
    if (products.length === 0) return;
    setSavingToInventory(true);

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) throw new Error("Please log in to save to inventory.");

      const res = await fetch("http://127.0.0.1:8000/api/pdf/bulk-save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          products: products,
          source_filename: selectedFile?.name || "document.pdf",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to save products.");

      setSavedSuccess(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error saving to catalog.");
    } finally {
      setSavingToInventory(false);
    }
  };

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

          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Main Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 shadow-sm shadow-cyan-100/50">
            <FileText className="h-3.5 w-3.5 text-cyan-600" />
            PDF Ingestion & Excel Converter
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            PDF Catalog Normalizer
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Upload messy supplier price lists, PDF spec sheets, or catalog
            documents. The AI extracts all individual products, normalizes
            attributes, and generates a clean, downloadable CSV/Excel file.
          </p>
        </div>

        {/* Upload Zone Card */}
        <div className="rounded-2xl border border-cyan-100 bg-white p-8 shadow-sm backdrop-blur-xl">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
          />

          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-200 bg-cyan-50/40 p-10 text-center transition hover:border-cyan-400 hover:bg-cyan-50/70"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 shadow-sm">
                <FileUp className="h-8 w-8" />
              </div>
              <p className="mt-4 text-sm font-bold text-slate-900">
                Click to browse or drop supplier PDF here
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Supports catalogs, product lists, invoices, and spec sheets (.pdf)
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 rounded-xl border border-cyan-200 bg-cyan-50/50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-sm">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  disabled={loading}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  title="Remove file"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={handleUploadAndNormalize}
                  disabled={loading}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 text-sm font-semibold text-white shadow-md shadow-cyan-500/25 transition hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing PDF & Normalizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Extract & Normalize Products
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-5 shadow-sm">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-900">Processing Error</p>
              <p className="mt-1 text-xs text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Results & CSV Download Section */}
        {products.length > 0 && (
          <div className="mt-8 space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col gap-4 rounded-2xl border border-cyan-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    {products.length} Products Successfully Normalized
                  </h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Ready for instant download in Excel/CSV format or catalog save.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* 🔹 PRIMARY ACTION: DOWNLOAD CSV */}
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition hover:from-emerald-500 hover:to-teal-500"
                >
                  <Download className="h-4 w-4" />
                  Download Normalized CSV
                </button>

                {/* OPTIONAL BULK SAVE */}
                <button
                  type="button"
                  onClick={handleBulkSave}
                  disabled={savingToInventory || savedSuccess}
                  className={`inline-flex h-11 items-center gap-2 rounded-xl border px-5 text-sm font-semibold transition ${
                    savedSuccess
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-cyan-200 bg-white text-cyan-800 hover:bg-cyan-50"
                  }`}
                >
                  {savingToInventory ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : savedSuccess ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Saved to Catalog!
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save All to Inventory
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Normalized Products Preview Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Normalized Catalog Preview
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="px-5 py-3.5">Product Name</th>
                      <th className="px-5 py-3.5">SKU / Part #</th>
                      <th className="px-5 py-3.5">Brand & Model</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Material</th>
                      <th className="px-5 py-3.5">Dimensions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p, idx) => (
                      <tr key={idx} className="transition hover:bg-cyan-50/30">
                        <td className="px-5 py-4 font-semibold text-slate-900">
                          {p.product_name}
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-cyan-700">
                          {p.part_number || "—"}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-600">
                          {p.brand ? `${p.brand} ${p.model || ""}` : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-lg border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                            {p.category || "General"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-600">
                          {p.material || "—"}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-600">
                          {p.dimensions || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}