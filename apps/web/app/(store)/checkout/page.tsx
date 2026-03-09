"use client";

import Image from "next/image";
import React, { useMemo, useState, ChangeEvent, FormEvent } from "react";
import { CiCircleRemove } from "react-icons/ci";
import { FaSpinner } from "react-icons/fa";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import { useCart } from "../../context/CartContext";
import type { CartItemLike } from "../../../../../packages/shared/types/product";
import {
  getPriceUSD,
  formatUSD,
} from "../../../../../packages/shared/utils/price";

/* ---------------- Stripe ---------------- */
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

/* ---------------- Types ---------------- */
type SafeCartItem = {
  id: string;
  title: string;
  imgSrc: string;
  qty: number;
  unitPrice: number;
};

type CheckoutForm = {
  name: string;
  tel: string;
  address: string;
  email: string;
};

type FormErrors = Partial<Record<keyof CheckoutForm, string>>;

// ✅ ตรงกับ response จาก POST /checkout/orders
type CreateOrderResponse = { orderId: string; status: string };
// ✅ ตรงกับ response จาก POST /checkout/:orderId/pay
type CreateIntentResponse = { clientSecret: string; paymentIntentId: string };

interface FieldProps {
  label: string;
  name: keyof CheckoutForm;
  value: string;
  error?: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  disabled?: boolean;
}

/* ---------------- Utils ---------------- */
const safeString = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : fallback;

const safeNumber = (v: unknown, fallback = 0): number => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  if (typeof v === "bigint") return Number(v);
  return fallback;
};

const pickImage = (item: CartItemLike): string => {
  const thumb = safeString((item as { thumbnail?: unknown }).thumbnail);
  if (thumb.trim()) return thumb;

  const images = (item as { images?: unknown }).images;
  if (
    Array.isArray(images) &&
    typeof images[0] === "string" &&
    images[0].trim()
  )
    return images[0];

  const image = safeString((item as { image?: unknown }).image);
  if (image.trim()) return image;

  return "/placeholder.png";
};

const normalizeItem = (item: CartItemLike): SafeCartItem => {
  const id = safeString((item as { id?: unknown }).id, crypto.randomUUID());
  const title = safeString((item as { title?: unknown }).title, "Untitled");

  const qtyRaw = (item as { quantity?: unknown }).quantity;
  const qty = Math.max(1, Math.floor(safeNumber(qtyRaw, 1)));

  const price = getPriceUSD(item);
  const unitPrice = price === null ? 0 : price;

  return { id, title, imgSrc: pickImage(item), qty, unitPrice };
};

/* ---------------- API helpers ---------------- */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    credentials: "include",
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data as T;
}

