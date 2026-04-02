import React, { useState } from "react";
import { COLORS, style } from "../utils/theme";
import { callGemini } from "../utils/gemini";
import { PROMPTS } from "../utils/prompts";

export default function EAVArchitecturePage({ projectHook, onComplete }: any) {
  const { activeProject, updateProject } = projectHook;
  const [activeEntity, setActiveEntity] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const data = activeProject?.eav_architecture;

  const generateEAV = async () => {
    if (!activeProject || !activeProject.source_context_data) return;
    setLoading(true);
    setError("");
    try {
      const result = await callGemini(
        PROMPTS.eavArchitecture(
          activeProject.source_context_data.central_entity,
          activeProject.source_context_data.source_context,
          activeProject.source_context_data.central_search_intent,
          activeProject.monetization_type
        )
      );
      updateProject(activeProject.project_id, { eav_architecture: result.eav_architecture });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={style.sectionTitle}>Step 3 of 7</div>
      <h1 style={style.h1}>EAV Architecture<br /><span style={{ color: COLORS.accent }}>Knowledge Graph</span></h1>
      <p style={style.subtitle}>Entity → Attribute → Value. The semantic skeleton of your entire content network.</p>

      {!data && (
        <div style={{ marginBottom: "24px" }}>
          {!activeProject?.source_context_data ? (
            <div style={{ color: COLORS.muted }}>Please complete Source Context generation first.</div>
          ) : (
            <button style={{ ...style.btnPrimary, width: "auto" }} onClick={generateEAV} disabled={loading}>
              {loading ? "Generating EAV Architecture..." : "Generate EAV Architecture"}
            </button>
          )}
          {error && <div style={{ color: "#EF4444", marginTop: "12px", fontSize: "14px" }}>{error}</div>}
        </div>
      )}

      {data && (
        <>
          <div style={style.grid2}>
            <div>
              <div style={style.sectionTitle}>Entity Index</div>
              {data.map((e: any, i: number) => (
                <div key={i} onClick={() => setActiveEntity(i)} style={{
                  ...style.card,
                  cursor: "pointer",
                  borderLeft: activeEntity === i ? `3px solid ${COLORS.accent}` : `3px solid transparent`,
                  background: activeEntity === i ? `${COLORS.accent}08` : COLORS.card,
                }}>
                  <div style={{ fontWeight: "700", fontSize: "14px" }}>{e.entity}</div>
                  <div style={style.tag(COLORS.muted)}>{e.entity_type}</div>
                  <div style={{ fontSize: "12px", color: COLORS.muted, marginTop: "6px" }}>{e.attributes.length} attributes mapped</div>
                </div>
              ))}
            </div>
            <div>
              <div style={style.sectionTitle}>Attributes & Values</div>
              {data[activeEntity]?.attributes.map((a: any, i: number) => (
                <div key={i} style={{ ...style.card, borderLeft: `3px solid ${a.priority === "P1" ? COLORS.green : COLORS.muted}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div style={{ fontWeight: "700", fontSize: "13px" }}>{a.attribute}</div>
                    <span style={style.tag(a.priority === "P1" ? COLORS.green : COLORS.muted)}>{a.priority}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "8px" }}>
                    {a.values.map((v: string) => <span key={v} style={style.tag(COLORS.accent)}>{v}</span>)}
                  </div>
                  <div style={{ fontSize: "11px", color: COLORS.muted, fontStyle: "italic", marginBottom: "4px" }}>SPO: {a.spo_triple}</div>
                  <div style={{ fontSize: "11px", color: COLORS.muted }}>Target: {a.section_target}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
             <button style={{ ...style.btnSecondary, flex: 0.5 }} onClick={generateEAV} disabled={loading}>
               {loading ? "Regenerating..." : "Regenerate"}
             </button>
             <button style={{ ...style.btnPrimary, flex: 1 }} onClick={onComplete}>Confirm → Build Topical Map</button>
          </div>
        </>
      )}
    </div>
  );
}
