"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Check,
  ChevronDown,
  Cpu,
  Database,
  FileText,
  Factory,
  Layers3,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";

const pipeline = [
  { icon: FileText, label: "RAW DATA", detail: "PDFs · Listings · Specs" },
  { icon: Cpu, label: "LOCAL AI", detail: "Ollama · Llama 3.2" },
  { icon: Layers3, label: "NORMALIZE", detail: "Attributes · Standards" },
  { icon: Database, label: "CATALOG", detail: "Search-ready records" },
];

const capabilities = [
  {
    icon: UploadCloud,
    kicker: "01",
    title: "Ingest the chaos",
    text: "Bring manufacturer listings, technical text and supplier documents into one controlled processing flow.",
  },
  {
    icon: Sparkles,
    kicker: "02",
    title: "Let local AI structure it",
    text: "Extract meaningful product attributes and transform inconsistent descriptions into a predictable schema.",
  },
  {
    icon: Search,
    kicker: "03",
    title: "Publish cleaner records",
    text: "Turn normalized output into a foundation for inventory search, audit workflows and future commerce operations.",
  },
];

function GlowCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`group relative rounded-[24px] p-px ${className}`}>
      <div className="absolute inset-0 rounded-[24px] bg-[conic-gradient(from_180deg_at_50%_50%,#00e5ff22,#8b5cf644,#ff5b4d33,#00e5ff22)] opacity-0 blur-[1px] transition duration-500 group-hover:opacity-100" />
      <div className="relative h-full rounded-[23px] border border-white/10 bg-[#090d15]/85 backdrop-blur-xl transition duration-500 group-hover:border-transparent group-hover:bg-[#0a101c]/90">
        {children}
      </div>
    </div>
  );
}

