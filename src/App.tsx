import React, { useState } from "react";
import { useProject } from "./hooks/useProject";
import ApiKeyStatus from "./components/ApiKeyStatus";

import SettingsPage from "./pages/Settings";
import DomainInputPage from "./pages/DomainInput";
import SourceContextPage from "./pages/SourceContext";
import EAVArchitecturePage from "./pages/EAVArchitecture";
import TopicalMapPage from "./pages/TopicalMap";
import ContentBriefPage from "./pages/ContentBrief";
import InternalLinksPage from "./pages/InternalLinks";
import AuditModePage from "./pages/AuditMode";
import GrowthDashboardPage from "./pages/GrowthDashboard";
import CompetitorAnalysisPage from "./pages/CompetitorAnalysis";
import SERPExtractorPage from "./pages/SERPExtractor";
import AuthorBuilderPage from "./pages/AuthorBuilder";
import MultilingualModePage from "./pages/MultilingualMode";
import SemanticDistancePage from "./pages/SemanticDistance";
import ProgrammaticSEOPage from "./pages/ProgrammaticSEO";
import SitemapGeneratorPage from "./pages/SitemapGenerator";
import ExportSuitePage from "./pages/ExportSuite";

const NAV_ITEMS = [
  { id: "settings", label: "⚙ Settings", icon: "⚙", section: "config" },
  { id: "input", label: "01 Domain", icon: "🌐", section: "workflow" },
  { id: "context", label: "02 Context", icon: "🎯", section: "workflow" },
  { id: "eav", label: "03 EAV", icon: "🧬", section: "workflow" },
  { id: "map", label: "04 Topical Map", icon: "🗺️", section: "workflow" },
  { id: "briefs", label: "05 Briefs", icon: "📝", section: "workflow" },
  { id: "links", label: "06 Link Matrix", icon: "🔗", section: "workflow" },
  { id: "audit", label: "07 Audit", icon: "🔍", section: "workflow" },
  { id: "growth", label: "08 Growth", icon: "📈", section: "tools" },
  { id: "competitors", label: "09 Competitors", icon: "⚔️", section: "tools" },
  { id: "serp", label: "10 SERP Intel", icon: "🔎", section: "tools" },
  { id: "author", label: "11 Author", icon: "✍️", section: "tools" },
  { id: "multilingual", label: "12 Multilingual", icon: "🌍", section: "tools" },
  { id: "distance", label: "13 Distance", icon: "📏", section: "tools" },
  { id: "programmatic", label: "14 Programmatic", icon: "⚙️", section: "tools" },
  { id: "sitemap", label: "15 Sitemap", icon: "🗂️", section: "tools" },
  { id: "export", label: "16 Export", icon: "📦", section: "tools" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("settings");
  const projectHook = useProject();

  const renderPage = () => {
    const props = { projectHook };
    switch (activeTab) {
      case "settings":     return <SettingsPage />;
      case "input":        return <DomainInputPage {...props} onComplete={() => setActiveTab("context")} />;
      case "context":      return <SourceContextPage {...props} onComplete={() => setActiveTab("eav")} />;
      case "eav":          return <EAVArchitecturePage {...props} onComplete={() => setActiveTab("map")} />;
      case "map":          return <TopicalMapPage {...props} onComplete={() => setActiveTab("briefs")} />;
      case "briefs":       return <ContentBriefPage {...props} onComplete={() => setActiveTab("links")} />;
      case "links":        return <InternalLinksPage {...props} onComplete={() => setActiveTab("audit")} />;
      case "audit":        return <AuditModePage {...props} onComplete={() => setActiveTab("growth")} />;
      case "growth":       return <GrowthDashboardPage {...props} />;
      case "competitors":  return <CompetitorAnalysisPage {...props} />;
      case "serp":         return <SERPExtractorPage {...props} />;
      case "author":       return <AuthorBuilderPage {...props} />;
      case "multilingual": return <MultilingualModePage {...props} />;
      case "distance":     return <SemanticDistancePage {...props} />;
      case "programmatic": return <ProgrammaticSEOPage {...props} />;
      case "sitemap":      return <SitemapGeneratorPage {...props} />;
      case "export":       return <ExportSuitePage {...props} />;
      default:             return <SettingsPage />;
    }
  };

  const workflowItems = NAV_ITEMS.filter(i => i.section === "workflow");
  const toolItems = NAV_ITEMS.filter(i => i.section === "tools");
  const configItems = NAV_ITEMS.filter(i => i.section === "config");

  const navBtn = (item: typeof NAV_ITEMS[0]) => (
    <button
      key={item.id}
      onClick={() => setActiveTab(item.id)}
      title={item.label}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        width: "100%",
        padding: "9px 14px",
        border: "none",
        background: activeTab === item.id ? "#1E2230" : "transparent",
        color: activeTab === item.id ? "#00E5FF" : "#6B7280",
        fontSize: "11px",
        textAlign: "left",
        cursor: "pointer",
        borderLeft: activeTab === item.id ? "2px solid #00E5FF" : "2px solid transparent",
        fontFamily: "'Space Mono', monospace",
        transition: "all 0.15s",
      }}
    >
      <span style={{ fontSize: "13px" }}>{item.icon}</span>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {item.label}
      </span>
    </button>
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0A0B0F", color: "#E8ECF0", fontFamily: "'Space Mono', monospace" }}>
      {/* Sidebar */}
      <div style={{ width: "200px", background: "#111318", borderRight: "1px solid #1E2230", overflowY: "auto", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        {/* Brand */}
        <div style={{ padding: "16px 14px", borderBottom: "1px solid #1E2230", flexShrink: 0 }}>
          <div style={{ color: "#00E5FF", fontSize: "13px", fontWeight: "700", letterSpacing: "0.1em" }}>SemanticOS</div>
          <div style={{ fontSize: "9px", color: "#6B7280", marginTop: "2px", letterSpacing: "0.12em" }}>KORAYNESE FRAMEWORK</div>
        </div>

        {/* Config */}
        <div style={{ padding: "6px 0" }}>
          {configItems.map(navBtn)}
        </div>

        {/* Workflow section */}
        <div style={{ borderTop: "1px solid #1E2230", padding: "6px 0" }}>
          <div style={{ fontSize: "9px", color: "#3D4454", letterSpacing: "0.2em", padding: "6px 14px 2px" }}>WORKFLOW</div>
          {workflowItems.map(navBtn)}
        </div>

        {/* Tools section */}
        <div style={{ borderTop: "1px solid #1E2230", padding: "6px 0" }}>
          <div style={{ fontSize: "9px", color: "#3D4454", letterSpacing: "0.2em", padding: "6px 14px 2px" }}>TOOLS</div>
          {toolItems.map(navBtn)}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 36px" }}>
        <ApiKeyStatus onOpenSettings={() => setActiveTab("settings")} />
        {renderPage()}
      </div>
    </div>
  );
}
