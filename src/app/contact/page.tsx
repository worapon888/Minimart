"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: connect to backend or email service
    router.push("/contact/completed");
  };

  return (
    <section className="max-w-3xl mx-auto px-6 py-16 space-y-10">
      <div className="text-center">
        <h2 className="text-4xl font-semibold mb-2">Contact Us</h2>
        <p className="text-gray-600">
          Have questions or feedback? We&apos;d love to hear from you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 bg-white rounded-xl focus:ring-black"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 bg-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            rows={5}
            className="w-full border border-gray-300 bg-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <button
          type="submit"
          className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition"
        >
          Send Message
        </button>
      </form>

      <div className="text-center pt-10 text-gray-500 text-sm">
        Or email us at{" "}
        <a
          href="mailto:contact@minimalmart.com"
          className="underline hover:text-black"
        >
          contact@minimalmart.com
        </a>
      </div>
    </section>
  );
}
