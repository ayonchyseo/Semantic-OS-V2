import React from "react";
import { COLORS, style } from "../utils/theme";

export default function AuditModePage({ projectHook, onComplete }: any) {
  return (
    <div>
      <div style={style.sectionTitle}>Step 7 of 7</div>
      <h1 style={style.h1}>Topical Authority<br /><span style={{ color: COLORS.orange }}>Audit Report</span></h1>
      <p style={style.subtitle}>Existing site analysis complete. Coverage gaps detected. 90-day plan generated.</p>

      <div style={style.grid3}>
        {[
          { label: "Topical Coverage Score", value: "38/100", color: COLORS.orange, sub: "62% of core missing" },
          { label: "Diluted Articles", value: "7", color: "#EF4444", sub: "outside borders" },
          { label: "Cannibalized Pairs", value: "3", color: COLORS.gold, sub: "same macro context" },
        ].map(s => (
          <div key={s.label} style={style.statCard(s.color)}>
            <div style={style.sectionTitle}>{s.label}</div>
            <div style={{ fontSize: "28px", fontWeight: "700", color: s.color, marginTop: "8px" }}>{s.value}</div>
            <div style={{ fontSize: "11px", color: COLORS.muted, marginTop: "4px" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={style.card}>
        <div style={{ fontSize: "12px", color: "#EF4444", letterSpacing: "0.1em", marginBottom: "16px" }}>// TOPICAL DILUTION</div>
        {["General Tips for Beginners", "Best Tripods 2024"].map(a => (
          <div key={a} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${COLORS.border}30`, fontSize: "13px" }}>
            <span style={{ color: COLORS.muted }}>{a}</span>
            <span style={style.tag("#EF4444")}>Delete</span>
          </div>
        ))}
      </div>

      <button style={style.btnPrimary} onClick={onComplete}>Launch Growth Dashboard →</button>
    </div>
  );
}
