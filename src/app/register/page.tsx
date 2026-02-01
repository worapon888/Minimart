"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiUser } from "react-icons/fi";
import Image from "next/image";
import { signIn } from "next-auth/react";
import Link from "next/link";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
};

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitted) return;

    // 🔐 production: connect real backend
    setSubmitted(true);

    setTimeout(() => {
      router.push("/login");
    }, 1200);
  };

  return (
    <div className="min-h-screen  px-6 py-16 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="
          w-full max-w-md
          rounded-3xl border border-black/10
          bg-white/70 backdrop-blur-xl
          px-6 py-10 sm:px-10 sm:py-12
        "
      >
        {/* Header */}
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">
            Create account
          </p>
          <h1 className="mt-3 text-2xl sm:text-3xl font-normal tracking-tight text-black/85">
            Welcome to MinimalMart
          </h1>
          <p className="mt-2 text-sm text-black/55">
            Keep it simple — start your shopping journey.
          </p>
        </div>

        {/* Fields */}
        <div className="mt-8 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-black/45">
              Name
            </label>
            <div className="mt-2 relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="John Doe"
                required
                className="
                  w-full rounded-2xl
                  border border-black/10 bg-white/70
                  px-11 py-3 text-sm text-black/80
                  placeholder:text-black/35
                  outline-none
                  focus:border-black/25 focus:ring-2 focus:ring-black/10
                  transition
                "
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-black/45">
              Email
            </label>
            <div className="mt-2 relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="you@example.com"
                required
                className="
                  w-full rounded-2xl
                  border border-black/10 bg-white/70
                  px-11 py-3 text-sm text-black/80
                  placeholder:text-black/35
                  outline-none
                  focus:border-black/25 focus:ring-2 focus:ring-black/10
                  transition
                "
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-black/45">
              Password
            </label>
            <div className="mt-2 relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
                placeholder="••••••••"
                required
                className="
                  w-full rounded-2xl
                  border border-black/10 bg-white/70
                  px-11 py-3 text-sm text-black/80
                  placeholder:text-black/35
                  outline-none
                  focus:border-black/25 focus:ring-2 focus:ring-black/10
                  transition
                "
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-7 flex items-center gap-4">
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
            w-full inline-flex items-center justify-center gap-3
            rounded-full border border-black/10 bg-white/60
            py-3 text-[12px] uppercase tracking-[0.22em]
            text-black/70
            hover:bg-white hover:text-black/80
            transition
          "
        >
          <Image
            src="https://img.icons8.com/?size=100&id=17949&format=png&color=000000"
            alt="Google"
            width={18}
            height={18}
            className="opacity-70"
          />
          Continue with Google
        </button>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitted}
          className={`
            mt-4 w-full rounded-full
            bg-black text-white
            py-3 text-[12px] uppercase tracking-[0.22em]
            hover:bg-black/85 transition
            ${submitted ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          {submitted ? "Creating account..." : "Register"}
        </button>

        {/* Footer link */}
        <p className="mt-6 text-center text-sm text-black/55">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-black/75 hover:text-black underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
