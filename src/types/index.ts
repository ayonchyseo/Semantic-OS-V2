export type SiteType = "new" | "existing";
export type MonetizationType = "SaaS" | "affiliate" | "ecommerce" | "law" | "healthcare" | "local" | "media" | "other";
export type NodeType = "Quality" | "Bridge" | "Trust" | "Historical" | "Trending";
export type SectionType = "Core" | "Outer";
export type IntentType = "Informational" | "Commercial" | "Transactional" | "Navigational";
export type Priority = "P1" | "P2" | "SKIP";
export type NodeStatus = "planned" | "in-progress" | "published" | "needs-update";
export type LinkIntentStage = "Informational" | "Commercial" | "Transactional";

export interface AudienceSegment {
  name: string;
  description: string;
}

export interface SourceContextData {
  source_context: string;
  central_entity: string;
  central_search_intent: string;
  audience_segments: AudienceSegment[];
  topical_borders: string[];
  monetization_type: MonetizationType;
  historical_data_risk: string;
}

export interface EAVAttribute {
  attribute: string;
  priority: Priority;
  values: string[];
  spo_triple: string;
  section_target: "Core" | "Outer" | "Skip";
}

export interface EAVEntity {
  entity: string;
  entity_type: string;
  semantic_distance: number;
  attributes: EAVAttribute[];
}

export interface TopicalMapNode {
  node_id: string;
  article_title: string;
  slug_suggestion: string;
  target_entity: string;
  primary_attribute: string;
  node_type: NodeType;
  section: SectionType;
  macro_context: string;
  search_intent_type: IntentType;
  semantic_distance_score: number;
  priority_sequence: number;
  estimated_word_count: string;
  featured_snippet_target: boolean;
  schema_type: string;
  status: NodeStatus;
  published_url: string;
  published_date?: string;
  cannibalization_risk: boolean;
  cannibalization_conflict: string;
  bridge_to_core?: string;
  trust_signal_type?: string;
  gsc_impressions?: number;
  gsc_clicks?: number;
  gsc_position?: number;
  gsc_flag?: string;
}

export interface BriefOutlineItem {
  h2: string;
  extractive_answer: string;
  eav_entities: string[];
  spo_triple: string;
  semantic_distance_note: string;
}

export interface BriefInternalLink {
  target_article: string;
  anchor_text: string;
  intent_stage: LinkIntentStage;
  placement: string;
}

export interface ContentBrief {
  node_id: string;
  document_meta: {
    word_count_range: string;
    featured_snippet_target: boolean;
    featured_snippet_reason: string;
    schema_type: string;
    paa_questions: string[];
    voice_query_variants: string[];
    geo_optimization_note: string;
    entity_completeness_score: number;
    missing_entities_from_serp: string[];
  };
  macro_context_statement: string;
  h1: string;
  opening_paragraph: string;
  outline: BriefOutlineItem[];
  internal_links: BriefInternalLink[];
  schema_json_ld: Record<string, any>;
  koraynese_checklist: Record<string, boolean>;
  content_configuration_trigger: string;
}

export interface LinkRecord {
  from_node_id: string;
  from_article: string;
  to_node_id: string;
  to_article: string;
  anchor_text: string;
  intent_stage: LinkIntentStage;
  placement_note: string;
  link_type: "contextual" | "pillar" | "breadcrumb";
}

export interface LinkArchitecture {
  link_matrix: LinkRecord[];
  publishing_priority_order: Array<{ sequence: number; node_id: string; title: string; reason: string }>;
  pillar_pages: string[];
  orphan_alerts: Array<{ node_id: string; reason: string }>;
  cluster_groups: Array<{ cluster_name: string; nodes: string[] }>;
}

export interface AuditReport {
  coverage_score: number;
  core_coverage_pct: number;
  outer_coverage_pct: number;
  covered_nodes: string[];
  missing_nodes: string[];
  diluted_articles: Array<{
    url: string;
    title: string;
    reason: string;
    recommendation: "Delete" | "Redirect" | "Consolidate" | "Rewrite";
    redirect_target: string;
  }>;
  cannibalization_pairs: Array<{
    article_1_url: string;
    article_2_url: string;
    shared_macro_context: string;
    keep: string;
    merge_or_delete: string;
  }>;
  orphan_pages: string[];
  pruning_priority: Array<{ url: string; priority: number; expected_traffic_impact: string }>;
  expansion_roadmap: {
    missing_quality_nodes: string[];
    missing_bridge_nodes: string[];
    missing_trust_nodes: string[];
  };
  remediation_plan: {
    phase_1_month_1: string[];
    phase_2_month_2: string[];
    phase_3_month_3: string[];
  };
}

export interface CompetitorData {
  competitor_domain: string;
  guessed_central_entity: string;
  estimated_coverage_score: number;
  their_core_topics: string[];
  their_outer_topics: string[];
  their_topical_gaps: string[];
  overlap_with_our_map: string[];
  attack_opportunities: Array<{
    topic: string;
    commercial_value: "High" | "Medium" | "Low";
    ranking_ease: "Easy" | "Medium" | "Hard";
    rationale: string;
    priority: number;
  }>;
}

export interface AuthorEntity {
  author_id: string;
  name: string;
  expertise_areas: string[];
  bio: string;
  social_profiles: { linkedin?: string; twitter?: string; website?: string };
  schema_json_ld: Record<string, any>;
  eeat_score: number;
  eeat_improvements: string[];
  byline_strategy: string;
  assigned_articles: string[];
}

export interface GrowthReport {
  query_gap_analysis: Array<{
    query: string;
    estimated_volume: string;
    commercial_value: "High" | "Medium" | "Low";
    topical_relevance: "High" | "Medium" | "Low";
    recommended_section: SectionType;
    priority_score: number;
  }>;
  trending_nodes: Array<{
    topic: string;
    trend_source: string;
    recommended_section: SectionType;
    urgency: "High" | "Medium" | "Low";
  }>;
  content_configuration_triggers: Array<{
    node_id: string;
    article_title: string;
    trigger_reason: string;
    update_instructions: string;
  }>;
  historical_data_score: {
    publishing_frequency: string;
    consistency_score: number;
    days_since_last_publish: number;
    recommendation: string;
  };
  content_calendar_30_days: Array<{
    week: number;
    articles: Array<{ node_id: string; title: string; node_type: string; reason: string }>;
  }>;
}

export interface AuthorityScoreSnapshot {
  week: string;
  coverage_score: number;
  published_nodes: number;
  total_nodes: number;
  core_coverage_pct: number;
  outer_coverage_pct: number;
  publishing_consistency_score: number;
  overall_authority_score: number;
}

export interface Project {
  project_id: string;
  created_at: string;
  domain: string;
  site_type: SiteType;
  monetization_type: MonetizationType;
  geo_targets: string[];
  mode: "editorial" | "programmatic";
  multilingual: boolean;
  source_context_data?: SourceContextData;
  eav_architecture?: EAVEntity[];
  topical_map?: TopicalMapNode[];
  link_architecture?: LinkArchitecture;
  content_briefs?: Record<string, ContentBrief>;
  audit_report?: AuditReport;
  competitors?: CompetitorData[];
  authors?: AuthorEntity[];
  growth_report?: GrowthReport;
  authority_score_history?: AuthorityScoreSnapshot[];
  existing_articles?: Array<{ url: string; title: string }>;
  business_description?: string;
}
