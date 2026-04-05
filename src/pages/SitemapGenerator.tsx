import React, { useState, useMemo } from "react";
import { COLORS, style } from "../utils/theme";
import { callAI } from "../utils/apiProvider";
import { PROMPTS } from "../utils/prompts";

interface SitemapEntry {
  loc: string;
  priority: number;
  changefreq: string;
  node_type: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  Quality: COLORS.gold,
  Trending: COLORS.orange,
  Bridge: COLORS.accent,
  Trust: COLORS.green,
  Historical: COLORS.muted,
};

const CHANGEFREQ_COLORS: Record<string, string> = {
  weekly: COLORS.orange,
  monthly: COLORS.accent,
  yearly: COLORS.muted,
};

export default function SitemapGeneratorPage({ projectHook }: any) {
  const { activeProject, updateProject } = projectHook;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [xmlCopied, setXmlCopied] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [filterFreq, setFilterFreq] = useState("");

  const hasMap = activeProject?.topical_map && activeProject.topical_map.length > 0;
  const sitemapData = activeProject?.sitemap_data;
  const entries: SitemapEntry[] = sitemapData?.sitemap_entries || [];
  const xmlOutput: string = sitemapData?.xml_output || "";

  const generate = async () => {
    if (!hasMap) return;
    setLoading(true);
    setError("");
    try {
      const mapSummary = JSON.stringify(
        activeProject.topical_map.map((n: any) => ({
          slug: n.slug_suggestion || n.article_title?.toLowerCase().replace(/\s+/g, "-"),
          node_type: n.node_type,
          published_url: n.published_url || "",
          status: n.status,
        }))
      );
      const result = await callAI(
        PROMPTS.sitemapGenerator(mapSummary),
        { maxTokens: 16000 }
      );
      updateProject(activeProject.project_id, { sitemap_data: result });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = [...entries];
    if (filterType) list = list.filter(e => e.node_type === filterType);
    if (filterFreq) list = list.filter(e => e.changefreq === filterFreq);
    return list;
  }, [entries, filterType, filterFreq]);

  const copyXml = () => {
    navigator.clipboard.writeText(xmlOutput).then(() => {
      setXmlCopied(true);
      setTimeout(() => setXmlCopied(false), 2000);
    });
  };

  const downloadXml = () => {
    const blob = new Blob([xmlOutput], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sitemap-${activeProject?.domain || "site"}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCsv = () => {
    const header = "URL,Priority,ChangeFreq,NodeType\n";
    const rows = entries.map(e => `${e.loc},${e.priority},${e.changefreq},${e.node_type}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sitemap-${activeProject?.domain || "site"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stats
  const stats = useMemo(() => {
    const byType: Record<string, number> = {};
    const byFreq: Record<string, number> = {};
    entries.forEach(e => {
      byType[e.node_type] = (byType[e.node_type] || 0) + 1;
      byFreq[e.changefreq] = (byFreq[e.changefreq] || 0) + 1;
    });
    return { byType, byFreq };
  }, [entries]);

  const btnFilter = (active: boolean, color: string) => ({
    background: active ? `${color}20` : "transparent",
    border: `1px solid ${active ? color : COLORS.border}`,
    color: active ? color : COLORS.muted,
    padding: "5px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "10px",
    letterSpacing: "0.1em",
    fontFamily: "'Space Mono', monospace",
  });

  return (
    <div>
      <div style={style.sectionTitle}>Module 15</div>
      <h1 style={style.h1}>XML Sitemap<br /><span style={{ color: COLORS.accent }}>Architecture</span></h1>
      <p style={style.subtitle}>
        Auto-generate a priority-weighted XML sitemap from your topical map.
        Quality nodes = 0.9 priority · Trending = 0.8 · Bridge = 0.7 · Trust = 0.6 · Historical = 0.5
      </p>

      {!hasMap && (
        <div style={{ ...style.card, borderColor: COLORS.gold + "50" }}>
          <div style={{ color: COLORS.gold, fontSize: "13px" }}>
            ⚠ Generate a Topical Map (Step 4) first to build the sitemap.
          </div>
        </div>
      )}

      {hasMap && !sitemapData && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "13px", color: COLORS.muted, marginBottom: "14px" }}>
            {activeProject.topical_map.length} nodes found in topical map.
          </div>
          <button style={{ ...style.btnPrimary, width: "auto" }} onClick={generate} disabled={loading}>
            {loading ? "Generating Sitemap..." : "🗂️ Generate XML Sitemap"}
          </button>
          {error && (
            <div style={{ color: "#EF4444", marginTop: "12px", fontSize: "13px", background: "#EF444415", padding: "12px", borderRadius: "6px" }}>
              {error}
            </div>
          )}
        </div>
      )}

      {sitemapData && (
        <>
          {/* Summary stats */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: "6px", padding: "12px 18px" }}>
              <div style={{ fontSize: "24px", fontWeight: "700", color: COLORS.accent }}>{entries.length}</div>
              <div style={{ fontSize: "10px", color: COLORS.muted, letterSpacing: "0.1em" }}>TOTAL URLs</div>
            </div>
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: "6px", padding: "12px 18px" }}>
                <div style={{ fontSize: "24px", fontWeight: "700", color: PRIORITY_COLORS[type] || COLORS.muted }}>{count}</div>
                <div style={{ fontSize: "10px", color: COLORS.muted, letterSpacing: "0.1em" }}>{type.toUpperCase()}</div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
            <button style={{ ...style.btnPrimary, fontSize: "11px", padding: "10px 18px" }} onClick={downloadXml}>
              ↓ Download .xml
            </button>
            <button style={{ ...style.btnSecondary, fontSize: "11px", padding: "10px 18px" }} onClick={downloadCsv}>
              ↓ Download .csv
            </button>
            <button style={{ ...style.btnSecondary, fontSize: "11px", padding: "10px 18px" }} onClick={copyXml}>
              {xmlCopied ? "✓ Copied!" : "⧉ Copy XML"}
            </button>
            <button
              style={{ ...style.btnSecondary, fontSize: "11px", padding: "10px 18px" }}
              onClick={generate}
              disabled={loading}
            >
              {loading ? "Regenerating..." : "↺ Regenerate"}
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "10px", color: COLORS.muted }}>Filter:</span>
            {Object.keys(PRIORITY_COLORS).map(t => (
              <button key={t} style={btnFilter(filterType === t, PRIORITY_COLORS[t])} onClick={() => setFilterType(filterType === t ? "" : t)}>
                {t}
              </button>
            ))}
            <span style={{ color: COLORS.border }}>|</span>
            {["weekly", "monthly", "yearly"].map(f => (
              <button key={f} style={btnFilter(filterFreq === f, CHANGEFREQ_COLORS[f])} onClick={() => setFilterFreq(filterFreq === f ? "" : f)}>
                {f}
              </button>
            ))}
            {(filterType || filterFreq) && (
              <button onClick={() => { setFilterType(""); setFilterFreq(""); }}
                style={{ ...btnFilter(false, COLORS.muted), color: COLORS.accent }}>
                × Clear
              </button>
            )}
            <span style={{ fontSize: "11px", color: COLORS.muted, marginLeft: "4px" }}>
              {filtered.length} of {entries.length} URLs
            </span>
          </div>

          {/* Entries table */}
          <div style={{ ...style.card, padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto", maxHeight: "420px", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead style={{ position: "sticky", top: 0, background: COLORS.surface }}>
                  <tr>
                    {["URL / Slug", "Priority", "Change Freq", "Node Type"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: "10px", color: COLORS.muted, letterSpacing: "0.1em", borderBottom: `1px solid ${COLORS.border}` }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((entry, i) => {
                    const tc = PRIORITY_COLORS[entry.node_type] || COLORS.muted;
                    const fc = CHANGEFREQ_COLORS[entry.changefreq] || COLORS.muted;
                    return (
                      <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}20` }}>
                        <td style={{ padding: "8px 14px", color: COLORS.text, fontFamily: "monospace", fontSize: "11px", maxWidth: "400px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {entry.loc}
                        </td>
                        <td style={{ padding: "8px 14px" }}>
                          <span style={{ color: tc, fontWeight: "700" }}>{entry.priority}</span>
                        </td>
                        <td style={{ padding: "8px 14px" }}>
                          <span style={{ color: fc, fontSize: "11px" }}>{entry.changefreq}</span>
                        </td>
                        <td style={{ padding: "8px 14px" }}>
                          <span style={{
                            fontSize: "10px", padding: "2px 8px", borderRadius: "3px",
                            background: `${tc}18`, border: `1px solid ${tc}40`, color: tc,
                          }}>
                            {entry.node_type}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* XML Preview */}
          {xmlOutput && (
            <div style={{ ...style.card, marginTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ fontSize: "11px", color: COLORS.muted, letterSpacing: "0.15em" }}>// XML PREVIEW</div>
                <button onClick={copyXml} style={{ ...style.btnSecondary, fontSize: "10px", padding: "5px 12px" }}>
                  {xmlCopied ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <pre style={{
                fontSize: "10px",
                color: COLORS.green,
                background: "#0A0B0F",
                padding: "14px",
                borderRadius: "6px",
                overflowX: "auto",
                overflowY: "auto",
                maxHeight: "280px",
                margin: 0,
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              }}>
                {xmlOutput.slice(0, 3000)}{xmlOutput.length > 3000 ? "\n... (truncated — download full file above)" : ""}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
