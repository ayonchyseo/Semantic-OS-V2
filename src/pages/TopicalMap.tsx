import React, { useState } from "react";
import { COLORS, style } from "../utils/theme";

const SAMPLE_MAP = [
  { title: "What Is Video Repurposing Software", entity: "Video Repurposing", attr: "Definition", type: "Trust", section: "Core", intent: "Informational" },
  { title: "AI Video Spinner vs Manual Editing: Cost Comparison", entity: "AI Video Spinner", attr: "Cost", type: "Quality", section: "Core", intent: "Commercial" },
  { title: "How to Repurpose YouTube Videos for Instagram Reels", entity: "YouTube Videos", attr: "Platform Distribution", type: "Bridge", section: "Core", intent: "Informational" },
  { title: "Short-Form Video Trends for Brands in 2025", entity: "Short-Form Video", attr: "Trend", type: "Trending", section: "Outer", intent: "Informational" },
];

export default function TopicalMapPage({ projectHook, onComplete }: any) {
  const [selected, setSelected] = useState<any>(null);
  const nodeTypes = ["Quality", "Bridge", "Trust", "Historical", "Trending"];
  const colorMap: Record<string, string> = { Quality: COLORS.quality, Bridge: COLORS.bridge, Trust: COLORS.trust, Historical: COLORS.historical, Trending: COLORS.trending };

  return (
    <div>
      <div style={style.sectionTitle}>Step 4 of 7</div>
      <h1 style={style.h1}>Topical Map<br /><span style={{ color: COLORS.accent }}>Core + Outer Sections</span></h1>
      <p style={style.subtitle}>{SAMPLE_MAP.length} nodes generated. Color-coded by type.</p>

      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
        {nodeTypes.map(t => (
          <span key={t} style={style.tag(colorMap[t])}>■ {t} Node</span>
        ))}
      </div>

      <div style={style.grid2}>
        <div>
          <div style={{ ...style.sectionTitle, color: COLORS.gold, marginBottom: "12px" }}>// CORE SECTION</div>
          {SAMPLE_MAP.filter(n => n.section === "Core").map((node, i) => (
            <div key={i} onClick={() => setSelected(node)} style={{
              ...style.node(node.type),
              marginBottom: "8px",
              borderColor: selected?.title === node.title ? colorMap[node.type] : `${colorMap[node.type]}40`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={style.tag(colorMap[node.type])}>{node.type}</span>
                <span style={{ fontSize: "10px", color: COLORS.muted, letterSpacing: "0.1em" }}>{node.intent.toUpperCase()}</span>
              </div>
              <div style={{ fontSize: "13px", fontWeight: "600", lineHeight: 1.4 }}>{node.title}</div>
              <div style={{ fontSize: "11px", color: COLORS.muted, marginTop: "4px" }}>{node.entity} → {node.attr}</div>
            </div>
          ))}

          <div style={{ ...style.sectionTitle, color: COLORS.green, marginTop: "24px", marginBottom: "12px" }}>// OUTER SECTION</div>
          {SAMPLE_MAP.filter(n => n.section === "Outer").map((node, i) => (
            <div key={i} onClick={() => setSelected(node)} style={{
              ...style.node(node.type),
              marginBottom: "8px",
              borderColor: selected?.title === node.title ? colorMap[node.type] : `${colorMap[node.type]}40`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={style.tag(colorMap[node.type])}>{node.type}</span>
                <span style={{ fontSize: "10px", color: COLORS.muted, letterSpacing: "0.1em" }}>{node.intent.toUpperCase()}</span>
              </div>
              <div style={{ fontSize: "13px", fontWeight: "600", lineHeight: 1.4 }}>{node.title}</div>
              <div style={{ fontSize: "11px", color: COLORS.muted, marginTop: "4px" }}>{node.entity} → {node.attr}</div>
            </div>
          ))}
        </div>
        <div>
          {selected && (
            <div style={{ ...style.card, borderTop: `3px solid ${colorMap[selected.type]}`, position: "sticky", top: "16px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.15em", color: colorMap[selected.type], marginBottom: "12px" }}>NODE PREVIEW</div>
              <div style={{ fontWeight: "700", fontSize: "15px", marginBottom: "12px" }}>{selected.title}</div>
              <div style={{ fontSize: "12px", color: COLORS.muted, marginBottom: "6px" }}>Target Entity: <span style={{ color: COLORS.text }}>{selected.entity}</span></div>
              <div style={{ fontSize: "12px", color: COLORS.muted, marginBottom: "6px" }}>Primary Attribute: <span style={{ color: COLORS.text }}>{selected.attr}</span></div>
              <div style={{ fontSize: "12px", color: COLORS.muted, marginBottom: "6px" }}>Intent: <span style={style.tag(COLORS.accent)}>{selected.intent}</span></div>
            </div>
          )}
        </div>
      </div>

      <button style={style.btnPrimary} onClick={onComplete}>Generate Content Briefs →</button>
    </div>
  );
}
