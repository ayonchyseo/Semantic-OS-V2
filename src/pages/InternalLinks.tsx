import React from "react";
import { COLORS, style } from "../utils/theme";

const LINK_MATRIX = [
  { from: "AI Video Spinner vs Manual Editing", to: "Video Spinning Software Pricing", anchor: "video spinning software pricing", intent: "Commercial" },
  { from: "How to Repurpose YouTube Videos", to: "Short-Form Video Trends", anchor: "short-form video trends", intent: "Informational" },
];

export default function InternalLinksPage({ projectHook, onComplete }: any) {
  return (
    <div>
      <div style={style.sectionTitle}>Step 6 of 7</div>
      <h1 style={style.h1}>Internal Link<br /><span style={{ color: COLORS.accent }}>Architecture Matrix</span></h1>
      <p style={style.subtitle}>Intent-progressive linking strategy. Every anchor text moves the reader systemically.</p>

      <div style={style.grid3}>
        {[
          { label: "Total Links Planned", value: "47", color: COLORS.accent },
          { label: "Quality Nodes Covered", value: "100%", color: COLORS.green },
          { label: "Orphan Pages", value: "0", color: COLORS.gold },
        ].map(s => (
          <div key={s.label} style={style.statCard(s.color)}>
            <div style={style.sectionTitle}>{s.label}</div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: s.color, marginTop: "8px" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ ...style.card, marginTop: "16px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <th style={{ textAlign: "left", padding: "8px 12px", color: COLORS.muted }}>FROM ARTICLE</th>
              <th style={{ textAlign: "left", padding: "8px 12px", color: COLORS.muted }}>TO ARTICLE</th>
              <th style={{ textAlign: "left", padding: "8px 12px", color: COLORS.muted }}>ANCHOR TEXT</th>
              <th style={{ textAlign: "left", padding: "8px 12px", color: COLORS.muted }}>INTENT STAGE</th>
            </tr>
          </thead>
          <tbody>
            {LINK_MATRIX.map((l, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}30` }}>
                <td style={{ padding: "10px 12px" }}>{l.from}</td>
                <td style={{ padding: "10px 12px" }}>{l.to}</td>
                <td style={{ padding: "10px 12px", color: COLORS.accent }}>{l.anchor}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={style.tag(l.intent === "Commercial" ? COLORS.gold : COLORS.bridge)}>{l.intent}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button style={style.btnPrimary} onClick={onComplete}>Run Topical Authority Audit →</button>
    </div>
  );
}
