"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type ProId = "igor" | "fernanda" | "harold" | "kristen";
type LoginUser = "admin" | "if" | "harold" | "kristen";

type ProSummary = {
  proId: ProId;
  proName: string;
  currency: "EUR" | "GBP";
  rate45: number;
  rate45Zar: number;
  rate45ZarRounded: number;
  rate60: number;
  rate60Zar: number;
  rate60ZarRounded: number;
};

type Slot = {
  dateKey: string;
  dateLabel: string;
  startMinutes: number;
  endMinutes: number;
  startTime: string;
  endTime: string;
  label: string;
  durationMinutes: number;
  status: "available" | "booked";
  bookingSummary: string;
};

type DaySchedule = {
  dateKey: string;
  dateLabel: string;
  slotDurationMinutes: number;
  slots: Slot[];
};

type Booking = {
  rowNumber: number;
  proId: ProId;
  proName: string;
  dateKey: string;
  dateLabel: string;
  startMinutes: number;
  endMinutes: number;
  startTime: string;
  durationMinutes: number;
  studentName: string;
  partnerName: string;
  notes: string;
  currency: "EUR" | "GBP";
  amountOriginal: number;
  amountZar: number;
  amountZarRounded: number;
};
type Workshop = {
  proId: ProId;
  proName: string;
  dateKey: string;
  dateLabel: string;
  startMinutes: number;
  endMinutes: number;
  timeLabel: string;
  title: string;
  location: string;
};

type ProSchedule = {
  proId: ProId;
  proName: string;
  currency: "EUR" | "GBP";
  rate45: number;
  rate45Zar: number;
  rate45ZarRounded: number;
  rate60: number;
  rate60Zar: number;
  rate60ZarRounded: number;
  workshops: Workshop[];
  days: DaySchedule[];
  bookings: Booking[];
  stats: {
    availableSlots: number;
    bookedSlots: number;
  };
};

type ExchangeRates = {
  EUR_ZAR: number;
  GBP_ZAR: number;
  source: string;
  fetchedAt: string | null;
  fallbackUsed: boolean;
};
type ViewerSession =
  | { role: "admin" }
  | { role: "pro"; scope: "if" | "harold" | "kristen"; proIds: ProId[] };

type DashboardData = {
  viewer: ViewerSession;
  pros: ProSummary[];
  exchangeRates: ExchangeRates;
  schedules: Record<ProId, ProSchedule>;
};

type SelectedSlot = {
  proId: ProId;
  proName: string;
  dateKey: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
};

function isMarch45Exception(dateKey: string): boolean {
  const [, month, day] = dateKey.split("-").map((part) => Number(part));
  return month === 3 && (day === 21 || day === 22);
}

