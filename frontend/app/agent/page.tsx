"use client";

import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Package,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useRef, useState } from "react";

type AgentResponse = {
  agent_message: string;
  widget_type: "TEXT_MESSAGE" | "AUDIT_GRID" | "NORMALIZATION_CARD";
  widget_data: {
    product_name?: string;
    brand?: string;
    model?: string;
    manufacturer?: string;
    category?: string;
    part_number?: string;
    material?: string;
    dimensions?: string;
    [key: string]: unknown;
  };
};

/* =========================================================
   HELPER: FLATTENS STRINGS, OBJECTS, OR ARRAYS SAFELY FOR REACT
========================================================= */
function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return value.map((v) => formatValue(v)).filter(Boolean).join(", ");
    }
    // Formats { length: "4755 mm", width: "1850 mm" } -> "Length: 4755 mm; Width: 1850 mm"
    return Object.entries(value as Record<string, unknown>)
      .map(
        ([k, v]) =>
          `${k.charAt(0).toUpperCase() + k.slice(1)}: ${formatValue(v)}`
      )
      .join("; ");
  }
  return String(value);
}

function ProcessingAnimation() {
  const orbitItems = [
    { icon: "✦", label: "Analyze", position: "top" },
    { icon: "◇", label: "Normalize", position: "rightTop" },
    { icon: "▣", label: "Structure", position: "rightBottom" },
    { icon: "✓", label: "Validate", position: "bottom" },
    { icon: "◆", label: "Categorize", position: "leftBottom" },
    { icon: "⚙", label: "Process", position: "leftTop" },
  ];

  return (
    <div className="processing-panel">
      <div className="processing-content">
        {/* LEFT — AI ORBIT */}
        <div className="ai-orbit-area">
          <div className="orbit-glow"></div>

          {/* Rotating orbit */}
          <div className="orbit-system">
            <div className="orbit-ring ring-one"></div>
            <div className="orbit-ring ring-two"></div>
            <div className="orbit-ring ring-three"></div>

            <div className="orbit-rotator">
              {orbitItems.map((item) => (
                <div
                  key={item.label}
                  className={`orbit-item ${item.position}`}
                >
                  <div className="orbit-icon">{item.icon}</div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            {/* CENTER ROBOT */}
            <div className="ai-robot">
              <div className="robot-aura"></div>
              <div className="robot-head">
                <div className="robot-eye"></div>
                <div className="robot-eye"></div>
                <div className="robot-smile"></div>
              </div>
              <div className="robot-body">
                <div className="robot-star">✦</div>
              </div>
              <div className="robot-ear left"></div>
              <div className="robot-ear right"></div>
            </div>
          </div>

          <h2 className="processing-title">
            AI is analyzing your product
            <span className="processing-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </h2>

          <p className="processing-subtitle">
            Understanding, normalizing and structuring your product information...
          </p>
        </div>

        {/* RIGHT — PROCESS STEPS */}
        <div className="processing-steps">
          <div className="processing-step active">
            <div className="step-circle">✓</div>
            <div>
              <h3>Analyzing product details</h3>
              <p>Understanding the product information...</p>
            </div>
          </div>

          <div className="step-line"></div>

          <div className="processing-step active">
            <div className="step-circle pulse">◆</div>
            <div>
              <h3>Extracting key attributes</h3>
              <p>Identifying brand, model, and specifications...</p>
            </div>
          </div>

          <div className="step-line"></div>

          <div className="processing-step">
            <div className="step-circle pending">◇</div>
            <div>
              <h3>Normalizing catalog data</h3>
              <p>Converting information into standard format...</p>
            </div>
          </div>

          <div className="step-line"></div>

          <div className="processing-step">
            <div className="step-circle pending">✓</div>
            <div>
              <h3>Validating information</h3>
              <p>Checking completeness and consistency...</p>
            </div>
          </div>

          <div className="step-line"></div>

          <div className="processing-step">
            <div className="step-circle pending">✦</div>
            <div>
              <h3>Preparing final result</h3>
              <p>Almost ready...</p>
            </div>
          </div>
        </div>
      </div>

      <div className="processing-notice">
        <span>◷</span>
        AI processing is running locally. Please wait while your product is analyzed.
      </div>

      <style jsx>{`
        .processing-panel {
          margin-top: 24px;
          padding: 42px 38px 28px;
          border: 1px solid rgba(0, 220, 255, 0.2);
          border-radius: 18px;
          background: radial-gradient(
              circle at 25% 45%,
              rgba(0, 220, 255, 0.08),
              transparent 35%
            ),
            linear-gradient(
              135deg,
              rgba(4, 25, 48, 0.95),
              rgba(2, 14, 30, 0.98)
            );
          box-shadow: 0 0 60px rgba(0, 200, 255, 0.05),
            inset 0 0 40px rgba(0, 200, 255, 0.02);
          overflow: hidden;
        }

        .processing-content {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 45px;
          align-items: center;
        }

        .ai-orbit-area {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .orbit-system {
          position: relative;
          width: 390px;
          height: 390px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .orbit-ring {
          position: absolute;
          border: 1px solid rgba(0, 210, 255, 0.25);
          border-radius: 50%;
          pointer-events: none;
        }

        .ring-one {
          width: 220px;
          height: 220px;
        }

        .ring-two {
          width: 290px;
          height: 290px;
        }

        .ring-three {
          width: 355px;
          height: 355px;
          border-color: rgba(0, 210, 255, 0.12);
        }

        .orbit-rotator {
          position: absolute;
          inset: 0;
          animation: rotateOrbit 14s linear infinite;
        }

        .orbit-item {
          position: absolute;
          width: 74px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          animation: counterRotate 14s linear infinite;
        }

        .orbit-icon {
          width: 58px;
          height: 58px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 25px;
          color: #00e5ff;
          background: rgba(0, 180, 255, 0.1);
          border: 1px solid rgba(0, 220, 255, 0.35);
          box-shadow: 0 0 20px rgba(0, 220, 255, 0.15),
            inset 0 0 15px rgba(0, 220, 255, 0.05);
        }

        .orbit-item span {
          font-size: 12px;
          color: #9bd9eb;
          font-weight: 600;
          white-space: nowrap;
        }

        .top {
          top: 0;
          left: 50%;
          transform: translateX(-50%);
        }

        .rightTop {
          top: 55px;
          right: 5px;
        }

        .rightBottom {
          bottom: 55px;
          right: 5px;
        }

        .bottom {
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
        }

        .leftBottom {
          bottom: 55px;
          left: 5px;
        }

        .leftTop {
          top: 55px;
          left: 5px;
        }

        .ai-robot {
          position: relative;
          z-index: 10;
          width: 145px;
          height: 170px;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: robotFloat 2.5s ease-in-out infinite;
          filter: drop-shadow(0 0 30px rgba(0, 220, 255, 0.35));
        }

        .robot-aura {
          position: absolute;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(0, 220, 255, 0.18),
            transparent 65%
          );
          animation: auraPulse 2s ease-in-out infinite;
        }

        .robot-head {
          position: relative;
          z-index: 2;
          width: 105px;
          height: 78px;
          border-radius: 35px;
          background: linear-gradient(145deg, #dffcff, #6edff5);
          border: 4px solid #00d9ff;
          box-shadow: 0 0 25px rgba(0, 225, 255, 0.65),
            inset 0 -10px 20px rgba(0, 120, 170, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .robot-eye {
          width: 11px;
          height: 17px;
          border-radius: 50%;
          background: #00364d;
          box-shadow: 0 0 8px #00e5ff;
          animation: blink 4s infinite;
        }

        .robot-smile {
          position: absolute;
          bottom: 17px;
          width: 27px;
          height: 12px;
          border-bottom: 3px solid #00364d;
          border-radius: 0 0 20px 20px;
        }

        .robot-body {
          position: relative;
          z-index: 1;
          margin-top: -3px;
          width: 88px;
          height: 75px;
          border-radius: 20px 20px 30px 30px;
          background: linear-gradient(145deg, #8beafa, #159bc4);
          border: 3px solid #00d9ff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 25px rgba(0, 210, 255, 0.4);
        }

        .robot-star {
          width: 35px;
          height: 35px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.75);
          color: #00bde8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          animation: starPulse 1.5s ease-in-out infinite;
        }

        .robot-ear {
          position: absolute;
          top: 34px;
          width: 16px;
          height: 30px;
          border-radius: 10px;
          background: #36cde9;
          border: 2px solid #00d9ff;
        }

        .robot-ear.left {
          left: 13px;
        }

        .robot-ear.right {
          right: 13px;
        }

        .processing-title {
          margin-top: 5px;
          color: white;
          font-size: 21px;
          font-weight: 700;
          text-align: center;
        }

        .processing-dots span {
          animation: dotBlink 1.4s infinite;
        }

        .processing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .processing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        .processing-subtitle {
          margin-top: 8px;
          max-width: 430px;
          text-align: center;
          color: #80b8c9;
          font-size: 13px;
          line-height: 1.6;
        }

        .processing-steps {
          padding: 15px 10px;
        }

        .processing-step {
          display: flex;
          align-items: center;
          gap: 17px;
        }

        .step-circle {
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00e5ff;
          border: 2px solid #00cfff;
          background: rgba(0, 190, 255, 0.1);
          box-shadow: 0 0 18px rgba(0, 210, 255, 0.18);
        }

        .step-circle.pending {
          color: #426577;
          border-color: #254456;
          box-shadow: none;
        }

        .step-circle.pulse {
          animation: stepPulse 1.3s infinite;
        }

        .processing-step h3 {
          margin: 0;
          color: #e6faff;
          font-size: 14px;
          font-weight: 600;
        }

        .processing-step p {
          margin: 4px 0 0;
          color: #6798aa;
          font-size: 12px;
        }

        .step-line {
          width: 2px;
          height: 27px;
          margin: 3px 0 3px 20px;
          background: linear-gradient(
            to bottom,
            rgba(0, 210, 255, 0.5),
            rgba(0, 210, 255, 0.08)
          );
        }

        .processing-notice {
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid rgba(0, 210, 255, 0.1);
          text-align: center;
          color: #5f9caf;
          font-size: 12px;
        }

        .processing-notice span {
          color: #00e5ff;
          margin-right: 7px;
        }

        @keyframes rotateOrbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes counterRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes robotFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes auraPulse {
          0%,
          100% {
            transform: scale(0.9);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.15);
            opacity: 1;
          }
        }

        @keyframes starPulse {
          0%,
          100% {
            transform: scale(0.8);
            opacity: 0.65;
          }
          50% {
            transform: scale(1.15);
            opacity: 1;
          }
        }

        @keyframes stepPulse {
          0%,
          100% {
            box-shadow: 0 0 5px rgba(0, 220, 255, 0.1);
          }
          50% {
            box-shadow: 0 0 25px rgba(0, 220, 255, 0.65);
          }
        }

        @keyframes blink {
          0%,
          45%,
          50%,
          100% {
            transform: scaleY(1);
          }
          47% {
            transform: scaleY(0.1);
          }
        }

        @keyframes dotBlink {
          0%,
          60%,
          100% {
            opacity: 0.2;
          }
          30% {
            opacity: 1;
          }
        }

        @media (max-width: 900px) {
          .processing-content {
            grid-template-columns: 1fr;
          }

          .orbit-system {
            width: 340px;
            height: 340px;
            transform: scale(0.9);
          }

          .processing-steps {
            width: 100%;
          }
        }

        @media (max-width: 500px) {
          .processing-panel {
            padding: 25px 10px;
          }

          .orbit-system {
            transform: scale(0.72);
            margin: -35px 0;
          }
        }
      `}</style>
    </div>
  );
}

export default function AgentPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Refs for smooth automated scrolling
  const processingRef = useRef<HTMLDivElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError("Please enter product information first.");
      return;
    }

    setLoading(true);
    setError("");
    setResponse(null);

    // Smoothly scroll down so the floating robot animation comes into full view
    setTimeout(() => {
      processingRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 80);

    try {
      const accessToken = localStorage.getItem("access_token");

      const res = await fetch("https://ezycomersia-backend.onrender.com/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken
            ? {
                Authorization: `Bearer ${accessToken}`,
              }
            : {}),
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.detail || "The AI Agent could not process your request."
        );
      }

      setResponse(data);

      // Smoothly scroll down to the structured normalization card
      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
    } catch (err) {
      console.error("Agent error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while contacting the AI Agent."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    setPrompt("");
    setResponse(null);
    setError("");
  };

  return (
    <main className="min-h-screen bg-[#05070b] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-[-180px] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute right-[-100px] top-1/3 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[120px]" />
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

          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/60 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Content */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-10 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/5 px-3 py-1.5 text-xs text-cyan-200/80">
            <Bot className="h-3.5 w-3.5" />
            AI Agent Online
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Universal Catalog AI Agent
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">
            Give the agent raw supplier or product information. It will analyze
            the input and structure the information into a clean catalog-ready
            format.
          </p>
        </div>

        {/* Input area */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/5">
                <Package className="h-5 w-5 text-cyan-300" />
              </div>

              <div>
                <h2 className="font-semibold">Product Input</h2>
                <p className="text-xs text-white/35">
                  Paste raw or unstructured product information
                </p>
              </div>
            </div>

            {prompt && (
              <button
                onClick={clearResult}
                type="button"
                className="rounded-lg p-2 text-white/30 transition hover:bg-white/5 hover:text-white/70"
                title="Clear"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Toyota Innova HyCross ZX (Hybrid) 4755 mm Length x 1850 mm Width"
              rows={7}
              className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-4 text-sm leading-6 text-white outline-none placeholder:text-white/20 transition focus:border-cyan-300/30 focus:bg-black/30"
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-white/30">
                AI-powered catalog normalization
              </p>

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 text-sm font-semibold text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Analyze Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Processing Animation (With ref for smooth scroll) */}
        {loading && (
          <div ref={processingRef} className="scroll-mt-6">
            <ProcessingAnimation />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-300/15 bg-red-300/5 p-4">
            <X className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
            <div>
              <p className="text-sm font-medium text-red-200">Agent Error</p>
              <p className="mt-1 text-xs leading-5 text-red-200/60">{error}</p>
            </div>
          </div>
        )}

        {/* Result (With ref for smooth scroll) */}
        {response && (
          <div ref={resultRef} className="mt-8 scroll-mt-6">
            {/* Agent message */}
            <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/5">
                  <Bot className="h-5 w-5 text-cyan-300" />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-cyan-300/60">
                    AI Agent
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/75">
                    {response.agent_message}
                  </p>
                </div>
              </div>
            </div>

            {/* Normalization card */}
            {response.widget_type === "NORMALIZATION_CARD" && (
              <NormalizationCard
                data={response.widget_data}
                rawInput={prompt}
              />
            )}

            {/* Audit grid */}
            {response.widget_type === "AUDIT_GRID" && (
              <AuditGrid data={response.widget_data} />
            )}

            {/* Text response */}
            {response.widget_type === "TEXT_MESSAGE" && (
              <TextMessage data={response.widget_data} />
            )}
          </div>
        )}
      </section>
    </main>
  );
}

/* =========================================================
   NORMALIZATION CARD
========================================================= */

function NormalizationCard({
  data,
  rawInput,
}: {
  data: AgentResponse["widget_data"];
  rawInput: string;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const resolvedProductName =
    formatValue(data.product_name) || rawInput || "Normalized Product";

  // All fields are safely converted to formatted strings
  const fields = [
    ["Product Name", resolvedProductName],
    ["Brand", formatValue(data.brand)],
    ["Model", formatValue(data.model)],
    ["Manufacturer", formatValue(data.manufacturer)],
    ["Category", formatValue(data.category)],
    ["Part Number", formatValue(data.part_number)],
    ["Material", formatValue(data.material)],
    ["Dimensions", formatValue(data.dimensions)],
  ];

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setSaveError("");

    try {
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        throw new Error("Authentication required. Please log in again.");
      }

      // If no explicit part_number was found, assign an automatic catalog SKU
      const resolvedPartNumber =
        formatValue(data.part_number) ||
        `SKU-${Math.floor(100000 + Math.random() * 900000)}`;

      const res = await fetch("https://ezycomersia-backend.onrender.com/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          product_name: resolvedProductName,
          part_number: resolvedPartNumber,
          category: formatValue(data.category) || null,
          material: formatValue(data.material) || null,
          dimensions: formatValue(data.dimensions) || null,
          raw_input: rawInput,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.detail || "Unable to save product to inventory.");
      }

      setSaved(true);
    } catch (err) {
      console.error("Inventory save error:", err);

      setSaveError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving the product."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-cyan-300/15 bg-white/[0.025] backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-300/10">
            <CheckCircle2 className="h-5 w-5 text-cyan-300" />
          </div>

          <div>
            <h2 className="text-sm font-semibold">{resolvedProductName}</h2>
            <p className="text-xs text-white/35">
              Structured catalog information
            </p>
          </div>
        </div>

        <span className="rounded-full border border-emerald-300/15 bg-emerald-300/5 px-3 py-1 text-[10px] uppercase tracking-wider text-emerald-300">
          Processed
        </span>
      </div>

      {/* Product fields grid */}
      <div className="grid sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label} className="border-b border-white/5 p-5">
            <p className="text-[11px] uppercase tracking-wider text-white/30">
              {label}
            </p>
            <p
              className={`mt-2 text-sm font-medium ${
                value ? "text-white/90" : "text-white/40 italic"
              }`}
            >
              {value || "Not specified"}
            </p>
          </div>
        ))}
      </div>

      {/* Save section */}
      <div className="border-t border-white/10 bg-black/10 px-5 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white/75">Inventory</p>
            <p className="mt-1 text-xs text-white/35">
              Store this normalized product in your catalog.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || saved}
            className={`flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition ${
              saved
                ? "cursor-default border border-emerald-300/20 bg-emerald-300/10 text-emerald-300"
                : "bg-cyan-300 text-black hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Saved to Inventory
              </>
            ) : (
              <>
                <Package className="h-4 w-4" />
                Save to Inventory
              </>
            )}
          </button>
        </div>

        {/* Save error */}
        {saveError && (
          <div className="mt-4 rounded-xl border border-red-300/15 bg-red-300/5 px-4 py-3">
            <p className="text-xs text-red-200/80">{saveError}</p>
          </div>
        )}

        {/* Save success */}
        {saved && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-300/15 bg-emerald-300/5 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            <p className="text-xs text-emerald-200/80">
              Product successfully added to your inventory.
            </p>
            <Link
              href="/inventory"
              className="ml-auto text-xs font-semibold text-emerald-300 transition hover:text-emerald-200"
            >
              View Inventory →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   AUDIT GRID
========================================================= */

function AuditGrid({ data }: { data: AgentResponse["widget_data"] }) {
  const entries = Object.entries(data);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-300/10">
          <ClipboardCheck className="h-5 w-5 text-cyan-300" />
        </div>

        <div>
          <h2 className="text-sm font-semibold">Audit Results</h2>
          <p className="text-xs text-white/35">
            AI validation and catalog analysis
          </p>
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-xs uppercase tracking-wider text-white/35">
              {key.replace(/_/g, " ")}
            </span>

            <span className="text-sm text-white/75">
              {formatValue(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   TEXT MESSAGE
========================================================= */

function TextMessage({ data }: { data: AgentResponse["widget_data"] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Bot className="h-5 w-5 text-cyan-300" />
        <h2 className="text-sm font-semibold">AI Response</h2>
      </div>

      <pre className="mt-5 whitespace-pre-wrap text-sm leading-6 text-white/65">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}