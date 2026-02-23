"use client";

import Image from "next/image";
import { useMemo, useState, type FormEvent } from "react";
import { getOrCreateSessionId } from "@/lib/sessionId";

type ShirtTypeKey = "ladies_active" | "polycotton_ladies" | "unisex";

type ShirtColor = {
  key: string;
  label: string;
  imageSrc: string;
  unavailableSizes?: string[];
};

type SizeChartRow = {
  label: string;
  valuesBySize: Record<string, number>;
};

type ShirtType = {
  key: ShirtTypeKey;
  title: string;
  fitLabel: string;
  material: string;
  sizes: string[];
  colors: ShirtColor[];
  sizeChart: {
    sizes: string[];
    rows: SizeChartRow[];
    notes?: string[];
  };
};

type VariantSelection = {
  typeKey: ShirtTypeKey;
  colorKey: string;
  quantitiesBySize: Record<string, number>;
};

const SHIRT_TYPES: ShirtType[] = [
  {
    key: "ladies_active",
    title: "Active vest",
    fitLabel: "Fitted (ladies cut)",
    material: "160g/m² • 100% Polyester Birdseye",
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    colors: [
      {
        key: "black",
        label: "Black",
        imageSrc: "/images/tshirts/ladies_active_black.png",
      },
      {
        key: "navy",
        label: "Navy",
        imageSrc: "/images/tshirts/ladies_active_navy.png",
      },
      {
        key: "pink",
        label: "Pink",
        imageSrc: "/images/tshirts/ladies_active_pink.png",
      },
    ],
    sizeChart: {
      sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
      rows: [
        {
          label: "1/2 Chest (cm)",
          valuesBySize: {
            XS: 35.5,
            S: 38,
            M: 40.5,
            L: 43,
            XL: 45.5,
            "2XL": 48,
            "3XL": 50.5,
          },
        },
      ],
      notes: ["No XS available."],
    },
  },
  {
    key: "polycotton_ladies",
    title: "Polycotton vest",
    fitLabel: "Fitted (ladies cut)",
    material: "160g • 65/35 Poly Cotton Single Jersey",
    sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL"],
    colors: [
      {
        key: "navy",
        label: "Navy",
        imageSrc: "/images/tshirts/polycotton_ladies_1.png",
        unavailableSizes: ["M"],
      },
      {
        key: "red",
        label: "Red",
        imageSrc: "/images/tshirts/polycotton_ladies_red.png",
      },
    ],
    sizeChart: {
      sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL"],
      rows: [
        {
          label: "1/2 Chest (cm)",
          valuesBySize: {
            S: 43,
            M: 46,
            L: 49,
            XL: 52,
            "2XL": 55,
            "3XL": 58,
            "4XL": 61,
          },
        },
        {
          label: "1/2 Bottom (cm)",
          valuesBySize: {
            S: 55,
            M: 58,
            L: 61,
            XL: 64,
            "2XL": 67,
            "3XL": 70,
            "4XL": 73,
          },
        },
        {
          label: "Centre Back Length (cm)",
          valuesBySize: {
            S: 65,
            M: 67,
            L: 69,
            XL: 71,
            "2XL": 73,
            "3XL": 75,
            "4XL": 77,
          },
        },
      ],
      notes: ["Navy: no size M.", "No XS available."],
    },
  },
  {
    key: "unisex",
    title: "Unisex t-shirt",
    fitLabel: "Unisex fit (same as last year)",
    material: "110g/m² • 100% Polyester Single Jersey Knit",
    sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    colors: [
      {
        key: "black",
        label: "Black",
        imageSrc: "/images/tshirts/unisex_black.png",
      },
      {
        key: "navy",
        label: "Navy",
        imageSrc: "/images/tshirts/unisex_navy.png",
      },
      {
        key: "red",
        label: "Red",
        imageSrc: "/images/tshirts/unisex_red.png",
      },
      {
        key: "royal_blue",
        label: "Royal blue",
        imageSrc: "/images/tshirts/unisex_royal_blue.png",
      },
    ],
    sizeChart: {
      sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
      rows: [
        {
          label: "1/2 Chest (cm)",
          valuesBySize: {
            S: 50,
            M: 53,
            L: 56,
            XL: 59,
            "2XL": 62,
            "3XL": 65,
            "4XL": 68,
            "5XL": 71,
          },
        },
        {
          label: "1/2 Bottom (cm)",
          valuesBySize: {
            S: 50,
            M: 53,
            L: 56,
            XL: 59,
            "2XL": 62,
            "3XL": 65,
            "4XL": 68,
            "5XL": 71,
          },
        },
        {
          label: "Centre Back Length (cm)",
          valuesBySize: {
            S: 70,
            M: 72,
            L: 74,
            XL: 76,
            "2XL": 78,
            "3XL": 80,
            "4XL": 82,
            "5XL": 84,
          },
        },
        {
          label: "Sleeve Length (cm)",
          valuesBySize: {
            S: 19,
            M: 20,
            L: 21,
            XL: 22,
            "2XL": 23,
            "3XL": 24,
            "4XL": 25,
            "5XL": 26,
          },
        },
      ],
      notes: ["No XS available."],
    },
  },
];

