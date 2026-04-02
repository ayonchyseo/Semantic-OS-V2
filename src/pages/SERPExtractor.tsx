import React, { useState } from "react";
import { callGemini } from "../utils/gemini";
import { PROMPTS } from "../utils/prompts";

export default function SERPExtractorPage({ projectHook }: any) {
  const { activeProject } = projectHook;
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const extract = async () => {
    if (!selectedNode) return;
    setLoading(true); setError("");
    try {
      const planned = selectedNode.target_entity || "";
      const data = await callGemini(
        PROMPTS.serpEntityExtractor(selectedNode.article_title, selectedNode.article_title, JSON.stringify([planned])),
        { useGrounding: true, temperature: 0.3 }
      );
      setResult(data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const nodes = activeProject?.topical_map || [];

  return (
    <div>
      <div style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.2em", marginBottom: "8px" }}>MODULE 10</div>
      <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>SERP Entity<br /><span style={{ color: "#00E5FF" }}>Intelligence Extractor</span></h1>
      <p style={{ color: "#6B7280", marginBottom: "24px" }}>Extract entities from top-ranking SERP results. Find what Google expects to see. Fill entity gaps before writing.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div>
          <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "12px", letterSpacing: "0.15em" }}>SELECT ARTICLE NODE</div>
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {nodes.length === 0 ? <p style={{color: "#6B7280"}}>No nodes available yet.</p> : nodes.map((node: any) => (
              <div key={node.node_id} onClick={() => setSelectedNode(node)} style={{ padding: "10px 14px", background: selectedNode?.node_id === node.node_id ? "#00E5FF10" : "#16181F", border: `1px solid ${selectedNode?.node_id === node.node_id ? "#00E5FF40" : "#1E2230"}`, borderRadius: "6px", marginBottom: "6px", cursor: "pointer", fontSize: "12px" }}>
                <div style={{ fontWeight: "600" }}>{node.article_title}</div>
                <div style={{ color: "#6B7280", fontSize: "10px", marginTop: "2px" }}>{node.section} • {node.node_type}</div>
              </div>
            ))}
          </div>
          <button onClick={extract} disabled={loading || !selectedNode} style={{ marginTop: "16px", background: "#00E5FF", color: "#000", border: "none", padding: "14px 28px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.12em", fontFamily: "'Space Mono', monospace", width: "100%" }}>
            {loading ? "Searching SERP..." : "Extract SERP Entities"}
          </button>
          {error && <div style={{ color: "#EF4444", marginTop: "8px", fontSize: "12px" }}>{error}</div>}
        </div>

        {result && (
          <div>
            <div style={{ background: "#16181F", border: "1px solid #1E2230", borderRadius: "8px", padding: "20px", marginBottom: "12px" }}>
              <div style={{ fontSize: "11px", color: "#00E5FF", marginBottom: "8px" }}>ENTITY COMPLETENESS SCORE</div>
              <div style={{ fontSize: "36px", fontWeight: "700", color: result.entity_completeness_score > 70 ? "#00FF88" : "#EF4444" }}>{result.entity_completeness_score}/100</div>
            </div>
            <div style={{ background: "#EF444410", border: "1px solid #EF444430", borderRadius: "8px", padding: "20px", marginBottom: "12px" }}>
              <div style={{ fontSize: "11px", color: "#EF4444", marginBottom: "8px" }}>ENTITY GAPS (Add These to Brief)</div>
              {(result.entity_gaps || []).map((e: string, i: number) => <div key={i} style={{ fontSize: "12px", color: "#E8ECF0", padding: "4px 0", borderBottom: "1px solid #EF444420" }}>⚠ {e}</div>)}
            </div>
            <div style={{ background: "#16181F", border: "1px solid #1E2230", borderRadius: "8px", padding: "20px", marginBottom: "12px" }}>
              <div style={{ fontSize: "11px", color: "#FFB800", marginBottom: "8px" }}>PAA QUESTIONS (Use as H2s)</div>
              {(result.paa_questions || []).map((q: string, i: number) => <div key={i} style={{ fontSize: "12px", color: "#E8ECF0", padding: "4px 0", borderBottom: "1px solid #1E223020" }}>? {q}</div>)}
            </div>
            <div style={{ background: "#16181F", border: "1px solid #1E2230", borderRadius: "8px", padding: "20px" }}>
              <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "8px" }}>FEATURED SNIPPET FORMAT</div>
              <div style={{ fontSize: "14px", color: "#A855F7", fontWeight: "700" }}>{result.featured_snippet_format?.toUpperCase() || "PARAGRAPH"}</div>
              <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "8px" }}>Format your H2 extractive answer to match this format.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
