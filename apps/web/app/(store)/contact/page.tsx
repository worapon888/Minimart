"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/contact/completed");
  };

  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-3xl">
        {/* Header */}
        <header className="text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-black/45">
            Contact
          </p>

          <h1 className="mt-3 text-3xl sm:text-4xl font-light tracking-tight text-black">
            Get in touch
          </h1>

          <p className="mt-4 text-base sm:text-lg leading-relaxed text-black/60">
            Have questions or feedback? We’d love to hear from you.
          </p>
        </header>

        {/* Divider */}
        <div className="my-12 h-px w-full bg-black/10" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.24em] text-black/50">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="
                  w-full rounded-xl border border-black/15
                  bg-white/70 px-4 py-3
                  text-sm text-black/80
                  outline-none
                  transition
                  focus:border-black/40
                "
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.24em] text-black/50">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="
                  w-full rounded-xl border border-black/15
                  bg-white/70 px-4 py-3
                  text-sm text-black/80
                  outline-none
                  transition
                  focus:border-black/40
                "
              />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-[0.24em] text-black/50">
              Message
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              className="
                w-full rounded-2xl border border-black/15
                bg-white/70 px-4 py-3
                text-sm text-black/80
                outline-none
                transition
                focus:border-black/40
                resize-none
              "
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="
              w-full rounded-full border border-black/20
              bg-white/70 py-3
              text-[12px] uppercase tracking-[0.24em]
              text-black/70
              transition
              hover:bg-white hover:text-black
            "
          >
            Send message
          </button>
        </form>

        {/* Footer note */}
        <div className="mt-12 text-center text-sm text-black/45">
          Or email us at{" "}
          <a
            href="mailto:contact@minimalmart.com"
            className="underline underline-offset-4 hover:text-black"
          >
            contact@minimalmart.com
          </a>
        </div>

        {/* Bottom line */}
        <div className="mt-12 h-px w-full bg-black/10" />
      </div>
    </section>
  );
}
