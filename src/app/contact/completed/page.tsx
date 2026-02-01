"use client";

import Link from "next/link";

export default function ContactCompletedPage() {
  return (
    <section className="px-6 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-xl text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-black/45">
          Message sent
        </p>

        <div className="mt-8 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-black/15 bg-white/70 text-black/70">
            ✓
          </div>
        </div>

        <h1 className="mt-6 text-3xl sm:text-4xl font-light tracking-tight text-black">
          Thank you
        </h1>

        <p className="mt-4 text-base sm:text-lg leading-relaxed text-black/60">
          We’ve received your message and will get back to you as soon as
          possible.
        </p>

        <div className="my-10 h-px w-full bg-black/10" />

        <Link
          href="/"
          className="
            inline-flex items-center justify-center
            rounded-full border border-black/20
            bg-white/70 px-6 py-3
            text-[12px] uppercase tracking-[0.24em]
            text-black/70
            transition
            hover:bg-white hover:text-black
          "
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