// ✅ เปลี่ยนเป็น POST /checkout/orders (รับ items + shipping โดยตรง ไม่ต้องมี reservationId)
async function createOrder(params: {
  items: { productId: string; qty: number }[];
  shipping: { name: string; tel: string; address: string; email?: string };
  idempotencyKey: string;
}): Promise<CreateOrderResponse> {
  return apiJson<CreateOrderResponse>("/checkout/orders", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// ✅ เปลี่ยนเป็น POST /checkout/:orderId/pay (ตรงกับ CheckoutController)
async function createPaymentIntent(
  orderId: string,
  idempotencyKey: string,
): Promise<CreateIntentResponse> {
  return apiJson<CreateIntentResponse>(`/checkout/${orderId}/pay`, {
    method: "POST",
    body: JSON.stringify({ idempotencyKey }),
  });
}

/* ---------------- Stripe Payment Form ---------------- */
function StripePaymentForm({
  orderId,
  onBack,
}: {
  orderId: string;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  const handlePay = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErr("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success?orderId=${orderId}`,
      },
    });

    // confirmPayment จะ redirect ถ้าสำเร็จ — โค้ดด้านล่างจะรันเฉพาะกรณี error
    if (error) setErr(error.message || "Payment failed");
    setLoading(false);
  };

  return (
    <div className="rounded-3xl border border-black/10 bg-white/60 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">
            Payment
          </p>
          <h2 className="mt-2 text-2xl font-normal tracking-tight text-black/85">
            Pay securely
          </h2>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-[12px] uppercase tracking-[0.18em] text-black/50 hover:text-black/80 transition"
        >
          Back
        </button>
      </div>

      <form onSubmit={handlePay} className="mt-6 space-y-4">
        <PaymentElement />
        {err && <p className="text-[12px] text-red-600/80">{err}</p>}
        <button
          disabled={!stripe || !elements || loading}
          className={`mt-2 w-full rounded-full bg-black text-white py-3 text-[12px] uppercase tracking-[0.22em] transition hover:bg-black/85 ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          type="submit"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <FaSpinner className="animate-spin" /> Processing
            </span>
          ) : (
            "Pay now"
          )}
        </button>
      </form>
    </div>
  );
}

/* ---------------- Main Page ---------------- */
export default function CheckoutPage() {
  const { state, dispatch } = useCart();
  const items = useMemo(
    () => ((state.items as CartItemLike[] | undefined) ?? []).map(normalizeItem),
    [state.items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.unitPrice * it.qty, 0),
    [items],
  );
  const shippingCost = items.length > 0 ? 2.99 : 0;
  const total = subtotal + shippingCost;

  const [step, setStep] = useState<"DETAILS" | "PAY">("DETAILS");
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string>("");

  const [form, setForm] = useState<CheckoutForm>({
    name: "",
    tel: "",
    address: "",
    email: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleInput = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = "Please enter your name.";
    if (!/^[0-9]{9,10}$/.test(form.tel))
      newErrors.tel = "Phone number must be 9–10 digits.";
    if (!form.address.trim()) newErrors.address = "Please enter your address.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToPayment = async () => {
    if (!validate() || items.length === 0) return;

    setIsLoading(true);
    try {
      // ✅ สร้าง idempotencyKey ครั้งเดียว ใช้กับทั้ง createOrder และ createPaymentIntent
      const orderIdempotencyKey = crypto.randomUUID();

      const payloadItems = items.map((it) => ({
        productId: it.id,
        qty: it.qty,
      }));

      // ✅ POST /checkout/orders — สร้าง order พร้อม shipping
      const createdOrder = await createOrder({
        items: payloadItems,
        shipping: {
          name: form.name,
          tel: form.tel,
          address: form.address,
          ...(form.email ? { email: form.email } : {}),
        },
        idempotencyKey: orderIdempotencyKey,
      });

      // ✅ POST /checkout/:orderId/pay — ขอ clientSecret จาก Stripe
      const payIntentKey = crypto.randomUUID();
      const intent = await createPaymentIntent(
        createdOrder.orderId,
        payIntentKey,
      );

      setOrderId(createdOrder.orderId);
      setClientSecret(intent.clientSecret);
      setStep("PAY");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Checkout failed.";
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ กลับไป DETAILS และล้าง intent เดิม เพื่อให้ขอ intent ใหม่ได้
  const handleBack = () => {
    setClientSecret("");
    setOrderId("");
    setStep("DETAILS");
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      <header className="text-center">
        <p className="text-[11px] uppercase tracking-[0.24em] text-black/45">
          Checkout
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-normal tracking-tight text-black/85">
          Complete your order
        </h1>
      </header>

      <div className="mt-10 rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl">
        <div className="p-5 sm:p-8">
          {items.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-sm text-black/60">Your cart is empty.</p>
            </div>
          ) : (
            <>
              {/* Product List */}
              <div className="mb-10">
                <div className="hidden md:grid grid-cols-12 gap-4 border-b border-black/10 pb-3 text-[12px] uppercase tracking-[0.2em] text-black/45">
                  <span className="col-span-6 pl-16">Product</span>
                  <span className="col-span-2 text-center">Price</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-2 text-center">Subtotal</span>
                </div>
                <div className="mt-4 space-y-3">
                  {items.map((it) => (
                    <div
                      key={it.id}
                      className="md:grid md:grid-cols-12 md:gap-4 flex flex-col gap-3 rounded-2xl border border-black/10 bg-white/60 px-4 py-4"
                    >
                      <div className="md:col-span-6 relative flex items-start gap-4 pl-2 md:pl-10">
                        <button
                          onClick={() =>
                            dispatch({ type: "REMOVE_ITEM", payload: it.id })
                          }
                          className="absolute -left-3 top-1/2 -translate-y-1/2 text-black/35 hover:text-black/70 md:relative md:left-0"
                          disabled={step === "PAY"}
                        >
                          <CiCircleRemove className="text-2xl" />
                        </button>
                        <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-black/10 bg-white">
                          <Image
                            src={it.imgSrc}
                            alt={it.title}
                            fill
                            sizes="56px"
                            className="object-contain p-1"
                          />
                        </div>
                        <p className="text-[13px] font-normal tracking-wide text-black/80 line-clamp-2">
                          {it.title}
                        </p>
                      </div>
                      <div className="md:col-span-2 text-center text-[13px] text-black/70">
                        {formatUSD(it.unitPrice)}
                      </div>
                      <div className="md:col-span-2 text-center">
                        <input
                          type="number"
                          min={1}
                          value={it.qty}
                          disabled={step === "PAY"}
                          onChange={(e) =>
                            dispatch({
                              type: "SET_QUANTITY",
                              payload: {
                                id: it.id,
                                quantity: Math.max(1, Number(e.target.value)),
                              },
                            })
                          }
                          className="w-16 text-center rounded-full border border-black/10 bg-white/70 px-2 py-1.5 text-[13px] disabled:opacity-50"
                        />
                      </div>
                      <div className="md:col-span-2 text-center text-[13px] text-black/70">
                        {formatUSD(it.unitPrice * it.qty)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-5">
                  <h2 className="text-[16px] font-normal text-black/80">
                    Shipping address
                  </h2>
                  <Field
                    label="Name"
                    name="name"
                    value={form.name}
                    error={errors.name}
                    onChange={handleInput}
                    disabled={step === "PAY"}
                  />
                  <Field
                    label="Phone"
                    name="tel"
                    value={form.tel}
                    error={errors.tel}
                    onChange={handleInput}
                    disabled={step === "PAY"}
                  />
                  <Field
                    label="Email (Optional)"
                    name="email"
                    value={form.email}
                    error={errors.email}
                    onChange={handleInput}
                    disabled={step === "PAY"}
                  />
                  <TextAreaField
                    label="Address"
                    name="address"
                    value={form.address}
                    error={errors.address}
                    onChange={handleInput}
                    disabled={step === "PAY"}
                  />
                </div>

                {step === "DETAILS" ? (
                  <div className="rounded-3xl border border-black/10 bg-white/60 p-6">
                    <h2 className="text-2xl font-normal text-black/85">
                      Totals
                    </h2>
                    <div className="mt-6 space-y-3 text-[13px]">
                      <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
                      <Row
                        label="Shipping"
                        value={`$${shippingCost.toFixed(2)}`}
                      />
                      <div className="my-4 h-px bg-black/10" />
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleContinueToPayment}
                      disabled={items.length === 0 || isLoading}
                      className="mt-6 w-full rounded-full bg-black text-white py-3 text-[12px] uppercase tracking-[0.22em] hover:bg-black/85 disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <FaSpinner className="animate-spin" /> Creating
                          payment...
                        </span>
                      ) : (
                        "Continue to payment"
                      )}
                    </button>
                  </div>
                ) : // ✅ clientSecret ต้องมีค่าก่อนถึงจะ render Elements
                clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <StripePaymentForm orderId={orderId} onBack={handleBack} />
                  </Elements>
                ) : (
                  <div className="flex items-center justify-center">
                    <FaSpinner className="animate-spin text-black/40 text-2xl" />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------- UI components ---------------- */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-black/55">{label}</span>
      <span className="text-black/75">{value}</span>
    </div>
  );
}

function Field({ label, name, value, error, onChange, disabled }: FieldProps) {
  return (
    <div className="relative">
      <label className="block text-[11px] uppercase tracking-[0.2em] text-black/45 mb-2">
        {label}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full rounded-2xl border bg-white/70 px-4 py-3 text-[13px] outline-none transition ${error ? "border-red-500" : "border-black/10"} ${disabled ? "opacity-50" : ""}`}
      />
      {error && <div className="mt-1 text-[11px] text-red-500">{error}</div>}
    </div>
  );
}

function TextAreaField({
  label,
  name,
  value,
  error,
  onChange,
  disabled,
}: FieldProps) {
  return (
    <div className="relative">
      <label className="block text-[11px] uppercase tracking-[0.2em] text-black/45 mb-2">
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={4}
        className={`w-full rounded-2xl border bg-white/70 px-4 py-3 text-[13px] outline-none transition resize-none ${error ? "border-red-500" : "border-black/10"} ${disabled ? "opacity-50" : ""}`}
      />
      {error && <div className="mt-1 text-[11px] text-red-500">{error}</div>}
    </div>
  );
}
