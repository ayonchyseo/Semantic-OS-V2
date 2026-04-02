import React, { useState } from "react";
import { COLORS, style } from "../utils/theme";
import { callGemini } from "../utils/gemini";
import { PROMPTS } from "../utils/prompts";

export default function ContentBriefPage({ projectHook, onComplete }: any) {
  const { activeProject, updateProject } = projectHook;
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nodes = activeProject?.topical_map || [];
  const briefs = activeProject?.content_briefs || {};

  const generateBrief = async () => {
    if (!activeProject || !selectedNode || !activeProject.eav_architecture) return;
    setLoading(true);
    setError("");
    try {
      const eavJson = JSON.stringify(activeProject.eav_architecture.find((e: any) => e.entity === selectedNode.target_entity) || {});
      const availableLinks = JSON.stringify(nodes.map((n: any) => n.article_title));
      
      const result = await callGemini(
        PROMPTS.contentBrief(
          JSON.stringify(selectedNode),
          eavJson,
          availableLinks,
          activeProject.geo_targets?.[0] || "Global"
        ),
        { temperature: 0.5 }
      );
      
      // result has node_id empty from prompt, so let's enforce it
      result.node_id = selectedNode.node_id || selectedNode.article_title;
      
      const updatedBriefs = { ...briefs, [result.node_id]: result };
      updateProject(activeProject.project_id, { content_briefs: updatedBriefs });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const currentBriefId = selectedNode?.node_id || selectedNode?.article_title;
  const currentBrief = currentBriefId ? briefs[currentBriefId] : null;

  return (
    <div>
      <div style={style.sectionTitle}>Step 5 of 7</div>
      <h1 style={style.h1}>Content Brief<br /><span style={{ color: COLORS.accent }}>Koraynese Generator</span></h1>
      <p style={style.subtitle}>Generate a full Koraynese-compliant content brief with EAV coverage, H2 questions, and schema.</p>

      <div style={style.grid2}>
        <div>
          <div style={style.sectionTitle}>Select Article Node</div>
          {nodes.length === 0 && <div style={{ color: COLORS.muted }}>Please generate a Topical Map first.</div>}
          <div style={{ maxHeight: "600px", overflowY: "auto", paddingRight: "8px" }}>
            {nodes.map((node: any, i: number) => {
              const hasBrief = !!briefs[node.node_id || node.article_title];
              return (
                <div key={i} onClick={() => setSelectedNode(node)} style={{
                  ...style.card,
                  cursor: "pointer",
                  background: selectedNode?.article_title === node.article_title ? `${COLORS.accent}10` : COLORS.card,
                  borderLeft: selectedNode?.article_title === node.article_title ? `3px solid ${COLORS.accent}` : `3px solid transparent`,
                  marginBottom: "8px",
                  padding: "12px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: hasBrief ? COLORS.green : COLORS.text }}>{node.article_title}</div>
                    {hasBrief && <span style={style.tag(COLORS.green)}>Generated</span>}
                  </div>
                  <div style={{ fontSize: "10px", color: COLORS.muted }}>{node.section} Section • {node.node_type}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          {selectedNode && !currentBrief && (
             <div style={{ ...style.card, borderTop: `3px solid ${COLORS.accent}` }}>
               <div style={{ fontSize: "14px", fontWeight: "700", marginBottom: "16px" }}>{selectedNode.article_title}</div>
               <button onClick={generateBrief} disabled={loading} style={{ ...style.btnPrimary, width: "100%" }}>
                 {loading ? "Generating Brief..." : "Generate Brief"}
               </button>
               {error && <div style={{ color: "#EF4444", marginTop: "12px", fontSize: "14px" }}>{error}</div>}
             </div>
          )}

          {currentBrief && (
            <div style={{ ...style.card, borderTop: `3px solid ${COLORS.accent}`, maxHeight: "600px", overflowY: "auto" }}>
              <div style={{ ...style.sectionTitle, color: COLORS.accent, marginBottom: "16px" }}>GENERATED BRIEF</div>
              <div style={{ fontWeight: "700", fontSize: "18px", marginBottom: "8px", color: COLORS.text }}>{currentBrief.h1}</div>
              <div style={{ fontSize: "12px", color: COLORS.muted, fontStyle: "italic", marginBottom: "16px" }}>"{currentBrief.macro_context_statement}"</div>
              
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.15em", color: COLORS.muted, marginBottom: "4px" }}>OPENING PARAGRAPH (≤40 words)</div>
                <div style={{ fontSize: "13px", color: COLORS.text, background: `${COLORS.accent}10`, padding: "12px", borderRadius: "6px" }}>
                  {currentBrief.opening_paragraph}
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div style={style.sectionTitle}>Document Meta</div>
                <div style={{ fontSize: "12px", marginTop: "8px", lineHeight: 1.8, color: COLORS.muted }}>
                  Word count target: <span style={{ color: COLORS.text }}>{currentBrief.document_meta?.word_count_range || "1200-1800"}</span><br />
                  Featured snippet target: <span style={{ color: currentBrief.document_meta?.featured_snippet_target ? COLORS.green : COLORS.muted }}>{currentBrief.document_meta?.featured_snippet_target ? "YES" : "NO"}</span>
                  {currentBrief.document_meta?.featured_snippet_reason && <div>({currentBrief.document_meta.featured_snippet_reason})</div>}
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                 <div style={style.sectionTitle}>H2 Sections</div>
                 {currentBrief.outline?.map((o: any, idx: number) => (
                   <div key={idx} style={{ background: "#0D0F14", padding: "12px", borderRadius: "6px", marginBottom: "8px", border: "1px solid #1E2230" }}>
                     <div style={{ fontWeight: "700", fontSize: "13px", color: COLORS.text, marginBottom: "6px" }}>{o.h2}</div>
                     <div style={{ fontSize: "12px", color: COLORS.muted, marginBottom: "8px" }}>{o.extractive_answer}</div>
                     <div style={{ fontSize: "10px", color: COLORS.accent, fontStyle: "italic" }}>SPO: {o.spo_triple}</div>
                   </div>
                 ))}
              </div>
              
              <div style={{ marginBottom: "0" }}>
                 <div style={style.sectionTitle}>Internal Linking Plan</div>
                 {currentBrief.internal_links?.map((l: any, idx: number) => (
                   <div key={idx} style={{ fontSize: "12px", background: "#0D0F14", padding: "8px 12px", borderRadius: "6px", marginBottom: "4px", border: "1px solid #1E2230" }}>
                     Link to <span style={{ color: COLORS.text }}>{l.target_article}</span> via "{l.anchor_text}" <span style={style.tag(COLORS.muted)}>{l.intent_stage}</span>
                   </div>
                 ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <button style={{ ...style.btnPrimary, marginTop: "24px" }} onClick={onComplete}>Build Internal Link Matrix →</button>
    </div>
  );
}
