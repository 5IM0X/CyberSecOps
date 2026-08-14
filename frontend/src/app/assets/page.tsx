"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Asset = {
  id: string;
  type: string;
  value: string;
  environment: string;
  created_at: string;
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [type, setType] = useState("ip");
  const [value, setValue] = useState("");
  const [environment, setEnvironment] = useState("lab");
  const [error, setError] = useState<string | null>(null);
  const [scanningId, setScanningId] = useState<string | null>(null);

  async function load() {
    try {
      const data = await api.listAssets();
      setAssets(data);
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.createAsset(type, value, environment);
      setValue("");
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleScan(assetId: string) {
    setScanningId(assetId);
    try {
      await api.createScan(assetId, "nmap");
      alert("Scan launched — check the Findings page in a moment.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setScanningId(null);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Assets</h1>

      <form onSubmit={handleCreate} className="flex gap-2 mb-8">
        <select value={type} onChange={(e) => setType(e.target.value)} className="border rounded px-2 py-1">
          <option value="ip">ip</option>
          <option value="domain">domain</option>
          <option value="url">url</option>
        </select>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="127.0.0.1"
          className="border rounded px-2 py-1 flex-1"
          required
        />
        <select
          value={environment}
          onChange={(e) => setEnvironment(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="lab">lab</option>
          <option value="staging">staging</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-1">
          Add
        </button>
      </form>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Type</th>
            <th className="py-2">Value</th>
            <th className="py-2">Environment</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {assets.map((a) => (
            <tr key={a.id} className="border-b">
              <td className="py-2">{a.type}</td>
              <td className="py-2">{a.value}</td>
              <td className="py-2">{a.environment}</td>
              <td className="py-2">
                <button
                  onClick={() => handleScan(a.id)}
                  disabled={scanningId === a.id}
                  className="text-blue-600 text-sm disabled:opacity-50"
                >
                  {scanningId === a.id ? "Launching..." : "Scan (nmap)"}
                </button>
              </td>
            </tr>
          ))}
          {assets.length === 0 && (
            <tr>
              <td colSpan={4} className="py-4 text-gray-500">
                No assets yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
