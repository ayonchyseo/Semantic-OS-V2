import React, { useState } from "react";
import { callGemini } from "../utils/gemini";
import { PROMPTS } from "../utils/prompts";
import { GrowthReport } from "../types";

export default function GrowthDashboardPage({ projectHook }: any) {
  const { activeProject, updateProject, snapshotAuthorityScore } = projectHook;
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<GrowthReport | null>(activeProject?.growth_report || null);
  const [error, setError] = useState("");

  const generateReport = async () => {
    if (!activeProject) return;
    setLoading(true); setError("");
    try {
      const mapSummary = JSON.stringify(activeProject.topical_map?.slice(0, 20) || []);
      const published = (activeProject.topical_map || [])
        .filter((n: any) => n.status === "published")
        .map((n: any) => `${n.article_title} (${n.published_date || "unknown date"})`)
        .join(", ");
      const data = await callGemini(
        PROMPTS.growthMonitor(activeProject.domain, mapSummary, published),
        { useGrounding: true, temperature: 0.6 }
      );
      setReport(data);
      updateProject(activeProject.project_id, { growth_report: data });
      snapshotAuthorityScore(activeProject.project_id);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const history = activeProject?.authority_score_history || [];
  const latestScore = history.length > 0 ? history[history.length - 1].overall_authority_score : 0;

  return (
    <div>
      <div style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.2em", marginBottom: "8px" }}>MODULE 08</div>
      <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>Growth<br /><span style={{ color: "#00E5FF" }}>Monitoring Dashboard</span></h1>
      <p style={{ color: "#6B7280", marginBottom: "24px" }}>Query gap analysis, trending nodes, content configuration triggers, and 30-day publishing calendar.</p>

      {/* Authority Score */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Authority Score", value: `${latestScore}/100`, color: "#00E5FF" },
          { label: "Published Nodes", value: `${(activeProject?.topical_map||[]).filter((n:any)=>n.status==="published").length}`, color: "#00FF88" },
          { label: "Total Nodes", value: `${(activeProject?.topical_map||[]).length}`, color: "#FFB800" },
        ].map(s => (
          <div key={s.label} style={{ background: "#16181F", border: `1px solid ${s.color}30`, borderTop: `3px solid ${s.color}`, borderRadius: "8px", padding: "20px" }}>
            <div style={{ fontSize: "10px", color: "#6B7280", letterSpacing: "0.15em", textTransform: "uppercase" }}>{s.label}</div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: s.color, marginTop: "8px" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <button onClick={generateReport} disabled={loading} style={{ background: "#00E5FF", color: "#000", border: "none", padding: "14px 28px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.15em", fontFamily: "'Space Mono', monospace", marginBottom: "24px" }}>
        {loading ? "Generating Growth Report..." : "Generate Growth Intelligence Report"}
      </button>
      {error && <div style={{ color: "#EF4444", marginBottom: "16px", fontSize: "13px" }}>{error}</div>}

      {report && (
        <div style={{ display: "grid", gap: "16px" }}>
          {/* Query Gaps */}
          <div style={{ background: "#16181F", border: "1px solid #1E2230", borderRadius: "8px", padding: "24px" }}>
            <div style={{ fontSize: "11px", color: "#FF6B35", letterSpacing: "0.2em", marginBottom: "16px" }}>// QUERY GAP ANALYSIS</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead><tr style={{ borderBottom: "1px solid #1E2230" }}>
                {["Query", "Volume", "Commercial Value", "Section", "Priority"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "#6B7280", fontWeight: "400", fontSize: "10px", letterSpacing: "0.1em" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(report.query_gap_analysis || []).map((g, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #1E223020" }}>
                    <td style={{ padding: "10px 12px", color: "#E8ECF0" }}>{g.query}</td>
                    <td style={{ padding: "10px 12px", color: "#6B7280" }}>{g.estimated_volume}</td>
                    <td style={{ padding: "10px 12px" }}><span style={{ padding: "3px 8px", borderRadius: "3px", background: g.commercial_value === "High" ? "#FFB80020" : "#1E2230", color: g.commercial_value === "High" ? "#FFB800" : "#6B7280", fontSize: "10px" }}>{g.commercial_value}</span></td>
                    <td style={{ padding: "10px 12px" }}><span style={{ padding: "3px 8px", borderRadius: "3px", background: "#00E5FF20", color: "#00E5FF", fontSize: "10px" }}>{g.recommended_section}</span></td>
                    <td style={{ padding: "10px 12px", color: "#00FF88" }}>{g.priority_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Trending Nodes */}
          <div style={{ background: "#16181F", border: "1px solid #1E2230", borderRadius: "8px", padding: "24px" }}>
            <div style={{ fontSize: "11px", color: "#FF6B35", letterSpacing: "0.2em", marginBottom: "16px" }}>// TRENDING NODES</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
              {(report.trending_nodes || []).map((t, i) => (
                <div key={i} style={{ background: "#FF6B3510", border: "1px solid #FF6B3530", borderRadius: "6px", padding: "12px" }}>
                  <div style={{ fontWeight: "700", fontSize: "13px", marginBottom: "6px" }}>{t.topic}</div>
                  <div style={{ fontSize: "11px", color: "#6B7280" }}>{t.recommended_section} Section • <span style={{ color: t.urgency === "High" ? "#EF4444" : "#FFB800" }}>{t.urgency} Urgency</span></div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Calendar */}
          <div style={{ background: "#16181F", border: "1px solid #1E2230", borderRadius: "8px", padding: "24px" }}>
            <div style={{ fontSize: "11px", color: "#00FF88", letterSpacing: "0.2em", marginBottom: "16px" }}>// 30-DAY CONTENT CALENDAR</div>
            {(report.content_calendar_30_days || []).map((week, i) => (
              <div key={i} style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "12px", color: "#00E5FF", marginBottom: "8px" }}>Week {week.week}</div>
                {(week.articles || []).map((a, j) => (
                  <div key={j} style={{ padding: "8px 12px", borderLeft: "2px solid #00FF88", background: "#00FF8808", marginBottom: "4px", fontSize: "12px" }}>
                    <span style={{ color: "#E8ECF0" }}>{a.title}</span>
                    <span style={{ color: "#6B7280", marginLeft: "8px" }}>— {a.reason}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
