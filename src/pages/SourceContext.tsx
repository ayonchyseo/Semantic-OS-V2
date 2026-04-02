import React, { useState } from "react";
import { COLORS, style } from "../utils/theme";
import { callGemini } from "../utils/gemini";
import { PROMPTS } from "../utils/prompts";

export default function SourceContextPage({ projectHook, onComplete }: any) {
  const { activeProject, updateProject } = projectHook;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const data = activeProject?.source_context_data;

  const generateSourceContext = async () => {
    if (!activeProject) return;
    setLoading(true);
    setError("");
    try {
      const result = await callGemini(
        PROMPTS.sourceContext(
          activeProject.domain,
          activeProject.business_description || "",
          activeProject.geo_targets[0] || "",
          activeProject.site_type,
          activeProject.monetization_type
        )
      );
      updateProject(activeProject.project_id, { source_context_data: result });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={style.sectionTitle}>Step 2 of 7</div>
      <h1 style={style.h1}>Source Context<br /><span style={{ color: COLORS.accent }}>Analysis Engine</span></h1>
      <p style={style.subtitle}>Gemini will analyze your domain and extract the semantic foundation necessary to build your Topical Map.</p>

      {!data && (
        <div style={{ marginBottom: "24px" }}>
          <button style={{ ...style.btnPrimary, width: "auto" }} onClick={generateSourceContext} disabled={loading}>
            {loading ? "Generating Source Context..." : "Generate Source Context"}
          </button>
          {error && <div style={{ color: "#EF4444", marginTop: "12px", fontSize: "14px" }}>{error}</div>}
        </div>
      )}

      {data && (
        <>
          <div style={style.grid2}>
            <div style={{ ...style.card, borderTop: `3px solid ${COLORS.accent}` }}>
              <div style={style.sectionTitle}>Source Context</div>
              <p style={{ fontSize: "14px", lineHeight: 1.7, marginTop: "8px" }}>
                {data.source_context}
              </p>
            </div>
            <div style={{ ...style.card, borderTop: `3px solid ${COLORS.gold}` }}>
              <div style={style.sectionTitle}>Central Entity</div>
              <div style={{ fontSize: "24px", fontWeight: "700", color: COLORS.gold, marginTop: "8px" }}>{data.central_entity}</div>
              <div style={{ fontSize: "12px", color: COLORS.muted, marginTop: "6px" }}>appears in every section of the topical map</div>
            </div>
          </div>

          <div style={{ ...style.card, borderTop: `3px solid ${COLORS.purple}` }}>
            <div style={style.sectionTitle}>Central Search Intent</div>
            <p style={{ fontSize: "15px", lineHeight: 1.7, color: COLORS.text, marginTop: "8px" }}>
              "{data.central_search_intent}"
            </p>
          </div>

          <div style={style.card}>
            <div style={style.sectionTitle}>Topical Borders (Do NOT Write About)</div>
            <div style={{ marginTop: "12px" }}>
              {(data.topical_borders || []).map((b: string) => (
                <span key={b} style={style.tag("#EF4444")}>{b}</span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
             <button style={{ ...style.btnSecondary, flex: 0.5 }} onClick={generateSourceContext} disabled={loading}>
               {loading ? "Regenerating..." : "Regenerate"}
             </button>
             <button style={{ ...style.btnPrimary, flex: 1 }} onClick={onComplete}>Confirm → Build EAV Architecture</button>
          </div>
        </>
      )}
    </div>
  );
}
