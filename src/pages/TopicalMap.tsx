import React, { useState, useMemo } from "react";
import { COLORS, style } from "../utils/theme";
import { callAI } from "../utils/apiProvider";
import { PROMPTS } from "../utils/prompts";
import { TopicalMapNode, ContentLevel, FunnelStage, NodeStatus } from "../types";

// ── Color maps ────────────────────────────────────────────────────────────────
const NODE_COLORS: Record<string, string> = {
  Quality: COLORS.quality,
  Bridge: COLORS.accent,
  Trust: COLORS.green,
  Historical: COLORS.muted,
  Trending: COLORS.orange,
};
const LEVEL_COLORS: Record<ContentLevel, string> = {
  Pillar: COLORS.gold,
  Cluster: COLORS.accent,
  Supporting: COLORS.green,
};
const FUNNEL_COLORS: Record<FunnelStage, string> = {
  ToFU: "#60A5FA",
  MoFU: COLORS.purple,
  BoFU: COLORS.orange,
};
const STATUS_COLORS: Record<NodeStatus, string> = {
  "planned": COLORS.muted,
  "in-progress": COLORS.gold,
  "published": COLORS.green,
  "needs-update": COLORS.orange,
};

// ── Tiny badge component ──────────────────────────────────────────────────────
const Badge = ({ label, color }: { label: string; color: string }) => (
  <span style={{
    display: "inline-block",
    padding: "2px 7px",
    borderRadius: "3px",
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "0.08em",
    background: `${color}22`,
    border: `1px solid ${color}50`,
    color,
    margin: "2px",
  }}>{label}</span>
);

