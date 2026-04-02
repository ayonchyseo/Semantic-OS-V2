import React, { useState } from "react";
import { COLORS, style } from "../utils/theme";
import { callGemini } from "../utils/gemini";
import { PROMPTS } from "../utils/prompts";

export default function TopicalMapPage({ projectHook, onComplete }: any) {
  const { activeProject, updateProject } = projectHook;
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState("");

  const data = activeProject?.topical_map;
  const nodeTypes = ["Quality", "Bridge", "Trust", "Historical", "Trending"];
  const colorMap: Record<string, string> = { Quality: COLORS.quality, Bridge: COLORS.bridge, Trust: COLORS.trust, Historical: COLORS.historical, Trending: COLORS.trending };

  const generateMap = async () => {
    if (!activeProject || !activeProject.source_context_data || !activeProject.eav_architecture) return;
    setLoading(true);
    setError("");
    try {
      setStatusText("Generating Core Section...");
      const coreResult = await callGemini(
        PROMPTS.coreSection(
          activeProject.source_context_data.central_entity,
          activeProject.source_context_data.source_context,
          activeProject.source_context_data.central_search_intent,
          JSON.stringify(activeProject.eav_architecture),
          activeProject.monetization_type
        )
      );

      setStatusText("Generating Outer Section...");
      const coreSummary = JSON.stringify(coreResult.map((n: any) => ({ title: n.article_title, intent: n.search_intent_type, context: n.macro_context })));
      const p2Attrs = JSON.stringify(
        activeProject.eav_architecture.map((e: any) => ({
          entity: e.entity,
          attributes: e.attributes.filter((a: any) => a.priority === "P2")
        }))
      );

      const outerResult = await callGemini(
        PROMPTS.outerSection(
          activeProject.source_context_data.central_entity,
          activeProject.source_context_data.topical_borders,
          coreSummary,
          p2Attrs
        )
      );

      const fullMap = [...coreResult, ...outerResult];
      updateProject(activeProject.project_id, { topical_map: fullMap });
      setStatusText("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={style.sectionTitle}>Step 4 of 7</div>
      <h1 style={style.h1}>Topical Map<br /><span style={{ color: COLORS.accent }}>Core + Outer Sections</span></h1>
      <p style={style.subtitle}>{data ? data.length : 0} nodes generated. Color-coded by type.</p>

      {!data && (
        <div style={{ marginBottom: "24px" }}>
          {!activeProject?.eav_architecture ? (
            <div style={{ color: COLORS.muted }}>Please complete EAV Architecture generation first.</div>
          ) : (
            <button style={{ ...style.btnPrimary, width: "auto" }} onClick={generateMap} disabled={loading}>
              {loading ? statusText : "Generate Topical Map"}
            </button>
          )}
          {error && <div style={{ color: "#EF4444", marginTop: "12px", fontSize: "14px" }}>{error}</div>}
        </div>
      )}

      {data && (
        <>
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
            {nodeTypes.map(t => (
              <span key={t} style={style.tag(colorMap[t])}>■ {t} Node</span>
            ))}
          </div>

          <div style={style.grid2}>
            <div>
              <div style={{ ...style.sectionTitle, color: COLORS.gold, marginBottom: "12px" }}>// CORE SECTION</div>
              {data.filter((n: any) => n.section === "Core").map((node: any, i: number) => (
                <div key={i} onClick={() => setSelected(node)} style={{
                  ...style.node(node.node_type),
                  marginBottom: "8px",
                  borderColor: selected?.title === node.article_title ? colorMap[node.node_type] : `${colorMap[node.node_type]}40`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={style.tag(colorMap[node.node_type])}>{node.node_type}</span>
                    <span style={{ fontSize: "10px", color: COLORS.muted, letterSpacing: "0.1em" }}>{node.search_intent_type.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "600", lineHeight: 1.4 }}>{node.article_title}</div>
                  <div style={{ fontSize: "11px", color: COLORS.muted, marginTop: "4px" }}>{node.target_entity} → {node.primary_attribute}</div>
                </div>
              ))}

              <div style={{ ...style.sectionTitle, color: COLORS.green, marginTop: "24px", marginBottom: "12px" }}>// OUTER SECTION</div>
              {data.filter((n: any) => n.section === "Outer").map((node: any, i: number) => (
                <div key={i} onClick={() => setSelected(node)} style={{
                  ...style.node(node.node_type),
                  marginBottom: "8px",
                  borderColor: selected?.title === node.article_title ? colorMap[node.node_type] : `${colorMap[node.node_type]}40`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={style.tag(colorMap[node.node_type])}>{node.node_type}</span>
                    <span style={{ fontSize: "10px", color: COLORS.muted, letterSpacing: "0.1em" }}>{node.search_intent_type.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "600", lineHeight: 1.4 }}>{node.article_title}</div>
                  <div style={{ fontSize: "11px", color: COLORS.muted, marginTop: "4px" }}>{node.target_entity} → {node.primary_attribute}</div>
                </div>
              ))}
            </div>
            <div>
              {selected && (
                <div style={{ ...style.card, borderTop: `3px solid ${colorMap[selected.node_type]}`, position: "sticky", top: "16px" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "0.15em", color: colorMap[selected.node_type], marginBottom: "12px" }}>NODE PREVIEW</div>
                  <div style={{ fontWeight: "700", fontSize: "15px", marginBottom: "12px" }}>{selected.article_title}</div>
                  <div style={{ fontSize: "12px", color: COLORS.muted, marginBottom: "6px" }}>Target Entity: <span style={{ color: COLORS.text }}>{selected.target_entity}</span></div>
                  <div style={{ fontSize: "12px", color: COLORS.muted, marginBottom: "6px" }}>Primary Attribute: <span style={{ color: COLORS.text }}>{selected.primary_attribute}</span></div>
                  <div style={{ fontSize: "12px", color: COLORS.muted, marginBottom: "6px" }}>Intent: <span style={style.tag(COLORS.accent)}>{selected.search_intent_type}</span></div>
                  <div style={{ fontSize: "12px", color: COLORS.muted, marginBottom: "6px", fontStyle: "italic", marginTop: "12px" }}>"{selected.macro_context}"</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
             <button style={{ ...style.btnSecondary, flex: 0.5 }} onClick={generateMap} disabled={loading}>
               {loading ? statusText : "Regenerate Map"}
             </button>
             <button style={{ ...style.btnPrimary, flex: 1 }} onClick={onComplete}>Confirm → Generate Content Briefs</button>
          </div>
        </>
      )}
    </div>
  );
}
