"use client";

import { useState, useEffect } from "react";
import { X, Key, Eye, EyeOff, Globe, Clock } from "lucide-react";

interface SettingsModalProps {
  onClose: () => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export default function SettingsModal({ onClose, apiKey, onApiKeyChange }: SettingsModalProps) {
  const [key, setKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setKey(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    onApiKeyChange(key);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0d1235]/95 backdrop-blur-xl overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-white/40" />
            </button>
          </div>

          {/* API Key */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-400">
              <Key size={16} />
              <h3 className="text-sm font-bold text-white">API Keys</h3>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-white/50">Anthropic API Key</label>
              <p className="text-[10px] text-white/30">
                For Claude AI predictions — get yours at console.anthropic.com
              </p>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="sk-ant-..."
                    className="w-full px-3 py-2.5 text-sm font-mono text-white bg-white/5 border border-white/10 rounded-xl focus:border-blue-500/50 focus:outline-none transition-colors placeholder:text-white/20"
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-white/50"
                  >
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-400">
              <Globe size={16} />
              <h3 className="text-sm font-bold text-white">Data Sources</h3>
            </div>

            <div className="space-y-2">
              <SourceRow name="CoinGecko" desc="Crypto data" status="Active" />
              <SourceRow name="Yahoo Finance" desc="Stocks, Commodities, Forex" status="Active" />
              <SourceRow
                name="Claude AI"
                desc="Investment analysis"
                status={key ? "Active" : "Key needed"}
              />
            </div>
          </div>

          {/* Refresh Info */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
            <Clock size={14} className="text-white/30" />
            <span className="text-xs text-white/40">Data refreshes every 30 seconds</span>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-white/10 hover:from-blue-500/40 hover:to-purple-500/40 transition-all"
          >
            Save Settings
          </button>

          {/* Disclaimer */}
          <p className="text-[10px] text-white/20 text-center leading-relaxed">
            STOX — AI-powered investment tracker. Recommendations are for educational purposes only. Always do your own research.
          </p>
        </div>
      </div>
    </div>
  );
}

function SourceRow({
  name,
  desc,
  status,
}: {
  name: string;
  desc: string;
  status: string;
}) {
  const isActive = status === "Active";
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5">
      <div>
        <p className="text-xs font-semibold text-white">{name}</p>
        <p className="text-[10px] text-white/30">{desc}</p>
      </div>
      <span
        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
          isActive
            ? "text-green-400 bg-green-500/10"
            : "text-gray-400 bg-gray-500/10"
        }`}
      >
        {status}
      </span>
    </div>
  );
}