// ── Stats bar ─────────────────────────────────────────────────────────────────
function StatsBar({ nodes }: { nodes: TopicalMapNode[] }) {
  const total = nodes.length;
  const pillars = nodes.filter(n => n.content_level === "Pillar").length;
  const clusters = nodes.filter(n => n.content_level === "Cluster").length;
  const supporting = nodes.filter(n => n.content_level === "Supporting").length;
  const published = nodes.filter(n => n.status === "published").length;
  const planned = nodes.filter(n => n.status === "planned").length;
  const inProgress = nodes.filter(n => n.status === "in-progress").length;
  const tofu = nodes.filter(n => n.funnel_stage === "ToFU").length;
  const mofu = nodes.filter(n => n.funnel_stage === "MoFU").length;
  const bofu = nodes.filter(n => n.funnel_stage === "BoFU").length;

  const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0;

  const stat = (label: string, value: number | string, color: string) => (
    <div style={{
      background: COLORS.card,
      border: `1px solid ${color}30`,
      borderTop: `3px solid ${color}`,
      borderRadius: "6px",
      padding: "12px 16px",
      minWidth: "90px",
      flex: 1,
    }}>
      <div style={{ fontSize: "22px", fontWeight: "700", color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "10px", color: COLORS.muted, marginTop: "4px", letterSpacing: "0.1em" }}>{label}</div>
    </div>
  );

  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
        {stat("TOTAL NODES", total, COLORS.text)}
        {stat("PILLAR", pillars, COLORS.gold)}
        {stat("CLUSTER", clusters, COLORS.accent)}
        {stat("SUPPORTING", supporting, COLORS.green)}
        {stat("PUBLISHED", published, COLORS.green)}
        {stat("IN PROGRESS", inProgress, COLORS.gold)}
        {stat("PLANNED", planned, COLORS.muted)}
      </div>
      {/* Progress bars */}
      <div style={{ display: "flex", gap: "8px" }}>
        <div style={{ flex: 1, background: COLORS.card, borderRadius: "6px", padding: "10px 14px" }}>
          <div style={{ fontSize: "10px", color: COLORS.muted, marginBottom: "6px", letterSpacing: "0.1em" }}>CONTENT PROGRESS</div>
          <div style={{ background: COLORS.border, borderRadius: "3px", height: "8px", overflow: "hidden" }}>
            <div style={{ background: COLORS.green, height: "100%", width: `${pct(published)}%`, transition: "width 0.4s" }} />
          </div>
          <div style={{ fontSize: "10px", color: COLORS.green, marginTop: "4px" }}>{pct(published)}% Published</div>
        </div>
        <div style={{ flex: 1, background: COLORS.card, borderRadius: "6px", padding: "10px 14px" }}>
          <div style={{ fontSize: "10px", color: COLORS.muted, marginBottom: "6px", letterSpacing: "0.1em" }}>FUNNEL COVERAGE</div>
          <div style={{ display: "flex", gap: "4px", height: "8px", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ background: FUNNEL_COLORS.ToFU, width: `${pct(tofu)}%` }} />
            <div style={{ background: FUNNEL_COLORS.MoFU, width: `${pct(mofu)}%` }} />
            <div style={{ background: FUNNEL_COLORS.BoFU, width: `${pct(bofu)}%` }} />
          </div>
          <div style={{ fontSize: "10px", color: COLORS.muted, marginTop: "4px" }}>
            <span style={{ color: FUNNEL_COLORS.ToFU }}>ToFU {tofu}</span> ·{" "}
            <span style={{ color: FUNNEL_COLORS.MoFU }}>MoFU {mofu}</span> ·{" "}
            <span style={{ color: FUNNEL_COLORS.BoFU }}>BoFU {bofu}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Node Card (compact list item) ────────────────────────────────────────────
function NodeCard({
  node,
  selected,
  onClick,
  onStatusChange,
  indent = 0,
}: {
  node: TopicalMapNode;
  selected: boolean;
  onClick: () => void;
  onStatusChange: (id: string, status: NodeStatus) => void;
  indent?: number;
}) {
  const nc = NODE_COLORS[node.node_type] || COLORS.muted;
  const lc = LEVEL_COLORS[node.content_level || "Cluster"];
  const sc = STATUS_COLORS[node.status || "planned"];

  return (
    <div
      onClick={onClick}
      style={{
        marginLeft: `${indent * 24}px`,
        marginBottom: "4px",
        background: selected ? `${lc}12` : COLORS.card,
        border: `1px solid ${selected ? lc : COLORS.border}`,
        borderLeft: `3px solid ${lc}`,
        borderRadius: "6px",
        padding: "10px 14px",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", justifyContent: "space-between" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "4px" }}>
            <Badge label={node.content_level || "Cluster"} color={lc} />
            <Badge label={node.node_type} color={nc} />
            {node.funnel_stage && <Badge label={node.funnel_stage} color={FUNNEL_COLORS[node.funnel_stage]} />}
            {node.search_intent_type && (
              <Badge label={node.search_intent_type.slice(0, 4).toUpperCase()} color={COLORS.muted} />
            )}
            {node.content_type && <Badge label={node.content_type} color={COLORS.muted} />}
          </div>
          <div style={{ fontSize: "13px", fontWeight: "600", lineHeight: 1.35, color: COLORS.text }}>
            {node.article_title}
          </div>
          {node.keyword_targets && node.keyword_targets.length > 0 && (
            <div style={{ fontSize: "10px", color: COLORS.muted, marginTop: "3px" }}>
              🔑 {node.keyword_targets.slice(0, 3).join(" · ")}
            </div>
          )}
          <div style={{ fontSize: "10px", color: COLORS.muted, marginTop: "2px" }}>
            {node.target_entity} → {node.primary_attribute}
            {node.estimated_word_count && (
              <span style={{ marginLeft: "8px" }}>· {node.estimated_word_count} words</span>
            )}
            {node.semantic_distance_score !== undefined && (
              <span style={{ marginLeft: "8px" }}>· SD {node.semantic_distance_score}</span>
            )}
          </div>
        </div>
        {/* Status selector */}
        <div onClick={e => e.stopPropagation()}>
          <select
            value={node.status || "planned"}
            onChange={e => onStatusChange(node.node_id, e.target.value as NodeStatus)}
            style={{
              background: `${sc}15`,
              border: `1px solid ${sc}50`,
              color: sc,
              borderRadius: "4px",
              padding: "3px 6px",
              fontSize: "10px",
              cursor: "pointer",
              fontFamily: "'Space Mono', monospace",
              letterSpacing: "0.05em",
            }}
          >
            <option value="planned">Planned</option>
            <option value="in-progress">In Progress</option>
            <option value="published">Published</option>
            <option value="needs-update">Needs Update</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────
function DetailPanel({
  node,
  onClose,
  onUrlSave,
}: {
  node: TopicalMapNode;
  onClose: () => void;
  onUrlSave: (id: string, url: string) => void;
}) {
  const lc = LEVEL_COLORS[node.content_level || "Cluster"];
  const [url, setUrl] = useState(node.published_url || "");

  return (
    <div style={{
      position: "sticky",
      top: "16px",
      background: COLORS.card,
      border: `1px solid ${lc}40`,
      borderTop: `3px solid ${lc}`,
      borderRadius: "8px",
      padding: "20px",
      maxHeight: "calc(100vh - 200px)",
      overflowY: "auto",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <Badge label={`${node.content_level} PAGE`} color={lc} />
        <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: "16px" }}>×</button>
      </div>

      <div style={{ fontWeight: "700", fontSize: "14px", lineHeight: 1.4, marginBottom: "14px" }}>
        {node.article_title}
      </div>

      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "14px" }}>
        <Badge label={node.node_type} color={NODE_COLORS[node.node_type] || COLORS.muted} />
        {node.funnel_stage && <Badge label={node.funnel_stage} color={FUNNEL_COLORS[node.funnel_stage]} />}
        <Badge label={node.search_intent_type} color={COLORS.accent} />
        {node.content_type && <Badge label={node.content_type} color={COLORS.muted} />}
        <Badge label={node.schema_type} color={COLORS.muted} />
      </div>

      {[
        ["Slug", `/${node.slug_suggestion}`],
        ["Entity", node.target_entity],
        ["Attribute", node.primary_attribute],
        ["Cluster", node.content_cluster],
        ["Word Count", node.estimated_word_count],
        ["Sem. Distance", node.semantic_distance_score?.toString()],
        ["Pub. Priority", `#${node.priority_sequence}`],
        ["Schema", node.schema_type],
        ["Featured Snippet", node.featured_snippet_target ? "Yes" : "No"],
        ["Cannibal. Risk", node.cannibalization_risk ? `⚠ ${node.cannibalization_conflict}` : "None"],
      ].map(([label, val]) => val ? (
        <div key={label} style={{ marginBottom: "8px" }}>
          <div style={{ fontSize: "10px", color: COLORS.muted, letterSpacing: "0.1em" }}>{label}</div>
          <div style={{ fontSize: "12px", color: COLORS.text }}>{val}</div>
        </div>
      ) : null)}

      {node.keyword_targets && node.keyword_targets.length > 0 && (
        <div style={{ marginBottom: "10px" }}>
          <div style={{ fontSize: "10px", color: COLORS.muted, letterSpacing: "0.1em", marginBottom: "4px" }}>KEYWORD TARGETS</div>
          {node.keyword_targets.map((kw, i) => (
            <Badge key={i} label={kw} color={i === 0 ? COLORS.gold : COLORS.muted} />
          ))}
        </div>
      )}

      <div style={{ marginBottom: "12px" }}>
        <div style={{ fontSize: "10px", color: COLORS.muted, letterSpacing: "0.1em", marginBottom: "4px" }}>MACRO CONTEXT</div>
        <div style={{ fontSize: "12px", color: COLORS.text, fontStyle: "italic", lineHeight: 1.5 }}>
          "{node.macro_context}"
        </div>
      </div>

      {node.trust_signal_type && (
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "10px", color: COLORS.muted, letterSpacing: "0.1em" }}>TRUST SIGNAL</div>
          <div style={{ fontSize: "12px", color: COLORS.green }}>{node.trust_signal_type}</div>
        </div>
      )}

      {/* Published URL */}
      <div style={{ marginTop: "14px", borderTop: `1px solid ${COLORS.border}`, paddingTop: "14px" }}>
        <div style={{ fontSize: "10px", color: COLORS.muted, letterSpacing: "0.1em", marginBottom: "6px" }}>
          PUBLISHED URL
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://yourdomain.com/slug"
            style={{ ...style.input, flex: 1, fontSize: "11px", padding: "8px 10px", marginTop: 0 }}
          />
          <button
            onClick={() => onUrlSave(node.node_id, url)}
            style={{ ...style.btnSecondary, padding: "8px 12px", fontSize: "10px" }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tree View ─────────────────────────────────────────────────────────────────
function TreeView({
  nodes,
  selected,
  onSelect,
  onStatusChange,
}: {
  nodes: TopicalMapNode[];
  selected: TopicalMapNode | null;
  onSelect: (n: TopicalMapNode) => void;
  onStatusChange: (id: string, s: NodeStatus) => void;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const toggleCollapse = (id: string) =>
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const pillars = nodes.filter(n => n.content_level === "Pillar");
  const clusters = nodes.filter(n => n.content_level === "Cluster");
  const supporting = nodes.filter(n => n.content_level === "Supporting");

  // Group clusters by pillar
  const clustersByPillar: Record<string, TopicalMapNode[]> = {};
  clusters.forEach(c => {
    const pid = c.parent_pillar_id || "__orphan__";
    if (!clustersByPillar[pid]) clustersByPillar[pid] = [];
    clustersByPillar[pid].push(c);
  });

  // Group supporting by cluster
  const supportingByCluster: Record<string, TopicalMapNode[]> = {};
  supporting.forEach(s => {
    const cid = s.parent_cluster_id || "__orphan__";
    if (!supportingByCluster[cid]) supportingByCluster[cid] = [];
    supportingByCluster[cid].push(s);
  });

  const renderConnector = (isLast: boolean, depth: number) => (
    <span style={{
      display: "inline-block",
      width: `${depth * 24}px`,
      flexShrink: 0,
      fontSize: "12px",
      color: COLORS.border,
      fontFamily: "monospace",
    }}>
      {depth > 0 ? (isLast ? "└─ " : "├─ ") : ""}
    </span>
  );

  return (
    <div>
      {pillars.map((pillar, pi) => {
        const pillarClusters = clustersByPillar[pillar.node_id] || [];
        const isPillarCollapsed = collapsed.has(pillar.node_id);

        return (
          <div key={pillar.node_id} style={{ marginBottom: "16px" }}>
            {/* PILLAR */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0" }}>
              <button
                onClick={() => toggleCollapse(pillar.node_id)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: COLORS.gold, fontSize: "12px", padding: "0 6px 0 0", marginTop: "11px", flexShrink: 0,
                }}
              >
                {isPillarCollapsed ? "▶" : "▼"}
              </button>
              <div style={{ flex: 1 }}>
                <NodeCard
                  node={pillar}
                  selected={selected?.node_id === pillar.node_id}
                  onClick={() => onSelect(pillar)}
                  onStatusChange={onStatusChange}
                />
              </div>
            </div>

            {/* CLUSTERS under this pillar */}
            {!isPillarCollapsed && pillarClusters.map((cluster, ci) => {
              const clusterSupporting = supportingByCluster[cluster.node_id] || [];
              const isClusterCollapsed = collapsed.has(cluster.node_id);
              const isLastCluster = ci === pillarClusters.length - 1;

              return (
                <div key={cluster.node_id}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0", marginLeft: "18px" }}>
                    <div style={{ fontSize: "10px", color: COLORS.border, padding: "0 4px", marginTop: "14px", fontFamily: "monospace", flexShrink: 0 }}>
                      {isLastCluster ? "└─" : "├─"}
                    </div>
                    {clusterSupporting.length > 0 && (
                      <button
                        onClick={() => toggleCollapse(cluster.node_id)}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: COLORS.accent, fontSize: "10px", padding: "0 4px", marginTop: "11px", flexShrink: 0,
                        }}
                      >
                        {isClusterCollapsed ? "▶" : "▼"}
                      </button>
                    )}
                    <div style={{ flex: 1 }}>
                      <NodeCard
                        node={cluster}
                        selected={selected?.node_id === cluster.node_id}
                        onClick={() => onSelect(cluster)}
                        onStatusChange={onStatusChange}
                        indent={0}
                      />
                    </div>
                  </div>

                  {/* SUPPORTING under this cluster */}
                  {!isClusterCollapsed && clusterSupporting.map((sup, si) => {
                    const isLastSup = si === clusterSupporting.length - 1;
                    return (
                      <div key={sup.node_id} style={{ display: "flex", alignItems: "flex-start", marginLeft: "42px" }}>
                        <div style={{ fontSize: "10px", color: COLORS.border, padding: "0 4px", marginTop: "14px", fontFamily: "monospace", flexShrink: 0 }}>
                          {isLastSup ? "└─" : "├─"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <NodeCard
                            node={sup}
                            selected={selected?.node_id === sup.node_id}
                            onClick={() => onSelect(sup)}
                            onStatusChange={onStatusChange}
                            indent={0}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Orphaned nodes (no pillar parent) */}
      {(() => {
        const orphaned = nodes.filter(n =>
          n.content_level !== "Pillar" &&
          !pillars.some(p => p.node_id === n.parent_pillar_id)
        );
        if (orphaned.length === 0) return null;
        return (
          <div style={{ marginTop: "16px" }}>
            <div style={{ fontSize: "11px", color: COLORS.muted, letterSpacing: "0.1em", marginBottom: "8px" }}>
              // UNGROUPED NODES ({orphaned.length})
            </div>
            {orphaned.map(n => (
              <NodeCard
                key={n.node_id}
                node={n}
                selected={selected?.node_id === n.node_id}
                onClick={() => onSelect(n)}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        );
      })()}
    </div>
  );
}

// ── Flat List View ────────────────────────────────────────────────────────────
function ListView({
  nodes,
  selected,
  onSelect,
  onStatusChange,
}: {
  nodes: TopicalMapNode[];
  selected: TopicalMapNode | null;
  onSelect: (n: TopicalMapNode) => void;
  onStatusChange: (id: string, s: NodeStatus) => void;
}) {
  // Group by content_cluster
  const clusters: Record<string, TopicalMapNode[]> = {};
  nodes.forEach(n => {
    const key = n.content_cluster || n.section || "General";
    if (!clusters[key]) clusters[key] = [];
    clusters[key].push(n);
  });

  return (
    <div>
      {Object.entries(clusters).map(([clusterName, clusterNodes]) => (
        <div key={clusterName} style={{ marginBottom: "20px" }}>
          <div style={{
            fontSize: "11px",
            letterSpacing: "0.15em",
            color: COLORS.accent,
            marginBottom: "8px",
            paddingBottom: "4px",
            borderBottom: `1px solid ${COLORS.border}`,
          }}>
            // {clusterName.toUpperCase()} ({clusterNodes.length} nodes)
          </div>
          {clusterNodes
            .sort((a, b) => (a.priority_sequence || 99) - (b.priority_sequence || 99))
            .map(node => (
              <NodeCard
                key={node.node_id}
                node={node}
                selected={selected?.node_id === node.node_id}
                onClick={() => onSelect(node)}
                onStatusChange={onStatusChange}
              />
            ))}
        </div>
      ))}
    </div>
  );
}

// ── Filter Bar ────────────────────────────────────────────────────────────────
function FilterBar({
  filters,
  onChange,
  onSearch,
  searchQuery,
}: {
  filters: Record<string, string>;
  onChange: (key: string, val: string) => void;
  onSearch: (q: string) => void;
  searchQuery: string;
}) {
  const selStyle = (active: boolean, color = COLORS.accent) => ({
    background: active ? `${color}20` : "transparent",
    border: `1px solid ${active ? color : COLORS.border}`,
    color: active ? color : COLORS.muted,
    padding: "5px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "10px",
    letterSpacing: "0.1em",
    fontFamily: "'Space Mono', monospace",
    transition: "all 0.15s",
  });

  const group = (key: string, options: { val: string; label: string; color?: string }[]) => (
    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", alignItems: "center" }}>
      {options.map(o => (
        <button
          key={o.val}
          onClick={() => onChange(key, filters[key] === o.val ? "" : o.val)}
          style={selStyle(filters[key] === o.val, o.color)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: "8px",
      padding: "14px 16px",
      marginBottom: "16px",
    }}>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <input
          value={searchQuery}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search nodes..."
          style={{
            ...style.input,
            width: "180px",
            padding: "6px 12px",
            fontSize: "12px",
            marginTop: 0,
          }}
        />

        <div style={{ width: "1px", background: COLORS.border, height: "28px" }} />

        {group("level", [
          { val: "Pillar", label: "Pillar", color: COLORS.gold },
          { val: "Cluster", label: "Cluster", color: COLORS.accent },
          { val: "Supporting", label: "Supporting", color: COLORS.green },
        ])}

        <div style={{ width: "1px", background: COLORS.border, height: "28px" }} />

        {group("section", [
          { val: "Core", label: "Core", color: COLORS.gold },
          { val: "Outer", label: "Outer", color: COLORS.green },
        ])}

        <div style={{ width: "1px", background: COLORS.border, height: "28px" }} />

        {group("funnel", [
          { val: "ToFU", label: "ToFU", color: FUNNEL_COLORS.ToFU },
          { val: "MoFU", label: "MoFU", color: FUNNEL_COLORS.MoFU },
          { val: "BoFU", label: "BoFU", color: FUNNEL_COLORS.BoFU },
        ])}

        <div style={{ width: "1px", background: COLORS.border, height: "28px" }} />

        {group("status", [
          { val: "planned", label: "Planned" },
          { val: "in-progress", label: "In Progress", color: COLORS.gold },
          { val: "published", label: "Published", color: COLORS.green },
          { val: "needs-update", label: "Needs Update", color: COLORS.orange },
        ])}

        <div style={{ width: "1px", background: COLORS.border, height: "28px" }} />

        {group("type", [
          { val: "Quality", label: "Quality", color: COLORS.gold },
          { val: "Bridge", label: "Bridge", color: COLORS.accent },
          { val: "Trust", label: "Trust", color: COLORS.green },
          { val: "Trending", label: "Trending", color: COLORS.orange },
        ])}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function TopicalMapPage({ projectHook, onComplete }: any) {
  const { activeProject, updateProject } = projectHook;
  const [selected, setSelected] = useState<TopicalMapNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"tree" | "list" | "stats">("tree");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const data: TopicalMapNode[] = activeProject?.topical_map || [];

  // ── Filtering / search ──
  const filtered = useMemo(() => {
    let nodes = [...data];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      nodes = nodes.filter(n =>
        n.article_title?.toLowerCase().includes(q) ||
        n.macro_context?.toLowerCase().includes(q) ||
        n.content_cluster?.toLowerCase().includes(q) ||
        n.keyword_targets?.some(k => k.toLowerCase().includes(q))
      );
    }
    if (filters.level) nodes = nodes.filter(n => n.content_level === filters.level);
    if (filters.section) nodes = nodes.filter(n => n.section === filters.section);
    if (filters.funnel) nodes = nodes.filter(n => n.funnel_stage === filters.funnel);
    if (filters.status) nodes = nodes.filter(n => n.status === filters.status);
    if (filters.type) nodes = nodes.filter(n => n.node_type === filters.type);
    return nodes;
  }, [data, filters, searchQuery]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length + (searchQuery ? 1 : 0);

  // ── Status update handler ──
  const handleStatusChange = (nodeId: string, newStatus: NodeStatus) => {
    const updated = data.map(n => n.node_id === nodeId ? { ...n, status: newStatus } : n);
    updateProject(activeProject.project_id, { topical_map: updated });
    if (selected?.node_id === nodeId) setSelected(prev => prev ? { ...prev, status: newStatus } : null);
  };

  // ── URL save handler ──
  const handleUrlSave = (nodeId: string, url: string) => {
    const updated = data.map(n => n.node_id === nodeId ? { ...n, published_url: url } : n);
    updateProject(activeProject.project_id, { topical_map: updated });
    if (selected?.node_id === nodeId) setSelected(prev => prev ? { ...prev, published_url: url } : null);
  };

  // ── 3-Phase map generation ──
  const generateMap = async () => {
    if (!activeProject?.source_context_data || !activeProject?.eav_architecture) return;
    setLoading(true);
    setError("");

    try {
      const sc = activeProject.source_context_data;
      const eavJson = JSON.stringify(activeProject.eav_architecture);
      const AI_OPTS = { maxTokens: 16000 };

      // Phase 1: Pillar pages (5-7 pages — small, fast)
      setStatusText("Phase 1/3 — Generating Pillar Pages...");
      const pillars: TopicalMapNode[] = await callAI(
        PROMPTS.pillarPages(sc.central_entity, sc.source_context, sc.central_search_intent, eavJson, activeProject.monetization_type),
        AI_OPTS
      );

      // Phase 2: Cluster pages (3-4 per pillar — mid-size batch)
      setStatusText("Phase 2/3 — Generating Cluster Pages (~30s)...");
      const pillarsSummary = JSON.stringify(
        pillars.map(p => ({ node_id: p.node_id, title: p.article_title, content_cluster: p.content_cluster, attribute: p.primary_attribute }))
      );
      const clusters: TopicalMapNode[] = await callAI(
        PROMPTS.clusterPages(sc.central_entity, pillarsSummary, eavJson, activeProject.monetization_type),
        AI_OPTS
      );

      // Phase 3: Supporting pages — only top 8 clusters to keep output small
      setStatusText("Phase 3/3 — Generating Supporting Pages...");
      const topClusters = clusters.slice(0, 8);
      const clustersSummary = JSON.stringify(
        topClusters.map(c => ({ node_id: c.node_id, title: c.article_title, content_cluster: c.content_cluster, parent_pillar_id: c.parent_pillar_id }))
      );
      const supporting: TopicalMapNode[] = await callAI(
        PROMPTS.supportingPages(sc.central_entity, clustersSummary, sc.topical_borders || []),
        AI_OPTS
      );

      const fullMap = [...pillars, ...clusters, ...supporting];
      updateProject(activeProject.project_id, { topical_map: fullMap });
      setStatusText("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Legacy 2-phase generation (fallback / re-generate outer) ──
  const regenerateOuter = async () => {
    if (!activeProject?.source_context_data || !activeProject?.eav_architecture) return;
    setLoading(true);
    setError("");
    try {
      const sc = activeProject.source_context_data;
      const existingCore = data.filter(n => n.section === "Core");
      const coreSummary = JSON.stringify(existingCore.map(n => ({ title: n.article_title, intent: n.search_intent_type, context: n.macro_context })));
      const p2Attrs = JSON.stringify(
        activeProject.eav_architecture.map((e: any) => ({
          entity: e.entity,
          attributes: e.attributes.filter((a: any) => a.priority === "P2"),
        }))
      );

      setStatusText("Regenerating Outer Section...");
      const outerResult: TopicalMapNode[] = await callAI(
        PROMPTS.outerSection(sc.central_entity, sc.topical_borders || [], coreSummary, p2Attrs),
        { maxTokens: 16000 }
      );
      const updated = [...existingCore, ...outerResult];
      updateProject(activeProject.project_id, { topical_map: updated });
      setStatusText("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const viewBtnStyle = (active: boolean) => ({
    background: active ? `${COLORS.accent}20` : "transparent",
    border: `1px solid ${active ? COLORS.accent : COLORS.border}`,
    color: active ? COLORS.accent : COLORS.muted,
    padding: "7px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "11px",
    letterSpacing: "0.1em",
    fontFamily: "'Space Mono', monospace",
  });

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div>
      <div style={style.sectionTitle}>Step 4 of 7</div>
      <h1 style={style.h1}>
        Topical Map
        <br />
        <span style={{ color: COLORS.accent }}>
          Pillar → Cluster → Supporting
        </span>
      </h1>
      <p style={style.subtitle}>
        {data.length === 0
          ? "Generate a SearchAtlas-style 3-level topical authority map. 60–120+ nodes across Pillar, Cluster, and Supporting content tiers."
          : `${data.length} nodes across ${data.filter(n => n.content_level === "Pillar").length} pillars · ${data.filter(n => n.content_level === "Cluster").length} clusters · ${data.filter(n => n.content_level === "Supporting").length} supporting pages`}
      </p>

      {/* Generate button (when no data) */}
      {data.length === 0 && (
        <div style={{ marginBottom: "28px" }}>
          {!activeProject?.eav_architecture ? (
            <div style={{ color: COLORS.muted, fontSize: "13px" }}>
              Complete EAV Architecture (Step 3) first to enable map generation.
            </div>
          ) : (
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                style={{ ...style.btnPrimary, width: "auto" }}
                onClick={generateMap}
                disabled={loading}
              >
                {loading ? statusText : "⚡ Generate Full Topical Map (3-Phase)"}
              </button>
            </div>
          )}
          {error && (
            <div style={{ color: "#EF4444", marginTop: "12px", fontSize: "13px", background: "#EF444415", padding: "12px", borderRadius: "6px" }}>
              {error}
            </div>
          )}
        </div>
      )}

      {/* Map content */}
      {data.length > 0 && (
        <>
          {/* Stats summary */}
          <StatsBar nodes={data} />

          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              <button style={viewBtnStyle(viewMode === "tree")} onClick={() => setViewMode("tree")}>🌲 Tree View</button>
              <button style={viewBtnStyle(viewMode === "list")} onClick={() => setViewMode("list")}>☰ List View</button>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button style={{ ...style.btnSecondary, fontSize: "11px", padding: "7px 14px" }} onClick={regenerateOuter} disabled={loading}>
                Regen Outer
              </button>
              <button style={{ ...style.btnSecondary, fontSize: "11px", padding: "7px 14px", borderColor: "#EF4444", color: "#EF4444" }}
                onClick={generateMap} disabled={loading}>
                {loading ? statusText : "Regenerate Full Map"}
              </button>
            </div>
          </div>

          {/* Filter bar */}
          <FilterBar
            filters={filters}
            onChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
            onSearch={setSearchQuery}
            searchQuery={searchQuery}
          />

          {activeFilterCount > 0 && (
            <div style={{ marginBottom: "10px", fontSize: "12px", color: COLORS.muted }}>
              Showing {filtered.length} of {data.length} nodes
              <button
                onClick={() => { setFilters({}); setSearchQuery(""); }}
                style={{ marginLeft: "10px", background: "none", border: "none", color: COLORS.accent, cursor: "pointer", fontSize: "12px" }}
              >
                × Clear filters
              </button>
            </div>
          )}

          {error && (
            <div style={{ color: "#EF4444", marginBottom: "12px", fontSize: "13px", background: "#EF444415", padding: "12px", borderRadius: "6px" }}>
              {error}
            </div>
          )}

          {/* Main layout: map + detail panel */}
          <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 360px" : "1fr", gap: "16px" }}>
            <div>
              {viewMode === "tree" ? (
                <TreeView
                  nodes={filtered}
                  selected={selected}
                  onSelect={setSelected}
                  onStatusChange={handleStatusChange}
                />
              ) : (
                <ListView
                  nodes={filtered}
                  selected={selected}
                  onSelect={setSelected}
                  onStatusChange={handleStatusChange}
                />
              )}
            </div>

            {/* Detail panel */}
            {selected && (
              <DetailPanel
                node={selected}
                onClose={() => setSelected(null)}
                onUrlSave={handleUrlSave}
              />
            )}
          </div>

          {/* Legend */}
          <div style={{ ...style.card, marginTop: "16px", padding: "14px 18px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.15em", color: COLORS.muted, marginBottom: "10px" }}>// LEGEND</div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {Object.entries(LEVEL_COLORS).map(([lv, c]) => <Badge key={lv} label={lv} color={c} />)}
              <span style={{ color: COLORS.border }}>|</span>
              {Object.entries(NODE_COLORS).map(([nt, c]) => <Badge key={nt} label={nt} color={c} />)}
              <span style={{ color: COLORS.border }}>|</span>
              {Object.entries(FUNNEL_COLORS).map(([fs, c]) => <Badge key={fs} label={fs} color={c} />)}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <button style={{ ...style.btnPrimary, flex: 1 }} onClick={onComplete}>
              Confirm Map → Generate Content Briefs
            </button>
          </div>
        </>
      )}
    </div>
  );
}
