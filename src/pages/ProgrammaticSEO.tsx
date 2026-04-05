import React, { useState } from "react";
import { COLORS, style } from "../utils/theme";
import { callAI } from "../utils/apiProvider";
import { PROMPTS } from "../utils/prompts";

interface ProgrammaticBlueprint {
  url_pattern: string;
  title_template: string;
  h1_template: string;
  macro_context_template: string;
  estimated_page_count: number;
  schema_template: Record<string, any>;
  internal_linking_pattern: string;
  deduplication_rules: string[];
  sample_pages: Array<{ value: string; url: string; title: string; h1: string }>;
}

export default function ProgrammaticSEOPage({ projectHook }: any) {
  const { activeProject, updateProject } = projectHook;
  const [entityType, setEntityType] = useState("");
  const [variable, setVariable] = useState("");
  const [exampleValues, setExampleValues] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeBlueprint, setActiveBlueprint] = useState(0);

  const hasContext = !!activeProject?.source_context_data;
  const blueprints: ProgrammaticBlueprint[] = activeProject?.programmatic_blueprints || [];

  const generate = async () => {
    if (!entityType.trim() || !variable.trim() || !exampleValues.trim() || !hasContext) return;
    setLoading(true);
    setError("");
    try {
      const sc = activeProject.source_context_data;
      const values = exampleValues.split("\n").map(v => v.trim()).filter(Boolean).slice(0, 10);
      const result: ProgrammaticBlueprint = await callAI(
        PROMPTS.programmaticSEO(entityType.trim(), variable.trim(), sc.source_context, values),
        { maxTokens: 8000 }
      );
      const updated = [...blueprints, result];
      updateProject(activeProject.project_id, { programmatic_blueprints: updated });
      setActiveBlueprint(updated.length - 1);
      setEntityType("");
      setVariable("");
      setExampleValues("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const bp = blueprints[activeBlueprint];

  return (
    <div>
      <div style={style.sectionTitle}>Module 14</div>
      <h1 style={style.h1}>Programmatic<br /><span style={{ color: COLORS.accent }}>SEO Strategy</span></h1>
      <p style={style.subtitle}>
        Scale content by defining entity-variable URL templates. Generate URL patterns,
        H1 templates, schema blueprints, and sample pages automatically.
      </p>

      {!hasContext && (
        <div style={{ ...style.card, borderColor: COLORS.gold + "50" }}>
          <div style={{ color: COLORS.gold, fontSize: "13px" }}>
            ⚠ Complete Source Context (Step 2) first.
          </div>
        </div>
      )}

      {hasContext && (
        <div style={{ display: "grid", gridTemplateColumns: blueprints.length > 0 ? "380px 1fr" : "1fr", gap: "16px" }}>
          {/* Left: Form */}
          <div>
            <div style={style.card}>
              <div style={{ fontSize: "11px", color: COLORS.muted, letterSpacing: "0.15em", marginBottom: "16px" }}>
                // NEW PROGRAMMATIC BLUEPRINT
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={style.label}>Entity Type</label>
                <input
                  value={entityType}
                  onChange={e => setEntityType(e.target.value)}
                  placeholder="e.g. City, Product, Service, Tool"
                  style={style.input}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={style.label}>Variable Name</label>
                <input
                  value={variable}
                  onChange={e => setVariable(e.target.value)}
                  placeholder="e.g. location, product-name, keyword"
                  style={style.input}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={style.label}>Example Values (one per line, max 10)</label>
                <textarea
                  value={exampleValues}
                  onChange={e => setExampleValues(e.target.value)}
                  placeholder={"New York\nLos Angeles\nChicago\nHouston"}
                  style={{ ...style.textarea, minHeight: "120px" }}
                />
                <div style={{ fontSize: "10px", color: COLORS.muted, marginTop: "4px" }}>
                  {exampleValues.split("\n").filter(Boolean).length} values entered
                </div>
              </div>

              <button
                onClick={generate}
                disabled={loading || !entityType.trim() || !variable.trim() || !exampleValues.trim()}
                style={{ ...style.btnPrimary, width: "100%" }}
              >
                {loading ? "Generating Blueprint..." : "⚙ Generate Blueprint"}
              </button>

              {error && (
                <div style={{ color: "#EF4444", marginTop: "12px", fontSize: "13px", background: "#EF444415", padding: "12px", borderRadius: "6px" }}>
                  {error}
                </div>
              )}
            </div>

            {/* Blueprint list */}
            {blueprints.length > 0 && (
              <div style={{ marginTop: "0" }}>
                <div style={{ fontSize: "11px", color: COLORS.muted, letterSpacing: "0.15em", marginBottom: "8px" }}>
                  // SAVED BLUEPRINTS ({blueprints.length})
                </div>
                {blueprints.map((b, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveBlueprint(i)}
                    style={{
                      ...style.card,
                      padding: "10px 14px",
                      cursor: "pointer",
                      borderLeft: `3px solid ${activeBlueprint === i ? COLORS.accent : COLORS.border}`,
                      background: activeBlueprint === i ? `${COLORS.accent}08` : COLORS.card,
                      marginBottom: "6px",
                    }}
                  >
                    <div style={{ fontSize: "12px", fontWeight: "600", color: activeBlueprint === i ? COLORS.accent : COLORS.text }}>
                      {b.url_pattern}
                    </div>
                    <div style={{ fontSize: "10px", color: COLORS.muted, marginTop: "2px" }}>
                      ~{b.estimated_page_count} pages
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Blueprint detail */}
          {bp && (
            <div>
              <div style={style.card}>
                <div style={{ fontSize: "11px", color: COLORS.accent, letterSpacing: "0.15em", marginBottom: "16px" }}>
                  // BLUEPRINT: {bp.url_pattern}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                  {[
                    ["URL Pattern", bp.url_pattern],
                    ["Est. Page Count", `~${bp.estimated_page_count} pages`],
                    ["Title Template", bp.title_template],
                    ["H1 Template", bp.h1_template],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <div style={{ fontSize: "10px", color: COLORS.muted, letterSpacing: "0.1em", marginBottom: "4px" }}>{label}</div>
                      <div style={{ fontSize: "12px", color: COLORS.text, fontFamily: label.includes("Template") || label.includes("Pattern") ? "'Space Mono', monospace" : "inherit" }}>
                        {val}
                      </div>
                    </div>
                  ))}
                </div>

                {bp.macro_context_template && (
                  <div style={{ padding: "12px", background: `${COLORS.purple}10`, border: `1px solid ${COLORS.purple}20`, borderRadius: "6px", marginBottom: "14px" }}>
                    <div style={{ fontSize: "10px", color: COLORS.purple, marginBottom: "6px" }}>MACRO CONTEXT TEMPLATE</div>
                    <div style={{ fontSize: "12px", color: COLORS.text, fontStyle: "italic" }}>{bp.macro_context_template}</div>
                  </div>
                )}

                {bp.internal_linking_pattern && (
                  <div style={{ marginBottom: "14px" }}>
                    <div style={{ fontSize: "10px", color: COLORS.muted, marginBottom: "4px" }}>INTERNAL LINKING PATTERN</div>
                    <div style={{ fontSize: "12px", color: COLORS.text }}>{bp.internal_linking_pattern}</div>
                  </div>
                )}

                {bp.deduplication_rules && bp.deduplication_rules.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ fontSize: "10px", color: COLORS.muted, letterSpacing: "0.1em", marginBottom: "8px" }}>DEDUPLICATION RULES</div>
                    {bp.deduplication_rules.map((r, i) => (
                      <div key={i} style={{ fontSize: "12px", color: COLORS.text, marginBottom: "4px" }}>
                        <span style={{ color: COLORS.gold }}>→</span> {r}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sample pages */}
              {bp.sample_pages && bp.sample_pages.length > 0 && (
                <div style={style.card}>
                  <div style={{ fontSize: "11px", color: COLORS.muted, letterSpacing: "0.15em", marginBottom: "12px" }}>
                    // SAMPLE PAGES ({bp.sample_pages.length})
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                      <thead>
                        <tr>
                          {["Value", "URL", "Title", "H1"].map(h => (
                            <th key={h} style={{ textAlign: "left", padding: "6px 10px", fontSize: "10px", color: COLORS.muted, letterSpacing: "0.1em", borderBottom: `1px solid ${COLORS.border}` }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bp.sample_pages.map((p, i) => (
                          <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                            <td style={{ padding: "8px 10px", color: COLORS.gold, fontWeight: "600" }}>{p.value}</td>
                            <td style={{ padding: "8px 10px", color: COLORS.accent, fontFamily: "monospace", fontSize: "11px" }}>{p.url}</td>
                            <td style={{ padding: "8px 10px", color: COLORS.text }}>{p.title}</td>
                            <td style={{ padding: "8px 10px", color: COLORS.text }}>{p.h1}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Schema preview */}
              {bp.schema_template && (
                <div style={style.card}>
                  <div style={{ fontSize: "11px", color: COLORS.muted, letterSpacing: "0.15em", marginBottom: "10px" }}>
                    // SCHEMA TEMPLATE (JSON-LD)
                  </div>
                  <pre style={{
                    fontSize: "11px", color: COLORS.green, background: "#0A0B0F",
                    padding: "12px", borderRadius: "6px", overflowX: "auto",
                    margin: 0, lineHeight: 1.6,
                  }}>
                    {JSON.stringify(bp.schema_template, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
