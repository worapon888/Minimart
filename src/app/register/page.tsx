"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiUser } from "react-icons/fi";
import Image from "next/image";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔐 ต้องเชื่อม backend จริงในระบบ production
    setSubmitted(true);

    setTimeout(() => {
      router.push("/login");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md sm:rounded-2xl sm:shadow-md px-6 py-12 sm:p-16 space-y-8"
      >
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Create account
          </h1>
          <p className="text-sm text-gray-500">
            Get started with your shopping journey
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          {/* Name */}
          <div className="relative">
            <label className="absolute -top-2 left-3 text-xs px-1 bg-white text-gray-500">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="John Doe"
              required
            />
            <FiUser className="absolute top-3.5 left-3 text-gray-400" />
          </div>

          {/* Email */}
          <div className="relative">
            <label className="absolute -top-2 left-3 text-xs px-1 bg-white text-gray-500">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="you@example.com"
              required
            />
            <FiMail className="absolute top-3.5 left-3 text-gray-400" />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="absolute -top-2 left-3 text-xs px-1 bg-white text-gray-500">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="••••••"
              required
            />
            <FiLock className="absolute top-3.5 left-3 text-gray-400" />
          </div>
        </div>

        {/* Google Sign-in */}
        <button
          type="button"
          onClick={() => signIn("google")}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-800 font-medium py-2 rounded-lg hover:bg-gray-100 transition"
        >
          <Image
            src="https://img.icons8.com/?size=100&id=17949&format=png&color=000000"
            alt="Google"
            width={20}
            height={20}
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:opacity-90 transition"
        >
          {submitted ? "Creating account..." : "Register"}
        </button>

        {/* Link to Login */}
        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Sign in
          </span>
        </p>
      </form>
    </div>
  );
}
