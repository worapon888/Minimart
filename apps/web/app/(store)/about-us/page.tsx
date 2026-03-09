"use client";

export default function AboutUsPage() {
  const values = [
    {
      title: "Minimal design",
      desc: "Clean, calming, and easy to navigate — no clutter, no stress.",
    },
    {
      title: "Function first",
      desc: "Not just aesthetics — usability and quality that lasts.",
    },
    {
      title: "Customer-centered",
      desc: "We listen. Your feedback shapes every decision we make.",
    },
  ];

  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <header className="text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-black/45">
            About
          </p>

          <h1 className="mt-3 text-3xl sm:text-5xl font-light tracking-tight text-black">
            About <span className="font-medium">MinimalMart</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-black/60">
            Your simple choice for everyday style — curated to feel calm, clean,
            and intentional.
          </p>
        </header>

        {/* Divider */}
        <div className="my-12 h-px w-full bg-black/10" />

        {/* Main editorial layout */}
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
          {/* Left: Philosophy */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-black/45">
              Philosophy
            </p>

            <h2 className="mt-3 text-2xl sm:text-3xl font-light tracking-tight text-black">
              Less, but better.
            </h2>

            <p className="mt-4 text-base sm:text-lg leading-relaxed text-black/60">
              At <span className="font-medium text-black/80">MinimalMart</span>,
              we believe in <span className="italic">“less is more.”</span>
              <br />
              Our brand was born from a passion for clean design and practical
              living. Every item is carefully selected to match a minimalist
              lifestyle — with purpose and simplicity.
            </p>

            {/* Small notes */}
            <div className="mt-8 rounded-2xl border border-black/10 bg-white/60 p-6 backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.28em] text-black/40">
                Based in Thailand
              </p>
              <p className="mt-2 text-sm sm:text-base leading-relaxed text-black/60">
                We ship nationwide and are always expanding our reach — quietly,
                thoughtfully, step by step.
              </p>
            </div>
          </div>

          {/* Right: Values + Mission */}
          <div className="space-y-10">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-black/45">
                Core values
              </p>

              <div className="mt-5 grid gap-4">
                {values.map((v) => (
                  <div
                    key={v.title}
                    className="rounded-2xl border border-black/10 bg-white/60 p-6 backdrop-blur-xl
                               transition hover:bg-white/80"
                  >
                    <h3 className="text-base sm:text-lg font-medium tracking-tight text-black/90">
                      {v.title}
                    </h3>
                    <p className="mt-2 text-sm sm:text-base leading-relaxed text-black/60">
                      {v.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white/60 p-7 backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.28em] text-black/45">
                Our mission
              </p>
              <p className="mt-3 text-base sm:text-lg font-light leading-relaxed text-black/70">
                To simplify your shopping experience — one meaningful product at
                a time.
              </p>

              <div className="mt-6 h-px w-full bg-black/10" />

              <p className="mt-6 text-sm sm:text-base leading-relaxed text-black/60">
                Thank you for supporting an independent brand with intention and
                care.
              </p>

              <p className="mt-2 text-sm sm:text-base font-medium text-black/80">
                MinimalMart — the calm side of commerce.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom spacing */}
        <div className="mt-14 h-px w-full bg-black/10" />
        <p className="mt-6 text-center text-xs sm:text-sm text-black/45">
          © {new Date().getFullYear()} MinimalMart. Crafted with intention.
        </p>
      </div>
    </section>
  );
}
