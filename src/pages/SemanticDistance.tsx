import React, { useState } from "react";
import { COLORS, style } from "../utils/theme";
import { callAI } from "../utils/apiProvider";
import { PROMPTS } from "../utils/prompts";

interface EvalResult {
  topic: string;
  semantic_distance_score: number;
  risk_level: string;
  recommendation: string;
  reasoning: string;
}

const RISK_ZONES = [
  { min: 0,  max: 30,  label: "Core Territory",  color: COLORS.green,  bg: "#00FF8815", desc: "Publish — directly supports topical authority" },
  { min: 31, max: 60,  label: "Bridge Zone",      color: COLORS.accent, bg: "#00E5FF15", desc: "Publish with care — strong bridging needed" },
  { min: 61, max: 80,  label: "Outer Territory",  color: COLORS.gold,   bg: "#FFB80015", desc: "Use sparingly — risk of topical dilution" },
  { min: 81, max: 100, label: "Border Risk",      color: "#EF4444",     bg: "#EF444415", desc: "Do NOT publish — outside topical borders" },
];

function ScoreGauge({ score }: { score: number }) {
  const zone = RISK_ZONES.find(z => score >= z.min && score <= z.max) || RISK_ZONES[3];
  const pct = Math.min(100, Math.max(0, score));

  return (
    <div style={{ marginBottom: "20px" }}>
      {/* Gauge bar */}
      <div style={{ position: "relative", marginBottom: "6px" }}>
        <div style={{ display: "flex", height: "20px", borderRadius: "10px", overflow: "hidden" }}>
          {RISK_ZONES.map(z => (
            <div
              key={z.label}
              style={{
                flex: z.max - z.min,
                background: z.color + "40",
                borderRight: "1px solid #0A0B0F",
              }}
            />
          ))}
        </div>
        {/* Needle */}
        <div style={{
          position: "absolute",
          top: "-4px",
          left: `calc(${pct}% - 8px)`,
          width: "16px",
          height: "28px",
          background: zone.color,
          borderRadius: "3px",
          transition: "left 0.6s ease",
          boxShadow: `0 0 10px ${zone.color}80`,
        }} />
      </div>
      {/* Zone labels */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: COLORS.muted, letterSpacing: "0.05em" }}>
        <span>0 Core</span><span>31 Bridge</span><span>61 Outer</span><span>81 Border</span><span>100</span>
      </div>
      {/* Score badge */}
      <div style={{
        marginTop: "14px",
        padding: "14px 20px",
        background: zone.bg,
        border: `1px solid ${zone.color}40`,
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: "36px", fontWeight: "700", color: zone.color, lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: "11px", color: zone.color, letterSpacing: "0.1em", marginTop: "4px" }}>{zone.label.toUpperCase()}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "12px", color: COLORS.text, fontWeight: "600" }}>{zone.desc}</div>
        </div>
      </div>
    </div>
  );
}

