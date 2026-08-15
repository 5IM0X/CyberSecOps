"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, clearToken } from "@/lib/api";
import { useRouter } from "next/navigation";

type Asset = {
  id: string;
  type: string;
  value: string;
  environment: string;
  created_at: string;
};

type Finding = {
  id: string;
  title: string;
  severity: string;
  evidence: string | null;
  status: string;
  created_at: string;
};

export default function Home() {
  const router = useRouter();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [assetsData, findingsData] = await Promise.all([
          api.listAssets(),
          api.listFindings(),
        ]);

        setAssets(assetsData);
        setFindings(findingsData);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  function logout() {
    clearToken();
    router.push("/login");
  }

  const critical = findings.filter(
    (f) => f.severity.toLowerCase() === "critical"
  ).length;

  const high = findings.filter(
    (f) => f.severity.toLowerCase() === "high"
  ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400">Loading CyberSecOps...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 bg-slate-950/95">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              <span className="text-cyan-400">Cyber</span>SecOps
            </h1>
            <p className="text-xs text-slate-500">
              Security Operations Platform
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/"
              className="text-cyan-400 font-medium"
            >
              Dashboard
            </Link>

            <Link
              href="/assets"
              className="text-slate-400 hover:text-white"
            >
              Assets
            </Link>

            <Link
              href="/findings"
              className="text-slate-400 hover:text-white"
            >
              Findings
            </Link>

            <button
              onClick={logout}
              className="text-red-400 hover:text-red-300"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <p className="text-cyan-400 text-sm font-medium mb-2">
            SECURITY OPERATIONS
          </p>

          <h2 className="text-4xl font-bold tracking-tight">
            Security Dashboard
          </h2>

          <p className="text-slate-400 mt-2">
            Monitor assets, scans and security findings from one place.
          </p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Total Assets</p>
            <p className="text-3xl font-bold mt-2">{assets.length}</p>
            <p className="text-xs text-slate-500 mt-2">
              Registered targets
            </p>
          </div>

          <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-6">
            <p className="text-sm text-red-400">Critical Findings</p>
            <p className="text-3xl font-bold mt-2">{critical}</p>
            <p className="text-xs text-slate-500 mt-2">
              Immediate attention required
            </p>
          </div>

          <div className="rounded-xl border border-orange-900/50 bg-orange-950/20 p-6">
            <p className="text-sm text-orange-400">High Findings</p>
            <p className="text-3xl font-bold mt-2">{high}</p>
            <p className="text-xs text-slate-500 mt-2">
              High-risk issues
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Total Findings</p>
            <p className="text-3xl font-bold mt-2">{findings.length}</p>
            <p className="text-xs text-slate-500 mt-2">
              Detected security issues
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Recent Assets</h3>
                <p className="text-sm text-slate-500">
                  Assets registered in CyberSecOps
                </p>
              </div>

              <Link
                href="/assets"
                className="text-sm text-cyan-400 hover:text-cyan-300"
              >
                View all
              </Link>
            </div>

            <div className="p-6">
              {assets.length === 0 ? (
                <p className="text-slate-500">
                  No assets registered yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {assets.slice(0, 5).map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between rounded-lg bg-slate-800/50 p-4"
                    >
                      <div>
                        <p className="font-medium">{asset.value}</p>
                        <p className="text-xs text-slate-500">
                          {asset.type} · {asset.environment}
                        </p>
                      </div>

                      <span className="text-xs rounded-full bg-slate-700 px-3 py-1 text-slate-300">
                        Asset
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Security Findings</h3>
                <p className="text-sm text-slate-500">
                  Latest detected vulnerabilities
                </p>
              </div>

              <Link
                href="/findings"
                className="text-sm text-cyan-400 hover:text-cyan-300"
              >
                View all
              </Link>
            </div>

            <div className="p-6">
              {findings.length === 0 ? (
                <p className="text-slate-500">
                  No security findings yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {findings.slice(0, 5).map((finding) => (
                    <div
                      key={finding.id}
                      className="flex items-center justify-between rounded-lg bg-slate-800/50 p-4"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {finding.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {finding.status}
                        </p>
                      </div>

                      <span
                        className={`ml-4 text-xs rounded-full px-3 py-1 ${
                          finding.severity === "critical"
                            ? "bg-red-600 text-white"
                            : finding.severity === "high"
                            ? "bg-orange-500 text-white"
                            : finding.severity === "medium"
                            ? "bg-yellow-400 text-black"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {finding.severity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
