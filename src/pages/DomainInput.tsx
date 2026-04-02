import React, { useState } from "react";
import { COLORS, style } from "../utils/theme";

export default function DomainInputPage({ projectHook, onComplete }: any) {
  const { createProject } = projectHook;
  const [form, setForm] = useState({
    domain: "",
    business: "",
    geo: "United States",
    siteType: "new",
  });

  const handleNext = () => {
    // We create a project upon saving Domain Input
    createProject({
      domain: form.domain,
      site_type: form.siteType,
    });
    if (onComplete) onComplete();
  };

  return (
    <div>
      <div style={style.sectionTitle}>Step 1 of 7</div>
      <h1 style={style.h1}>Domain Intelligence<br /><span style={{ color: COLORS.accent }}>Input Engine</span></h1>
      <p style={style.subtitle}>Begin with your domain. SemanticOS analyzes your business context, identifies your Central Entity, and sets the semantic foundation for your entire Topical Map.</p>
      
      <div style={{ ...style.card, border: `1px solid ${COLORS.accent}30` }}>
        <div style={{ ...style.sectionTitle, color: COLORS.accent, marginBottom: "20px" }}>// DOMAIN CONFIG</div>
        <div style={{ marginBottom: "20px" }}>
          <label style={style.label}>Target Domain</label>
          <input style={style.input} value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })} placeholder="yourdomain.com" />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label style={style.label}>Business Description & Monetization Model</label>
          <textarea style={style.textarea} value={form.business} onChange={e => setForm({ ...form, business: e.target.value })} placeholder="Describe what your business does, how it makes money, and who the target customer is..." />
        </div>
        <div style={style.grid2}>
          <div>
            <label style={style.label}>Primary Geography</label>
            <input style={style.input} value={form.geo} onChange={e => setForm({ ...form, geo: e.target.value })} placeholder="United States" />
          </div>
          <div>
            <label style={style.label}>Site Type</label>
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              {["new", "existing"].map(t => (
                <button key={t} onClick={() => setForm({ ...form, siteType: t })} style={{
                  ...style.btnSecondary,
                  background: form.siteType === t ? `${COLORS.accent}20` : "transparent",
                  color: form.siteType === t ? COLORS.accent : COLORS.muted,
                  flex: 1,
                }}>
                  {t === "new" ? "New Site" : "Existing Site"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...style.card, background: `${COLORS.gold}08`, border: `1px solid ${COLORS.gold}20` }}>
        <div style={{ fontSize: "12px", color: COLORS.gold, letterSpacing: "0.1em", marginBottom: "12px" }}>⚡ KORAY'S FRAMEWORK NOTE</div>
        <p style={{ fontSize: "13px", color: COLORS.muted, lineHeight: 1.7, margin: 0 }}>
          A topical map is NOT a list of keywords. It is a semantic content network anchored to a Central Entity and a Source Context. 
          The more precise your business description, the more accurate your Central Search Intent detection.
        </p>
      </div>

      <button style={style.btnPrimary} onClick={handleNext}>Analyze Domain → Generate Source Context</button>
    </div>
  );
}
