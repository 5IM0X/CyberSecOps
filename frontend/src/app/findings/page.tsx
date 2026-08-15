"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Finding = {
  id: string;
  title: string;
  severity: string;
  evidence: string | null;
  status: string;
  created_at: string;
};

const severityColor: Record<string, string> = {
  critical: "bg-red-600 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-400 text-black",
  low: "bg-blue-400 text-white",
  info: "bg-gray-300 text-black",
};

export default function FindingsPage() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const data = await api.listFindings();
      setFindings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000); // auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const visible = filter === "all" ? findings : findings.filter((f) => f.severity === filter);

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Findings</h1>

      <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded px-2 py-1 mb-4">
        <option value="all">All severities</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
        <option value="info">Info</option>
      </select>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="space-y-2">
        {visible.map((f) => (
          <div key={f.id} className="border rounded p-3 flex items-start justify-between">
            <div>
              <p className="font-medium">{f.title}</p>
              {f.evidence && <p className="text-sm text-gray-500">{f.evidence}</p>}
            </div>
            <span className={`text-xs px-2 py-1 rounded ${severityColor[f.severity] || "bg-gray-200"}`}>
              {f.severity}
            </span>
          </div>
        ))}
        {visible.length === 0 && <p className="text-gray-500">No findings yet — launch a scan from Assets.</p>}
      </div>
    </div>
  );
}
