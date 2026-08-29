"use client";

import { useState, useEffect } from "react";
import {
  Truck,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  Key,
  Globe,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  getSystemSetting,
  updateSystemSetting,
  MengantarConfigValue,
} from "@/modules/settings/settings.service";

const DEFAULT_MENGANTAR_CONFIG: MengantarConfigValue = {
  api_key: "",
  webhook_secret: "",
  base_url: "https://api.mengantar.com",
};

export default function MengantarSettingsPage() {
  const [config, setConfig] = useState<MengantarConfigValue>(DEFAULT_MENGANTAR_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }

    async function loadConfig() {
      try {
        setLoading(true);
        const data = await getSystemSetting<MengantarConfigValue>(
          "mengantar_config",
          DEFAULT_MENGANTAR_CONFIG
        );
        setConfig(data);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load Mengantar settings.");
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, []);

  const webhookUrl = `${origin}/api/webhooks/mengantar`;

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      await updateSystemSetting("mengantar_config", config);
      setSuccessMsg("Mengantar logistics configuration updated successfully.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const isConfigured = Boolean(config.api_key);

  return (
    <div className="w-full space-y-6 pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
          Mengantar Logistics Integration
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Manage courier aggregator keys, tracking webhook endpoints, and shipping rate sync directly from the database.
        </p>
      </div>

      {/* Status Notice */}
      <div
        className={`p-4 rounded-xl border flex items-start gap-3 ${
          isConfigured
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-amber-50 border-amber-200 text-amber-800"
        }`}
      >
        {isConfigured ? (
          <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
        ) : (
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
        )}
        <div className="text-xs space-y-1">
          <div className="font-semibold text-sm">
            {isConfigured ? "Logistics Service Connected" : "API Key Required"}
          </div>
          <p className="opacity-90">
            {isConfigured
              ? "Automated shipping rate estimation and live courier tracking webhooks are enabled."
              : "Enter your Mengantar API key below to connect your multi-courier shipping services."}
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Settings */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Key className="h-4 w-4 text-blue-600" /> API Configuration
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Base API URL
                </label>
                <input
                  type="text"
                  placeholder="https://api.mengantar.com"
                  value={config.base_url}
                  onChange={(e) => setConfig({ ...config, base_url: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono focus:bg-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Mengantar API Key
                </label>
                <input
                  type="password"
                  placeholder="Enter your Mengantar API Key"
                  value={config.api_key}
                  onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono focus:bg-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Webhook Secret Token (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Enter incoming secret token for payload verification"
                  value={config.webhook_secret}
                  onChange={(e) => setConfig({ ...config, webhook_secret: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono focus:bg-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>

          {/* Webhook Endpoint Info */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-600" /> Tracking Webhook URL
            </h2>
            <p className="text-xs text-gray-500">
              Paste this URL into <strong>Mengantar Dashboard &rarr; Integration &rarr; Webhook URL</strong>.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg font-mono text-gray-700 select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy URL"}
              </button>
            </div>
          </div>
        </form>

        {/* Quick Links */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Portals</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://mengantar.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-blue-600 font-medium transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Truck className="h-4 w-4" /> Mengantar Portal
                  </span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://docs.mengantar.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <span>API Documentation</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}