function EnergyShard() {
  return (
    <div className="relative mx-auto aspect-[0.72] w-[min(82vw,460px)] overflow-visible">
      <div className="absolute inset-[12%_18%_10%] rounded-full bg-[radial-gradient(circle,rgba(255,166,76,.22),rgba(255,67,42,.12)_35%,rgba(21,137,255,.08)_62%,transparent_72%)] blur-3xl" />

      <div className="absolute left-1/2 top-1/2 h-[92%] w-[54%] -translate-x-1/2 -translate-y-1/2 rotate-[9deg] bg-[linear-gradient(150deg,#d6f7ff_0%,#ff7f55_18%,#ff3030_38%,#ffb25e_54%,#ff4438_68%,#dceeff_100%)] shadow-[0_0_60px_rgba(255,92,58,.26)] [clip-path:polygon(22%_0,77%_0,62%_37%,90%_37%,44%_100%,52%_58%,12%_58%)]" />
      <div className="absolute left-1/2 top-1/2 h-[88%] w-[49%] -translate-x-1/2 -translate-y-1/2 rotate-[9deg] bg-[linear-gradient(145deg,#0d1322_3%,#ff532f_18%,#ff9b48_40%,#0d1322_60%,#ff5d43_79%,#0a1020_95%)] opacity-90 [clip-path:polygon(22%_0,77%_0,62%_37%,90%_37%,44%_100%,52%_58%,12%_58%)]" />

      <div className="absolute left-1/2 top-1/2 h-[81%] w-[42%] -translate-x-1/2 -translate-y-1/2 rotate-[9deg] bg-[radial-gradient(circle_at_55%_28%,rgba(255,255,255,.82),transparent_6%),linear-gradient(160deg,#ffedcf,#fff4d8_28%,#fff 46%,#ffb365 62%,#ff4632 86%)] blur-[2px] opacity-90 [clip-path:polygon(24%_0,75%_0,61%_38%,87%_38%,44%_100%,51%_58%,14%_58%)]" />

      <div className="absolute inset-[18%_16%_15%] rounded-[999px] border border-white/10 opacity-80 [mask-image:radial-gradient(circle,black_0%,transparent_68%)]" />

      <div className="absolute left-[22%] top-[22%] h-1.5 w-1.5 animate-ping rounded-full bg-white shadow-[0_0_22px_8px_rgba(255,210,170,.5)]" />
      <div className="absolute right-[20%] top-[40%] h-1 w-1 rounded-full bg-cyan-200 shadow-[0_0_22px_8px_rgba(34,211,238,.35)]" />
      <div className="absolute bottom-[24%] left-[32%] h-1 w-1 rounded-full bg-amber-100 shadow-[0_0_25px_10px_rgba(255,157,85,.36)]" />

      <div className="absolute left-1/2 top-[9%] -translate-x-1/2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[9px] font-semibold tracking-[0.25em] text-slate-300 backdrop-blur-md">
        LOCAL AI CORE
      </div>
      <div className="absolute bottom-[7%] left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-[#07101a]/80 px-4 py-2 text-[10px] font-mono tracking-[0.14em] text-cyan-200 shadow-2xl backdrop-blur-md">
        NORMALIZE → SEARCH → SCALE
      </div>
    </div>
  );
}

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [pointer, setPointer] = useState({ x: 50, y: 50 });

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#03050a] text-white selection:bg-cyan-300/20">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-24 top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-red-500/[0.08] blur-[130px]" />
        <div className="absolute right-[-10rem] top-[8rem] h-[32rem] w-[32rem] rounded-full bg-cyan-400/[0.07] blur-[140px]" />
        <div className="absolute left-1/3 top-[40%] h-[24rem] w-[24rem] rounded-full bg-violet-500/[0.05] blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_bottom,black_0%,black_55%,transparent_100%)]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:radial-gradient(circle_at_20%_20%,white_0.7px,transparent_0.8px)] [background-size:10px_10px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#03050a]/72 backdrop-blur-2xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-7 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] shadow-[0_0_30px_rgba(0,229,255,.06)] transition duration-300 group-hover:border-cyan-300/30">
              <Boxes className="h-5 w-5 text-slate-100" />
              <span className="absolute inset-0 rounded-xl bg-cyan-300/10 opacity-0 blur-xl transition group-hover:opacity-100" />
            </div>
            <div>
              <div className="text-[14px] font-semibold tracking-[0.31em] text-white">EZYCOMERSIA</div>
              <div className="mt-0.5 text-[8px] font-medium tracking-[0.34em] text-slate-500">INTELLIGENT CATALOG ENGINE</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-[13px] text-slate-400 lg:flex">
            <a href="#problem" className="transition hover:text-white">The problem</a>
            <a href="#pipeline" className="transition hover:text-white">How it works</a>
            <a href="#capabilities" className="transition hover:text-white">Capabilities</a>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link href="/login" className="rounded-xl px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.04] hover:text-white">Sign in</Link>
            <Link href="/login" className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-cyan-300/10">
              Open platform
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <button type="button" aria-label="Toggle menu" onClick={() => setMobileOpen((v) => !v)} className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-slate-200 md:hidden">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/[0.07] bg-[#03050a]/95 px-5 py-5 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-4 text-sm text-slate-300">
              <a href="#problem" onClick={() => setMobileOpen(false)}>The problem</a>
              <a href="#pipeline" onClick={() => setMobileOpen(false)}>How it works</a>
              <a href="#capabilities" onClick={() => setMobileOpen(false)}>Capabilities</a>
              <Link href="/login" className="mt-2 rounded-xl bg-white px-4 py-3 text-center font-semibold text-slate-950">Open platform</Link>
            </div>
          </div>
        )}
      </header>

      <section
        className="relative z-10"
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setPointer({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 });
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-90 [background:radial-gradient(500px_circle_at_var(--mx)_var(--my),rgba(0,229,255,.075),transparent_65%)]" style={{ "--mx": `${pointer.x}%`, "--my": `${pointer.y}%` } as React.CSSProperties} />

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-16 sm:px-7 lg:grid-cols-[1.02fr_.98fr] lg:gap-4 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.045] px-3.5 py-2 text-[9px] font-semibold tracking-[0.23em] text-cyan-100 shadow-[inset_0_0_24px_rgba(34,211,238,.03)]">
              <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300/70" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-200" /></span>
              LOCAL-FIRST AI INFRASTRUCTURE
            </div>

            <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-[0.95] tracking-[-0.055em] text-white sm:text-6xl lg:text-[74px]">
              Chaos in.
              <br />
              <span className="bg-[linear-gradient(90deg,#ffffff_0%,#bdf8ff_36%,#ffb18b_68%,#ffffff_100%)] bg-clip-text text-transparent">Intelligence out.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-[15px] leading-7 text-slate-400 sm:text-[17px]">
              ezycomersia converts messy supplier listings, technical attributes and document-heavy manufacturer data into structured, search-ready catalog records — powered by a local AI engine.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-slate-950 shadow-[0_16px_50px_rgba(255,255,255,.08)] transition hover:-translate-y-0.5">
                <span className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-cyan-300/60 blur-md transition-transform duration-700 group-hover:translate-x-[420%]" />
                Enter ezycomersia
                <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a href="#pipeline" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-cyan-300/[0.045]">
                Explore the pipeline
                <ChevronDown className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-8 grid max-w-xl grid-cols-3 border-y border-white/[0.07] py-5">
              {["LOCAL PROCESSING", "STRUCTURED OUTPUT", "BUILT TO SCALE"].map((item) => (
                <div key={item} className="border-r border-white/[0.07] px-3 first:pl-0 last:border-0 sm:px-5">
                  <Check className="h-3.5 w-3.5 text-cyan-200" />
                  <div className="mt-2 text-[9px] font-semibold tracking-[0.17em] text-slate-500">{item}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[560px] lg:min-h-[650px]">
            <div className="absolute inset-x-[-10%] top-[8%] h-[78%] bg-[radial-gradient(ellipse_at_center,rgba(255,105,58,.16),transparent_54%)] blur-3xl" />
            <EnergyShard />

            <GlowCard className="absolute bottom-3 left-1/2 w-[86%] -translate-x-1/2 sm:w-[390px]">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-9 w-9 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.05]"><Factory className="h-4 w-4 text-cyan-200" /></div>
                    <div>
                      <div className="text-xs font-semibold text-white">Catalog Intelligence</div>
                      <div className="text-[9px] text-slate-500">Live normalization pipeline</div>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.06] px-2 py-1 text-[8px] font-bold tracking-[0.16em] text-emerald-200">READY</span>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2">
                  {pipeline.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5 text-center">
                        <Icon className="mx-auto h-3.5 w-3.5 text-slate-300" />
                        <div className="mt-2 text-[7px] font-semibold tracking-[0.13em] text-slate-500">0{index + 1}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </GlowCard>
          </div>
        </div>
      </section>

      <section id="problem" className="relative z-10 border-y border-white/[0.07] bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-7 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <div className="text-[9px] font-bold tracking-[0.28em] text-cyan-200">THE OPERATIONS GAP</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">Manual catalog cleanup breaks under volume.</h2>
            <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">Supplier information is rarely delivered in the clean, uniform shape that modern commerce systems expect.</p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { icon: FileText, title: "Chaotic listings", text: "Naming, units, sizing and technical descriptions vary from one supplier to the next." },
              { icon: ShieldCheck, title: "High entry risk", text: "Manual transcription creates avoidable inconsistency and makes quality control expensive." },
              { icon: Zap, title: "Slow to scale", text: "More SKUs mean more cleanup work unless the process is automated from the start." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <GlowCard key={item.title}>
                  <div className="p-6">
                    <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.035]"><Icon className="h-5 w-5 text-slate-200" /></div>
                    <h3 className="mt-5 text-base font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
                  </div>
                </GlowCard>
              );
            })}
          </div>
        </div>
      </section>

      <section id="pipeline" className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-7 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
          <div>
            <div className="text-[9px] font-bold tracking-[0.28em] text-cyan-200">THE ezycomersia PIPELINE</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">One workflow from raw source to structured inventory.</h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">The product surface is simple. Underneath it, the architecture turns unstructured manufacturer information into predictable data objects that can be searched, reviewed and moved downstream.</p>
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-4">
          {pipeline.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="group relative rounded-[22px] p-px">
                <div className="absolute inset-0 rounded-[22px] bg-[conic-gradient(from_210deg,#00e5ff00,#7c3aed55,#ff6b4a55,#00e5ff00)] opacity-0 blur-sm transition duration-500 group-hover:opacity-100" />
                <div className="relative h-full rounded-[21px] border border-white/[0.08] bg-[#090d15]/85 p-5 backdrop-blur-xl transition duration-500 group-hover:-translate-y-1 group-hover:border-white/5">
                  <div className="flex items-center justify-between"><span className="font-mono text-[9px] text-slate-600">0{index + 1}</span><ArrowUpRight className="h-4 w-4 text-slate-600 transition group-hover:text-cyan-200" /></div>
                  <div className="mt-10 grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.035] transition group-hover:border-cyan-300/25 group-hover:bg-cyan-300/[0.06]"><Icon className="h-5 w-5 text-slate-200" /></div>
                  <div className="mt-6 text-[10px] font-bold tracking-[0.18em] text-slate-200">{item.label}</div>
                  <div className="mt-2 text-xs text-slate-500">{item.detail}</div>
                </div>
                {index < pipeline.length - 1 && <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-cyan-300/40 md:block" />}
              </div>
            );
          })}
        </div>
      </section>

      <section id="capabilities" className="relative z-10 border-y border-white/[0.07] bg-white/[0.012]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-7 lg:px-8 lg:py-24">
          <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
            <div>
              <div className="text-[9px] font-bold tracking-[0.28em] text-cyan-200">CORE CAPABILITIES</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">Built for the way catalog teams actually work.</h2>
            </div>
            <Link href="/login" className="group inline-flex items-center gap-2 text-sm font-semibold text-cyan-100 transition hover:text-white">Open workspace <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {capabilities.map((item, index) => {
              const Icon = item.icon;
              return (
                <button key={item.title} type="button" onMouseEnter={() => setActiveCard(index)} onMouseLeave={() => setActiveCard(null)} className="text-left">
                  <GlowCard>
                    <div className="relative min-h-[250px] overflow-hidden p-6">
                      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition duration-500 ${activeCard === index ? "bg-cyan-400/15" : "bg-transparent"}`} />
                      <div className="flex items-center justify-between">
                        <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.035]"><Icon className="h-5 w-5 text-slate-200" /></div>
                        <span className="font-mono text-[9px] text-slate-600">{item.kicker}</span>
                      </div>
                      <h3 className="mt-8 text-lg font-semibold text-white">{item.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-500">{item.text}</p>
                      <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between border-t border-white/[0.07] pt-4 text-[9px] font-semibold tracking-[0.15em] text-slate-600 transition group-hover:text-cyan-200"><span>VIEW CAPABILITY</span><ArrowUpRight className="h-3.5 w-3.5" /></div>
                    </div>
                  </GlowCard>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-7 lg:px-8 lg:py-20">
        <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,.05),rgba(0,229,255,.025),rgba(255,90,60,.03))] p-7 shadow-2xl sm:p-10 lg:p-12">
          <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-orange-400/[0.06] blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="text-[9px] font-bold tracking-[0.28em] text-cyan-200">READY FOR THE NEXT LAYER</div>
              <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">From product introduction to an intelligent operating workspace.</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">Sign in to reach the dashboard, AI agent, inventory records and audit workflow built around the same local processing core.</p>
            </div>
            <Link href="/login" className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5">
              Launch workspace
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.07] px-5 py-8 sm:px-7 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-[10px] tracking-[0.08em] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} EZYCOMERSIA</span>
          <span>LOCAL AI · STRUCTURED DATA · INTELLIGENT CATALOG OPERATIONS</span>
        </div>
      </footer>
    </main>
  );
}
