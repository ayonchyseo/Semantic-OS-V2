import React, { useState, useEffect } from "react";
import { COLORS, style } from "../utils/theme";
import {
  AIProvider,
  AIProviderConfig,
  PROVIDER_MODELS,
  getConfig,
  saveConfig,
  testConnection,
} from "../utils/apiProvider";

type TestStatus = "idle" | "testing" | "ok" | "fail";

export default function SettingsPage() {
  const [cfg, setCfg] = useState<AIProviderConfig>(getConfig());
  const [testStatus, setTestStatus] = useState<Record<AIProvider, TestStatus>>({
    gemini: "idle",
    openai: "idle",
    claude: "idle",
  });
  const [testError, setTestError] = useState<Record<AIProvider, string>>({
    gemini: "",
    openai: "",
    claude: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCfg(getConfig());
  }, []);

  const update = (field: keyof AIProviderConfig, value: string) => {
    setCfg(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveConfig(cfg);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleTest = async (provider: AIProvider) => {
    const keys: Record<AIProvider, string> = {
      gemini: cfg.geminiKey,
      openai: cfg.openaiKey,
      claude: cfg.claudeKey,
    };
    const models: Record<AIProvider, string> = {
      gemini: cfg.geminiModel,
      openai: cfg.openaiModel,
      claude: cfg.claudeModel,
    };
    const key = keys[provider];
    if (!key) {
      setTestError(prev => ({ ...prev, [provider]: "No API key entered." }));
      setTestStatus(prev => ({ ...prev, [provider]: "fail" }));
      return;
    }
    setTestStatus(prev => ({ ...prev, [provider]: "testing" }));
    setTestError(prev => ({ ...prev, [provider]: "" }));
    const result = await testConnection(provider, key, models[provider]);
    setTestStatus(prev => ({ ...prev, [provider]: result.valid ? "ok" : "fail" }));
    if (!result.valid) setTestError(prev => ({ ...prev, [provider]: result.error ?? "Unknown error" }));
  };

  const PROVIDERS: { id: AIProvider; label: string; color: string; icon: string; hint: string }[] = [
    {
      id: "gemini",
      label: "Google Gemini",
      color: COLORS.accent,
      icon: "◆",
      hint: "Get key at aistudio.google.com — Free tier available (5 RPM)",
    },
    {
      id: "openai",
      label: "OpenAI GPT",
      color: COLORS.green,
      icon: "◉",
      hint: "Get key at platform.openai.com — Pay-as-you-go",
    },
    {
      id: "claude",
      label: "Anthropic Claude",
      color: COLORS.purple,
      icon: "◈",
      hint: "Get key at console.anthropic.com — Pay-as-you-go",
    },
  ];

  const statusIcon = (s: TestStatus) => {
    if (s === "testing") return <span style={{ color: COLORS.muted, animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>;
    if (s === "ok") return <span style={{ color: COLORS.green }}>✓ Connected</span>;
    if (s === "fail") return <span style={{ color: "#EF4444" }}>✗ Failed</span>;
    return null;
  };

  const keyField = (provider: AIProvider, label: string, color: string) => {
    const keys: Record<AIProvider, keyof AIProviderConfig> = {
      gemini: "geminiKey",
      openai: "openaiKey",
      claude: "claudeKey",
    };
    const models: Record<AIProvider, keyof AIProviderConfig> = {
      gemini: "geminiModel",
      openai: "openaiModel",
      claude: "claudeModel",
    };
    const isActive = cfg.provider === provider;

    return (
      <div
        style={{
          ...style.card,
          borderTop: `3px solid ${isActive ? color : COLORS.border}`,
          opacity: isActive ? 1 : 0.75,
          transition: "all 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color, fontSize: "18px" }}>
              {PROVIDERS.find(p => p.id === provider)?.icon}
            </span>
            <div>
              <div style={{ fontWeight: "700", fontSize: "14px", color: isActive ? color : COLORS.text }}>
                {label}
              </div>
              <div style={{ fontSize: "11px", color: COLORS.muted, marginTop: "2px" }}>
                {PROVIDERS.find(p => p.id === provider)?.hint}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {isActive && (
              <span style={{ ...style.tag(color), fontSize: "10px" }}>ACTIVE</span>
            )}
            <button
              onClick={() => { update("provider", provider); }}
              style={{
                background: isActive ? `${color}20` : "transparent",
                border: `1px solid ${isActive ? color : COLORS.border}`,
                color: isActive ? color : COLORS.muted,
                padding: "6px 14px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "11px",
                letterSpacing: "0.1em",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              {isActive ? "Selected" : "Use This"}
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "8px", alignItems: "end" }}>
          <div>
            <label style={style.label}>API Key</label>
            <input
              type="password"
              value={(cfg[keys[provider]] as string) || ""}
              onChange={e => update(keys[provider], e.target.value)}
              placeholder={`Enter your ${label} API key...`}
              style={{ ...style.input, borderColor: isActive ? `${color}50` : COLORS.border }}
            />
          </div>
          <button
            onClick={() => handleTest(provider)}
            disabled={testStatus[provider] === "testing"}
            style={{
              ...style.btnSecondary,
              borderColor: color,
              color,
              padding: "12px 16px",
              fontSize: "11px",
              marginTop: "8px",
            }}
          >
            Test
          </button>
        </div>

        <div style={{ marginTop: "12px" }}>
          <label style={style.label}>Model</label>
          <select
            value={(cfg[models[provider]] as string) || ""}
            onChange={e => update(models[provider], e.target.value)}
            style={{
              ...style.input,
              cursor: "pointer",
              borderColor: isActive ? `${color}50` : COLORS.border,
            }}
          >
            {PROVIDER_MODELS[provider].map(m => (
              <option key={m} value={m} style={{ background: COLORS.card }}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {testStatus[provider] !== "idle" && (
          <div style={{ marginTop: "10px", fontSize: "12px" }}>
            {statusIcon(testStatus[provider])}
            {testStatus[provider] === "fail" && testError[provider] && (
              <div style={{ color: "#EF4444", fontSize: "11px", marginTop: "4px" }}>
                {testError[provider]}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={style.sectionTitle}>Configuration</div>
      <h1 style={style.h1}>
        API Settings<br />
        <span style={{ color: COLORS.accent }}>Choose Your AI Provider</span>
      </h1>
      <p style={style.subtitle}>
        Select one provider, enter your API key, and all 16 SemanticOS modules will use it.
        Keys are stored only in your browser's localStorage — never sent to any server.
      </p>

      {/* Provider Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
        {keyField("gemini", "Google Gemini", COLORS.accent)}
        {keyField("openai", "OpenAI GPT", COLORS.green)}
        {keyField("claude", "Anthropic Claude", COLORS.purple)}
      </div>

      {/* Save Button */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "8px" }}>
        <button style={{ ...style.btnPrimary, minWidth: "180px" }} onClick={handleSave}>
          Save Settings
        </button>
        {saved && (
          <span style={{ color: COLORS.green, fontSize: "13px" }}>
            ✓ Settings saved!
          </span>
        )}
      </div>

      {/* Info box */}
      <div
        style={{
          marginTop: "32px",
          background: `${COLORS.accent}08`,
          border: `1px solid ${COLORS.accent}20`,
          borderRadius: "8px",
          padding: "20px",
        }}
      >
        <div style={{ fontSize: "12px", color: COLORS.accent, letterSpacing: "0.15em", marginBottom: "12px" }}>
          // PROVIDER COMPARISON
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", fontSize: "12px" }}>
          {[
            {
              name: "Gemini 2.5 Flash",
              color: COLORS.accent,
              pros: ["Free tier (5 RPM)", "Google Search grounding", "Fast & capable"],
              cons: ["Rate limited on free tier"],
            },
            {
              name: "GPT-4o",
              color: COLORS.green,
              pros: ["Strong JSON output", "Very reliable", "No CORS issues"],
              cons: ["Paid only", "Higher cost"],
            },
            {
              name: "Claude Sonnet",
              color: COLORS.purple,
              pros: ["Largest context (200k)", "Excellent reasoning", "Best for long maps"],
              cons: ["Paid only", "Requires browser CORS header"],
            },
          ].map(p => (
            <div
              key={p.name}
              style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "6px",
                padding: "14px",
              }}
            >
              <div style={{ fontWeight: "700", color: p.color, marginBottom: "8px", fontSize: "12px" }}>
                {p.name}
              </div>
              {p.pros.map(pro => (
                <div key={pro} style={{ color: COLORS.green, fontSize: "11px", marginBottom: "3px" }}>
                  + {pro}
                </div>
              ))}
              {p.cons.map(con => (
                <div key={con} style={{ color: COLORS.muted, fontSize: "11px", marginBottom: "3px" }}>
                  − {con}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Vercel deployment guide */}
      <div
        style={{
          marginTop: "16px",
          background: `${COLORS.gold}08`,
          border: `1px solid ${COLORS.gold}20`,
          borderRadius: "8px",
          padding: "20px",
        }}
      >
        <div style={{ fontSize: "12px", color: COLORS.gold, letterSpacing: "0.15em", marginBottom: "10px" }}>
          // VERCEL DEPLOYMENT: ENV VARIABLE FALLBACKS
        </div>
        <div style={{ fontSize: "12px", color: COLORS.muted, lineHeight: 1.8 }}>
          If deploying on Vercel, you can also set these environment variables instead of entering keys here:<br />
          <code style={{ color: COLORS.accent }}>VITE_GEMINI_API_KEY</code> &nbsp;
          <code style={{ color: COLORS.green }}>VITE_OPENAI_API_KEY</code> &nbsp;
          <code style={{ color: COLORS.purple }}>VITE_CLAUDE_API_KEY</code><br />
          Keys entered in this settings panel take priority over environment variables.
        </div>
      </div>
    </div>
  );
}
