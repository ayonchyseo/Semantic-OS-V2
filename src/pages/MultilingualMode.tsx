import React, { useState } from "react";
import { COLORS, style } from "../utils/theme";
import { callAI } from "../utils/apiProvider";
import { PROMPTS } from "../utils/prompts";

const COUNTRY_OPTIONS = [
  { code: "US", label: "United States", lang: "en-US", flag: "🇺🇸" },
  { code: "GB", label: "United Kingdom", lang: "en-GB", flag: "🇬🇧" },
  { code: "CA", label: "Canada", lang: "en-CA", flag: "🇨🇦" },
  { code: "AU", label: "Australia", lang: "en-AU", flag: "🇦🇺" },
  { code: "DE", label: "Germany", lang: "de-DE", flag: "🇩🇪" },
  { code: "FR", label: "France", lang: "fr-FR", flag: "🇫🇷" },
  { code: "ES", label: "Spain", lang: "es-ES", flag: "🇪🇸" },
  { code: "MX", label: "Mexico", lang: "es-MX", flag: "🇲🇽" },
  { code: "BR", label: "Brazil", lang: "pt-BR", flag: "🇧🇷" },
  { code: "IN", label: "India", lang: "en-IN", flag: "🇮🇳" },
  { code: "JP", label: "Japan", lang: "ja-JP", flag: "🇯🇵" },
  { code: "KR", label: "South Korea", lang: "ko-KR", flag: "🇰🇷" },
  { code: "NL", label: "Netherlands", lang: "nl-NL", flag: "🇳🇱" },
  { code: "IT", label: "Italy", lang: "it-IT", flag: "🇮🇹" },
  { code: "PL", label: "Poland", lang: "pl-PL", flag: "🇵🇱" },
];

