"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Member = {
  member_id: number;
  first_name: string;
  surname: string;
  full_name: string;
  role: string;
  level: string;
  pensionerStudent: string;
};

type FreeEntryResponse =
  | { applies: false; today: string }
  | {
      applies: true;
      today: string;
      entry_type: string;
      applicable_date: string;
      details: string;
      reason: string;
    };

type CostsResponse = {
  today: string;
  isFirstMonday: boolean;
  costs: Record<string, number>;
};

type NewMemberPayload = {
  firstName: string;
  surname: string;
  contactNumber?: string;
  email?: string;
  feedbackConsent?: boolean;
  role: "Lead" | "Follow" | "I don't know";
  level: "first timer" | "1" | "2";
  level2Reason?: "International experience" | "Teacher approval received";
  howFoundUs?: string;
  visitor?: boolean;
};

const BASE_TYPES = ["Standard entry", "Pensioner", "Student"] as const;
const MONTHLY_TYPES = [
  "Monthly",
  "Pensioner monthly",
  "Student monthly",
] as const;

function formatZar(amount: number): string {
  return `R${amount}`;
}

function formatRole(role: string): string {
  const r = (role ?? "").trim().toUpperCase();
  switch (r) {
    case "L":
      return "Lead";
    case "F":
      return "Follow";
    case "L/F":
      return "Lead / Follow";
    case "F/L":
      return "Follow / Lead";
    default:
      return "Unknown";
  }
}

