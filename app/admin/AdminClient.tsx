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
  created_at: string;
  workshop_day: string | null;
  party_add_on: boolean | null;
};

type BootcampRegistration = {
  name: string;
  surname: string;
  bootcamp_type: string;
  role: string;
  registration_type: string;
  registration_status: string;
  created_at: string;
};

type RoleBalanceItem = {
  level: number;
  role: string;
  count: string;
};

type AggregateByDayItem = {
  day: string;
  level: number;
  role: string;
  count: number;
};

type NonCompleteItem = {
  registration_status: string;
  level: number;
  role: string;
  pass_type: string;
  count: string | number;
};

type PricingTierItem = {
  pass_type: string;
  price_tier: string;
  registration_status: string;
  count: string | number;
};

type SortKey = keyof Registration;
type BootcampSortKey = keyof BootcampRegistration;
type SortDirection = "asc" | "desc";
type ActiveTab = "weekender" | "bootcamp";

export default function AdminClient({ initialAuthed }: { initialAuthed: boolean }) {
  const [authed, setAuthed] = useState(initialAuthed);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [bootcampRegistrations, setBootcampRegistrations] = useState<BootcampRegistration[]>([]);
  const [roleBalance, setRoleBalance] = useState<RoleBalanceItem[]>([]);
  const [aggregateByDay, setAggregateByDay] = useState<AggregateByDayItem[]>([]);
  const [nonComplete, setNonComplete] = useState<NonCompleteItem[]>([]);
  const [pricingTiers, setPricingTiers] = useState<PricingTierItem[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");
  

  const [activeTab, setActiveTab] = useState<ActiveTab>("weekender");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [bootcampSortKey, setBootcampSortKey] = useState<BootcampSortKey>("created_at");
  const [bootcampSortDirection, setBootcampSortDirection] = useState<SortDirection>("desc");
  
  // Collapsible sections state
  const [showAnalytics, setShowAnalytics] = useState(true);

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
      const [regRes, balanceRes, dayRes, bootcampRes, nonCompleteRes, tiersRes] = await Promise.all([
        fetch("/api/admin/weekender-registrations"),
        fetch("/api/admin/role-balance"),
        fetch("/api/admin/aggregate-by-day"),
        fetch("/api/admin/bootcamp-registrations"),
        fetch("/api/admin/non-complete-breakdown"),
        fetch("/api/admin/pricing-tiers"),
      ]);

      if (!regRes.ok || !balanceRes.ok || !dayRes.ok || !bootcampRes.ok || !nonCompleteRes.ok || !tiersRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const regData = await regRes.json();
      const balanceData = await balanceRes.json();
      const dayData = await dayRes.json();
      const bootcampData = await bootcampRes.json();
      const nonCompleteData = await nonCompleteRes.json();
      const tiersData = await tiersRes.json();

      setRegistrations(regData.registrations || []);
      setRoleBalance(balanceData.roleBalance || []);
      setAggregateByDay(dayData.aggregateByDay || []);
      setBootcampRegistrations(bootcampData.registrations || []);
      setNonComplete(nonCompleteData.breakdown || []);
      setPricingTiers(tiersData.tiers || []);
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

  const handleBootcampSort = (key: BootcampSortKey) => {
    if (bootcampSortKey === key) {
      setBootcampSortDirection(bootcampSortDirection === "asc" ? "desc" : "asc");
    } else {
      setBootcampSortKey(key);
      setBootcampSortDirection("asc");
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

  const sortedBootcampRegistrations = useMemo(() => {
    return [...bootcampRegistrations].sort((a, b) => {
      const aVal = a[bootcampSortKey];
      const bVal = b[bootcampSortKey];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return bootcampSortDirection === "asc" ? comparison : -comparison;
    });
  }, [bootcampRegistrations, bootcampSortKey, bootcampSortDirection]);

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

  // Calculate waitlist status - which roles are on waitlist and how many opposite roles needed
  const waitlistStatus = useMemo(() => {
    const { level1, level2 } = roleBalanceByLevel;
    const statuses: { level: number; roleOnWaitlist: string; needed: number; neededRole: string }[] = [];

    // Level 1 - check if imbalanced
    const l1Diff = level1.lead - level1.follow;
    if (l1Diff > 0) {
      // More leads than follows - follows can join, leads waitlisted
      statuses.push({ level: 1, roleOnWaitlist: "Lead", needed: l1Diff, neededRole: "Follow" });
    } else if (l1Diff < 0) {
      // More follows than leads - leads can join, follows waitlisted
      statuses.push({ level: 1, roleOnWaitlist: "Follow", needed: Math.abs(l1Diff), neededRole: "Lead" });
    }

    // Level 2 - check if imbalanced
    const l2Diff = level2.lead - level2.follow;
    if (l2Diff > 0) {
      statuses.push({ level: 2, roleOnWaitlist: "Lead", needed: l2Diff, neededRole: "Follow" });
    } else if (l2Diff < 0) {
      statuses.push({ level: 2, roleOnWaitlist: "Follow", needed: Math.abs(l2Diff), neededRole: "Lead" });
    }

    return statuses;
  }, [roleBalanceByLevel]);

  // Calculate per-day role balance
  const roleBalanceByDay = useMemo(() => {
    const saturday = { level1: { lead: 0, follow: 0 }, level2: { lead: 0, follow: 0 } };
    const sunday = { level1: { lead: 0, follow: 0 }, level2: { lead: 0, follow: 0 } };

    aggregateByDay.forEach((item) => {
      const dayData = item.day === "Saturday" ? saturday : sunday;
      const levelData = item.level === 1 ? dayData.level1 : dayData.level2;
      const count = typeof item.count === 'string' ? parseInt(item.count, 10) : item.count;
      if (item.role === "L") {
        levelData.lead += count;
      } else {
        levelData.follow += count;
      }
    });

    return { saturday, sunday };
  }, [aggregateByDay]);

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

  const BootcampSortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: BootcampSortKey }) => (
    <th
      className="px-3 py-2 text-left text-xs font-semibold text-text-dark/70 cursor-pointer hover:text-text-dark select-none"
      onClick={() => handleBootcampSort(sortKeyName)}
    >
      {label}
      {bootcampSortKey === sortKeyName && (
        <span className="ml-1">{bootcampSortDirection === "asc" ? "↑" : "↓"}</span>
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
            className="bg-purple-accent flex items-center justify-center text-white text-xs font-semibold"
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

  // Compact bar for per-day balance
  const CompactBalanceBar = ({ label, lead, follow }: { label: string; lead: number; follow: number }) => {
    const total = lead + follow;
    if (total === 0) return <div className="text-xs text-text-dark/40">{label}: No data</div>;
    const leadPercent = (lead / total) * 100;
    return (
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-0.5">
          <span className="font-medium">{label}</span>
          <span className="text-text-dark/50">{lead}L / {follow}F</span>
        </div>
        <div className="flex h-4 rounded overflow-hidden border border-text-dark/10">
          <div className="bg-purple-accent" style={{ width: `${leadPercent}%` }} />
          <div className="bg-pink-accent flex-1" />
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
              src="/images/WCS CT Logo white.png"
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
              src="/images/WCS CT Logo white.png"
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

        {/* Analytics Toggle Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center gap-2 text-sm font-semibold text-text-dark hover:text-pink-accent transition-colors"
          >
            <span>{showAnalytics ? '▼' : '▶'}</span>
            <span>{showAnalytics ? 'Hide' : 'Show'} Analytics</span>
          </button>
        </div>

        {showAnalytics && (
          <>
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

        {/* Pricing Tiers Section */}
        <section className="bg-white rounded-xl p-4 shadow-sm mb-8">
          <h2 className="font-spartan font-semibold text-base mb-3">
            Pricing Tiers
          </h2>

          {dataLoading ? (
            <p className="text-text-dark/60 text-xs">Loading...</p>
          ) : pricingTiers.length === 0 ? (
            <p className="text-text-dark/60 text-xs">No pricing data available.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['weekend', 'day', 'party', 'bootcamp'].map(passType => {
                const passData = pricingTiers.filter(t => t.pass_type === passType);
                if (passData.length === 0) return null;
                const total = passData.reduce((sum, t) => sum + Number(t.count), 0);
                
                return (
                  <div key={passType} className="border border-text-dark/10 rounded-lg p-3 bg-cloud-dancer/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-xs uppercase text-text-dark">{passType}</span>
                      <span className="text-xs font-bold text-pink-accent">{total}</span>
                    </div>
                    <div className="space-y-1">
                      {passData.map((tier, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-text-dark/70">
                          <span className="uppercase text-[10px]">{tier.price_tier}</span>
                          <span className="font-semibold text-text-dark">{tier.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Per-Day Balance & Waitlist Status Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Level 1 */}
          <section className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-spartan font-semibold text-sm mb-2">Level 1</h2>
            {dataLoading ? (
              <p className="text-text-dark/60 text-xs">Loading...</p>
            ) : (
              <>
                <CompactBalanceBar label="Saturday" lead={roleBalanceByDay.saturday.level1.lead} follow={roleBalanceByDay.saturday.level1.follow} />
                <CompactBalanceBar label="Sunday" lead={roleBalanceByDay.sunday.level1.lead} follow={roleBalanceByDay.sunday.level1.follow} />
              </>
            )}
          </section>

          {/* Level 2 */}
          <section className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-spartan font-semibold text-sm mb-2">Level 2</h2>
            {dataLoading ? (
              <p className="text-text-dark/60 text-xs">Loading...</p>
            ) : (
              <>
                <CompactBalanceBar label="Saturday" lead={roleBalanceByDay.saturday.level2.lead} follow={roleBalanceByDay.saturday.level2.follow} />
                <CompactBalanceBar label="Sunday" lead={roleBalanceByDay.sunday.level2.lead} follow={roleBalanceByDay.sunday.level2.follow} />
              </>
            )}
          </section>

          {/* Non-Complete Breakdown */}
          <section className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-spartan font-semibold text-sm mb-2">Incomplete Registrations</h2>
            {dataLoading ? (
              <p className="text-text-dark/60 text-xs">Loading...</p>
            ) : nonComplete.length === 0 ? (
              <p className="text-green-600 text-xs font-medium">✓ All complete</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {nonComplete.map((item, idx) => {
                  const statusColor = 
                    item.registration_status === 'waitlist' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                    item.registration_status === 'pending' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                    'bg-gray-50 border-gray-200 text-gray-700';
                  
                  return (
                    <div key={idx} className={`flex items-center justify-between px-2 py-1 border rounded text-xs ${statusColor}`}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold capitalize">{item.registration_status}</span>
                        <span className="opacity-60">|</span>
                        <span>L{item.level}</span>
                        <span>{item.role === 'L' ? 'Lead' : 'Follow'}</span>
                        <span className="opacity-60">|</span>
                        <span className="capitalize">{item.pass_type}</span>
                      </div>
                      <span className="font-semibold">{item.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
        </>
        )}

        {/* Registrations Section with Tabs */}
        <section className="bg-white rounded-xl shadow-sm">
          {/* Tab Header */}
          <div className="flex items-center justify-between border-b border-text-dark/10 px-6 pt-4">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("weekender")}
                className={`px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors ${
                  activeTab === "weekender"
                    ? "bg-yellow-accent text-text-dark"
                    : "text-text-dark/60 hover:text-text-dark hover:bg-cloud-dancer"
                }`}
              >
                Weekender ({registrations.length})
              </button>
              <button
                onClick={() => setActiveTab("bootcamp")}
                className={`px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors ${
                  activeTab === "bootcamp"
                    ? "bg-purple-accent text-white"
                    : "text-text-dark/60 hover:text-text-dark hover:bg-cloud-dancer"
                }`}
              >
                Bootcamp ({bootcampRegistrations.length})
              </button>
            </div>
            <button
              onClick={fetchData}
              disabled={dataLoading}
              className="text-sm text-pink-accent hover:text-yellow-accent underline disabled:opacity-50 mb-2"
            >
              {dataLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Weekender Tab */}
            {activeTab === "weekender" && (
              <>
                {dataLoading ? (
                  <p className="text-text-dark/60">Loading...</p>
                ) : registrations.length === 0 ? (
                  <p className="text-text-dark/60">No registrations yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-cloud-dancer">
                        <tr>
                          <SortHeader label="Created" sortKeyName="created_at" />
                          <SortHeader label="Name" sortKeyName="name" />
                          <SortHeader label="Surname" sortKeyName="surname" />
                          <SortHeader label="Level" sortKeyName="level" />
                          <SortHeader label="Role" sortKeyName="role" />
                          <SortHeader label="Type" sortKeyName="registration_type" />
                          <SortHeader label="Status" sortKeyName="registration_status" />
                          <SortHeader label="Tier" sortKeyName="price_tier" />
                          <SortHeader label="Pass" sortKeyName="pass_type" />
                          <SortHeader label="Day" sortKeyName="workshop_day" />
                          <SortHeader label="Party" sortKeyName="party_add_on" />
                        </tr>
                      </thead>
                      <tbody>
                        {sortedRegistrations.map((reg, idx) => (
                          <tr
                            key={idx}
                            className="border-t border-text-dark/10 hover:bg-cloud-dancer/50"
                          >
                            <td className="px-3 py-2 text-xs text-text-dark/60">
                              {reg.created_at ? new Date(reg.created_at).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                            </td>
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
                            <td className="px-3 py-2">{reg.workshop_day || '-'}</td>
                            <td className="px-3 py-2">{reg.party_add_on ? 'Yes' : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-xs text-text-dark/60 mt-3">
                      Total: {registrations.length} registration(s)
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Bootcamp Tab */}
            {activeTab === "bootcamp" && (
              <>
                {dataLoading ? (
                  <p className="text-text-dark/60">Loading...</p>
                ) : bootcampRegistrations.length === 0 ? (
                  <p className="text-text-dark/60">No bootcamp registrations yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-cloud-dancer">
                        <tr>
                          <BootcampSortHeader label="Created" sortKeyName="created_at" />
                          <BootcampSortHeader label="Name" sortKeyName="name" />
                          <BootcampSortHeader label="Surname" sortKeyName="surname" />
                          <BootcampSortHeader label="Bootcamp" sortKeyName="bootcamp_type" />
                          <BootcampSortHeader label="Role" sortKeyName="role" />
                          <BootcampSortHeader label="Type" sortKeyName="registration_type" />
                          <BootcampSortHeader label="Status" sortKeyName="registration_status" />
                        </tr>
                      </thead>
                      <tbody>
                        {sortedBootcampRegistrations.map((reg, idx) => (
                          <tr
                            key={idx}
                            className="border-t border-text-dark/10 hover:bg-cloud-dancer/50"
                          >
                            <td className="px-3 py-2 text-xs text-text-dark/60">
                              {reg.created_at ? new Date(reg.created_at).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                            </td>
                            <td className="px-3 py-2">{reg.name}</td>
                            <td className="px-3 py-2">{reg.surname}</td>
                            <td className="px-3 py-2">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                  reg.bootcamp_type === "beginner"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {reg.bootcamp_type === "beginner" ? "Beginner" : "Fast-Track"}
                              </span>
                            </td>
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-xs text-text-dark/60 mt-3">
                      Total: {bootcampRegistrations.length} registration(s)
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
