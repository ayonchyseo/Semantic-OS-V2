import React, { useState } from "react";
import { callGemini } from "../utils/gemini";
import { PROMPTS } from "../utils/prompts";
import { CompetitorData } from "../types";

export default function CompetitorAnalysisPage({ projectHook }: any) {
  const { activeProject, updateProject } = projectHook;
  const [competitors, setCompetitors] = useState<CompetitorData[]>(activeProject?.competitors || []);
  const [domain, setDomain] = useState("");
  const [articles, setArticles] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!domain || !activeProject) return;
    setLoading(true); setError("");
    try {
      const mapSummary = (activeProject.topical_map || []).map((n: any) => n.article_title).join(", ");
      const data = await callGemini(
        PROMPTS.competitorAnalysis(domain, articles || "No articles provided — analyze from domain", activeProject.source_context_data?.central_entity || "", mapSummary),
        { temperature: 0.6 }
      );
      const updated = [...competitors, data];
      setCompetitors(updated);
      updateProject(activeProject.project_id, { competitors: updated });
      setDomain(""); setArticles("");
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.2em", marginBottom: "8px" }}>MODULE 09</div>
      <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>Competitor<br /><span style={{ color: "#00E5FF" }}>Topical Map Reverse Engineering</span></h1>
      <p style={{ color: "#6B7280", marginBottom: "24px" }}>Reverse-engineer competitor topical maps. Find their gaps. Build your attack plan.</p>

      <div style={{ background: "#16181F", border: "1px solid #1E2230", borderRadius: "8px", padding: "24px", marginBottom: "24px" }}>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.15em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Competitor Domain</label>
          <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="competitor.com" style={{ width: "100%", background: "#0D0F14", border: "1px solid #1E2230", borderRadius: "6px", padding: "12px 16px", color: "#E8ECF0", fontSize: "14px", fontFamily: "'Space Mono', monospace", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.15em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Competitor Article URLs (paste list, one per line)</label>
          <textarea value={articles} onChange={e => setArticles(e.target.value)} rows={6} placeholder="https://competitor.com/article-1&#10;https://competitor.com/article-2" style={{ width: "100%", background: "#0D0F14", border: "1px solid #1E2230", borderRadius: "6px", padding: "12px 16px", color: "#E8ECF0", fontSize: "12px", fontFamily: "'Space Mono', monospace", boxSizing: "border-box", resize: "vertical" }} />
        </div>
        <button onClick={analyze} disabled={loading || !domain} style={{ background: "#00E5FF", color: "#000", border: "none", padding: "14px 28px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.15em", fontFamily: "'Space Mono', monospace" }}>
          {loading ? "Analyzing..." : "Reverse Engineer Topical Map"}
        </button>
        {error && <div style={{ color: "#EF4444", marginTop: "12px", fontSize: "13px" }}>{error}</div>}
      </div>

      {competitors.map((comp, i) => (
        <div key={i} style={{ background: "#16181F", border: "1px solid #1E2230", borderRadius: "8px", padding: "24px", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ fontWeight: "700", fontSize: "16px" }}>{comp.competitor_domain}</div>
            <div style={{ background: "#EF444420", border: "1px solid #EF444440", borderRadius: "6px", padding: "4px 12px", fontSize: "12px", color: "#EF4444" }}>Coverage: {comp.estimated_coverage_score}/100</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "8px" }}>THEIR GAPS (Your Opportunities)</div>
              {(comp.their_topical_gaps || []).map((g, j) => <div key={j} style={{ fontSize: "12px", color: "#00FF88", padding: "4px 0", borderBottom: "1px solid #1E223020" }}>→ {g}</div>)}
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "8px" }}>OVERLAP (Direct Competition)</div>
              {(comp.overlap_with_our_map || []).map((g, j) => <div key={j} style={{ fontSize: "12px", color: "#FFB800", padding: "4px 0", borderBottom: "1px solid #1E223020" }}>⚡ {g}</div>)}
            </div>
          </div>
          <div style={{ fontSize: "11px", color: "#00E5FF", marginBottom: "8px" }}>ATTACK PLAN (Priority Order)</div>
          {(comp.attack_opportunities || []).map((a, j) => (
            <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#0D0F14", borderRadius: "4px", marginBottom: "4px" }}>
              <span style={{ fontSize: "12px" }}>#{a.priority} {a.topic}</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "3px", background: a.commercial_value === "High" ? "#FFB80020" : "#1E2230", color: a.commercial_value === "High" ? "#FFB800" : "#6B7280" }}>{a.commercial_value} Value</span>
                <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "3px", background: a.ranking_ease === "Easy" ? "#00FF8820" : "#1E2230", color: a.ranking_ease === "Easy" ? "#00FF88" : "#6B7280" }}>{a.ranking_ease}</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