function normalizePensionerStudent(v: string): "pensioner" | "student" | "" {
  const s = (v ?? "").trim().toLowerCase();
  if (s.includes("pension")) return "pensioner";
  if (s.includes("student")) return "student";
  return "";
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

function PillButton({
  children,
  onClick,
  selected,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  selected?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={
        "px-5 py-4 rounded-xl border-2 text-lg font-semibold text-left transition-colors " +
        (disabled
          ? "opacity-40 border-text-dark/20"
          : selected
            ? "border-pink-accent bg-pink-accent/10"
            : "border-text-dark/20 bg-white hover:border-text-dark/40")
      }
    >
      {children}
    </button>
  );
}

function Modal({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-text-dark/50 flex items-end md:items-center justify-center p-3">
      <div className="bg-cloud-dancer w-full max-w-[720px] max-h-[90vh] rounded-2xl border border-text-dark/10 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-text-dark/10 bg-white/60">
          <h2 className="font-spartan font-semibold text-xl">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-dark/70 hover:text-text-dark font-semibold"
          >
            Close
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function AddNewPersonForm({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (member: Member) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [feedbackConsent, setFeedbackConsent] = useState(false);
  const [role, setRole] = useState<NewMemberPayload["role"]>("I don't know");
  const [level, setLevel] = useState<NewMemberPayload["level"]>("1");
  const [howFoundUs, setHowFoundUs] = useState("");
  const [visitor, setVisitor] = useState(false);
  const [level2Reason, setLevel2Reason] = useState<
    NewMemberPayload["level2Reason"] | ""
  >("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
  }, [open]);

  useEffect(() => {
    if (level !== "2") {
      setLevel2Reason("");
    }
  }, [level]);

  async function submit() {
    setError(null);

    if (!firstName.trim() || !surname.trim()) {
      setError("First name and surname are required.");
      return;
    }

    const emailTrim = email.trim();
    const contactTrim = contactNumber.trim();

    const isValidEmail = (v: string) => {
      if (!v) return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    };

    const isValidPhone = (v: string) => {
      if (!v) return true;
      const digits = v.replace(/[^0-9]/g, "");
      return digits.length >= 9 && digits.length <= 15;
    };

    if (!isValidEmail(emailTrim)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isValidPhone(contactTrim)) {
      setError("Please enter a valid contact number.");
      return;
    }

    if ((emailTrim || contactTrim) && !feedbackConsent) {
      setError(
        "Consent box needs to be checked if contact details are given."
      );
      return;
    }

    if (level === "2" && !level2Reason) {
      setError("Please select why they are joining Level 2.");
      return;
    }

    setSaving(true);
    try {
      const payload: NewMemberPayload = {
        firstName: firstName.trim(),
        surname: surname.trim(),
        contactNumber: contactTrim || undefined,
        email: emailTrim || undefined,
        feedbackConsent,
        role,
        level,
        level2Reason:
          level === "2"
            ? (level2Reason as NewMemberPayload["level2Reason"])
            : undefined,
        howFoundUs: howFoundUs.trim() || undefined,
        visitor,
      };

      const res = await fetchJson<{ member: Member }>("/api/check-in/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // reset form
      setFirstName("");
      setSurname("");
      setContactNumber("");
      setEmail("");
      setFeedbackConsent(false);
      setRole("I don't know");
      setLevel("1");
      setHowFoundUs("");
      setVisitor(false);
      setLevel2Reason("");

      onCreated(res.member);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add member");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Add new person" open={open} onClose={onClose}>
      <div className="space-y-5">
        <div className="bg-white/60 rounded-xl border border-text-dark/10 p-4 text-sm text-text-dark/80">
          <p className="font-semibold mb-1">Welcoming committee script</p>
          <p>
            Ask for a <span className="font-semibold">contact number or email</span> (only one is
            fine). If they give you one, ask:
            <span className="font-semibold">
              {" "}“Is it OK if we use that to ask for feedback very occasionally?”
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-2">
            <div className="font-semibold">First name (required)</div>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-text-dark/20 text-lg bg-white"
              autoCapitalize="words"
            />
          </label>

          <label className="space-y-2">
            <div className="font-semibold">Surname (required)</div>
            <input
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-text-dark/20 text-lg bg-white"
              autoCapitalize="words"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-2">
            <div className="font-semibold">Contact number (optional)</div>
            <input
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              inputMode="tel"
              className="w-full px-4 py-3 rounded-xl border-2 border-text-dark/20 text-lg bg-white"
            />
          </label>

          <label className="space-y-2">
            <div className="font-semibold">Email (optional)</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              inputMode="email"
              className="w-full px-4 py-3 rounded-xl border-2 border-text-dark/20 text-lg bg-white"
            />
          </label>
        </div>

        <label className="flex items-start gap-3 bg-white/60 rounded-xl border border-text-dark/10 p-4">
          <input
            type="checkbox"
            checked={feedbackConsent}
            onChange={(e) => setFeedbackConsent(e.target.checked)}
            className="mt-1"
          />
          <div>
            <div className="font-semibold">Consent to feedback follow-up (optional)</div>
            <div className="text-sm text-text-dark/70">
              OK to contact them using the number/email above, very occasionally (e.g. if they stop
              coming, ask why once-off).
            </div>
          </div>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-2">
            <div className="font-semibold">Role (required)</div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as NewMemberPayload["role"])}
              className="w-full px-4 py-3 rounded-xl border-2 border-text-dark/20 text-lg bg-white"
            >
              <option>Lead</option>
              <option>Follow</option>
              <option>I don&apos;t know</option>
            </select>
            <div className="text-sm text-text-dark/70">
              Ask if they&apos;re joining as a lead or a follow. If unsure, choose “I don&apos;t know”.
            </div>
          </label>
        </div>

        <label className="space-y-2">
          <div className="font-semibold">Level (required)</div>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as NewMemberPayload["level"])}
            className="w-full px-4 py-3 rounded-xl border-2 border-text-dark/20 text-lg bg-white"
          >
            <option value="first timer">first timer</option>
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
          <div className="text-sm text-text-dark/70 space-y-2">
            <div>
              <span className="font-semibold">first timer</span>: new to WCS.
            </div>
            <div>
              <span className="font-semibold">level 1</span>: has done some classes in Cape Town.
              If they&apos;re unsure, default to level 1.
            </div>
            <div>
              <span className="font-semibold">level 2</span>: international dancer (dancing
              frequently). If 6+ months: ask a teacher. If 1+ year: can join level 2.
            </div>
          </div>
        </label>

        {level === "2" && (
          <label className="space-y-2">
            <div className="font-semibold">Level 2 — why?</div>
            <select
              value={level2Reason}
              onChange={(e) =>
                setLevel2Reason(
                  e.target.value as NewMemberPayload["level2Reason"]
                )
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-text-dark/20 text-lg bg-white"
            >
              <option value="">Select one…</option>
              <option value="International experience">International experience</option>
              <option value="Teacher approval received">Teacher approval received</option>
            </select>
          </label>
        )}

        {level === "first timer" && (
          <div className="bg-yellow-accent/30 border-2 border-yellow-accent rounded-xl p-4">
            <div className="font-semibold">First timer note</div>
            <div className="text-sm text-text-dark/80">
              Tim will take first timers through the basics — they should not join Level 1.
            </div>
          </div>
        )}

        <label className="space-y-2">
          <div className="font-semibold">How did you find us? (optional)</div>
          <input
            value={howFoundUs}
            onChange={(e) => setHowFoundUs(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-text-dark/20 text-lg bg-white"
          />
        </label>

        <label className="flex items-start gap-3 bg-white/60 rounded-xl border border-text-dark/10 p-4">
          <input
            type="checkbox"
            checked={visitor}
            onChange={(e) => setVisitor(e.target.checked)}
            className="mt-1"
          />
          <div>
            <div className="font-semibold">Visitor (optional)</div>
            <div className="text-sm text-text-dark/70">
              Check if they are from out of town.
            </div>
          </div>
        </label>

        <div className="sticky bottom-0 bg-cloud-dancer pt-4">
          {error && (
            <div className="mb-3 bg-pink-accent/10 border border-pink-accent/40 rounded-xl p-4 text-text-dark">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className={
              "w-full py-4 rounded-xl font-spartan font-semibold text-xl border-2 transition-colors " +
              (saving
                ? "opacity-50 border-text-dark/20"
                : "border-pink-accent bg-pink-accent text-white hover:bg-pink-accent/90")
            }
          >
            {saving ? "Adding…" : "Add"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function CheckInClient({
  initialAuthed,
}: {
  initialAuthed: boolean;
}) {
  const [authed, setAuthed] = useState(initialAuthed);
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Member[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [step1Mode, setStep1Mode] = useState<"search" | "checkedIn">("search");
  const [checkedInLoading, setCheckedInLoading] = useState(false);
  const [checkedInError, setCheckedInError] = useState<string | null>(null);
  const [checkedInItems, setCheckedInItems] = useState<
    {
      member_id: number;
      full_name: string;
      type: string;
      paid_via: string;
      paid_amount: number;
      comment: string;
    }[]
  >([]);

  const [selected, setSelected] = useState<Member | null>(null);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [freeEntry, setFreeEntry] = useState<FreeEntryResponse | null>(null);
  const [freeEntryLoading, setFreeEntryLoading] = useState(false);

  const [costs, setCosts] = useState<CostsResponse | null>(null);
  const [costsError, setCostsError] = useState<string | null>(null);

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPaidVia, setSelectedPaidVia] = useState<"Cash" | "Yoco" | null>(
    null
  );

  // For special cases like Door Volunteer (custom payment)
  const [customAmount, setCustomAmount] = useState("0");
  const [customPaidVia, setCustomPaidVia] = useState<"Cash" | "Yoco" | null>(
    null
  );

  const [comment, setComment] = useState("");

  const [checkingIn, setCheckingIn] = useState(false);
  const [banner, setBanner] = useState<{ kind: "ok" | "error"; text: string } | null>(
    null
  );

  const [addModalOpen, setAddModalOpen] = useState(false);

  const [ignoreFreeEntry, setIgnoreFreeEntry] = useState(false);

  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideComment, setOverrideComment] = useState("");
  const [overrideError, setOverrideError] = useState<string | null>(null);
  const [overriding, setOverriding] = useState(false);

  const searchAbortRef = useRef<AbortController | null>(null);

  const typeOptions = useMemo(() => {
    const base = [...BASE_TYPES];
    const monthly = costs?.isFirstMonday ? [...MONTHLY_TYPES] : [];
    return [...base, ...monthly];
  }, [costs?.isFirstMonday]);

  const payableAmount = useMemo(() => {
    if (!selectedType) return 0;
    const amount = costs?.costs?.[selectedType];
    return typeof amount === "number" ? amount : 0;
  }, [costs, selectedType]);

  const effectiveFreeEntry = useMemo(() => {
    if (!freeEntry || ignoreFreeEntry) return null;
    return freeEntry;
  }, [freeEntry, ignoreFreeEntry]);

  const isDoorVolunteer = useMemo(() => {
    if (!effectiveFreeEntry?.applies) return false;
    return String(effectiveFreeEntry.entry_type)
      .toLowerCase()
      .includes("door volunteer");
  }, [effectiveFreeEntry]);

  const customAmountNumber = useMemo(() => {
    const n = Number(String(customAmount).trim());
    return Number.isFinite(n) ? n : NaN;
  }, [customAmount]);

  const checkinEnabled = useMemo(() => {
    if (!selected) return false;
    if (alreadyCheckedIn) return false;

    if (effectiveFreeEntry?.applies) {
      if (isDoorVolunteer) {
        if (!Number.isFinite(customAmountNumber)) return false;
        // paid_via optional if amount is 0
        return customAmountNumber === 0 ? true : Boolean(customPaidVia);
      }

      return true;
    }

    return Boolean(selectedType && selectedPaidVia);
  }, [
    alreadyCheckedIn,
    customAmountNumber,
    customPaidVia,
    effectiveFreeEntry,
    isDoorVolunteer,
    selected,
    selectedPaidVia,
    selectedType,
  ]);

  useEffect(() => {
    if (!authed) return;

    let cancelled = false;

    (async () => {
      setCostsError(null);
      try {
        const res = await fetchJson<CostsResponse>("/api/check-in/costs");
        if (cancelled) return;
        setCosts(res);
      } catch (e) {
        if (cancelled) return;
        setCostsError(e instanceof Error ? e.message : "Failed to load costs");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authed]);

  // Search members
  useEffect(() => {
    if (!authed) return;
    if (selected) return; // when a person is selected, keep list stable
    if (step1Mode !== "search") return;

    const q = search.trim();
    if (q.length < 3) {
      setResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    const handle = window.setTimeout(async () => {
      try {
        searchAbortRef.current?.abort();
        const ac = new AbortController();
        searchAbortRef.current = ac;

        const res = await fetchJson<{ results: Member[] }>(
          `/api/check-in/members?q=${encodeURIComponent(q)}`,
          { signal: ac.signal }
        );

        setResults(res.results);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 200);

    return () => window.clearTimeout(handle);
  }, [authed, search, selected, step1Mode]);

  async function selectMember(member: Member) {
    setSelected(member);
    setAlreadyCheckedIn(false);
    setSearch("");
    setResults([]);

    setSelectedType(null);
    setSelectedPaidVia(null);
    setCustomAmount("0");
    setCustomPaidVia(null);
    setComment("");

    setIgnoreFreeEntry(false);
    setFreeEntry(null);
    setFreeEntryLoading(true);

    try {
      const [freeEntryRes, checkedRes] = await Promise.all([
        fetchJson<FreeEntryResponse>(
          `/api/check-in/free-entry?member_id=${member.member_id}`
        ).catch(() => ({ applies: false, today: costs?.today ?? "" } as const)),
        fetchJson<{ alreadyCheckedIn: boolean }>(
          `/api/check-in/already-checked-in?member_id=${member.member_id}`
        ).catch(() => ({ alreadyCheckedIn: false })),
      ]);

      setFreeEntry(freeEntryRes);
      setAlreadyCheckedIn(Boolean(checkedRes.alreadyCheckedIn));
    } finally {
      setFreeEntryLoading(false);
    }
  }

  function resetToSearch() {
    setSelected(null);
    setAlreadyCheckedIn(false);
    setFreeEntry(null);
    setSelectedType(null);
    setSelectedPaidVia(null);
    setCustomAmount("0");
    setCustomPaidVia(null);
    setComment("");
    setIgnoreFreeEntry(false);
    setBanner(null);
    setSearch("");
    setResults([]);

    setStep1Mode("search");
    setCheckedInLoading(false);
    setCheckedInError(null);
    setCheckedInItems([]);

    setOverrideOpen(false);
    setOverrideComment("");
    setOverrideError(null);
    setOverriding(false);
  }

  async function doCheckIn() {
    if (!selected || !checkinEnabled) return;

    setBanner(null);
    setCheckingIn(true);
    try {
      const payload = effectiveFreeEntry?.applies
        ? isDoorVolunteer
          ? {
              member_id: selected.member_id,
              type: "Custom",
              paid_via: customPaidVia ?? "",
              paid_amount: Number.isFinite(customAmountNumber)
                ? customAmountNumber
                : 0,
              comment: comment.trim(),
              free_entry_reason: effectiveFreeEntry.reason ?? "",
            }
          : {
              member_id: selected.member_id,
              type: effectiveFreeEntry.entry_type || "Free Entry",
              paid_via: "",
              paid_amount: 0,
              comment: comment.trim(),
              free_entry_reason: effectiveFreeEntry.reason ?? "",
            }
        : {
            member_id: selected.member_id,
            type: selectedType,
            paid_via: selectedPaidVia,
            paid_amount: payableAmount,
            comment: comment.trim(),
            free_entry_reason: "",
          };

      await fetchJson<{ ok: true }>("/api/check-in/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setBanner({ kind: "ok", text: "Checked in successfully." });
      window.setTimeout(() => resetToSearch(), 900);
    } catch (e) {
      setBanner({
        kind: "error",
        text: e instanceof Error ? e.message : "Failed to check in",
      });
    } finally {
      setCheckingIn(false);
    }
  }

  async function submitPasscode() {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await fetchJson<{ ok: true }>("/api/check-in/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      setAuthed(true);
      setPasscode("");
      setShowPasscode(false);
    } catch {
      setAuthError("Incorrect passcode.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function doOverrideCheckIn() {
    if (!selected) return;

    setOverrideError(null);
    const comment = overrideComment.trim();
    if (!comment) {
      setOverrideError("Comment is required for an override check-in.");
      return;
    }

    setOverriding(true);
    try {
      await fetchJson<{ ok: true }>("/api/check-in/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: selected.member_id,
          type: "Override",
          paid_via: "Override",
          paid_amount: 0,
          comment,
        }),
      });

      setBanner({ kind: "ok", text: "Checked in successfully (override)." });
      setOverrideOpen(false);
      setOverrideComment("");
      window.setTimeout(() => resetToSearch(), 900);
    } catch (e) {
      setOverrideError(e instanceof Error ? e.message : "Override failed");
    } finally {
      setOverriding(false);
    }
  }

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-[5%] py-10">
        <div className="w-full max-w-[520px] bg-white/70 border border-text-dark/10 rounded-2xl p-6 shadow-lg">
          <h1 className="font-spartan font-semibold text-2xl mb-2">Check-in</h1>
          <p className="text-text-dark/70 mb-6">
            Enter the passcode to access the welcoming committee check-in.
          </p>

          <label className="space-y-2 block mb-4">
            <div className="font-semibold">Passcode</div>
            <input
              type={showPasscode ? "text" : "password"}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-text-dark/20 text-lg"
            />
          </label>

          <label className="flex items-center gap-3 mb-4 text-text-dark/80">
            <input
              type="checkbox"
              checked={showPasscode}
              onChange={(e) => setShowPasscode(e.target.checked)}
            />
            Show passcode
          </label>

          {authError && (
            <div className="mb-4 bg-pink-accent/10 border border-pink-accent/40 rounded-xl p-4">
              {authError}
            </div>
          )}

          <button
            type="button"
            onClick={submitPasscode}
            disabled={authLoading || !passcode}
            className={
              "w-full py-4 rounded-xl font-spartan font-semibold text-xl border-2 transition-colors " +
              (authLoading || !passcode
                ? "opacity-50 border-text-dark/20"
                : "border-pink-accent bg-pink-accent text-white hover:bg-pink-accent/90")
            }
          >
            {authLoading ? "Checking…" : "Enter"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-[5%] py-5">
      <div className="max-w-[980px] mx-auto">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="font-spartan font-semibold text-3xl">Welcoming committee check-in</h1>
            <div className="text-text-dark/70">
              {costs?.today ? `Today (Cape Town): ${costs.today}` : ""}
            </div>
          </div>

          {selected && (
            <button
              type="button"
              onClick={resetToSearch}
              className="px-4 py-3 rounded-xl border-2 border-text-dark/20 bg-white text-text-dark font-semibold"
            >
              New person
            </button>
          )}
        </div>

        {banner && (
          <div
            className={
              "mb-4 rounded-xl p-4 border " +
              (banner.kind === "ok"
                ? "bg-yellow-accent/20 border-yellow-accent"
                : "bg-pink-accent/10 border-pink-accent/40")
            }
          >
            <div className="font-semibold">{banner.text}</div>
          </div>
        )}

        {!selected && (
          <div className="bg-white/60 rounded-2xl border border-text-dark/10 p-5 mb-4">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
              <div className="flex gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setStep1Mode("search")}
                  className={
                    "px-4 py-3 rounded-xl border-2 font-semibold " +
                    (step1Mode === "search"
                      ? "border-pink-accent bg-pink-accent/10"
                      : "border-text-dark/20 bg-white")
                  }
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setStep1Mode("checkedIn");
                    setCheckedInError(null);
                    setCheckedInLoading(true);
                    try {
                      const res = await fetchJson<{
                        items: {
                          member_id: number;
                          full_name: string;
                          type: string;
                          paid_via: string;
                          paid_amount: number;
                          comment: string;
                        }[];
                      }>("/api/check-in/checked-in-today");
                      setCheckedInItems(res.items);
                    } catch (e) {
                      setCheckedInError(
                        e instanceof Error ? e.message : "Failed to load"
                      );
                      setCheckedInItems([]);
                    } finally {
                      setCheckedInLoading(false);
                    }
                  }}
                  className={
                    "px-4 py-3 rounded-xl border-2 font-semibold " +
                    (step1Mode === "checkedIn"
                      ? "border-pink-accent bg-pink-accent/10"
                      : "border-text-dark/20 bg-white")
                  }
                >
                  Checked in tonight
                </button>
              </div>

              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="px-5 py-4 rounded-xl border-2 border-purple-accent bg-purple-accent text-white font-spartan font-semibold text-lg"
              >
                Add new person
              </button>
            </div>

            {step1Mode === "search" && (
              <>
                <div className="min-w-[260px] flex-1">
                  <div className="font-semibold mb-2">Step 1 — Search person</div>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Type a name…"
                    className="w-full px-4 py-4 rounded-xl border-2 border-text-dark/20 text-xl bg-white"
                    autoCapitalize="words"
                  />
                  <div className="text-sm text-text-dark/70 mt-2">
                    After 3 letters, you will see matches.
                  </div>
                </div>

                {(searchLoading || results.length > 0) && (
                  <div className="mt-4">
                    <div className="font-semibold mb-2">
                      {searchLoading ? "Searching…" : "Select a person"}
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {results.map((m) => (
                        <PillButton
                          key={m.member_id}
                          onClick={() => selectMember(m)}
                        >
                          {m.full_name}
                        </PillButton>
                      ))}
                      {!searchLoading &&
                        results.length === 0 &&
                        search.trim().length >= 3 && (
                          <div className="text-text-dark/70">
                            No matches. Use “Add new person”.
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </>
            )}

            {step1Mode === "checkedIn" && (
              <div>
                <div className="font-semibold mb-2">Checked in tonight</div>

                {checkedInLoading && (
                  <div className="text-text-dark/70">Loading…</div>
                )}

                {checkedInError && (
                  <div className="mb-3 bg-pink-accent/10 border border-pink-accent/40 rounded-xl p-4">
                    {checkedInError}
                  </div>
                )}

                {!checkedInLoading && !checkedInError && checkedInItems.length === 0 && (
                  <div className="text-text-dark/70">No one checked in yet.</div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  {checkedInItems.map((i) => {
                    const typeLower = (i.type ?? "").toLowerCase();
                    const rowClass =
                      "bg-white rounded-xl border p-3 " +
                      (typeLower.includes("monthly")
                        ? "border-blue-500/40 bg-blue-500/5"
                        : typeLower.includes("teacher") || typeLower.includes("teach")
                          ? "border-purple-accent/40 bg-purple-accent/5"
                          : typeLower.includes("custom")
                            ? "border-orange-500/40 bg-orange-500/5"
                            : typeLower.includes("override")
                              ? "border-pink-accent/40 bg-pink-accent/5"
                              : typeLower.includes("free")
                                ? "border-yellow-accent bg-yellow-accent/10"
                                : "border-text-dark/10");

                    return (
                      <div key={`${i.member_id}-${i.full_name}`} className={rowClass}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-semibold truncate">{i.full_name}</div>
                          <div className="text-sm text-text-dark/70 whitespace-nowrap">
                            <span className="font-semibold">{i.type}</span>
                            {i.paid_amount > 0 ? ` • ${formatZar(i.paid_amount)}` : ""}
                            {i.paid_via ? ` • ${i.paid_via}` : ""}
                          </div>
                        </div>
                        {i.comment && (
                          <div className="text-xs text-text-dark/60 mt-1 truncate">
                            Note: {i.comment}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {selected && (
          <div className="bg-white/60 rounded-2xl border border-text-dark/10 p-5 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-text-dark/70 text-sm">Selected</div>
                <div className="font-spartan font-semibold text-3xl">
                  {selected.full_name}
                </div>
                {selected.level && (
                  <div className="text-text-dark/70 mt-1">{selected.level}</div>
                )}
                <div className="text-text-dark/70">
                  Role: {formatRole(selected.role)}
                </div>

                {alreadyCheckedIn && (
                  <div className="mt-3 bg-pink-accent/10 border border-pink-accent/40 rounded-xl px-4 py-3 font-semibold">
                    Member already checked in
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setFreeEntry(null);
                  setSelectedType(null);
                  setSelectedPaidVia(null);
                }}
                className="px-4 py-3 rounded-xl border-2 border-text-dark/20 bg-white text-text-dark font-semibold"
              >
                Change
              </button>
            </div>

            {selected.level === "First timer" && (
              <div className="mt-4 bg-yellow-accent/30 border-2 border-yellow-accent rounded-xl p-4">
                <div className="font-semibold">First timer</div>
                <div className="text-text-dark/80">
                  Tim will take first timers through the basics — they should not join Level 1.
                </div>
              </div>
            )}
          </div>
        )}

        {selected && (
          <div className="bg-white/60 rounded-2xl border border-text-dark/10 p-5">
            <div className="font-semibold mb-2">Step 2 — Entry rules & payment</div>

            {freeEntryLoading && <div className="text-text-dark/70">Checking free entry…</div>}

            {!freeEntryLoading && effectiveFreeEntry?.applies && (
              <>
                {isDoorVolunteer ? (
                  <div className="rounded-xl p-4 mb-4 border bg-orange-500/10 border-orange-500/40">
                    <div>
                      <div className="font-semibold text-lg">
                        Welcoming committee, custom payment
                      </div>
                      <div className="mt-2 text-text-dark/80">
                        Please ask Monique or Mercia to do this check in.
                      </div>
                    </div>

                    <div className="mt-4 bg-white rounded-xl border border-text-dark/10 p-4">
                      <label className="block space-y-2">
                        <div className="font-semibold">Custom amount</div>
                        <input
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          inputMode="decimal"
                          className="w-full px-4 py-3 rounded-xl border-2 border-text-dark/20 text-lg bg-white"
                        />
                      </label>

                      <div className="mt-4">
                        <div className="font-semibold mb-2">Payment method (optional if R0)</div>
                        <div className="flex gap-3 flex-wrap">
                          <PillButton
                            selected={customPaidVia === "Cash"}
                            onClick={() =>
                              setCustomPaidVia((v) => (v === "Cash" ? null : "Cash"))
                            }
                          >
                            Cash
                          </PillButton>
                          <PillButton
                            selected={customPaidVia === "Yoco"}
                            onClick={() =>
                              setCustomPaidVia((v) => (v === "Yoco" ? null : "Yoco"))
                            }
                          >
                            Yoco
                          </PillButton>
                        </div>
                      </div>

                      <label className="block mt-4 space-y-2">
                        <div className="font-semibold">Comment (optional)</div>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border-2 border-text-dark/20 text-lg bg-white"
                          rows={2}
                          placeholder="Add a note for the team…"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div
                    className={
                      "rounded-xl p-4 mb-4 border " +
                      (String(effectiveFreeEntry.entry_type).toLowerCase().includes("monthly")
                        ? "bg-blue-500/10 border-blue-500/40"
                        : String(effectiveFreeEntry.entry_type).toLowerCase().includes("teach")
                          ? "bg-purple-accent/10 border-purple-accent/40"
                          : "bg-yellow-accent/20 border-yellow-accent")
                    }
                  >
                    <div className="font-semibold text-lg">
                      {String(effectiveFreeEntry.entry_type)
                        .toLowerCase()
                        .includes("monthly")
                        ? "Paid for month"
                        : String(effectiveFreeEntry.entry_type)
                            .toLowerCase()
                            .includes("teach")
                          ? "Teacher"
                          : "Free entry"}
                    </div>
                    {effectiveFreeEntry.details && (
                      <div className="mt-2 text-text-dark/80">
                        {effectiveFreeEntry.details}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {!freeEntryLoading && freeEntry && (!freeEntry.applies || ignoreFreeEntry) && (
              <>
                {ignoreFreeEntry && freeEntry?.applies && (
                  <div className="mb-3 text-sm text-text-dark/70">
                    Free entry ignored — use paid entry instead.
                    <button
                      type="button"
                      onClick={() => setIgnoreFreeEntry(false)}
                      className="ml-2 underline font-semibold"
                    >
                      Use free entry
                    </button>
                  </div>
                )}

                <div className="text-text-dark/70 mb-3">
                  Choose entry type and payment.
                </div>

                {selected && normalizePensionerStudent(selected.pensionerStudent) && (
                  <div
                    className={
                      "mb-4 rounded-xl p-4 border font-semibold " +
                      (normalizePensionerStudent(selected.pensionerStudent) === "pensioner"
                        ? "bg-blue-500/10 border-blue-500/40"
                        : "bg-purple-accent/10 border-purple-accent/40")
                    }
                  >
                    Member record: {normalizePensionerStudent(selected.pensionerStudent)}
                  </div>
                )}

                {costsError && (
                  <div className="mb-4 bg-pink-accent/10 border border-pink-accent/40 rounded-xl p-4">
                    Could not load costs ({costsError}).
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {typeOptions.map((t) => (
                    <PillButton
                      key={t}
                      selected={selectedType === t}
                      onClick={() => {
                        setSelectedType(t);
                        setSelectedPaidVia(null);
                      }}
                      disabled={!costs}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>{t}</div>
                        <div className="font-semibold text-text-dark/70">
                          {costs ? formatZar(costs.costs?.[t] ?? 0) : ""}
                        </div>
                      </div>
                    </PillButton>
                  ))}
                </div>

                {selectedType && (
                  <div className="bg-white rounded-xl border border-text-dark/10 p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <div className="text-text-dark/70 text-sm">Amount</div>
                        <div className="font-spartan font-semibold text-3xl">
                          {formatZar(payableAmount)}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <PillButton
                          selected={selectedPaidVia === "Cash"}
                          onClick={() => setSelectedPaidVia("Cash")}
                        >
                          Cash
                        </PillButton>
                        <PillButton
                          selected={selectedPaidVia === "Yoco"}
                          onClick={() => setSelectedPaidVia("Yoco")}
                        >
                          Yoco
                        </PillButton>
                      </div>
                    </div>

                    <label className="block mt-4 space-y-2">
                      <div className="font-semibold">Comment (optional)</div>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-text-dark/20 text-lg bg-white"
                        rows={2}
                        placeholder="Add a note for the team…"
                      />
                    </label>
                  </div>
                )}
              </>
            )}

            <div className="mt-5">
              {effectiveFreeEntry?.applies && !isDoorVolunteer && (
                <label className="block mb-4 space-y-2">
                  <div className="font-semibold">Comment (optional)</div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-text-dark/20 text-lg bg-white"
                    rows={2}
                    placeholder="Add a note for the team…"
                  />
                </label>
              )}

              <button
                type="button"
                onClick={doCheckIn}
                disabled={!checkinEnabled || checkingIn || freeEntryLoading}
                className={
                  "w-full py-5 rounded-2xl font-spartan font-semibold text-2xl border-2 transition-colors " +
                  (!checkinEnabled || checkingIn || freeEntryLoading
                    ? "opacity-40 border-text-dark/20"
                    : "border-yellow-accent bg-yellow-accent text-text-dark hover:bg-yellow-accent/90")
                }
              >
                {checkingIn ? "Checking in…" : "Check in"}
              </button>

              {effectiveFreeEntry?.applies && (
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIgnoreFreeEntry(true)}
                    className="text-sm underline text-text-dark/70 hover:text-text-dark font-semibold"
                  >
                    This is not correct
                  </button>
                </div>
              )}

              <div className="text-sm text-text-dark/70 mt-2">
                {alreadyCheckedIn
                  ? "Member already checked in."
                  : effectiveFreeEntry?.applies
                    ? isDoorVolunteer
                      ? "Enter a custom amount. Select Cash/Yoco if needed (optional for R0)."
                      : String(effectiveFreeEntry.entry_type)
                            .toLowerCase()
                            .includes("monthly")
                        ? "You can check them in without payment."
                        : "If the details above are correct, you can check them in now."
                    : "Once payment is made, select Cash or Yoco to enable check-in."}
              </div>

              {!checkinEnabled && !freeEntryLoading && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setOverrideError(null);
                      setOverrideOpen((v) => !v);
                    }}
                    className="w-full md:w-auto px-6 py-4 rounded-2xl font-spartan font-semibold text-xl border-2 border-pink-accent bg-white text-text-dark"
                  >
                    {overrideOpen ? "Close override" : "Override check-in"}
                  </button>
                  <div className="text-xs text-text-dark/70 mt-2">
                    Use only if something goes wrong. A comment is required.
                  </div>

                  {overrideOpen && (
                    <div className="mt-3 bg-white rounded-2xl border border-text-dark/10 p-4 max-w-[640px]">
                      <div className="font-spartan font-semibold text-lg mb-2">
                        Override check-in
                      </div>
                      <div className="text-text-dark/70 text-sm mb-3">
                        This will log an override check-in for{" "}
                        <span className="font-semibold">
                          {selected?.full_name ?? ""}
                        </span>
                        . Please explain why.
                      </div>

                      <label className="space-y-2 block mb-3">
                        <div className="font-semibold">Comment (required)</div>
                        <textarea
                          value={overrideComment}
                          onChange={(e) => setOverrideComment(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border-2 border-text-dark/20 text-lg bg-white"
                          rows={3}
                        />
                      </label>

                      {overrideError && (
                        <div className="mb-3 bg-pink-accent/10 border border-pink-accent/40 rounded-xl p-4 text-text-dark">
                          {overrideError}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={doOverrideCheckIn}
                        disabled={overriding}
                        className={
                          "w-full md:w-auto px-6 py-4 rounded-xl font-spartan font-semibold text-lg border-2 transition-colors " +
                          (overriding
                            ? "opacity-50 border-text-dark/20"
                            : "border-pink-accent bg-pink-accent text-white hover:bg-pink-accent/90")
                        }
                      >
                        {overriding ? "Submitting…" : "Confirm override"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <AddNewPersonForm
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onCreated={(m) => selectMember(m)}
        />
      </div>
    </main>
  );
}
