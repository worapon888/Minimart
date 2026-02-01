"use client";

import { FaTruck } from "react-icons/fa";
import { FaRegLightbulb } from "react-icons/fa";
import { PiAppWindowLight } from "react-icons/pi";

export default function WhyMinimalMart() {
  const items = [
    {
      icon: <FaRegLightbulb />,
      title: "Curated selection",
      desc: "Only what’s useful, nothing extra.",
    },
    {
      icon: <FaTruck />,
      title: "Careful delivery",
      desc: "Packed clean. Delivered on time.",
    },
    {
      icon: <PiAppWindowLight />,
      title: "Quiet design",
      desc: "Simple forms that fit any space.",
    },
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
            Why
          </p>

          <h2 className="mt-3 text-3xl sm:text-5xl font-light tracking-[-0.02em] text-neutral-900">
            MinimalMart
          </h2>

          <p className="mt-4 text-sm sm:text-base text-neutral-600 leading-relaxed">
            Fewer choices. Better ones.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {items.map((it) => (
            <div
              key={it.title}
              className="rounded-2xl border border-neutral-200 bg-white p-7 text-center
                         hover:bg-neutral-50 transition"
            >
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700">
                <span className="text-xl">{it.icon}</span>
              </div>

              <h3 className="text-[15px] font-normal tracking-[0.02em] text-neutral-900">
                {it.title}
              </h3>

              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                {it.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
