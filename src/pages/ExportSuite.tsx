import React from "react";
import { COLORS, style } from "../utils/theme";

export default function ExportSuitePage({ projectHook }: any) {
  return (
    <div>
      <div style={style.sectionTitle}>MODULE 16</div>
      <h1 style={style.h1}>Project<br /><span style={{ color: COLORS.accent }}>Export Suite</span></h1>
      <p style={style.subtitle}>Export the Topical Map data seamlessly.</p>
      
      <div style={style.card}>
        <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.muted }}>
          <div style={{ fontSize: "32px", marginBottom: "16px" }}>📦</div>
          <p>Download map data as JSON, publishing schedules as CSVs, and audit reports as PDFs.</p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "24px" }}>
            <button style={{ ...style.btnPrimary }}>Download Map (JSON)</button>
            <button style={{ ...style.btnSecondary }}>Export Calendar (CSV)</button>
          </div>
        </div>
      </div>
    </div>
  );
}
