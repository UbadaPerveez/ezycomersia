"use client";

import Link from "next/link";
import { ArrowRight, Building2, Mail, User, LockKeyhole, Zap } from "lucide-react";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const formData = new FormData(e.currentTarget);

  const full_name = formData.get("full_name") as string;
  const company = formData.get("company") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const response = await fetch(
      "https://ezycomersia-backend.onrender.com/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name,
          company,
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Registration failed. Please try again."
      );
    }

    console.log("Registration successful:", data);

    window.location.href = "/login";
  } catch (error) {
    console.error("Registration error:", error);

    alert(
      error instanceof Error
        ? error.message
        : "Something went wrong during registration."
    );
  }
};

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05060b] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute right-0 top-1/4 h-[32rem] w-[32rem] rounded-full bg-orange-500/10 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
            <Zap className="h-4 w-4 text-cyan-300" />
          </div>

          <span className="text-sm font-semibold tracking-[0.18em] text-white">
            EZY<span className="text-cyan-300">COMERSIA</span>
          </span>
        </Link>

        <Link
          href="/login"
          className="text-xs text-white/50 transition hover:text-white"
        >
          Already have an account?
        </Link>
      </header>

      <section className="relative z-10 flex min-h-[calc(100vh-88px)] items-center justify-center px-5 pb-10">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.035] shadow-2xl backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr]">

          {/* Left information panel */}
          <div className="hidden border-r border-white/10 p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
            <div>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.8)]" />
                Create Workspace
              </div>

              <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.045em] text-white xl:text-5xl">
                Build your intelligent
                <span className="block bg-[linear-gradient(90deg,#ffffff_0%,#bdf8ff_40%,#ffb18b_75%,#ffffff_100%)] bg-clip-text text-transparent">
                  catalog workspace.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-sm leading-7 text-white/50">
                Create your ezycomersia workspace and turn fragmented supplier
                information into structured, searchable catalog records.
              </p>
            </div>

            <div className="mt-12 grid gap-3">
              <Feature
                icon={<User className="h-4 w-4" />}
                title="Personal workspace"
                text="A dedicated workspace for your catalog operations."
              />

              <Feature
                icon={<Building2 className="h-4 w-4" />}
                title="Business-ready"
                text="Organize your supplier and product workflows in one place."
              />

              <Feature
                icon={<Zap className="h-4 w-4" />}
                title="Local AI processing"
                text="Your existing local AI architecture stays at the core."
              />
            </div>
          </div>

          {/* Registration form */}
          <div className="p-6 sm:p-10 xl:p-14">
            <div className="mx-auto max-w-md">
              <div className="mb-8">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
                  New Workspace
                </p>

                <h2 className="text-3xl font-semibold tracking-tight">
                  Create an account
                </h2>

                <p className="mt-2 text-sm text-white/45">
                  Enter your details to create your ezycomersia workspace.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Full name */}
                <div>
                  <label
                    htmlFor="full_name"
                    className="mb-2 block text-xs font-medium text-white/70"
                  >
                    Full name
                  </label>

                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

                    <input
                      id="full_name"
                      name="full_name"
                      type="text"
                      autoComplete="name"
                      placeholder="Your full name"
                      required
                      className="h-12 w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-cyan-300/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-cyan-300/10"
                    />
                  </div>
                </div>

                {/* Company */}
                <div>
                  <label
                    htmlFor="company"
                    className="mb-2 block text-xs font-medium text-white/70"
                  >
                    Company
                  </label>

                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

                    <input
                      id="company"
                      name="company"
                      type="text"
                      autoComplete="organization"
                      placeholder="Company name"
                      required
                      className="h-12 w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-cyan-300/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-cyan-300/10"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-medium text-white/70"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      required
                      className="h-12 w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-cyan-300/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-cyan-300/10"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-xs font-medium text-white/70"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Create a password"
                      required
                      className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-11 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-cyan-300/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-cyan-300/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-wider text-white/35 transition hover:text-white/70"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="group relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-300 via-sky-300 to-orange-300 font-semibold text-[#061017] transition duration-300 hover:scale-[1.01] hover:shadow-[0_0_35px_rgba(103,232,249,0.18)]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
                    Create account
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              </form>

              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                  Already registered?
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <Link
                href="/login"
                className="flex h-12 w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] text-sm font-medium text-white/75 transition hover:border-cyan-300/30 hover:bg-white/[0.05] hover:text-white"
              >
                Sign in instead
              </Link>

              <p className="mt-6 text-center text-[10px] leading-5 text-white/25">
                Authentication connects to your FastAPI + SQLite backend.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-white/[0.05]">
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-200">
          {icon}
        </div>

        <div>
          <h3 className="text-xs font-semibold text-white/85">{title}</h3>
          <p className="mt-1 text-[11px] leading-5 text-white/35">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}