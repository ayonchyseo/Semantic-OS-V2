import React, { useState } from "react";
import { useProject } from "./hooks/useProject";
import ApiKeyStatus from "./components/ApiKeyStatus";

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
  { id: "input", label: "01 Domain", icon: "🌐" },
  { id: "context", label: "02 Context", icon: "🎯" },
  { id: "eav", label: "03 EAV", icon: "🧬" },
  { id: "map", label: "04 Topical Map", icon: "🗺️" },
  { id: "briefs", label: "05 Briefs", icon: "📝" },
  { id: "links", label: "06 Link Matrix", icon: "🔗" },
  { id: "audit", label: "07 Audit", icon: "🔍" },
  { id: "growth", label: "08 Growth", icon: "📈" },
  { id: "competitors", label: "09 Competitors", icon: "⚔️" },
  { id: "serp", label: "10 SERP Intel", icon: "🔎" },
  { id: "author", label: "11 Author", icon: "✍️" },
  { id: "multilingual", label: "12 Multilingual", icon: "🌍" },
  { id: "distance", label: "13 Distance", icon: "📏" },
  { id: "programmatic", label: "14 Programmatic", icon: "⚙️" },
  { id: "sitemap", label: "15 Sitemap", icon: "🗂️" },
  { id: "export", label: "16 Export", icon: "📦" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("input");
  const projectHook = useProject();

  const renderPage = () => {
    const props = { projectHook };
    switch (activeTab) {
      case "input": return <DomainInputPage {...props} onComplete={() => setActiveTab("context")} />;
      case "context": return <SourceContextPage {...props} onComplete={() => setActiveTab("eav")} />;
      case "eav": return <EAVArchitecturePage {...props} onComplete={() => setActiveTab("map")} />;
      case "map": return <TopicalMapPage {...props} onComplete={() => setActiveTab("briefs")} />;
      case "briefs": return <ContentBriefPage {...props} onComplete={() => setActiveTab("links")} />;
      case "links": return <InternalLinksPage {...props} onComplete={() => setActiveTab("audit")} />;
      case "audit": return <AuditModePage {...props} onComplete={() => setActiveTab("growth")} />;
      case "growth": return <GrowthDashboardPage {...props} />;
      case "competitors": return <CompetitorAnalysisPage {...props} />;
      case "serp": return <SERPExtractorPage {...props} />;
      case "author": return <AuthorBuilderPage {...props} />;
      case "multilingual": return <MultilingualModePage {...props} />;
      case "distance": return <SemanticDistancePage {...props} />;
      case "programmatic": return <ProgrammaticSEOPage {...props} />;
      case "sitemap": return <SitemapGeneratorPage {...props} />;
      case "export": return <ExportSuitePage {...props} />;
      default: return <DomainInputPage {...props} onComplete={() => setActiveTab("context")} />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0A0B0F", color: "#E8ECF0", fontFamily: "'Space Mono', monospace" }}>
      {/* Sidebar */}
      <div style={{ width: "200px", background: "#111318", borderRight: "1px solid #1E2230", overflowY: "auto", flexShrink: 0 }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #1E2230" }}>
          <div style={{ color: "#00E5FF", fontSize: "14px", fontWeight: "700", letterSpacing: "0.1em" }}>SemanticOS</div>
          <div style={{ fontSize: "9px", color: "#6B7280", marginTop: "2px", letterSpacing: "0.15em" }}>KORAYNESE FRAMEWORK</div>
        </div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              width: "100%", padding: "10px 16px", border: "none",
              background: activeTab === item.id ? "#1E2230" : "transparent",
              color: activeTab === item.id ? "#00E5FF" : "#6B7280",
              fontSize: "11px", textAlign: "left", cursor: "pointer",
              borderLeft: activeTab === item.id ? "2px solid #00E5FF" : "2px solid transparent",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      {/* Main Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
        <ApiKeyStatus />
        {renderPage()}
      </div>
    </div>
  );
}
