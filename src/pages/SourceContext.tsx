import React from "react";
import { COLORS, style } from "../utils/theme";

export default function SourceContextPage({ projectHook, onComplete }: any) {
  // Using static sample data as originally presented in the monolithic UI
  return (
    <div>
      <div style={style.sectionTitle}>Step 2 of 7</div>
      <h1 style={style.h1}>Source Context<br /><span style={{ color: COLORS.accent }}>Analysis Complete</span></h1>
      <p style={style.subtitle}>Gemini has analyzed your domain and extracted the semantic foundation. Review and confirm before building your EAV architecture.</p>

      <div style={style.grid2}>
        <div style={{ ...style.card, borderTop: `3px solid ${COLORS.accent}` }}>
          <div style={style.sectionTitle}>Source Context</div>
          <p style={{ fontSize: "14px", lineHeight: 1.7, marginTop: "8px" }}>
            The domain exists in SERPs to serve professionals seeking AI-automated workflows. It monetizes through SaaS subscriptions, making "conversion readiness" the primary signal of quality content.
          </p>
        </div>
        <div style={{ ...style.card, borderTop: `3px solid ${COLORS.gold}` }}>
          <div style={style.sectionTitle}>Central Entity</div>
          <div style={{ fontSize: "24px", fontWeight: "700", color: COLORS.gold, marginTop: "8px" }}>AI Automation Tool</div>
          <div style={{ fontSize: "12px", color: COLORS.muted, marginTop: "6px" }}>appears in every section of the topical map</div>
        </div>
      </div>

      <div style={{ ...style.card, borderTop: `3px solid ${COLORS.purple}` }}>
        <div style={style.sectionTitle}>Central Search Intent</div>
        <p style={{ fontSize: "15px", lineHeight: 1.7, color: COLORS.text, marginTop: "8px" }}>
          "Discover, evaluate, and adopt AI-powered tools to reduce production time and scale output without quality loss."
        </p>
      </div>

      <div style={style.card}>
        <div style={style.sectionTitle}>Topical Borders (Do NOT Write About)</div>
        <div style={{ marginTop: "12px" }}>
          {["Irrelevant industry details", "General lifestyle tips", "Generic news"].map(b => (
            <span key={b} style={style.tag("#EF4444")}>{b}</span>
          ))}
        </div>
      </div>

      <button style={style.btnPrimary} onClick={onComplete}>Confirm → Build EAV Architecture</button>
    </div>
  );
}
