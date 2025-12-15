import Link from "next/link";

const categories = [
  {
    name: "Starters",
    items: [
      { name: "Pani Puri Shots", description: "Crisp semolina shells, spiced tamarind water, potato, and sprouts.", price: "$8", tags: ["veg", "spicy"] },
      { name: "Tandoori Paneer Skewers", description: "Charred cottage cheese with hung curd marinade and pickled onions.", price: "$12", tags: ["veg"] },
      { name: "Amritsari Fish", description: "Carom seed batter, flaky white fish, lemon chaat spice.", price: "$14", tags: ["seafood"] },
    ],
  },
  {
    name: "Signature Mains",
    items: [
      { name: "Butter Chicken", description: "Slow-simmered tomato-cashew gravy, fenugreek, tandoor chicken.", price: "$20", tags: ["house favorite", "mild"] },
      { name: "Hyderabadi Dum Biryani", description: "Sealed-hand biryani with aged basmati, saffron, fried onions, raita.", price: "$22", tags: ["spicy"] },
      { name: "Palak Paneer", description: "Baby spinach purée, cottage cheese, roasted garlic tadka.", price: "$18", tags: ["veg", "gluten-free"] },
      { name: "Chettinad Pepper Lamb", description: "Black pepper masala, curry leaves, coconut, slow-cooked lamb.", price: "$23", tags: ["spicy"] },
    ],
  },
  {
    name: "Breads & Sides",
    items: [
      { name: "Garlic Naan", description: "Clay-oven baked, brushed with ghee and garlic chives.", price: "$5", tags: [] },
      { name: "Laccha Paratha", description: "Flaky whole-wheat layers, griddled with ghee.", price: "$6", tags: ["veg"] },
      { name: "Jeera Rice", description: "Basmati, cumin, and caramelized onions.", price: "$6", tags: ["veg", "gluten-free"] },
    ],
  },
  {
    name: "Desserts",
    items: [
      { name: "Gulab Jamun", description: "Milk-solid dumplings, rose cardamom syrup, pistachio dust.", price: "$7", tags: ["veg"] },
      { name: "Mango Shrikhand", description: "Hung yogurt mousse, kesar, Alfonso mango, almond brittle.", price: "$8", tags: ["veg", "gluten-free"] },
    ],
  },
  {
    name: "Drinks",
    items: [
      { name: "Masala Nimbu Soda", description: "Spiced lime soda with black salt and mint.", price: "$6", tags: ["non-alcoholic"] },
      { name: "Mango Lassi", description: "Yogurt, mango, saffron.", price: "$6", tags: ["non-alcoholic", "veg"] },
      { name: "Old Monk & Cola", description: "Classic rum highball with lime.", price: "$10", tags: ["spirits"] },
    ],
  },
];

const pillClass = "inline-flex items-center gap-2 rounded-full border border-[rgba(0,0,0,0.08)] bg-[rgba(0,0,0,0.03)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#334155]";

