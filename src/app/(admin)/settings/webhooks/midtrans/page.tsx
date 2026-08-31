"use client";

import { useState, useEffect } from "react";
import {
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
  MidtransConfigValue,
} from "@/modules/settings/settings.service";

const DEFAULT_MIDTRANS_CONFIG: MidtransConfigValue = {
  is_production: false,
  client_key: "",
  server_key: "",
  merchant_id: "",
};

export default function MidtransSettingsPage() {
  const [config, setConfig] = useState<MidtransConfigValue>(DEFAULT_MIDTRANS_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      queueMicrotask(() => setOrigin(window.location.origin));
    }

    async function loadConfig() {
      try {
        const data = await getSystemSetting<MidtransConfigValue>(
          "midtrans_config",
          DEFAULT_MIDTRANS_CONFIG
        );
        setConfig(data);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load Midtrans settings.");
      } finally {
        setLoading(false);
      }
    }

    queueMicrotask(() => void loadConfig());
  }, []);

  const webhookUrl = `${origin}/api/webhooks/midtrans`;

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

      await updateSystemSetting("midtrans_config", config);
      setSuccessMsg("Midtrans credentials updated successfully.");
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

  const isConfigured = Boolean(config.server_key && config.client_key);

  return (
    <div className="w-full space-y-6 pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
          Midtrans Payment Integration
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Manage payment credentials, environment modes, and webhook endpoints directly from the database.
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
            {isConfigured ? "Payment Gateway Active" : "Configuration Incomplete"}
          </div>
          <p className="opacity-90">
            {isConfigured
              ? `Currently running in ${
                  config.is_production ? "PRODUCTION" : "SANDBOX"
                } mode.`
              : "Please enter your Client Key and Server Key below to activate automated order payments."}
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
              <Key className="h-4 w-4 text-blue-600" /> Gateway Credentials
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Environment Mode
                </label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="is_production"
                      checked={!config.is_production}
                      onChange={() => setConfig({ ...config, is_production: false })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-700">Sandbox (Development)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="is_production"
                      checked={config.is_production}
                      onChange={() => setConfig({ ...config, is_production: true })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-700">Production (Live)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Merchant ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. G123456789"
                  value={config.merchant_id}
                  onChange={(e) => setConfig({ ...config, merchant_id: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono focus:bg-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Client Key
                </label>
                <input
                  type="text"
                  placeholder="SB-Mid-client-..."
                  value={config.client_key}
                  onChange={(e) => setConfig({ ...config, client_key: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono focus:bg-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Server Key
                </label>
                <input
                  type="password"
                  placeholder="SB-Mid-server-..."
                  value={config.server_key}
                  onChange={(e) => setConfig({ ...config, server_key: e.target.value })}
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
              <Globe className="h-4 w-4 text-blue-600" /> Webhook Notification URL
            </h2>
            <p className="text-xs text-gray-500">
              Paste this URL into <strong>Midtrans Dashboard &rarr; Settings &rarr; Configuration &rarr; Payment Notification URL</strong>.
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
                  href="https://dashboard.midtrans.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-blue-600 font-medium transition-colors"
                >
                  <span>Midtrans Production Portal</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://dashboard.sandbox.midtrans.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-blue-600 font-medium transition-colors"
                >
                  <span>Midtrans Sandbox Portal</span>
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
