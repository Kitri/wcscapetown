"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";

type Registration = {
  name: string;
  surname: string;
  level: number;
  role: string;
  registration_type: string;
  registration_status: string;
  price_tier: string;
  pass_type: string;
};

type RoleBalanceItem = {
  level: number;
  role: string;
  count: string;
};

type SortKey = keyof Registration;
type SortDirection = "asc" | "desc";

export default function AdminClient({ initialAuthed }: { initialAuthed: boolean }) {
  const [authed, setAuthed] = useState(initialAuthed);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [roleBalance, setRoleBalance] = useState<RoleBalanceItem[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Fetch data when authed
  useEffect(() => {
    if (authed) {
      fetchData();
    }
  }, [authed]);

  const fetchData = async () => {
    setDataLoading(true);
    setDataError("");

    try {
      const [regRes, balanceRes] = await Promise.all([
        fetch("/api/admin/weekender-registrations"),
        fetch("/api/admin/role-balance"),
      ]);

      if (!regRes.ok || !balanceRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const regData = await regRes.json();
      const balanceData = await balanceRes.json();

      setRegistrations(regData.registrations || []);
      setRoleBalance(balanceData.roleBalance || []);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const res = await fetch("/api/check-in/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });

      if (!res.ok) {
        throw new Error("Invalid passcode");
      }

      setAuthed(true);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedRegistrations = useMemo(() => {
    return [...registrations].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [registrations, sortKey, sortDirection]);

  // Calculate role balance by level
  const roleBalanceByLevel = useMemo(() => {
    const level1 = { lead: 0, follow: 0 };
    const level2 = { lead: 0, follow: 0 };

    roleBalance.forEach((item) => {
      const count = parseInt(item.count, 10) || 0;
      if (item.level === 1) {
        if (item.role === "Lead") level1.lead = count;
        else level1.follow = count;
      } else if (item.level === 2) {
        if (item.role === "Lead") level2.lead = count;
        else level2.follow = count;
      }
    });

    return { level1, level2 };
  }, [roleBalance]);

  const formatRole = (role: string) => {
    if (role === "L") return "Lead";
    if (role === "F") return "Follow";
    return role;
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <th
      className="px-3 py-2 text-left text-xs font-semibold text-text-dark/70 cursor-pointer hover:text-text-dark select-none"
      onClick={() => handleSort(sortKeyName)}
    >
      {label}
      {sortKey === sortKeyName && (
        <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
      )}
    </th>
  );

  const RoleBalanceBar = ({
    label,
    lead,
    follow,
  }: {
    label: string;
    lead: number;
    follow: number;
  }) => {
    const total = lead + follow;
    if (total === 0) return null;

    const leadPercent = (lead / total) * 100;
    const followPercent = (follow / total) * 100;

    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-semibold">{label}</span>
          <span className="text-text-dark/60">Total: {total}</span>
        </div>
        <div className="flex h-8 rounded-lg overflow-hidden border border-text-dark/10">
          <div
            className="bg-blue-500 flex items-center justify-center text-white text-xs font-semibold"
            style={{ width: `${leadPercent}%` }}
          >
            {lead > 0 && `Lead: ${lead}`}
          </div>
          <div
            className="bg-pink-accent flex items-center justify-center text-white text-xs font-semibold"
            style={{ width: `${followPercent}%` }}
          >
            {follow > 0 && `Follow: ${follow}`}
          </div>
        </div>
        <div className="flex justify-between text-xs text-text-dark/60 mt-1">
          <span>{leadPercent.toFixed(0)}% Lead</span>
          <span>{followPercent.toFixed(0)}% Follow</span>
        </div>
      </div>
    );
  };

  // Login screen
  if (!authed) {
    return (
      <main className="min-h-screen bg-cloud-dancer flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/WCS_Logo_Portrait.png"
              alt="WCS Cape Town"
              width={120}
              height={120}
            />
          </div>
          <h1 className="font-spartan font-semibold text-2xl text-center mb-6">
            Admin Portal
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">
                Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                placeholder="Enter passcode"
                required
              />
            </div>

            {authError && (
              <p className="text-red-600 text-sm">{authError}</p>
            )}

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

  // Admin dashboard
  return (
    <main className="min-h-screen bg-cloud-dancer">
      {/* Header */}
      <header className="bg-black text-white py-4">
        <div className="px-[5%] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/images/WCS_Logo_Portrait.png"
              alt="WCS Cape Town"
              width={40}
              height={40}
            />
            <h1 className="font-spartan font-semibold text-xl">Admin Portal</h1>
          </div>
          <Link
            href="/check-in"
            className="text-sm text-white/80 hover:text-white underline"
          >
            → Check-in Portal
          </Link>
        </div>
      </header>

      <div className="px-[5%] py-8">
        {dataError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {dataError}
          </div>
        )}

        {/* Role Balance Section */}
        <section className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h2 className="font-spartan font-semibold text-xl mb-4">
            Role Balance (Completed Registrations)
          </h2>

          {dataLoading ? (
            <p className="text-text-dark/60">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RoleBalanceBar
                label="Level 1"
                lead={roleBalanceByLevel.level1.lead}
                follow={roleBalanceByLevel.level1.follow}
              />
              <RoleBalanceBar
                label="Level 2"
                lead={roleBalanceByLevel.level2.lead}
                follow={roleBalanceByLevel.level2.follow}
              />
            </div>
          )}
        </section>

        {/* Registrations Table */}
        <section className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-spartan font-semibold text-xl">
              Weekender Registrations
            </h2>
            <button
              onClick={fetchData}
              disabled={dataLoading}
              className="text-sm text-pink-accent hover:text-yellow-accent underline disabled:opacity-50"
            >
              {dataLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {dataLoading ? (
            <p className="text-text-dark/60">Loading...</p>
          ) : registrations.length === 0 ? (
            <p className="text-text-dark/60">No registrations yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-cloud-dancer">
                  <tr>
                    <SortHeader label="Name" sortKeyName="name" />
                    <SortHeader label="Surname" sortKeyName="surname" />
                    <SortHeader label="Level" sortKeyName="level" />
                    <SortHeader label="Role" sortKeyName="role" />
                    <SortHeader label="Type" sortKeyName="registration_type" />
                    <SortHeader label="Status" sortKeyName="registration_status" />
                    <SortHeader label="Tier" sortKeyName="price_tier" />
                    <SortHeader label="Pass" sortKeyName="pass_type" />
                  </tr>
                </thead>
                <tbody>
                  {sortedRegistrations.map((reg, idx) => (
                    <tr
                      key={idx}
                      className="border-t border-text-dark/10 hover:bg-cloud-dancer/50"
                    >
                      <td className="px-3 py-2">{reg.name}</td>
                      <td className="px-3 py-2">{reg.surname}</td>
                      <td className="px-3 py-2">{reg.level}</td>
                      <td className="px-3 py-2">{formatRole(reg.role)}</td>
                      <td className="px-3 py-2 capitalize">{reg.registration_type}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            reg.registration_status === "complete"
                              ? "bg-green-100 text-green-700"
                              : reg.registration_status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {formatStatus(reg.registration_status)}
                        </span>
                      </td>
                      <td className="px-3 py-2">{reg.price_tier}</td>
                      <td className="px-3 py-2">{reg.pass_type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-text-dark/60 mt-3">
                Total: {registrations.length} registration(s)
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
