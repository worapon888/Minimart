"use client";

import { FaTruck, FaRegLightbulb } from "react-icons/fa";
import { PiAppWindowLight } from "react-icons/pi"; // ใช้เป็นไอคอนดีไซน์ใกล้เคียง aesthetic

export default function WhyMinimalMart() {
  return (
    <section className="py-20 px-6 text-center ">
      <h2 className="text-4xl sm:text-7xl font-bold text-gray-800 mb-16">
        <span className="bg-gradient-to-b from-black to-gray-400 bg-clip-text text-transparent">
          Why MinimalMart
        </span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 max-w-6xl mx-auto">
        {/* Feature 1 */}
        <div className="space-y-2">
          <FaRegLightbulb className="mx-auto text-6xl text-gray-700" />
          <h3 className="text-2xl font-medium">Curated with intention</h3>
          <p className="font-normal text-lg">→ Every piece serves a purpose.</p>
        </div>

        {/* Feature 2 */}
        <div className="space-y-2">
          <FaTruck className="mx-auto text-6xl text-gray-700" />
          <h3 className="text-2xl font-medium">Mindful delivery</h3>
          <p className="font-normal text-lg">→ Quick, clean, caring.</p>
        </div>

        {/* Feature 3 */}
        <div className="space-y-2">
          <PiAppWindowLight className="mx-auto text-6xl" />
          <h3 className="text-2xl font-medium">Timeless aesthetics</h3>
          <p className="font-normal text-lg">
            &quot;Simple, elegant, nd never out of style.&quot;
          </p>
        </div>
      </div>
    </section>
  );
}
