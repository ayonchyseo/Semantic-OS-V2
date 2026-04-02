import React from "react";
import { COLORS, style } from "../utils/theme";

export default function MultilingualModePage({ projectHook }: any) {
  return (
    <div>
      <div style={style.sectionTitle}>MODULE 12</div>
      <h1 style={style.h1}>Multilingual & <br /><span style={{ color: COLORS.accent }}>Multi-Regional Mode</span></h1>
      <p style={style.subtitle}>Adapt your topical map for different languages and target countries.</p>
      
      <div style={style.card}>
        <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.muted }}>
          <div style={{ fontSize: "32px", marginBottom: "16px" }}>🌍</div>
          <p>This module generates separate topical map roots, specific intent statements, and hreflang plans per region.</p>
          <button style={{ ...style.btnSecondary, marginTop: "16px" }}>Enable Multilingual Map</button>
        </div>
      </div>
    </div>
  );
}
