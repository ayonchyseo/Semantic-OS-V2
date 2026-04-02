import React from "react";
import { COLORS, style } from "../utils/theme";

export default function SemanticDistancePage({ projectHook }: any) {
  return (
    <div>
      <div style={style.sectionTitle}>MODULE 13</div>
      <h1 style={style.h1}>Semantic<br /><span style={{ color: COLORS.accent }}>Distance Calculator</span></h1>
      <p style={style.subtitle}>Evaluate proximity to Central Entity to ensure safe publishing zones.</p>
      
      <div style={style.card}>
        <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.muted }}>
          <div style={{ fontSize: "32px", marginBottom: "16px" }}>📏</div>
          <p>Score new topics on a 0-100 proximity scale to avoid border risk areas.</p>
          <button style={{ ...style.btnSecondary, marginTop: "16px" }}>Evaluate Topic Distance</button>
        </div>
      </div>
    </div>
  );
}