function getTypeByKey(key: ShirtTypeKey): ShirtType {
  const found = SHIRT_TYPES.find((t) => t.key === key);
  if (!found) throw new Error(`Unknown shirt type: ${key}`);
  return found;
}

function getColorByKey(typeKey: ShirtTypeKey, colorKey: string): ShirtColor {
  const type = getTypeByKey(typeKey);
  const found = type.colors.find((c) => c.key === colorKey);
  if (!found) throw new Error(`Unknown color '${colorKey}' for type '${typeKey}'`);
  return found;
}

function getAvailableSizes(typeKey: ShirtTypeKey, colorKey: string): string[] {
  const type = getTypeByKey(typeKey);
  const color = getColorByKey(typeKey, colorKey);

  const unavailable = new Set([...(color.unavailableSizes ?? []), "XS"]);
  return type.sizes.filter((s) => !unavailable.has(s));
}

function SizeChartTable({ chart }: { chart: ShirtType["sizeChart"] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-text-dark/10">
        <thead className="bg-cloud-dancer">
          <tr>
            <th className="text-left px-3 py-2 font-semibold">Size</th>
            {chart.sizes.map((size) => (
              <th key={size} className="px-3 py-2 font-semibold text-center">
                {size}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chart.rows.map((row) => (
            <tr key={row.label} className="border-t border-text-dark/10">
              <td className="px-3 py-2 font-medium text-text-dark/80 whitespace-nowrap">
                {row.label}
              </td>
              {chart.sizes.map((size) => (
                <td key={size} className="px-3 py-2 text-center">
                  {row.valuesBySize[size] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TShirtSurveyClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("pollEmail") || "";
  });
  const [notes, setNotes] = useState("");
  const [selections, setSelections] = useState<Record<string, VariantSelection>>({});

  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submissionId = useMemo(() => {
    if (typeof window !== "undefined" && "crypto" in window && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }, []);

  const variantId = (typeKey: ShirtTypeKey, colorKey: string) => `${typeKey}:${colorKey}`;

  const plannedItems = useMemo(() => {
    return Object.values(selections).flatMap((sel) => {
      return Object.entries(sel.quantitiesBySize)
        .filter(([, qty]) => Number.isFinite(qty) && qty > 0)
        .map(([size, qty]) => ({
          typeKey: sel.typeKey,
          colorKey: sel.colorKey,
          size,
          quantity: Math.floor(qty),
        }));
    });
  }, [selections]);

  const toggleVariant = (typeKey: ShirtTypeKey, colorKey: string) => {
    const key = variantId(typeKey, colorKey);
    setSelections((prev) => {
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: { typeKey, colorKey, quantitiesBySize: {} } };
    });
  };

  const toggleSizeForVariant = (typeKey: ShirtTypeKey, colorKey: string, size: string) => {
    const key = variantId(typeKey, colorKey);

    setSelections((prev) => {
      const existing = prev[key];
      if (!existing) return prev;

      const nextQtyBySize = { ...existing.quantitiesBySize };

      if (Number.isFinite(nextQtyBySize[size]) && nextQtyBySize[size] > 0) {
        delete nextQtyBySize[size];
      } else {
        nextQtyBySize[size] = 1;
      }

      return {
        ...prev,
        [key]: {
          ...existing,
          quantitiesBySize: nextQtyBySize,
        },
      };
    });
  };

  const setSizeQty = (typeKey: ShirtTypeKey, colorKey: string, size: string, quantity: number) => {
    const key = variantId(typeKey, colorKey);

    setSelections((prev) => {
      const existing = prev[key];
      if (!existing) return prev;

      const nextQty = Math.max(1, Math.floor(Number(quantity) || 1));

      return {
        ...prev,
        [key]: {
          ...existing,
          quantitiesBySize: {
            ...existing.quantitiesBySize,
            [size]: nextQty,
          },
        },
      };
    });
  };

  const clearSizesForVariant = (typeKey: ShirtTypeKey, colorKey: string) => {
    const key = variantId(typeKey, colorKey);

    setSelections((prev) => {
      const existing = prev[key];
      if (!existing) return prev;

      return {
        ...prev,
        [key]: {
          ...existing,
          quantitiesBySize: {},
        },
      };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (plannedItems.length === 0) {
      setSubmitError("Please select at least 1 shirt + size for your planned order.");
      return;
    }

    if (plannedItems.some((i) => !Number.isFinite(i.quantity) || i.quantity < 1)) {
      setSubmitError("Quantities must be 1 or more.");
      return;
    }

    setIsSubmitting(true);

    const trimmedName = name.trim();

    if (!trimmedName) {
      setSubmitError("Please enter your name.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      timestamp: new Date().toISOString(),
      submissionId,
      sessionId: getOrCreateSessionId(),
      name: trimmedName,
      email: email.trim() || null,
      notes: notes.trim() || null,
      items: plannedItems.map((i) => ({
        typeKey: i.typeKey,
        colorKey: i.colorKey,
        size: i.size,
        quantity: i.quantity,
      })),
    };

    try {
      const res = await fetch("/api/tshirt-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Failed to submit");
      }

      if (email.trim()) {
        localStorage.setItem("pollEmail", email.trim());
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="px-[5%] py-[60px] bg-cloud-dancer">
        <div className="max-w-[900px] mx-auto text-center">
          <h1 className="font-spartan font-semibold text-[32px] md:text-[44px] mb-3">
            Thank you!
          </h1>
          <p className="text-lg text-text-dark/80">
            Your planned order helps us decide what to stock for the weekender.
          </p>
          <p className="text-sm text-text-dark/60 mt-4">
            Note: This isn&apos;t a payment or a guarantee — we&apos;ll do our best to bring enough stock.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="px-[5%] py-[40px] bg-cloud-dancer">
        <div className="max-w-[950px] mx-auto text-center">
          <h1 className="font-spartan font-semibold text-[36px] md:text-[52px] mb-3">T-shirt survey</h1>
          <p className="text-lg md:text-xl text-text-dark/80">
            Help us order the right stock for the weekender — tell us what you&apos;re actually planning to buy.
          </p>
          <p className="text-sm text-text-dark/70 mt-4">
            Estimated price range: <span className="font-semibold">R160 – R200</span>. T-shirts will be on sale at the weekender.
          </p>
          <p className="text-sm text-text-dark/70 mt-1">
            No XS available on any of the options.
          </p>
        </div>
      </section>

      {/* Choose shirts */}
      <section className="px-[5%] py-[50px] bg-white">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="font-spartan font-semibold text-2xl md:text-3xl text-center mb-2">
            Choose your shirts
          </h2>
          <p className="text-center text-sm text-text-dark/70 mb-10">
            Tap a shirt to select it, then choose your size(s).
          </p>

          <div className="space-y-12">
            {SHIRT_TYPES.map((type) => (
              <div key={type.key}>
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-spartan font-semibold text-xl md:text-2xl">
                      {type.title}
                    </h3>
                    <p className="text-sm text-text-dark/70 mt-1">
                      {type.fitLabel} • {type.material}
                    </p>
                    {type.key === "unisex" ? (
                      <p className="text-xs text-text-dark/60 mt-1">
                        Unisex image shows both front and back.
                      </p>
                    ) : null}
                  </div>

                  <details className="bg-cloud-dancer rounded-xl p-4 border-2 border-text-dark/10">
                    <summary className="cursor-pointer select-none font-semibold">
                      Size chart
                      <span className="text-xs font-normal text-text-dark/60 block">
                        Measurements are garment measurements
                      </span>
                    </summary>
                    <div className="mt-4 space-y-3">
                      <SizeChartTable chart={type.sizeChart} />
                      {type.sizeChart.notes?.length ? (
                        <ul className="text-xs text-text-dark/70 list-disc pl-5">
                          {type.sizeChart.notes.map((n) => (
                            <li key={n}>{n}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </details>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {type.colors.map((color) => {
                    const key = variantId(type.key, color.key);
                    const selected = selections[key];
                    const availableSizes = getAvailableSizes(type.key, color.key);
                    const chosenSizes = selected ? Object.keys(selected.quantitiesBySize) : [];

                    return (
                      <div
                        key={color.key}
                        className={`rounded-xl border-[3px] p-4 transition-all ${
                          selected
                            ? "bg-yellow-accent/10 border-yellow-accent"
                            : "bg-cloud-dancer border-text-dark/10 hover:border-yellow-accent/50"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleVariant(type.key, color.key)}
                          aria-pressed={!!selected}
                          className="w-full text-left"
                        >
                          <div className="bg-white rounded-lg border border-text-dark/10 p-3">
                            <div className="relative h-[320px] md:h-[360px]">
                              <Image
                                src={color.imageSrc}
                                alt={`${type.title} in ${color.label}`}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 360px"
                                className="object-contain"
                              />
                            </div>
                          </div>

                          <div className="mt-3 flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">{color.label}</p>
                              {color.unavailableSizes?.length ? (
                                <p className="text-xs text-text-dark/60 mt-1">
                                  Note: no {color.unavailableSizes.join(", ")}
                                </p>
                              ) : null}
                            </div>
                            <span className="text-xs text-text-dark/60">
                              {selected ? "Selected" : "Tap to select"}
                            </span>
                          </div>
                        </button>

                        {selected ? (
                          <div className="mt-4">
                            <p className="text-sm font-semibold">Sizes</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {availableSizes.map((s) => {
                                const qty = selected.quantitiesBySize[s];
                                const isSelected = Number.isFinite(qty) && qty > 0;

                                return (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => toggleSizeForVariant(type.key, color.key, s)}
                                    className={`px-3 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                                      isSelected
                                        ? "bg-pink-accent/15 border-pink-accent text-text-dark"
                                        : "bg-white border-text-dark/10 hover:border-pink-accent/60"
                                    }`}
                                  >
                                    {s}
                                    {isSelected ? ` ×${qty}` : ""}
                                  </button>
                                );
                              })}
                            </div>

                            {chosenSizes.length ? (
                              <div className="mt-4 space-y-2">
                                {chosenSizes.map((s) => (
                                  <div key={s} className="flex items-center gap-3">
                                    <div className="w-10 font-semibold text-sm">{s}</div>
                                    <input
                                      type="number"
                                      min={1}
                                      step={1}
                                      value={selected.quantitiesBySize[s]}
                                      onChange={(e) => setSizeQty(type.key, color.key, s, Number(e.target.value))}
                                      className="w-24 px-3 py-2 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none bg-white"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => toggleSizeForVariant(type.key, color.key, s)}
                                      className="text-sm underline text-text-dark/60 hover:text-pink-accent"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}

                                <button
                                  type="button"
                                  onClick={() => clearSizesForVariant(type.key, color.key)}
                                  className="text-xs underline text-text-dark/60 hover:text-pink-accent"
                                >
                                  Clear sizes
                                </button>
                              </div>
                            ) : (
                              <p className="text-xs text-text-dark/60 mt-3">
                                Choose at least one size to add this shirt to your planned order.
                              </p>
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 max-w-[800px] mx-auto text-sm text-text-dark/70">
            <details className="bg-cloud-dancer rounded-xl p-5 border-2 border-text-dark/10">
              <summary className="cursor-pointer select-none font-semibold">
                Reference: last year&apos;s ladies cut t-shirt size chart
              </summary>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm border border-text-dark/10 bg-white">
                  <thead className="bg-cloud-dancer">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold">Size</th>
                      {["XS", "S", "M", "L", "XL", "2XL", "3XL"].map((s) => (
                        <th key={s} className="px-3 py-2 text-center font-semibold">
                          {s}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-text-dark/10">
                      <td className="px-3 py-2 font-medium text-text-dark/80 whitespace-nowrap">1/2 Chest (cm)</td>
                      {[38, 41.5, 45, 48.5, 52, 55.5, 59].map((v, idx) => (
                        <td key={idx} className="px-3 py-2 text-center">
                          {v}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Submit planned order */}
      <section
        className="px-[5%] py-[60px]"
        style={{
          background: "linear-gradient(135deg, rgba(255, 209, 23, 0.15), rgba(255, 209, 23, 0.05))",
        }}
      >
        <div className="max-w-[1100px] mx-auto">
          <h2 className="font-spartan font-semibold text-2xl md:text-3xl text-center mb-2">
            Planned order
          </h2>
          <p className="text-center text-sm text-text-dark/70 mb-8">
            Please include what you&apos;d realistically buy at the weekender.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-5 border-2 border-text-dark/10">
                <label className="block text-sm font-semibold mb-2">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                />
              </div>
              <div className="bg-white rounded-xl p-5 border-2 border-text-dark/10">
                <label className="block text-sm font-semibold mb-2">Email (optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                />
                <p className="text-xs text-text-dark/60 mt-2">
                  Useful if we need to contact you about sizes/stock.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border-2 border-text-dark/10">
              <h3 className="font-spartan font-semibold text-lg mb-3">Summary</h3>
              {plannedItems.length === 0 ? (
                <p className="text-sm text-text-dark/60">
                  Nothing selected yet — go back up and tap a shirt, then choose size(s).
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {plannedItems.map((i, idx) => {
                    const t = getTypeByKey(i.typeKey);
                    const c = getColorByKey(i.typeKey, i.colorKey);
                    return (
                      <li key={`${i.typeKey}-${i.colorKey}-${i.size}-${idx}`} className="flex items-center justify-between gap-4">
                        <span>
                          <span className="font-semibold">{t.title}</span> — {c.label} — {i.size} × {i.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleSizeForVariant(i.typeKey, i.colorKey, i.size)}
                          className="text-xs underline text-text-dark/60 hover:text-pink-accent"
                        >
                          Remove
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="bg-white rounded-xl p-5 border-2 border-text-dark/10">
              <label className="block text-sm font-semibold mb-2">Anything else? (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. If XL is out of stock, I’d take 2XL"
                className="w-full min-h-[90px] px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
              />
            </div>

            {submitError ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {submitError}
              </div>
            ) : null}

            <div className="text-center">
              <button
                type="submit"
                disabled={plannedItems.length === 0 || !name.trim() || isSubmitting}
                className="bg-pink-accent text-white px-10 py-4 rounded-lg font-medium text-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-accent/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 active:scale-95"
              >
                {isSubmitting ? "Submitting…" : "Submit planned order"}
              </button>
              <p className="text-xs text-text-dark/60 mt-3 max-w-[700px] mx-auto">
                We&apos;ll use the totals to order stock. Final availability depends on supplier stock and demand.
              </p>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
