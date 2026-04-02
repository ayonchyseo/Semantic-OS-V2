import React, { useState } from "react";
import { callGemini } from "../utils/gemini";
import { PROMPTS } from "../utils/prompts";
import { AuthorEntity } from "../types";

export default function AuthorBuilderPage({ projectHook }: any) {
  const { activeProject, updateProject } = projectHook;
  const [authors, setAuthors] = useState<AuthorEntity[]>(activeProject?.authors || []);
  const [form, setForm] = useState({ name: "", expertise: "", bio: "", linkedin: "", twitter: "", website: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buildAuthor = async () => {
    if (!form.name || !activeProject) return;
    setLoading(true); setError("");
    try {
      const data = await callGemini(
        PROMPTS.authorBuilder(form.name, form.expertise.split(",").map(s => s.trim()), form.bio, { linkedin: form.linkedin, twitter: form.twitter, website: form.website }, activeProject.domain),
        { temperature: 0.3 }
      );
      const newAuthor = { ...data, author_id: crypto.randomUUID(), assigned_articles: [] };
      const updated = [...authors, newAuthor];
      setAuthors(updated);
      updateProject(activeProject.project_id, { authors: updated });
      setForm({ name: "", expertise: "", bio: "", linkedin: "", twitter: "", website: "" });
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.2em", marginBottom: "8px" }}>MODULE 11</div>
      <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>Author Entity<br /><span style={{ color: "#00E5FF" }}>E-E-A-T Builder</span></h1>
      <p style={{ color: "#6B7280", marginBottom: "24px" }}>Build author entities with complete Person schema for E-E-A-T signal optimization.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div style={{ background: "#16181F", border: "1px solid #1E2230", borderRadius: "8px", padding: "24px" }}>
          <div style={{ fontSize: "11px", color: "#00E5FF", letterSpacing: "0.15em", marginBottom: "16px" }}>// CREATE AUTHOR ENTITY</div>
          {[
            { label: "Author Name", key: "name", placeholder: "Dr. Jane Smith" },
            { label: "Expertise Areas (comma separated)", key: "expertise", placeholder: "SEO, Content Marketing, NLP" },
            { label: "LinkedIn URL", key: "linkedin", placeholder: "https://linkedin.com/in/..." },
            { label: "Twitter/X URL", key: "twitter", placeholder: "https://twitter.com/..." },
            { label: "Website URL", key: "website", placeholder: "https://author-site.com" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "10px", color: "#6B7280", letterSpacing: "0.15em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>{f.label}</label>
              <input value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} style={{ width: "100%", background: "#0D0F14", border: "1px solid #1E2230", borderRadius: "6px", padding: "10px 14px", color: "#E8ECF0", fontSize: "13px", fontFamily: "'Space Mono', monospace", boxSizing: "border-box" }} />
            </div>
          ))}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "10px", color: "#6B7280", letterSpacing: "0.15em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Bio (2-3 sentences)</label>
            <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} style={{ width: "100%", background: "#0D0F14", border: "1px solid #1E2230", borderRadius: "6px", padding: "10px 14px", color: "#E8ECF0", fontSize: "13px", fontFamily: "'Space Mono', monospace", boxSizing: "border-box", resize: "vertical" }} />
          </div>
          <button onClick={buildAuthor} disabled={loading} style={{ background: "#00E5FF", color: "#000", border: "none", padding: "14px 28px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.12em", fontFamily: "'Space Mono', monospace", width: "100%" }}>
            {loading ? "Building..." : "Build Author Entity"}
          </button>
          {error && <div style={{ color: "#EF4444", marginTop: "8px", fontSize: "12px" }}>{error}</div>}
        </div>

        <div>
          {authors.map((a, i) => (
            <div key={i} style={{ background: "#16181F", border: "1px solid #1E2230", borderRadius: "8px", padding: "20px", marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ fontWeight: "700", fontSize: "15px" }}>{a.name}</div>
                <div style={{ background: "#00FF8820", border: "1px solid #00FF8840", borderRadius: "4px", padding: "3px 10px", fontSize: "12px", color: "#00FF88" }}>E-E-A-T: {a.eeat_score}/100</div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "12px" }}>
                {a.expertise_areas.map((e, j) => <span key={j} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "3px", background: "#00E5FF20", color: "#00E5FF", border: "1px solid #00E5FF40" }}>{e}</span>)}
              </div>
              <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "12px" }}>{a.byline_strategy}</div>
              <div style={{ fontSize: "10px", color: "#A855F7", marginBottom: "8px" }}>IMPROVEMENTS NEEDED:</div>
              {(a.eeat_improvements || []).map((imp: any, j: number) => <div key={j} style={{ fontSize: "11px", color: "#6B7280", padding: "3px 0" }}>→ {imp}</div>)}
              <div style={{ marginTop: "12px", background: "#0D0F14", borderRadius: "4px", padding: "10px", fontSize: "10px", color: "#6B7280", whiteSpace: "pre-wrap", overflowX: "auto" }}>
                {JSON.stringify(a.schema_json_ld, null, 2)}
              </div>
            </div>
          ))}
          {authors.length === 0 && <div style={{ color: "#6B7280", fontSize: "13px", textAlign: "center", padding: "40px" }}>No authors created yet. Build your first author entity →</div>}
        </div>
      </div>
    </div>
  );
}
