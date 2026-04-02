import React, { useEffect, useState } from "react";
import { testApiKey } from "../utils/gemini";

export default function ApiKeyStatus() {
  const [status, setStatus] = useState<"checking" | "valid" | "invalid">("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    testApiKey().then(result => {
      setStatus(result.valid ? "valid" : "invalid");
      if (!result.valid) setError(result.error || "Unknown error");
    });
  }, []);

  if (status === "checking") return (
    <div style={{ background: "#1E2230", border: "1px solid #6B728050", borderRadius: "6px", padding: "10px 16px", marginBottom: "16px", fontSize: "12px", color: "#6B7280", display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
      Checking Gemini API connection...
    </div>
  );

  if (status === "invalid") return (
    <div style={{ background: "#EF444415", border: "1px solid #EF444440", borderRadius: "6px", padding: "12px 16px", marginBottom: "16px" }}>
      <div style={{ fontSize: "12px", fontWeight: "700", color: "#EF4444", marginBottom: "6px" }}>⚠ Gemini API Key Not Working</div>
      <div style={{ fontSize: "11px", color: "#6B7280", lineHeight: 1.6 }}>
        The tool is deployed but the API key is missing or invalid.<br />
        <strong style={{ color: "#E8ECF0" }}>Fix:</strong> Go to Vercel → Settings → Environment Variables → Add <code style={{ color: "#00E5FF" }}>VITE_GEMINI_API_KEY</code> → Redeploy.<br />
        <span style={{ color: "#6B7280" }}>Error: {error}</span>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#00FF8810", border: "1px solid #00FF8830", borderRadius: "6px", padding: "8px 16px", marginBottom: "16px", fontSize: "11px", color: "#00FF88" }}>
      ✓ Gemini API connected and working
    </div>
  );
}
