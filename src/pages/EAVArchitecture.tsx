import React, { useState } from "react";
import { COLORS, style } from "../utils/theme";

const SAMPLE_EAV = [
  {
    entity: "AI Video Spinner",
    type: "Product",
    attributes: [
      { name: "Cost", priority: "P1", values: ["$29/mo", "$99/mo", "$299/mo agency"], spo: "AI Video Spinner costs range from $29 to $299 per month" },
      { name: "Processing Speed", priority: "P1", values: ["Real-time", "Batch (1hr)", "Overnight queue"] },
      { name: "Output Formats", priority: "P1", values: ["MP4", "MOV", "Vertical 9:16", "Square 1:1"] },
      { name: "Platform Support", priority: "P2", values: ["YouTube", "Instagram", "TikTok", "LinkedIn"] },
    ],
  },
  {
    entity: "Video Repurposing",
    type: "Process",
    attributes: [
      { name: "Time Saved", priority: "P1", values: ["3-5 hours per video", "80% reduction", "90% with AI"] },
      { name: "Quality Output", priority: "P1", values: ["4K", "1080p", "720p optimized"] },
      { name: "Use Case", priority: "P1", values: ["YouTube → Reels", "Webinar → Clips", "Podcast → Shorts"] },
    ],
  },
];

export default function EAVArchitecturePage({ projectHook, onComplete }: any) {
  const [activeEntity, setActiveEntity] = useState(0);
  
  return (
    <div>
      <div style={style.sectionTitle}>Step 3 of 7</div>
      <h1 style={style.h1}>EAV Architecture<br /><span style={{ color: COLORS.accent }}>Knowledge Graph</span></h1>
      <p style={style.subtitle}>Entity → Attribute → Value. The semantic skeleton of your entire content network.</p>

      <div style={style.grid2}>
        <div>
          <div style={style.sectionTitle}>Entity Index</div>
          {SAMPLE_EAV.map((e, i) => (
            <div key={i} onClick={() => setActiveEntity(i)} style={{
              ...style.card,
              cursor: "pointer",
              borderLeft: activeEntity === i ? `3px solid ${COLORS.accent}` : `3px solid transparent`,
              background: activeEntity === i ? `${COLORS.accent}08` : COLORS.card,
            }}>
              <div style={{ fontWeight: "700", fontSize: "14px" }}>{e.entity}</div>
              <div style={style.tag(COLORS.muted)}>{e.type}</div>
              <div style={{ fontSize: "12px", color: COLORS.muted, marginTop: "6px" }}>{e.attributes.length} attributes mapped</div>
            </div>
          ))}
        </div>
        <div>
          <div style={style.sectionTitle}>Attributes & Values</div>
          {SAMPLE_EAV[activeEntity].attributes.map((a, i) => (
            <div key={i} style={{ ...style.card, borderLeft: `3px solid ${a.priority === "P1" ? COLORS.green : COLORS.muted}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ fontWeight: "700", fontSize: "13px" }}>{a.name}</div>
                <span style={style.tag(a.priority === "P1" ? COLORS.green : COLORS.muted)}>{a.priority}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {a.values.map(v => <span key={v} style={style.tag(COLORS.accent)}>{v}</span>)}
              </div>
              {a.spo && <div style={{ fontSize: "11px", color: COLORS.muted, marginTop: "8px", fontStyle: "italic" }}>SPO: {a.spo}</div>}
            </div>
          ))}
        </div>
      </div>

      <button style={style.btnPrimary} onClick={onComplete}>Generate Topical Map →</button>
    </div>
  );
}
