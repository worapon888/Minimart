"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CiCircleRemove } from "react-icons/ci";
import { FaSpinner } from "react-icons/fa";
import { CartItemLike } from "@/types/product";

export default function CheckoutPage() {
  const { state, dispatch } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    tel: "",
    address: "",
    email: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    tel: "",
    address: "",
  });

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCheckout = () => {
    let hasError = false;
    const newErrors = { name: "", tel: "", address: "" };

    if (!form.name.trim()) {
      newErrors.name = "Please enter your name.";
      hasError = true;
    }
    if (!/^[0-9]{9,10}$/.test(form.tel)) {
      newErrors.tel = "Phone number must be 9–10 digits.";
      hasError = true;
    }
    if (!form.address.trim()) {
      newErrors.address = "Please enter your address.";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    setIsLoading(true);
    setTimeout(() => {
      dispatch({ type: "CLEAR_CART" });
      router.push("/order-success");
    }, 1500);
  };

  const items = (state.items as unknown as CartItemLike[]) ?? [];

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shippingCost = items.length > 0 ? 2.99 : 0;
  const total = subtotal + shippingCost;

  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      {/* Header */}
      <header className="text-center">
        <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">
          Checkout
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-normal tracking-tight text-black/85">
          Complete your order
        </h1>
        <p className="mt-3 text-sm sm:text-base text-black/50 leading-relaxed">
          Minimal details, clear summary — then you&apos;re done.
        </p>
      </header>

      <div className="mt-10 rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl">
        <div className="p-5 sm:p-8">
          {/* Empty cart */}
          {items.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-sm text-black/60">Your cart is empty.</p>
              <p className="mt-2 text-xs text-black/40">
                Add something first — then come back to checkout.
              </p>
            </div>
          ) : (
            <>
              {/* Products */}
              <div className="mb-10">
                <div className="hidden md:grid grid-cols-12 gap-4 border-b border-black/10 pb-3 text-[12px] uppercase tracking-[0.2em] text-black/45">
                  <span className="col-span-6 pl-16">Product</span>
                  <span className="col-span-2 text-center">Price</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-2 text-center">Subtotal</span>
                </div>

                <div className="mt-4 space-y-3">
                  {items.map((item) => {
                    const imgSrc =
                      typeof item.thumbnail === "string" &&
                      item.thumbnail.trim()
                        ? item.thumbnail
                        : Array.isArray(item.images) &&
                            typeof item.images[0] === "string"
                          ? item.images[0]
                          : typeof item.image === "string" && item.image?.trim()
                            ? item.image
                            : "/placeholder.png";

                    return (
                      <div
                        key={item.id}
                        className="
                          md:grid md:grid-cols-12 md:gap-4
                          flex flex-col gap-3
                          rounded-2xl border border-black/10
                          bg-white/60
                          px-4 py-4
                        "
                      >
                        {/* Product */}
                        <div className="md:col-span-6 relative flex items-start gap-4 pl-2 md:pl-10">
                          <button
                            onClick={() =>
                              dispatch({
                                type: "REMOVE_ITEM",
                                payload: item.id,
                              })
                            }
                            className="
                              absolute -left-3 top-1/2 -translate-y-1/2
                              text-black/35 hover:text-black/70 transition
                              md:relative md:left-0 md:top-auto md:translate-y-0
                            "
                            title="Remove item"
                            type="button"
                            aria-label="Remove item"
                          >
                            <CiCircleRemove className="text-2xl" />
                          </button>

                          <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-black/10 bg-white">
                            <Image
                              src={imgSrc}
                              alt={item.title}
                              fill
                              sizes="56px"
                              className="object-contain p-1"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[13px] font-normal tracking-wide text-black/80 line-clamp-2">
                              {item.title}
                            </p>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="md:col-span-2 text-center text-[13px] text-black/70">
                          <span className="block md:hidden text-[11px] uppercase tracking-[0.18em] text-black/40">
                            Price
                          </span>
                          ${item.price.toFixed(2)}
                        </div>

                        {/* Qty */}
                        <div className="md:col-span-2 text-center">
                          <span className="block md:hidden text-[11px] uppercase tracking-[0.18em] text-black/40">
                            Quantity
                          </span>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => {
                              const raw = Number(e.target.value);
                              const qty = Number.isFinite(raw)
                                ? Math.max(1, raw)
                                : 1;

                              dispatch({
                                type: "SET_QUANTITY",
                                payload: { id: item.id, quantity: qty },
                              });
                            }}
                            className="
                              w-16 text-center
                              rounded-full border border-black/10
                              bg-white/70 px-2 py-1.5 text-[13px] text-black/75
                              outline-none
                              focus:ring-2 focus:ring-black/10
                            "
                          />
                        </div>

                        {/* Subtotal */}
                        <div className="md:col-span-2 text-center text-[13px] text-black/70">
                          <span className="block md:hidden text-[11px] uppercase tracking-[0.18em] text-black/40">
                            Subtotal
                          </span>
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom grid */}
              <div className="grid md:grid-cols-2 gap-10">
                {/* Shipping */}
                <div>
                  <div className="mb-4">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">
                      Shipping
                    </p>
                    <h2 className="mt-2 text-[16px] font-normal tracking-wide text-black/80">
                      Shipping address
                    </h2>
                  </div>

                  <div className="space-y-5">
                    <Field
                      label="Name"
                      name="name"
                      value={form.name}
                      error={errors.name}
                      onChange={handleInput}
                    />

                    <Field
                      label="Phone"
                      name="tel"
                      value={form.tel}
                      error={errors.tel}
                      onChange={handleInput}
                    />

                    <TextAreaField
                      label="Address"
                      name="address"
                      value={form.address}
                      error={errors.address}
                      onChange={handleInput}
                    />
                  </div>
                </div>

                {/* Totals */}
                <div className="rounded-3xl border border-black/10 bg-white/60 p-6">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">
                    Summary
                  </p>
                  <h2 className="mt-2 text-2xl font-normal tracking-tight text-black/85">
                    Totals
                  </h2>

                  <div className="mt-6 space-y-3 text-[13px]">
                    <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
                    <Row
                      label="Shipping"
                      value={`$${shippingCost.toFixed(2)}`}
                    />
                    <div className="my-4 h-px w-full bg-black/10" />
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] uppercase tracking-[0.18em] text-black/45">
                        Total
                      </span>
                      <span className="text-[16px] font-normal tracking-wide text-black/85">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isLoading}
                    className={`
                      mt-6 w-full rounded-full
                      bg-black text-white
                      py-3 text-[12px] uppercase tracking-[0.22em]
                      transition
                      hover:bg-black/85
                      ${isLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                    `}
                    type="button"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <FaSpinner className="animate-spin" />
                        Processing
                      </span>
                    ) : (
                      "Checkout"
                    )}
                  </button>

                  <p className="mt-4 text-[12px] text-black/40 leading-relaxed">
                    By checking out, you agree to our minimal, simple purchase
                    flow.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-black/55">{label}</span>
      <span className="text-black/75">{value}</span>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  error,
  onChange,
}: {
  label: string;
  name: "name" | "tel";
  value: string;
  error: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const hasError = Boolean(error);

  return (
    <div className="relative">
      <label className="block text-[11px] uppercase tracking-[0.2em] text-black/45 mb-2">
        {label}
      </label>

      <input
        name={name}
        placeholder={label}
        value={value}
        onChange={onChange}
        className={`
          w-full rounded-2xl border
          bg-white/70 px-4 py-3 text-[13px] text-black/75
          outline-none transition
          ${hasError ? "border-red-500/60 ring-2 ring-red-500/10" : "border-black/10"}
          focus:ring-2 focus:ring-black/10
        `}
      />

      {hasError && (
        <div className="mt-2 text-[12px] text-red-600/80">{error}</div>
      )}
    </div>
  );
}

function TextAreaField({
  label,
  name,
  value,
  error,
  onChange,
}: {
  label: string;
  name: "address";
  value: string;
  error: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  const hasError = Boolean(error);

  return (
    <div className="relative">
      <label className="block text-[11px] uppercase tracking-[0.2em] text-black/45 mb-2">
        {label}
      </label>

      <textarea
        name={name}
        placeholder={label}
        value={value}
        onChange={onChange}
        rows={4}
        className={`
          w-full rounded-2xl border
          bg-white/70 px-4 py-3 text-[13px] text-black/75
          outline-none transition resize-none
          ${hasError ? "border-red-500/60 ring-2 ring-red-500/10" : "border-black/10"}
          focus:ring-2 focus:ring-black/10
        `}
      />

      {hasError && (
        <div className="mt-2 text-[12px] text-red-600/80">{error}</div>
      )}
    </div>
  );
}
