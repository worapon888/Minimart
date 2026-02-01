"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiMail, FiLock } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (res?.ok) {
      router.push("/");
    } else {
      setError("Invalid credentials. Try demo@example.com / 123456");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-14">
      <main className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="
            rounded-3xl border border-black/10
            bg-white/70 backdrop-blur-xl
            px-6 py-10 sm:px-10 sm:py-12
          "
        >
          {/* Header */}
          <header className="text-center">
            <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">
              Account
            </p>
            <h1 className="mt-3 text-2xl sm:text-3xl font-normal tracking-tight text-black/85">
              Sign in
            </h1>
            <p className="mt-3 text-sm text-black/50">
              Sign in to continue shopping.
            </p>
          </header>

          {/* Fields */}
          <div className="mt-9 space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] text-black/45 mb-2">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  className="
                    w-full rounded-2xl border border-black/10
                    bg-white/70 px-4 py-3 pl-11
                    text-[13px] text-black/75
                    outline-none transition
                    focus:ring-2 focus:ring-black/10
                  "
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] text-black/45 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="••••••"
                  required
                  className="
                    w-full rounded-2xl border border-black/10
                    bg-white/70 px-4 py-3 pl-11
                    text-[13px] text-black/75
                    outline-none transition
                    focus:ring-2 focus:ring-black/10
                  "
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-[12px] text-red-600/80 leading-relaxed">
                {error}
              </p>
            )}
          </div>

          {/* Primary */}
          <button
            type="submit"
            className="
              mt-8 w-full rounded-full
              bg-black text-white
              py-3 text-[12px] uppercase tracking-[0.22em]
              hover:bg-black/85 transition
              cursor-pointer
            "
          >
            Sign in
          </button>

          {/* Divider */}
          <div className="mt-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-black/10" />
            <span className="text-[11px] uppercase tracking-[0.24em] text-black/35">
              or
            </span>
            <div className="h-px flex-1 bg-black/10" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={() => signIn("google")}
            className="
              mt-6 w-full
              flex items-center justify-center gap-3
              rounded-full border border-black/10
              bg-white/70
              py-3
              text-[12px] uppercase tracking-[0.18em]
              text-black/70
              hover:bg-white hover:border-black/20
              transition
              cursor-pointer
            "
          >
            <Image
              src="https://img.icons8.com/color/48/000000/google-logo.png"
              alt="Google"
              width={18}
              height={18}
              className="h-[18px] w-[18px]"
            />
            Continue with Google
          </button>

          {/* Register */}
          <p className="mt-8 text-center text-sm text-black/50">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-black/75 underline underline-offset-4 hover:text-black transition"
            >
              Register
            </Link>
          </p>
        </form>

        {/* Optional tiny footer */}
        <p className="mt-6 text-center text-[12px] text-black/35">
          MinimalMart — the calm side of commerce.
        </p>
      </main>
    </div>
  );
}
