import { useState, useEffect, useCallback } from "react";
import { Project, AuthorityScoreSnapshot } from "../types";

const STORAGE_KEY = "semanticos_projects";

export function useProject() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Project[];
        setProjects(parsed);
        if (parsed.length > 0) setActiveProject(parsed[parsed.length - 1]);
      }
    } catch (e) {
      console.error("Failed to load projects:", e);
    }
  }, []);

  const saveProjects = useCallback((updated: Project[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setProjects(updated);
    } catch (e) {
      console.error("localStorage full:", e);
    }
  }, []);

  const createProject = useCallback((partial: Partial<Project>): Project => {
    const project: Project = {
      project_id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      domain: "",
      site_type: "new",
      monetization_type: "SaaS",
      geo_targets: ["United States"],
      mode: "editorial",
      multilingual: false,
      authority_score_history: [],
      content_briefs: {},
      competitors: [],
      authors: [],
      ...partial,
    };
    const updated = [...projects, project];
    saveProjects(updated);
    setActiveProject(project);
    return project;
  }, [projects, saveProjects]);

  const updateProject = useCallback((project_id: string, updates: Partial<Project>) => {
    const updated = projects.map(p =>
      p.project_id === project_id ? { ...p, ...updates } : p
    );
    saveProjects(updated);
    const updatedProject = updated.find(p => p.project_id === project_id);
    if (updatedProject) setActiveProject(updatedProject);
    return updatedProject;
  }, [projects, saveProjects]);

  const deleteProject = useCallback((project_id: string) => {
    const updated = projects.filter(p => p.project_id !== project_id);
    saveProjects(updated);
    setActiveProject(updated.length > 0 ? updated[updated.length - 1] : null);
  }, [projects, saveProjects]);

  const snapshotAuthorityScore = useCallback((project_id: string) => {
    const project = projects.find(p => p.project_id === project_id);
    if (!project || !project.topical_map) return;

    const total = project.topical_map.length;
    const published = project.topical_map.filter(n => n.status === "published").length;
    const coreTotal = project.topical_map.filter(n => n.section === "Core").length;
    const corePublished = project.topical_map.filter(n => n.section === "Core" && n.status === "published").length;
    const outerTotal = project.topical_map.filter(n => n.section === "Outer").length;
    const outerPublished = project.topical_map.filter(n => n.section === "Outer" && n.status === "published").length;
    const qualityTotal = project.topical_map.filter(n => n.node_type === "Quality").length;
    const qualityPublished = project.topical_map.filter(n => n.node_type === "Quality" && n.status === "published").length;
    const cannibIssues = project.topical_map.filter(n => n.cannibalization_risk).length;

    const corePct = coreTotal > 0 ? (corePublished / coreTotal) * 100 : 0;
    const outerPct = outerTotal > 0 ? (outerPublished / outerTotal) * 100 : 0;
    const qualityPct = qualityTotal > 0 ? (qualityPublished / qualityTotal) * 100 : 0;
    const cannibScore = Math.max(0, 100 - cannibIssues * 10);

    const overall = Math.round(
      corePct * 0.35 +
      outerPct * 0.15 +
      qualityPct * 0.25 +
      cannibScore * 0.15 +
      (total > 0 ? (published / total) * 100 : 0) * 0.10
    );

    const snapshot: AuthorityScoreSnapshot = {
      week: new Date().toISOString().split("T")[0],
      coverage_score: Math.round((published / Math.max(total, 1)) * 100),
      published_nodes: published,
      total_nodes: total,
      core_coverage_pct: Math.round(corePct),
      outer_coverage_pct: Math.round(outerPct),
      publishing_consistency_score: 0,
      overall_authority_score: overall,
    };

    const history = [...(project.authority_score_history || []), snapshot];
    updateProject(project_id, { authority_score_history: history });
  }, [projects, updateProject]);

  return {
    projects,
    activeProject,
    setActiveProject,
    createProject,
    updateProject,
    deleteProject,
    snapshotAuthorityScore,
  };
}
