"use client";

import {
  AlertCircle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  Clock3,
  Loader2,
  Package,
  RefreshCw,
  Search,
  Sparkles,
  Table,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  product_name?: string | null;
  part_number: string;
  category?: string | null;
  material?: string | null;
  dimensions?: string | null;
  raw_input?: string | null;
  created_at: string;
};

type InventoryResponse = {
  count: number;
  products: Product[];
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchInventory = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        throw new Error(
          "Authentication required. Please log in again."
        );
      }

      const response = await fetch(
        "http://127.0.0.1:8000/api/inventory",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data: InventoryResponse | { detail?: string } =
        await response.json();

      if (!response.ok) {
        throw new Error(
          "detail" in data && data.detail
            ? data.detail
            : "Unable to load inventory."
        );
      }

      setProducts(data.products);
    } catch (err) {
      console.error("Inventory fetch error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading inventory."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleDelete = async (productId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this product from your inventory?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(productId);
    setError("");

    try {
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        throw new Error(
          "Authentication required. Please log in again."
        );
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/inventory/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to delete the product."
        );
      }

      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) => product.id !== productId
        )
      );
    } catch (err) {
      console.error("Delete inventory error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while deleting the product."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) =>
      [
        product.part_number,
        product.product_name,
        product.category,
        product.material,
        product.dimensions,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        )
    );
  }, [products, search]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Unknown";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-[#05070b] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-[-180px] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute right-[-100px] top-1/3 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[120px]" />

        <div className="absolute bottom-[-200px] left-1/3 h-[350px] w-[350px] rounded-full bg-cyan-400/5 blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-3">
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

          <div className="flex items-center gap-3">
            <Link
              href="/agent"
              className="hidden items-center gap-2 rounded-xl border border-cyan-300/10 bg-cyan-300/5 px-4 py-2.5 text-sm text-cyan-200/80 transition hover:border-cyan-300/20 hover:bg-cyan-300/10 hover:text-cyan-200 sm:flex"
            >
              <Bot className="h-4 w-4" />
              AI Agent
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/60 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/5 px-3 py-1.5 text-xs text-cyan-200/80">
              <Package className="h-3.5 w-3.5" />
              Inventory Management
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Product Inventory
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">
              Manage normalized products saved from the ezycomersia
              AI catalog engine.
            </p>
          </div>

                    <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/audit"
              className="flex h-11 items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 text-sm font-medium text-purple-300 transition hover:border-purple-400/50 hover:bg-purple-500/20 hover:text-purple-200 active:scale-95"
            >
              <Table className="h-4 w-4" />
              Audit Console
            </Link>

            <button
              type="button"
              onClick={() => fetchInventory(true)}
              disabled={refreshing || loading}
              className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white/60 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />

              Refresh
            </button>

            <Link
              href="/agent"
              className="flex h-11 items-center gap-2 rounded-xl bg-cyan-300 px-5 text-sm font-semibold text-black transition hover:bg-cyan-200"
            >
              <Bot className="h-4 w-4" />
              Add Product
            </Link>
          </div>

        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-white/35">
                Total Products
              </p>

              <Package className="h-4 w-4 text-cyan-300/60" />
            </div>

            <p className="mt-3 text-3xl font-semibold">
              {loading ? "—" : products.length}
            </p>

            <p className="mt-1 text-xs text-white/30">
              Products in your catalog
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-white/35">
                AI Processed
              </p>

              <CheckCircle2 className="h-4 w-4 text-emerald-300/60" />
            </div>

            <p className="mt-3 text-3xl font-semibold">
              {loading ? "—" : products.length}
            </p>

            <p className="mt-1 text-xs text-white/30">
              Normalized catalog records
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-white/35">
                Catalog Status
              </p>

              <Clock3 className="h-4 w-4 text-cyan-300/60" />
            </div>

            <p className="mt-3 text-xl font-semibold text-emerald-300">
              Operational
            </p>

            <p className="mt-1 text-xs text-white/30">
              Inventory service connected
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-300/15 bg-red-300/5 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />

            <div className="flex-1">
              <p className="text-sm font-medium text-red-200">
                Inventory Error
              </p>

              <p className="mt-1 text-xs leading-5 text-red-200/60">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchInventory()}
              className="text-xs font-medium text-red-200/70 transition hover:text-red-200"
            >
              Retry
            </button>
          </div>
        )}

        {/* Inventory panel */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-xl">
          {/* Toolbar */}
          <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold">
                Catalog Records
              </h2>

              <p className="mt-1 text-xs text-white/35">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? "record"
                  : "records"}{" "}
                displayed
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="h-10 w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-cyan-300/30"
              />
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-cyan-300" />

                <p className="text-sm text-white/40">
                  Loading inventory...
                </p>
              </div>
            </div>
          )}

          {/* Empty */}
          {!loading && products.length === 0 && (
            <div className="flex min-h-[380px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/10 bg-cyan-300/5">
                <Package className="h-7 w-7 text-cyan-300/70" />
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                Your inventory is empty
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-white/35">
                Use the AI Agent to normalize a supplier product
                and save it directly to your catalog.
              </p>

              <Link
                href="/agent"
                className="mt-6 flex h-11 items-center gap-2 rounded-xl bg-cyan-300 px-5 text-sm font-semibold text-black transition hover:bg-cyan-200"
              >
                <Bot className="h-4 w-4" />
                Open AI Agent
              </Link>
            </div>
          )}

          {/* Search empty */}
          {!loading &&
            products.length > 0 &&
            filteredProducts.length === 0 && (
              <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
                <Search className="h-7 w-7 text-white/20" />

                <h3 className="mt-4 text-sm font-semibold">
                  No matching products
                </h3>

                <p className="mt-2 text-xs text-white/30">
                  Try a different product name, category, or part
                  number.
                </p>
              </div>
            )}

          {/* Desktop table */}
          {!loading && filteredProducts.length > 0 && (
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="px-5 py-4 text-[10px] font-medium uppercase tracking-wider text-white/30">
                      Part Number
                    </th>

                    <th className="px-5 py-4 text-[10px] font-medium uppercase tracking-wider text-white/30">
                      Category
                    </th>

                    <th className="px-5 py-4 text-[10px] font-medium uppercase tracking-wider text-white/30">
                      Material
                    </th>

                    <th className="px-5 py-4 text-[10px] font-medium uppercase tracking-wider text-white/30">
                      Dimensions
                    </th>

                    <th className="px-5 py-4 text-[10px] font-medium uppercase tracking-wider text-white/30">
                      Added
                    </th>

                    <th className="px-5 py-4 text-right text-[10px] font-medium uppercase tracking-wider text-white/30">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="transition hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-5">
                        <div>
                          <p className="text-sm font-medium text-white/85">
                            {product.part_number}
                          </p>

                          {product.product_name && (
                            <p className="mt-1 max-w-[180px] truncate text-xs text-white/30">
                              {product.product_name}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <span className="rounded-lg border border-cyan-300/10 bg-cyan-300/5 px-2.5 py-1 text-xs text-cyan-200/70">
                          {product.category || "Uncategorized"}
                        </span>
                      </td>

                      <td className="px-5 py-5 text-sm text-white/60">
                        {product.material || "Not specified"}
                      </td>

                      <td className="px-5 py-5 text-sm text-white/60">
                        {product.dimensions || "Not specified"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 text-xs text-white/35">
                        {formatDate(product.created_at)}
                      </td>

                      <td className="px-5 py-5 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(product.id)
                          }
                          disabled={deletingId === product.id}
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-300/10 bg-red-300/5 px-3 text-xs text-red-300/70 transition hover:border-red-300/20 hover:bg-red-300/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {deletingId === product.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}

                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile cards */}
          {!loading && filteredProducts.length > 0 && (
            <div className="divide-y divide-white/5 md:hidden">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white/85">
                        {product.part_number}
                      </p>

                      {product.product_name && (
                        <p className="mt-1 text-xs text-white/30">
                          {product.product_name}
                        </p>
                      )}
                    </div>

                    <span className="rounded-lg border border-cyan-300/10 bg-cyan-300/5 px-2.5 py-1 text-[10px] text-cyan-200/70">
                      {product.category || "Uncategorized"}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/25">
                        Material
                      </p>

                      <p className="mt-1 text-xs text-white/60">
                        {product.material || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/25">
                        Dimensions
                      </p>

                      <p className="mt-1 text-xs text-white/60">
                        {product.dimensions || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/25">
                        Added
                      </p>

                      <p className="mt-1 text-xs text-white/60">
                        {formatDate(product.created_at)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(product.id)
                    }
                    disabled={deletingId === product.id}
                    className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-300/10 bg-red-300/5 text-xs font-medium text-red-300/70 transition hover:border-red-300/20 hover:bg-red-300/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {deletingId === product.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Remove Product
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom information */}
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.015] px-4 py-3">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300/60" />

          <p className="text-xs leading-5 text-white/30">
            Inventory records are associated with your authenticated
            account and retrieved directly from the ezycomersia
            backend.
          </p>
        </div>
      </section>
    </main>
  );
}