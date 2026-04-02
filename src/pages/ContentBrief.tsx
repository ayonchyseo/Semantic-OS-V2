import React, { useState } from "react";
import { COLORS, style } from "../utils/theme";

const SAMPLE_BRIEFS = [
  { title: "AI Video Spinner vs Manual Editing: Cost Comparison" }
];

export default function ContentBriefPage({ projectHook, onComplete }: any) {
  const [selected, setSelected] = useState<any>(SAMPLE_BRIEFS[0]);
  return (
    <div>
      <div style={style.sectionTitle}>Step 5 of 7</div>
      <h1 style={style.h1}>Content Brief<br /><span style={{ color: COLORS.accent }}>Koraynese Generator</span></h1>
      <p style={style.subtitle}>Generate a full Koraynese-compliant content brief with EAV coverage, H2 questions, and schema.</p>

      <div style={style.grid2}>
        <div>
          <div style={style.sectionTitle}>Select Article Node</div>
          {SAMPLE_BRIEFS.map((node, i) => (
            <div key={i} onClick={() => setSelected(node)} style={{
              ...style.card,
              cursor: "pointer",
              background: selected?.title === node.title ? `${COLORS.accent}10` : COLORS.card,
              borderLeft: selected?.title === node.title ? `3px solid ${COLORS.accent}` : `3px solid transparent`,
            }}>
              <div style={{ fontSize: "12px", fontWeight: "600" }}>{node.title}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ ...style.card, borderTop: `3px solid ${COLORS.accent}` }}>
            <div style={{ ...style.sectionTitle, color: COLORS.accent, marginBottom: "16px" }}>GENERATED BRIEF</div>
            <div style={{ fontWeight: "700", fontSize: "14px", marginBottom: "16px", color: COLORS.text }}>{selected.title}</div>
            <div style={{ marginBottom: "16px" }}>
              <div style={style.sectionTitle}>Document Meta</div>
              <div style={{ fontSize: "12px", marginTop: "8px", lineHeight: 1.8, color: COLORS.muted }}>
                Word count: <span style={{ color: COLORS.text }}>1,200–1,800 words</span><br />
                Featured snippet target: <span style={{ color: COLORS.green }}>YES</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button style={style.btnPrimary} onClick={onComplete}>Build Internal Link Matrix →</button>
    </div>
  );
}
