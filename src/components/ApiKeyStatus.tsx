import React, { useEffect, useState } from "react";
import { getConfig, testConnection, AIProvider } from "../utils/apiProvider";
import { COLORS } from "../utils/theme";

const PROVIDER_LABELS: Record<AIProvider, string> = {
  gemini: "Gemini",
  openai: "OpenAI",
  claude: "Claude",
};

const PROVIDER_COLORS: Record<AIProvider, string> = {
  gemini: COLORS.accent,
  openai: COLORS.green,
  claude: COLORS.purple,
};

export default function ApiKeyStatus({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const [status, setStatus] = useState<"checking" | "valid" | "invalid" | "no-key">("checking");
  const [error, setError] = useState("");
  const [provider, setProvider] = useState<AIProvider>("gemini");

  useEffect(() => {
    const cfg = getConfig();
    setProvider(cfg.provider);

    const keys: Record<AIProvider, string> = {
      gemini: cfg.geminiKey,
      openai: cfg.openaiKey,
      claude: cfg.claudeKey,
    };

    const key = keys[cfg.provider];
    if (!key) {
      setStatus("no-key");
      return;
    }

    setStatus("checking");
    testConnection(cfg.provider, key).then(result => {
      setStatus(result.valid ? "valid" : "invalid");
      if (!result.valid) setError(result.error || "Unknown error");
    });
  }, []);

  const label = PROVIDER_LABELS[provider];
  const color = PROVIDER_COLORS[provider];

  const settingsBtn = onOpenSettings ? (
    <button
      onClick={onOpenSettings}
      style={{
        marginLeft: "12px",
        background: "transparent",
        border: `1px solid ${COLORS.border}`,
        color: COLORS.muted,
        padding: "3px 10px",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "10px",
        letterSpacing: "0.1em",
        fontFamily: "'Space Mono', monospace",
      }}
    >
      ⚙ Settings
    </button>
  ) : null;

  if (status === "checking") return (
    <div style={{
      background: "#1E2230",
      border: "1px solid #6B728050",
      borderRadius: "6px",
      padding: "8px 16px",
      marginBottom: "16px",
      fontSize: "12px",
      color: "#6B7280",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    }}>
      <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
      Checking {label} API connection...
    </div>
  );

  if (status === "no-key") return (
    <div style={{
      background: "#FFB80010",
      border: "1px solid #FFB80040",
      borderRadius: "6px",
      padding: "10px 16px",
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    }}>
      <div style={{ fontSize: "12px", color: COLORS.gold }}>
        ⚠ No API key configured. Go to ⚙ Settings to add your key.
      </div>
      {settingsBtn}
    </div>
  );

  if (status === "invalid") return (
    <div style={{
      background: "#EF444415",
      border: "1px solid #EF444440",
      borderRadius: "6px",
      padding: "10px 16px",
      marginBottom: "16px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ fontSize: "12px", fontWeight: "700", color: "#EF4444" }}>
          ✗ {label} API key invalid or quota exceeded
        </div>
        {settingsBtn}
      </div>
      <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "4px" }}>
        {error}
      </div>
    </div>
  );

  return (
    <div style={{
      background: `${color}10`,
      border: `1px solid ${color}30`,
      borderRadius: "6px",
      padding: "7px 16px",
      marginBottom: "16px",
      fontSize: "11px",
      color,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <span>✓ {label} API connected</span>
      {settingsBtn}
    </div>
  );
}
