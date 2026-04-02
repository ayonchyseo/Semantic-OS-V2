import React, { useState } from "react";
import { COLORS, style } from "../utils/theme";
import { callGemini } from "../utils/gemini";
import { PROMPTS } from "../utils/prompts";

export default function InternalLinksPage({ projectHook, onComplete }: any) {
  const { activeProject, updateProject } = projectHook;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const data = activeProject?.link_architecture;
  const mapData = activeProject?.topical_map;

  const generateLinks = async () => {
    if (!activeProject || !mapData) return;
    setLoading(true);
    setError("");
    try {
      const result = await callGemini(
        PROMPTS.linkArchitecture(JSON.stringify(mapData))
      );
      updateProject(activeProject.project_id, { link_architecture: result });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={style.sectionTitle}>Step 6 of 7</div>
      <h1 style={style.h1}>Internal Link<br /><span style={{ color: COLORS.accent }}>Architecture Matrix</span></h1>
      <p style={style.subtitle}>Intent-progressive linking strategy. Every anchor text moves the reader systemically.</p>

      {!data && (
        <div style={{ marginBottom: "24px" }}>
          {!mapData ? (
            <div style={{ color: COLORS.muted }}>Please generate a Topical Map first.</div>
          ) : (
            <button style={{ ...style.btnPrimary, width: "auto" }} onClick={generateLinks} disabled={loading}>
              {loading ? "Generating Link Architecture..." : "Generate Internal Links"}
            </button>
          )}
          {error && <div style={{ color: "#EF4444", marginTop: "12px", fontSize: "14px" }}>{error}</div>}
        </div>
      )}

      {data && (
        <>
          <div style={style.grid3}>
            {[
              { label: "Total Links Planned", value: data.link_matrix?.length || 0, color: COLORS.accent },
              { label: "Pillar Pages", value: data.pillar_pages?.length || 0, color: COLORS.green },
              { label: "Orphan Alerts", value: data.orphan_alerts?.length || 0, color: COLORS.gold },
            ].map(s => (
              <div key={s.label} style={style.statCard(s.color)}>
                <div style={style.sectionTitle}>{s.label}</div>
                <div style={{ fontSize: "32px", fontWeight: "700", color: s.color, marginTop: "8px" }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ ...style.card, marginTop: "16px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <th style={{ padding: "8px 12px", color: COLORS.muted }}>FROM ARTICLE</th>
                  <th style={{ padding: "8px 12px", color: COLORS.muted }}>TO ARTICLE</th>
                  <th style={{ padding: "8px 12px", color: COLORS.muted }}>ANCHOR TEXT</th>
                  <th style={{ padding: "8px 12px", color: COLORS.muted }}>INTENT STAGE</th>
                </tr>
              </thead>
              <tbody>
                {(data.link_matrix || []).map((l: any, i: number) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}30` }}>
                    <td style={{ padding: "10px 12px", color: COLORS.text }}>{l.from_article}</td>
                    <td style={{ padding: "10px 12px", color: COLORS.text }}>{l.to_article}</td>
                    <td style={{ padding: "10px 12px", color: COLORS.accent }}>"{l.anchor_text}"</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={style.tag(l.intent_stage === "Commercial" ? COLORS.gold : COLORS.bridge)}>{l.intent_stage}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
             <button style={{ ...style.btnSecondary, flex: 0.5 }} onClick={generateLinks} disabled={loading}>
               {loading ? "Regenerating..." : "Regenerate"}
             </button>
             <button style={{ ...style.btnPrimary, flex: 1 }} onClick={onComplete}>Run Topical Authority Audit →</button>
          </div>
        </>
      )}
    </div>
  );
}