function formatMoney(value: number, fractionDigits = 2): string {
  return value.toLocaleString("en-ZA", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

const OVERVIEW_PRO_ORDER: ProId[] = ["harold", "kristen", "fernanda", "igor"];

const OVERVIEW_PRO_COLORS: Record<
  ProId,
  { available: string; booked: string }
> = {
  harold: {
    available: "border-purple-300 bg-purple-100 text-purple-900 hover:bg-purple-200",
    booked: "border-purple-300 bg-purple-100 text-purple-900 opacity-60",
  },
  kristen: {
    available: "border-amber-700 bg-amber-100 text-amber-900 hover:bg-amber-200",
    booked: "border-amber-700 bg-amber-100 text-amber-900 opacity-60",
  },
  fernanda: {
    available: "border-red-300 bg-red-100 text-red-900 hover:bg-red-200",
    booked: "border-red-300 bg-red-100 text-red-900 opacity-60",
  },
  igor: {
    available: "border-orange-300 bg-orange-100 text-orange-900 hover:bg-orange-200",
    booked: "border-orange-300 bg-orange-100 text-orange-900 opacity-60",
  },
};

export default function ProAdminClient({ initialAuthed }: { initialAuthed: boolean }) {
  const [authed, setAuthed] = useState(initialAuthed);
  const [loginUser, setLoginUser] = useState<LoginUser>("if");
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeProId, setActiveProId] = useState<ProId | null>(null);
  const [viewMode, setViewMode] = useState<"single" | "overview">("single");

  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [editingRowNumber, setEditingRowNumber] = useState<number | null>(null);
  const [studentName, setStudentName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [notes, setNotes] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingError, setBookingError] = useState("");

  const clearBookingSelection = () => {
    setSelectedSlot(null);
    setEditingRowNumber(null);
    setBookingMessage("");
    setBookingError("");
  };

  const clearBookingForm = () => {
    clearBookingSelection();
    setStudentName("");
    setPartnerName("");
    setNotes("");
    setDurationMinutes(60);
  };

  const fetchSchedule = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/pro-admin/schedule");
      const json = (await res.json()) as DashboardData | { error?: string };

      if (!res.ok) {
        throw new Error(
          "error" in json && typeof json.error === "string"
            ? json.error
            : "Failed to load schedule."
        );
      }
      const dashboard = json as DashboardData;
      setData(dashboard);

      if (dashboard.viewer.role === "pro") {
        setViewMode("single");
        setActiveProId(dashboard.viewer.proIds[0] ?? null);
      } else {
        const firstPro = dashboard.pros[0]?.proId ?? null;
        setActiveProId((current) => current ?? firstPro);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load schedule.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) {
      void fetchSchedule();
    }
  }, [authed]);

  useEffect(() => {
    if (!selectedSlot) return;
    setDurationMinutes(selectedSlot.durationMinutes);
  }, [selectedSlot]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const res = await fetch("/api/pro-admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode, user: loginUser }),
      });

      if (!res.ok) {
        throw new Error("Invalid login details.");
      }

      setAuthed(true);
      setPasscode("");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/pro-admin/logout", { method: "POST" });
    } finally {
      setAuthed(false);
      setData(null);
      setActiveProId(null);
      clearBookingForm();
    }
  };

  const activeSchedule = useMemo(() => {
    if (!data || !activeProId) return null;
    return data.schedules[activeProId];
  }, [data, activeProId]);
  const isAdminViewer = data?.viewer.role === "admin";
  const scopedProIds = data?.viewer.role === "pro" ? data.viewer.proIds : [];
  const hasSharedProView = scopedProIds.length > 1;
  const canSwitchVisiblePros = isAdminViewer || hasSharedProView;
  const canManageBookings = isAdminViewer === true;

  const switchToSinglePro = (proId: ProId) => {
    if (!canSwitchVisiblePros) return;
    clearBookingForm();
    setActiveProId(proId);
    setViewMode("single");
  };

  const overviewByDay = useMemo(() => {
    if (!data) return [] as Array<{
      dateKey: string;
      dateLabel: string;
      slots: Array<{
        key: string;
        startMinutes: number;
        endMinutes: number;
        label: string;
        entries: Array<{
          proId: ProId;
          proName: string;
          status: Slot["status"];
          bookingSummary: string;
          slot: Slot;
        }>;
      }>;
    }>;

    const dayMap = new Map<
      string,
      {
        dateKey: string;
        dateLabel: string;
        slots: Map<
          string,
          {
            key: string;
            startMinutes: number;
            endMinutes: number;
            label: string;
            entries: Array<{
              proId: ProId;
              proName: string;
              status: Slot["status"];
              bookingSummary: string;
              slot: Slot;
            }>;
          }
        >;
      }
    >();

    for (const pro of data.pros) {
      const schedule = data.schedules[pro.proId];
      for (const day of schedule.days) {
        const dayGroup = dayMap.get(day.dateKey) ?? {
          dateKey: day.dateKey,
          dateLabel: day.dateLabel,
          slots: new Map(),
        };

        for (const slot of day.slots) {
          const slotKey = `${slot.startMinutes}-${slot.endMinutes}`;
          const slotGroup = dayGroup.slots.get(slotKey) ?? {
            key: slotKey,
            startMinutes: slot.startMinutes,
            endMinutes: slot.endMinutes,
            label: slot.label,
            entries: [],
          };

          slotGroup.entries.push({
            proId: pro.proId,
            proName: schedule.proName,
            status: slot.status,
            bookingSummary: slot.bookingSummary,
            slot,
          });

          dayGroup.slots.set(slotKey, slotGroup);
        }

        dayMap.set(day.dateKey, dayGroup);
      }
    }

    return Array.from(dayMap.values())
      .sort((a, b) => (a.dateKey < b.dateKey ? -1 : 1))
      .map((day) => ({
        dateKey: day.dateKey,
        dateLabel: day.dateLabel,
        slots: Array.from(day.slots.values())
          .sort((a, b) => a.startMinutes - b.startMinutes)
          .map((slotGroup) => ({
            ...slotGroup,
            entries: slotGroup.entries.sort(
              (a, b) =>
                OVERVIEW_PRO_ORDER.indexOf(a.proId) - OVERVIEW_PRO_ORDER.indexOf(b.proId)
            ),
          })),
      }));
  }, [data]);
  const workshopsByDay = useMemo(() => {
    if (!activeSchedule) return [] as Array<{
      dateKey: string;
      dateLabel: string;
      items: Workshop[];
    }>;

    const grouped = new Map<string, { dateKey: string; dateLabel: string; items: Workshop[] }>();
    for (const workshop of activeSchedule.workshops) {
      const day = grouped.get(workshop.dateKey) ?? {
        dateKey: workshop.dateKey,
        dateLabel: workshop.dateLabel,
        items: [],
      };
      day.items.push(workshop);
      grouped.set(workshop.dateKey, day);
    }

    return Array.from(grouped.values())
      .sort((a, b) => (a.dateKey < b.dateKey ? -1 : 1))
      .map((day) => ({
        ...day,
        items: day.items.sort((a, b) => a.startMinutes - b.startMinutes),
      }));
  }, [activeSchedule]);

  const handleSlotClick = (proId: ProId, slot: Slot) => {
    if (!data || !canManageBookings || slot.status !== "available") return;
    const proName = data.schedules[proId]?.proName ?? proId;
    setEditingRowNumber(null);
    setStudentName("");
    setPartnerName("");
    setNotes("");
    setSelectedSlot({
      proId,
      proName,
      dateKey: slot.dateKey,
      dateLabel: slot.dateLabel,
      startTime: slot.startTime,
      endTime: slot.endTime,
      durationMinutes: slot.durationMinutes,
    });
    setBookingMessage("");
    setBookingError("");
  };

  const prefillFromBooking = (booking: Booking) => {
    if (!canManageBookings) return;
    setSelectedSlot({
      proId: booking.proId,
      proName: booking.proName,
      dateKey: booking.dateKey,
      dateLabel: booking.dateLabel,
      startTime: booking.startTime,
      endTime: `${String(Math.floor(booking.endMinutes / 60)).padStart(2, "0")}:${String(
        booking.endMinutes % 60
      ).padStart(2, "0")}`,
      durationMinutes: booking.durationMinutes,
    });
    setEditingRowNumber(booking.rowNumber);
    setStudentName(booking.studentName);
    setPartnerName(booking.partnerName);
    setNotes(booking.notes);
    setDurationMinutes(booking.durationMinutes);
    setBookingMessage("");
    setBookingError("");
  };

  const durationOptions = useMemo(() => {
    if (!selectedSlot) return [60];
    if (isMarch45Exception(selectedSlot.dateKey)) return [45, 60];
    return [60];
  }, [selectedSlot]);

  const submitBooking = async (e: FormEvent) => {
    e.preventDefault();
    setBookingError("");
    setBookingMessage("");
    if (!canManageBookings) return;

    if (!selectedSlot) {
      setBookingError("Select an available slot first.");
      return;
    }
    if (!studentName.trim()) {
      setBookingError("Please enter the student name.");
      return;
    }

    setBookingLoading(true);
    try {
      const isEditing = editingRowNumber !== null;
      const res = await fetch("/api/pro-admin/book", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rowNumber: editingRowNumber,
          proId: selectedSlot.proId,
          dateKey: selectedSlot.dateKey,
          startTime: selectedSlot.startTime,
          durationMinutes,
          studentName: studentName.trim(),
          partnerName: partnerName.trim(),
          notes: notes.trim(),
        }),
      });
      const json = (await res.json()) as { error?: string };

      if (!res.ok) {
        throw new Error(json.error ?? "Failed to save booking.");
      }

      setBookingMessage(isEditing ? "Booking updated." : "Booking saved.");
      clearBookingForm();
      await fetchSchedule();
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Failed to save booking.");
    } finally {
      setBookingLoading(false);
    }
  };

  const unbook = async (rowNumber: number) => {
    if (!canManageBookings) return;
    const confirmed = window.confirm("Unbook this session?");
    if (!confirmed) return;

    setBookingError("");
    setBookingMessage("");
    setBookingLoading(true);
    try {
      const res = await fetch("/api/pro-admin/book", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rowNumber }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "Failed to unbook session.");
      }

      if (editingRowNumber === rowNumber) {
        clearBookingForm();
      }
      setBookingMessage("Session unbooked.");
      await fetchSchedule();
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Failed to unbook session.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (!authed) {
    return (
      <main className="min-h-screen bg-cloud-dancer flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/WCS CT Logo white.png"
              alt="WCS Cape Town"
              width={120}
              height={120}
            />
          </div>
          <h1 className="font-spartan font-semibold text-2xl text-center mb-6">
            Pro Schedule Login
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Login as</label>
              <select
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value as LoginUser)}
                className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none bg-white"
              >
                <option value="if">Igor &amp; Fernanda</option>
                <option value="harold">Harold</option>
                <option value="kristen">Kristen</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Passcode</label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                placeholder={
                  loginUser === "admin"
                    ? "Admin passcode"
                    : loginUser === "if"
                    ? "IF passcode (IF_CT)"
                    : loginUser === "harold"
                    ? "Harold passcode (hb_ct)"
                    : "Kristen passcode (kw_ct)"
                }
                required
              />
            </div>

            {authError && <p className="text-red-600 text-sm">{authError}</p>}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-yellow-accent text-text-dark px-6 py-3 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50"
            >
              {authLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cloud-dancer">
      <header className="bg-black text-white py-4">
        <div className="px-[5%] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/images/WCS CT Logo white.png"
              alt="WCS Cape Town"
              width={40}
              height={40}
            />
            <h1 className="font-spartan font-semibold text-xl">
              {isAdminViewer ? "Pro Lessons Admin" : "Pro Schedule"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {isAdminViewer && (
              <Link href="/admin" className="text-sm text-white/80 hover:text-white underline">
                Weekender Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1.5 rounded border border-white/30 hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="px-[5%] py-8 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => void fetchSchedule()}
            disabled={loading}
            className="bg-yellow-accent text-text-dark px-4 py-2 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-md transition-all disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh schedule"}
          </button>
          {isAdminViewer && (
            <>
              <button
                onClick={() => setViewMode("single")}
                className={`px-3 py-2 rounded-lg border text-sm font-semibold ${
                  viewMode === "single"
                    ? "border-yellow-accent bg-yellow-accent/15"
                    : "border-text-dark/15"
                }`}
              >
                Single pro
              </button>
              <button
                onClick={() => setViewMode("overview")}
                className={`px-3 py-2 rounded-lg border text-sm font-semibold ${
                  viewMode === "overview"
                    ? "border-yellow-accent bg-yellow-accent/15"
                    : "border-text-dark/15"
                }`}
              >
                Overview (all pros)
              </button>
            </>
          )}
          {data && (
            <p className="text-sm text-text-dark/70">
              Rates: 1 EUR = R{formatMoney(data.exchangeRates.EUR_ZAR)} • 1 GBP = R
              {formatMoney(data.exchangeRates.GBP_ZAR)}
              {data.exchangeRates.fallbackUsed ? " (fallback)" : ""}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!data || !activeProId || !activeSchedule ? (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-text-dark/70">{loading ? "Loading..." : "No schedule data yet."}</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {canSwitchVisiblePros &&
                  data.pros.map((pro) => (
                    <button
                      key={pro.proId}
                      onClick={() => switchToSinglePro(pro.proId)}
                      className={`px-4 py-2 rounded-lg border-2 font-semibold text-sm transition-colors ${
                        activeProId === pro.proId
                          ? "border-yellow-accent bg-yellow-accent/15"
                          : "border-text-dark/10 hover:border-yellow-accent/60"
                      }`}
                    >
                      {pro.proName}
                    </button>
                  ))}
                {!canSwitchVisiblePros && (
                  <p className="text-sm text-text-dark/70">
                    Signed in as <span className="font-semibold">{activeSchedule.proName}</span>
                  </p>
                )}
              </div>
            </div>

            {isAdminViewer && viewMode === "overview" ? (
              <div className="bg-white rounded-xl p-6 shadow-sm space-y-5">
                <h2 className="font-spartan font-semibold text-xl">Overview by day and time</h2>
                {overviewByDay.length === 0 ? (
                  <p className="text-text-dark/70">No availability found.</p>
                ) : (
                  <div className="space-y-6">
                    {overviewByDay.map((day) => (
                      <div
                        key={day.dateKey}
                        className="rounded-lg border border-text-dark/10 p-4 space-y-3"
                      >
                        <h3 className="font-semibold">{day.dateLabel}</h3>
                        {day.slots.length === 0 ? (
                          <p className="text-sm text-text-dark/60">No slots on this day.</p>
                        ) : (
                          <div className="space-y-2">
                            {day.slots.map((slotGroup) => (
                              <div
                                key={`${day.dateKey}-${slotGroup.key}`}
                                className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 md:gap-3"
                              >
                                <div className="text-sm font-semibold text-text-dark/80 pt-1">
                                  {slotGroup.label}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {slotGroup.entries.map((entry) => {
                                    const isAvailable = entry.status === "available";
                                    const colorClasses = isAvailable
                                      ? OVERVIEW_PRO_COLORS[entry.proId].available
                                      : OVERVIEW_PRO_COLORS[entry.proId].booked;

                                    return (
                                      <button
                                        key={`${day.dateKey}-${slotGroup.key}-${entry.proId}`}
                                        type="button"
                                        onClick={() => {
                                          if (!isAvailable) return;
                                          setViewMode("single");
                                          setActiveProId(entry.proId);
                                          handleSlotClick(entry.proId, entry.slot);
                                        }}
                                        disabled={!isAvailable}
                                        className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${colorClasses} ${
                                          isAvailable ? "" : "cursor-not-allowed"
                                        }`}
                                      >
                                        <div className="font-semibold">{entry.proName}</div>
                                        <div className="text-[11px]">
                                          {isAvailable
                                            ? "Available"
                                            : entry.bookingSummary || "Booked"}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-xs uppercase text-text-dark/60 mb-1">Rate (45 min)</p>
                    <p className="font-semibold text-lg">
                      {activeSchedule.currency} {formatMoney(activeSchedule.rate45)} • R
                      {formatMoney(activeSchedule.rate45ZarRounded, 0)}
                    </p>
                    <p className="text-xs text-text-dark/60 mt-1">
                      Exact: R{formatMoney(activeSchedule.rate45Zar)}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-xs uppercase text-text-dark/60 mb-1">Rate (60 min)</p>
                    <p className="font-semibold text-lg">
                      {activeSchedule.currency} {formatMoney(activeSchedule.rate60)} • R
                      {formatMoney(activeSchedule.rate60ZarRounded, 0)}
                    </p>
                    <p className="text-xs text-text-dark/60 mt-1">
                      Exact: R{formatMoney(activeSchedule.rate60Zar)}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-xs uppercase text-text-dark/60 mb-1">Slots</p>
                    <p className="font-semibold text-lg">
                      {activeSchedule.stats.availableSlots} available • {activeSchedule.stats.bookedSlots} booked
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm space-y-5">
                  <h2 className="font-spartan font-semibold text-xl">
                    {activeSchedule.proName}&apos;s schedule
                  </h2>

                  {activeSchedule.days.length === 0 ? (
                    <p className="text-text-dark/70">
                      No availability found. Empty cells are treated as unavailable.
                    </p>
                  ) : (
                    <div className="space-y-5">
                      {activeSchedule.days.map((day) => (
                        <div key={day.dateKey} className="rounded-lg border border-text-dark/10 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">{day.dateLabel}</h3>
                            <p className="text-xs text-text-dark/60">
                              {day.slotDurationMinutes}-minute grid
                            </p>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {day.slots.map((slot) => (
                              <button
                                key={`${day.dateKey}-${slot.startTime}-${slot.endTime}`}
                                onClick={() => handleSlotClick(activeProId, slot)}
                                disabled={!canManageBookings || slot.status !== "available"}
                                className={`rounded-lg border px-2 py-2 text-left transition-colors ${
                                  slot.status === "available" && canManageBookings
                                    ? "border-green-400 bg-green-100 text-green-900 hover:bg-green-200"
                                    : slot.status === "available"
                                    ? "border-green-300 bg-green-100 text-green-900"
                                    : "border-red-300 bg-red-100 text-red-800 cursor-not-allowed"
                                }`}
                              >
                                <div className="font-semibold text-sm">{slot.label}</div>
                                <div className="text-xs mt-1">
                                  {slot.status === "available"
                                    ? "Available"
                                    : slot.bookingSummary || "Booked"}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                  <h2 className="font-spartan font-semibold text-xl">Weekender workshops</h2>
                  {workshopsByDay.length === 0 ? (
                    <p className="text-text-dark/70">No workshop blocks found for this pro.</p>
                  ) : (
                    <div className="space-y-4">
                      {workshopsByDay.map((day) => (
                        <div key={day.dateKey} className="rounded-lg border border-text-dark/10 p-4">
                          <h3 className="font-semibold mb-2">{day.dateLabel}</h3>
                          <div className="space-y-2">
                            {day.items.map((item) => (
                              <div
                                key={`${item.dateKey}-${item.startMinutes}-${item.title}`}
                                className="rounded-lg border border-purple-accent/25 bg-purple-accent/5 px-3 py-2"
                              >
                                <p className="font-semibold text-sm">
                                  {item.timeLabel} • {item.title}
                                </p>
                                <p className="text-xs text-text-dark/70">{item.location}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {canManageBookings && (
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="font-spartan font-semibold text-xl mb-4">
                      {editingRowNumber ? "Change booking" : "Book selected slot"}
                    </h2>
                    {!selectedSlot ? (
                      <p className="text-text-dark/70">
                        Click a green slot in the grid above to prefill the booking form.
                      </p>
                    ) : (
                      <form onSubmit={submitBooking} className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                          <span className="font-semibold">{selectedSlot.proName}</span> •{" "}
                          {selectedSlot.dateLabel} • {selectedSlot.startTime}–{selectedSlot.endTime}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Student name</label>
                            <input
                              type="text"
                              value={studentName}
                              onChange={(e) => setStudentName(e.target.value)}
                              className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Partner name (optional)
                            </label>
                            <input
                              type="text"
                              value={partnerName}
                              onChange={(e) => setPartnerName(e.target.value)}
                              className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Duration</label>
                            <select
                              value={durationMinutes}
                              onChange={(e) => setDurationMinutes(Number(e.target.value))}
                              className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none bg-white"
                            >
                              {durationOptions.map((minutes) => (
                                <option key={minutes} value={minutes}>
                                  {minutes} minutes
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Notes</label>
                            <input
                              type="text"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                              placeholder="e.g. paid cash"
                            />
                          </div>
                        </div>

                        {bookingError && (
                          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            {bookingError}
                          </p>
                        )}
                        {bookingMessage && (
                          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                            {bookingMessage}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="submit"
                            disabled={bookingLoading}
                            className="bg-yellow-accent text-text-dark px-6 py-3 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            {bookingLoading
                              ? "Saving..."
                              : editingRowNumber
                              ? "Update booking"
                              : "Book slot"}
                          </button>
                          <button
                            type="button"
                            onClick={clearBookingForm}
                            className="px-4 py-3 rounded-lg border border-text-dark/20 text-sm font-semibold"
                          >
                            Clear selection
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="font-spartan font-semibold text-xl mb-4">
                    Existing bookings ({activeSchedule.bookings.length})
                  </h2>
                  {activeSchedule.bookings.length === 0 ? (
                    <p className="text-text-dark/70">No bookings recorded yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-cloud-dancer">
                          <tr>
                            <th className="px-3 py-2 text-left">Date</th>
                            <th className="px-3 py-2 text-left">Time</th>
                            <th className="px-3 py-2 text-left">Duration</th>
                            <th className="px-3 py-2 text-left">Student</th>
                            <th className="px-3 py-2 text-left">Partner</th>
                            <th className="px-3 py-2 text-left">Notes</th>
                            <th className="px-3 py-2 text-left">Amount (ZAR)</th>
                            {canManageBookings && (
                              <th className="px-3 py-2 text-left">Actions</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {activeSchedule.bookings.map((booking) => (
                            <tr key={booking.rowNumber} className="border-t border-text-dark/10">
                              <td className="px-3 py-2">{booking.dateLabel}</td>
                              <td className="px-3 py-2">{booking.startTime}</td>
                              <td className="px-3 py-2">{booking.durationMinutes} min</td>
                              <td className="px-3 py-2">{booking.studentName}</td>
                              <td className="px-3 py-2">{booking.partnerName || "-"}</td>
                              <td className="px-3 py-2">{booking.notes || "-"}</td>
                              <td className="px-3 py-2">
                                <div className="font-semibold">
                                  R{formatMoney(booking.amountZarRounded, 0)}
                                </div>
                                <div className="text-xs text-text-dark/60">
                                  exact R{formatMoney(booking.amountZar)}
                                </div>
                              </td>
                              {canManageBookings && (
                                <td className="px-3 py-2">
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => prefillFromBooking(booking)}
                                      className="text-xs px-2 py-1 rounded border border-text-dark/20 hover:bg-cloud-dancer"
                                    >
                                      Change
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => void unbook(booking.rowNumber)}
                                      className="text-xs px-2 py-1 rounded border border-red-300 text-red-700 hover:bg-red-50"
                                    >
                                      Unbook
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}