export default function MultilingualModePage({ projectHook }: any) {
  const { activeProject, updateProject } = projectHook;
  const [selected, setSelected] = useState<string[]>(["US", "GB"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeRegion, setActiveRegion] = useState(0);

  const data = activeProject?.multilingual_maps;
  const hasMap = activeProject?.topical_map && activeProject.topical_map.length > 0;

  const toggleCountry = (code: string) => {
    setSelected(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const generate = async () => {
    if (!activeProject?.source_context_data || !activeProject?.topical_map) return;
    setLoading(true);
    setError("");
    try {
      const sc = activeProject.source_context_data;
      const countries = COUNTRY_OPTIONS.filter(c => selected.includes(c.code))
        .map(c => `${c.label} (${c.lang})`);
      const baseMap = JSON.stringify(
        activeProject.topical_map.slice(0, 15).map((n: any) => ({
          node_id: n.node_id,
          title: n.article_title,
          intent: n.search_intent_type,
          cluster: n.content_cluster,
        }))
      );
      const result = await callAI(
        PROMPTS.multilingualMap(baseMap, countries, sc.central_entity),
        { maxTokens: 16000 }
      );
      const maps = Array.isArray(result) ? result : (result.regional_maps ?? [result]);
      updateProject(activeProject.project_id, { multilingual_maps: maps });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const regionData = data?.[activeRegion];

  return (
    <div>
      <div style={style.sectionTitle}>Module 12</div>
      <h1 style={style.h1}>Multilingual &<br /><span style={{ color: COLORS.accent }}>Multi-Regional Mode</span></h1>
      <p style={style.subtitle}>Generate localized topical map roots, search intent statements, and hreflang plans per country.</p>

      {!hasMap && (
        <div style={{ ...style.card, borderColor: COLORS.gold + "50" }}>
          <div style={{ color: COLORS.gold, fontSize: "13px" }}>
            ⚠ Complete the Topical Map (Step 4) first to enable multilingual adaptation.
          </div>
        </div>
      )}

      {hasMap && !data && (
        <div style={style.card}>
          <div style={{ fontSize: "12px", color: COLORS.muted, letterSpacing: "0.15em", marginBottom: "14px" }}>
            // SELECT TARGET COUNTRIES
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
            {COUNTRY_OPTIONS.map(c => {
              const isSelected = selected.includes(c.code);
              return (
                <button
                  key={c.code}
                  onClick={() => toggleCountry(c.code)}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "8px 14px", borderRadius: "6px", cursor: "pointer",
                    background: isSelected ? `${COLORS.accent}20` : COLORS.surface,
                    border: `1px solid ${isSelected ? COLORS.accent : COLORS.border}`,
                    color: isSelected ? COLORS.accent : COLORS.muted,
                    fontSize: "12px", fontFamily: "'Space Mono', monospace",
                    transition: "all 0.15s",
                  }}
                >
                  <span>{c.flag}</span>
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: "12px", color: COLORS.muted, marginBottom: "16px" }}>
            {selected.length} countries selected · Adapts top 15 map nodes per region
          </div>
          <button
            style={{ ...style.btnPrimary, width: "auto" }}
            onClick={generate}
            disabled={loading || selected.length === 0}
          >
            {loading ? "Generating Regional Maps..." : `🌍 Generate ${selected.length} Regional Maps`}
          </button>
          {error && (
            <div style={{ color: "#EF4444", marginTop: "12px", fontSize: "13px", background: "#EF444415", padding: "12px", borderRadius: "6px" }}>
              {error}
            </div>
          )}
        </div>
      )}

      {data && data.length > 0 && (
        <>
          {/* Region tabs */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
            {data.map((r: any, i: number) => (
              <button
                key={i}
                onClick={() => setActiveRegion(i)}
                style={{
                  padding: "8px 16px", borderRadius: "6px", cursor: "pointer",
                  background: activeRegion === i ? `${COLORS.accent}20` : COLORS.card,
                  border: `1px solid ${activeRegion === i ? COLORS.accent : COLORS.border}`,
                  color: activeRegion === i ? COLORS.accent : COLORS.muted,
                  fontSize: "12px", fontFamily: "'Space Mono', monospace",
                }}
              >
                {COUNTRY_OPTIONS.find(c => c.label === r.country || c.code === r.country)?.flag || "🌐"}{" "}
                {r.country}
              </button>
            ))}
            <button
              onClick={() => updateProject(activeProject.project_id, { multilingual_maps: undefined })}
              style={{ ...style.btnSecondary, fontSize: "11px", padding: "8px 14px", borderColor: "#EF4444", color: "#EF4444" }}
            >
              Reset
            </button>
          </div>

          {regionData && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {/* Region info */}
              <div>
                <div style={style.card}>
                  <div style={{ fontSize: "11px", color: COLORS.muted, letterSpacing: "0.15em", marginBottom: "10px" }}>
                    // REGIONAL CONTEXT
                  </div>
                  {[
                    ["Country", regionData.country],
                    ["Language", regionData.language_code],
                    ["hreflang", regionData.hreflang],
                  ].map(([label, val]) => val ? (
                    <div key={label} style={{ marginBottom: "10px" }}>
                      <div style={{ fontSize: "10px", color: COLORS.muted }}>{label}</div>
                      <div style={{ fontSize: "13px", color: COLORS.text, fontWeight: "600" }}>{val}</div>
                    </div>
                  ) : null)}
                  {regionData.localized_central_search_intent && (
                    <div style={{ marginTop: "10px", padding: "12px", background: `${COLORS.accent}10`, borderRadius: "6px", border: `1px solid ${COLORS.accent}20` }}>
                      <div style={{ fontSize: "10px", color: COLORS.accent, marginBottom: "6px" }}>LOCALIZED SEARCH INTENT</div>
                      <div style={{ fontSize: "12px", color: COLORS.text, lineHeight: 1.6 }}>
                        {regionData.localized_central_search_intent}
                      </div>
                    </div>
                  )}
                  {regionData.regional_publishing_priority && regionData.regional_publishing_priority.length > 0 && (
                    <div style={{ marginTop: "14px" }}>
                      <div style={{ fontSize: "10px", color: COLORS.muted, letterSpacing: "0.1em", marginBottom: "8px" }}>PUBLISHING PRIORITY</div>
                      {regionData.regional_publishing_priority.slice(0, 5).map((p: any, i: number) => (
                        <div key={i} style={{ fontSize: "12px", color: COLORS.text, marginBottom: "4px" }}>
                          <span style={{ color: COLORS.gold }}>#{p.sequence || i + 1}</span> {p.title || p}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Localized nodes */}
              <div>
                <div style={{ fontSize: "11px", color: COLORS.muted, letterSpacing: "0.15em", marginBottom: "10px" }}>
                  // LOCALIZED NODES ({regionData.localized_nodes?.length || 0})
                </div>
                <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                  {(regionData.localized_nodes || []).map((n: any, i: number) => (
                    <div key={i} style={{ ...style.card, padding: "12px 14px", marginBottom: "8px" }}>
                      <div style={{ fontWeight: "700", fontSize: "13px", marginBottom: "6px" }}>{n.localized_title}</div>
                      {n.country_specific_queries && n.country_specific_queries.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {n.country_specific_queries.slice(0, 3).map((q: string, qi: number) => (
                            <span key={qi} style={{
                              fontSize: "10px", padding: "2px 8px", borderRadius: "3px",
                              background: `${COLORS.green}15`, border: `1px solid ${COLORS.green}30`,
                              color: COLORS.green,
                            }}>{q}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