export default function MenuPage() {
  return (
    <main className="bg-white text-[#0b0d0f]">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-14 md:gap-16 md:py-20">
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#475569]">
            <span className={pillClass}>Menu</span>
            <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-[#312e81]">Authentic Indian, made to order</span>
            <span className="rounded-full bg-[#ecfeff] px-3 py-1 text-[#0f172a]">Dine-in · Takeout · Reserve</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] text-[#0f172a] md:text-[44px]">Simple, bold, and ready to order.</h1>
            <p className="text-lg text-[#3b4255]">
              See the essentials at a glance: signature mains, fresh tandoor breads, and crowd-favorite starters. One clear action — order or reserve — no clutter.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/order" className="inline-flex items-center justify-center gap-2 rounded-md border border-[#0f172a] bg-[#0f172a] px-5 py-3 text-white shadow-sm transition hover:-translate-y-[1px] hover:shadow-md">
              Order Online
            </Link>
            <Link href="/reserve" className="inline-flex items-center justify-center gap-2 rounded-md border border-[rgba(0,0,0,0.14)] bg-white px-5 py-3 text-[#0b0d0f] hover:border-[#0b0d0f]">
              Reserve a Table
            </Link>
            <span className="inline-flex items-center gap-2 rounded-md border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2 text-[#0f172a]">Call: (555) 123-9876</span>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-[1fr_0.62fr] md:items-start">
          <div className="space-y-5 rounded-2xl border border-[#e8ebf3] bg-white p-6 shadow-[0_12px_38px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#475569]">
              <span>What to expect</span>
              <span className="rounded-full bg-[#ecfeff] px-3 py-1 text-[#0f172a]">Ready in 15–25 min</span>
            </div>
            <ul className="grid gap-3 text-sm text-[#475569] md:grid-cols-2">
              <li className="rounded-lg border border-[#edf2f7] bg-[#f8fafc] px-3 py-2">Clear veg / non-veg tags on every item.</li>
              <li className="rounded-lg border border-[#edf2f7] bg-[#f8fafc] px-3 py-2">No autoplay video — fast to load on mobile.</li>
              <li className="rounded-lg border border-[#edf2f7] bg-[#f8fafc] px-3 py-2">One primary action: Order Online.</li>
              <li className="rounded-lg border border-[#edf2f7] bg-[#f8fafc] px-3 py-2">Secondary: Reserve a Table.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[#e8ebf3] bg-[#0f172a] p-5 text-white shadow-[0_12px_38px_rgba(15,23,42,0.25)]">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Today&apos;s highlight</span>
              <span className="rounded-full border border-white/30 px-2 py-1 text-[11px] text-white/80">Chef&apos;s pick</span>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-[#5bffb1]" />
                <div>
                  <p className="font-semibold">Hyderabadi Dum Biryani</p>
                  <p className="text-white/75">Saffron basmati, sealed-hand cooking, raita on the side. Balanced heat.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-[#ffd480]" />
                <div>
                  <p className="font-semibold">Garlic Naan</p>
                  <p className="text-white/75">Clay-oven char, brushed with ghee and chives. Best with gravies.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-[#8fb2ff]" />
                <div>
                  <p className="font-semibold">Mango Shrikhand</p>
                  <p className="text-white/75">Cool finish: hung yogurt, mango, saffron, almond brittle.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#768198]">Menu</p>
              <h2 className="text-2xl font-semibold text-[#0f172a]">Straightforward categories, quick actions.</h2>
              <p className="text-sm text-[#536072]">Tap any item to order — no extra modals or autoplay media.</p>
            </div>
            <Link href="/order" className="inline-flex items-center justify-center rounded-md border border-[#0f172a] px-4 py-2 text-sm font-semibold text-[#0f172a] hover:-translate-y-[1px] hover:shadow-sm">
              Order now
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {categories.map((category) => (
              <div key={category.name} className="space-y-3 rounded-2xl border border-[#e8ebf3] bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#0f172a]">{category.name}</h3>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">{category.items.length} items</span>
                </div>
                <div className="space-y-3">
                  {category.items.map((item) => (
                    <div key={item.name} className="flex flex-col gap-1 rounded-xl border border-[#edf2f7] bg-[#f8fafc] px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#0f172a]">{item.name}</p>
                          <p className="text-xs text-[#64748b]">{item.description}</p>
                        </div>
                        <span className="text-sm font-semibold text-[#0f172a]">{item.price}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#475569]">
                        {item.tags.length === 0 ? <span className="rounded-full border border-[#e2e8f0] bg-white px-2 py-1">Classic</span> : null}
                        {item.tags.map((tag) => (
                          <span key={tag} className="rounded-full border border-[#e2e8f0] bg-white px-2 py-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#e8ebf3] bg-white p-6 text-sm text-[#475569] shadow-[0_12px_38px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#768198]">Visit</p>
              <h3 className="text-lg font-semibold text-[#0f172a]">Open daily · 11:00am – 10:30pm</h3>
              <p>123 Spice Lane, Downtown • Parking available • Call (555) 123-9876</p>
            </div>
            <div className="flex gap-2">
              <Link href="/reserve" className="rounded-md border border-[#0f172a] px-4 py-2 text-sm font-semibold text-[#0f172a] hover:-translate-y-[1px] hover:shadow-sm">
                Reserve a Table
              </Link>
              <Link href="/order" className="rounded-md border border-[#0f172a] bg-[#0f172a] px-4 py-2 text-sm font-semibold text-white hover:-translate-y-[1px] hover:shadow-md">
                Order Online
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