export default function SemanticDistancePage({ projectHook }: any) {
  const { activeProject } = projectHook;
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<EvalResult[]>([]);
  const [latest, setLatest] = useState<EvalResult | null>(null);

  const hasContext = !!activeProject?.source_context_data;

  const evaluate = async () => {
    if (!topic.trim() || !hasContext) return;
    setLoading(true);
    setError("");
    try {
      const sc = activeProject.source_context_data;
      const result: EvalResult = await callAI(
        PROMPTS.semanticDistance(sc.central_entity, sc.source_context, topic.trim()),
        { maxTokens: 2000 }
      );
      setLatest(result);
      setResults(prev => [result, ...prev].slice(0, 20)); // keep last 20
      setTopic("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const riskColor = (level: string) => {
    if (level?.includes("Core")) return COLORS.green;
    if (level?.includes("Bridge")) return COLORS.accent;
    if (level?.includes("Outer")) return COLORS.gold;
    return "#EF4444";
  };

  return (
    <div>
      <div style={style.sectionTitle}>Module 13</div>
      <h1 style={style.h1}>Semantic<br /><span style={{ color: COLORS.accent }}>Distance Calculator</span></h1>
      <p style={style.subtitle}>
        Score any topic on a 0–100 proximity scale against your Central Entity.
        0 = Core territory. 100 = Border risk zone.
      </p>

      {!hasContext && (
        <div style={{ ...style.card, borderColor: COLORS.gold + "50" }}>
          <div style={{ color: COLORS.gold, fontSize: "13px" }}>
            ⚠ Complete Source Context (Step 2) first — the calculator needs your Central Entity.
          </div>
        </div>
      )}

      {hasContext && (
        <>
          {/* Central Entity context */}
          <div style={{ ...style.card, borderColor: COLORS.accent + "30", marginBottom: "16px", padding: "12px 16px" }}>
            <span style={{ fontSize: "11px", color: COLORS.muted }}>Central Entity: </span>
            <span style={{ fontSize: "13px", color: COLORS.accent, fontWeight: "700" }}>
              {activeProject.source_context_data.central_entity}
            </span>
          </div>

          {/* Zone reference */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
            {RISK_ZONES.map(z => (
              <div key={z.label} style={{
                padding: "6px 12px", borderRadius: "6px", fontSize: "11px",
                background: z.bg, border: `1px solid ${z.color}40`, color: z.color,
              }}>
                {z.min}–{z.max} {z.label}
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !loading && evaluate()}
              placeholder="Enter a topic to evaluate (e.g. 'keyword stuffing history')..."
              style={{ ...style.input, flex: 1, marginTop: 0 }}
            />
            <button
              onClick={evaluate}
              disabled={loading || !topic.trim()}
              style={{ ...style.btnPrimary, whiteSpace: "nowrap" }}
            >
              {loading ? "Scoring..." : "Score Topic"}
            </button>
          </div>

          {error && (
            <div style={{ color: "#EF4444", marginBottom: "14px", fontSize: "13px", background: "#EF444415", padding: "12px", borderRadius: "6px" }}>
              {error}
            </div>
          )}

          {/* Latest result */}
          {latest && (
            <div style={style.card}>
              <div style={{ fontSize: "11px", color: COLORS.muted, letterSpacing: "0.15em", marginBottom: "12px" }}>
                // RESULT: "{latest.topic}"
              </div>
              <ScoreGauge score={latest.semantic_distance_score} />
              <div style={{ marginTop: "12px" }}>
                <div style={{ fontSize: "10px", color: COLORS.muted, marginBottom: "4px" }}>RECOMMENDATION</div>
                <div style={{ fontSize: "13px", color: COLORS.text, fontWeight: "600", marginBottom: "10px" }}>
                  {latest.recommendation}
                </div>
                <div style={{ fontSize: "10px", color: COLORS.muted, marginBottom: "4px" }}>REASONING</div>
                <div style={{ fontSize: "12px", color: COLORS.text, lineHeight: 1.7 }}>{latest.reasoning}</div>
              </div>
            </div>
          )}

          {/* History */}
          {results.length > 1 && (
            <div style={{ marginTop: "16px" }}>
              <div style={{ fontSize: "11px", color: COLORS.muted, letterSpacing: "0.15em", marginBottom: "10px" }}>
                // EVALUATION HISTORY ({results.length})
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {results.slice(1).map((r, i) => {
                  const zone = RISK_ZONES.find(z => r.semantic_distance_score >= z.min && r.semantic_distance_score <= z.max) || RISK_ZONES[3];
                  return (
                    <div
                      key={i}
                      onClick={() => setLatest(r)}
                      style={{
                        ...style.card,
                        padding: "10px 14px",
                        cursor: "pointer",
                        borderLeft: `3px solid ${zone.color}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: "600" }}>{r.topic}</div>
                        <div style={{ fontSize: "10px", color: zone.color, marginTop: "2px" }}>{zone.label}</div>
                      </div>
                      <div style={{ fontSize: "24px", fontWeight: "700", color: zone.color }}>{r.semantic_distance_score}</div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => { setResults([]); setLatest(null); }}
                style={{ ...style.btnSecondary, marginTop: "10px", fontSize: "11px", padding: "8px 16px", borderColor: "#EF4444", color: "#EF4444" }}
              >
                Clear History
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
