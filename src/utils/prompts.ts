export const PROMPTS = {

  sourceContext: (domain: string, businessDesc: string, geo: string, siteType: string, monetization: string) => `
Analyze this domain and return Source Context Intelligence.
Domain: ${domain}
Business: ${businessDesc}
Geography: ${geo}
Site Type: ${siteType}
Monetization: ${monetization}

Return ONLY this JSON:
{
  "source_context": "2-3 sentences why this site must exist in SERPs, tied to monetization",
  "central_entity": "single overarching entity appearing site-wide — NOT the niche, the semantic anchor",
  "central_search_intent": "source_context + central_entity unified in 2-3 sentences",
  "audience_segments": [{"name": "", "description": ""}],
  "topical_borders": ["topics this site should NEVER cover — list 6-10"],
  "monetization_type": "${monetization}",
  "historical_data_risk": "assessment of how quickly this domain can build historical trust"
}`,

  eavArchitecture: (centralEntity: string, sourceContext: string, intent: string, monetization: string) => `
Build complete EAV (Entity-Attribute-Value) Architecture for Semantic SEO.
Central Entity: ${centralEntity}
Source Context: ${sourceContext}
Central Search Intent: ${intent}
Monetization: ${monetization}

Rules:
- 8-12 primary entities orbiting the central entity
- Each entity: 5-8 attributes
- Each attribute: 3-5 specific corroborable values
- P1 = Core Section, P2 = Outer Section, SKIP = outside topical borders
- semantic_distance: 0-30 Core, 31-60 Bridge, 61-80 Outer, 81-100 Border risk

Return ONLY this JSON:
{
  "eav_architecture": [{
    "entity": "",
    "entity_type": "Product|Process|Person|Place|Concept|Event|Tool|Metric",
    "semantic_distance": 0,
    "attributes": [{
      "attribute": "",
      "priority": "P1|P2|SKIP",
      "values": ["specific value 1", "value 2", "value 3"],
      "spo_triple": "Subject predicate object sentence",
      "section_target": "Core|Outer|Skip"
    }]
  }]
}`,

  coreSection: (centralEntity: string, sourceContext: string, intent: string, eavJson: string, monetization: string) => `
Build the CORE SECTION of a Topical Map using Koray Tugberk's framework.
Central Entity: ${centralEntity}
Source Context: ${sourceContext}
Central Search Intent: ${intent}
Monetization: ${monetization}
EAV Architecture: ${eavJson}

Rules:
- 20-40 nodes covering main attributes of Central Entity
- Each node: UNIQUE macro context (zero overlap between nodes)
- Prioritize P1 attributes from EAV
- node_type: Quality=directly supports monetization, Bridge=connects topics, Trust=builds E-E-A-T
- semantic_distance_score: 0-60 only for core section
- priority_sequence: order to publish (1=publish first)

Return ONLY a JSON array:
[{
  "node_id": "generate-unique-uuid-string",
  "article_title": "Natural language title",
  "slug_suggestion": "url-friendly-slug",
  "target_entity": "",
  "primary_attribute": "",
  "node_type": "Quality|Bridge|Trust|Historical|Trending",
  "section": "Core",
  "macro_context": "One sentence: single purpose of this article",
  "search_intent_type": "Informational|Commercial|Transactional|Navigational",
  "semantic_distance_score": 0,
  "priority_sequence": 1,
  "estimated_word_count": "1200-1800",
  "featured_snippet_target": true,
  "schema_type": "Article|FAQPage|HowTo|Product",
  "status": "planned",
  "published_url": "",
  "cannibalization_risk": false,
  "cannibalization_conflict": ""
}]`,

  outerSection: (centralEntity: string, topicalBorders: string[], coreSectionSummary: string, p2Attributes: string) => `
Build the OUTER SECTION of a Topical Map using Koray Tugberk's framework.
Central Entity: ${centralEntity}
Topical Borders (NEVER cover): ${topicalBorders.join(", ")}
Core Section Summary: ${coreSectionSummary}
P2 Attributes to cover: ${p2Attributes}

Rules:
- 15-30 nodes for minor attributes and contextual domains
- Must NOT compete with Core Section (different macro contexts)
- semantic_distance_score: 31-80 only (if >80 reject it)
- Each outer node must have bridge_to_core naming which core article it supports
- Builds trust, breadth, E-E-A-T

Return ONLY a JSON array with same schema as core section, plus these extra fields:
"bridge_to_core": "title of core article this supports",
"trust_signal_type": "E-E-A-T|breadth|freshness|comparison|definition"`,

  cannibalizationCheck: (newMacroContext: string, existingNodes: string) => `
Check if new article creates macro context cannibalization.
New Macro Context: "${newMacroContext}"
Existing Nodes: ${existingNodes}

Compare the new macro context against ALL existing nodes.
threshold: overlap_percentage > 70 = cannibalization detected.

Return ONLY this JSON:
{
  "cannibalization_detected": false,
  "conflicts": [{
    "existing_node_id": "",
    "existing_article_title": "",
    "existing_macro_context": "",
    "overlap_percentage": 0,
    "recommendation": "Merge|Differentiate|Replace|Safe"
  }],
  "safe_to_add": true
}`,

  contentBrief: (node: string, eavJson: string, availableLinks: string, geo: string) => `
Generate a complete Koraynese-compliant content brief.
Node: ${node}
EAV Context: ${eavJson}
Available Internal Links: ${availableLinks}
Geo Target: ${geo}

Koraynese Rules:
- ONE macro context per page
- H2s are real user questions (how/what/why/when/which/is format)
- Every H2 extractive_answer ≤ 40 words, featured snippet ready
- Opening paragraph answers-first, ≤ 40 words
- Every sentence carries semantic payload, zero fluff
- Internal links are intent-progressive: Informational→Commercial→Transactional
- schema_json_ld must be FULLY POPULATED (not a skeleton)

Return ONLY this JSON:
{
  "node_id": "",
  "document_meta": {
    "word_count_range": "",
    "featured_snippet_target": true,
    "featured_snippet_reason": "",
    "schema_type": "",
    "paa_questions": ["real user questions from this topic"],
    "voice_query_variants": ["longer conversational versions"],
    "geo_optimization_note": "how to make this citable by AI Overviews",
    "entity_completeness_score": 85,
    "missing_entities_from_serp": []
  },
  "macro_context_statement": "2 sentences max",
  "h1": "",
  "opening_paragraph": "≤40 words, answer-first",
  "outline": [{
    "h2": "Written as real user question",
    "extractive_answer": "≤40 words, direct, no padding",
    "eav_entities": [],
    "spo_triple": "",
    "semantic_distance_note": ""
  }],
  "internal_links": [{
    "target_article": "",
    "anchor_text": "intent-progressive anchor",
    "intent_stage": "Informational|Commercial|Transactional",
    "placement": "where in article to place this link"
  }],
  "schema_json_ld": {"@context": "https://schema.org", "@type": "Article"},
  "koraynese_checklist": {
    "one_macro_context": true,
    "h2s_as_questions": true,
    "extractive_answers_40w": true,
    "eav_coverage": true,
    "spo_triples_present": true,
    "no_fluff": true,
    "intent_progressive_anchors": true,
    "schema_implemented": true,
    "paa_addressed": true,
    "geo_optimized": true
  },
  "content_configuration_trigger": ""
}`,

  linkArchitecture: (topicalMapJson: string) => `
Build complete internal linking architecture for this topical map.
Topical Map: ${topicalMapJson}

Rules:
- Every Quality Node: ≥3 inbound links from other articles
- No orphan pages: every article links to ≥2 others
- Homepage links ONLY to pillar Quality Nodes
- Anchor texts are intent-progressive: Informational→Commercial→Transactional
- Bridge nodes connect Core and Outer sections

Return ONLY this JSON:
{
  "link_matrix": [{
    "from_node_id": "",
    "from_article": "",
    "to_node_id": "",
    "to_article": "",
    "anchor_text": "",
    "intent_stage": "Informational|Commercial|Transactional",
    "placement_note": "",
    "link_type": "contextual|pillar|breadcrumb"
  }],
  "publishing_priority_order": [{"sequence": 1, "node_id": "", "title": "", "reason": ""}],
  "pillar_pages": ["node_id"],
  "orphan_alerts": [{"node_id": "", "reason": ""}],
  "cluster_groups": [{"cluster_name": "", "nodes": ["node_id"]}]
}`,

  topicalAudit: (domain: string, existingArticles: string, idealMapJson: string, topicalBorders: string[]) => `
Perform complete Topical Authority Audit using Koray Tugberk's framework.
Domain: ${domain}
Existing Articles (URLs and titles): ${existingArticles}
Ideal Topical Map: ${idealMapJson}
Topical Borders: ${topicalBorders.join(", ")}

Return ONLY this JSON:
{
  "coverage_score": 0,
  "core_coverage_pct": 0,
  "outer_coverage_pct": 0,
  "covered_nodes": [],
  "missing_nodes": [],
  "diluted_articles": [{
    "url": "",
    "title": "",
    "reason": "",
    "recommendation": "Delete|Redirect|Consolidate|Rewrite",
    "redirect_target": ""
  }],
  "cannibalization_pairs": [{
    "article_1_url": "",
    "article_2_url": "",
    "shared_macro_context": "",
    "keep": "",
    "merge_or_delete": ""
  }],
  "orphan_pages": [],
  "pruning_priority": [{"url": "", "priority": 1, "expected_traffic_impact": ""}],
  "expansion_roadmap": {
    "missing_quality_nodes": [],
    "missing_bridge_nodes": [],
    "missing_trust_nodes": []
  },
  "remediation_plan": {
    "phase_1_month_1": [],
    "phase_2_month_2": [],
    "phase_3_month_3": []
  }
}`,

  growthMonitor: (domain: string, mapSummary: string, publishedArticles: string) => `
Generate growth intelligence report for semantic SEO monitoring.
Domain: ${domain}
Current Topical Map Summary: ${mapSummary}
Published Articles with dates: ${publishedArticles}

Use Google Search grounding to find: trending topics in this niche, query gaps, current SERP trends.

Return ONLY this JSON:
{
  "query_gap_analysis": [{
    "query": "",
    "estimated_volume": "",
    "commercial_value": "High|Medium|Low",
    "topical_relevance": "High|Medium|Low",
    "recommended_section": "Core|Outer",
    "priority_score": 0
  }],
  "trending_nodes": [{
    "topic": "",
    "trend_source": "",
    "recommended_section": "Core|Outer",
    "urgency": "High|Medium|Low"
  }],
  "content_configuration_triggers": [{
    "node_id": "",
    "article_title": "",
    "trigger_reason": "",
    "update_instructions": ""
  }],
  "historical_data_score": {
    "publishing_frequency": "",
    "consistency_score": 0,
    "days_since_last_publish": 0,
    "recommendation": ""
  },
  "content_calendar_30_days": [{
    "week": 1,
    "articles": [{"node_id": "", "title": "", "node_type": "", "reason": ""}]
  }]
}`,

  competitorAnalysis: (competitorDomain: string, competitorArticles: string, ourCentralEntity: string, ourMapSummary: string) => `
Reverse-engineer competitor's topical map and find attack opportunities.
Competitor Domain: ${competitorDomain}
Competitor Articles: ${competitorArticles}
Our Central Entity: ${ourCentralEntity}
Our Topical Map Summary: ${ourMapSummary}

Return ONLY this JSON:
{
  "competitor_domain": "${competitorDomain}",
  "guessed_central_entity": "",
  "estimated_coverage_score": 0,
  "their_core_topics": [],
  "their_outer_topics": [],
  "their_topical_gaps": [],
  "overlap_with_our_map": [],
  "attack_opportunities": [{
    "topic": "",
    "commercial_value": "High|Medium|Low",
    "ranking_ease": "Easy|Medium|Hard",
    "rationale": "",
    "priority": 1
  }]
}`,

  serpEntityExtractor: (articleTitle: string, targetQuery: string, ourPlannedEntities: string) => `
Extract entities from top-ranking SERP results and compare to our planned brief.
Article Title: ${articleTitle}
Target Query: ${targetQuery}
Our Planned Entities: ${ourPlannedEntities}

Use Google Search grounding to search for: "${targetQuery}"
Analyze what entities, attributes and values top-ranking pages cover.
Identify gaps — what they cover that we don't plan to.

Return ONLY this JSON:
{
  "serp_entities_found": [],
  "our_planned_entities": ${ourPlannedEntities},
  "entity_gaps": [],
  "entity_completeness_score": 0,
  "paa_questions": [],
  "featured_snippet_format": "paragraph|list|table|none",
  "top_competitor_word_counts": []
}`,

  authorBuilder: (authorName: string, expertise: string[], bio: string, socialLinks: Record<string, string>, domain: string) => `
Build a complete author entity for E-E-A-T optimization.
Author Name: ${authorName}
Expertise Areas: ${expertise.join(", ")}
Bio: ${bio}
Social Profiles: ${JSON.stringify(socialLinks)}
Domain: ${domain}

Return ONLY this JSON:
{
  "author_id": "generate-uuid",
  "name": "${authorName}",
  "expertise_areas": ${JSON.stringify(expertise)},
  "bio": "${bio}",
  "social_profiles": ${JSON.stringify(socialLinks)},
  "schema_json_ld": {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "${authorName}",
    "url": "",
    "sameAs": [],
    "knowsAbout": ${JSON.stringify(expertise)},
    "description": ""
  },
  "eeat_score": 0,
  "eeat_improvements": [],
  "byline_strategy": "",
  "assigned_articles": []
}`,

  semanticDistance: (centralEntity: string, sourceContext: string, topicToEvaluate: string) => `
Calculate semantic distance score for topic evaluation.
Central Entity: ${centralEntity}
Source Context: ${sourceContext}
Topic to Evaluate: ${topicToEvaluate}

Scoring: 0-30 = Core territory, 31-60 = Bridge, 61-80 = Outer, 81-100 = Border risk.

Return ONLY this JSON:
{
  "topic": "${topicToEvaluate}",
  "semantic_distance_score": 0,
  "risk_level": "Core|Bridge|Outer|Border Risk",
  "recommendation": "Core Section|Outer Section|Do Not Publish",
  "reasoning": ""
}`,

  multilingualMap: (baseMap: string, targetCountries: string[], centralEntity: string) => `
Adapt topical map for multilingual/multi-regional deployment.
Base Topical Map: ${baseMap}
Target Countries: ${targetCountries.join(", ")}
Central Entity: ${centralEntity}

For each country: adapt Central Search Intent, localize entity values (prices, dates, units),
generate hreflang recommendations, identify country-specific query variations.

Return ONLY this JSON:
{
  "regional_maps": [{
    "country": "",
    "language_code": "",
    "hreflang": "",
    "localized_central_search_intent": "",
    "localized_nodes": [{
      "node_id": "",
      "localized_title": "",
      "localized_entities": [],
      "country_specific_queries": []
    }],
    "regional_publishing_priority": []
  }]
}`,

  programmaticSEO: (entityType: string, variable: string, sourceContext: string, exampleValues: string[]) => `
Generate programmatic SEO blueprint for entity-variable content scaling.
Entity Type: ${entityType}
Variable: ${variable}
Source Context: ${sourceContext}
Example Values: ${exampleValues.join(", ")}

Return ONLY this JSON:
{
  "url_pattern": "/${entityType.toLowerCase()}-{variable}/",
  "title_template": "",
  "h1_template": "",
  "macro_context_template": "",
  "estimated_page_count": 0,
  "schema_template": {"@context": "https://schema.org"},
  "internal_linking_pattern": "",
  "deduplication_rules": [],
  "sample_pages": [{
    "value": "",
    "url": "",
    "title": "",
    "h1": ""
  }]
}`,

  // ───────────────────────────────────────────────
  // ENHANCED TOPICAL MAP — SearchAtlas-style 3-level
  // ───────────────────────────────────────────────

  /**
   * Phase 1: Generate PILLAR pages (6-10 cornerstone content hubs).
   * These are the "hub" pages in the Pillar → Cluster → Supporting hierarchy.
   */
  pillarPages: (centralEntity: string, sourceContext: string, intent: string, eavJson: string, monetization: string) => `
Build PILLAR PAGES for a SearchAtlas-style topical authority map using Koray Tugberk's framework.
Central Entity: ${centralEntity}
Source Context: ${sourceContext}
Central Search Intent: ${intent}
Monetization: ${monetization}
EAV Architecture: ${eavJson}

PILLAR PAGE RULES:
- Generate 6-10 pillar pages (cornerstone content hubs)
- Each pillar = a major attribute cluster of the Central Entity
- Word count: 3000-5000 (comprehensive guides)
- Pillar pages are ALWAYS Quality or Trust node type
- Funnel stage: mostly ToFU and MoFU
- content_level: "Pillar"
- Each pillar page represents a distinct topical cluster

Return ONLY a JSON array:
[{
  "node_id": "generate-unique-uuid",
  "article_title": "Complete natural-language title (The Ultimate Guide to...)",
  "slug_suggestion": "url-slug",
  "target_entity": "",
  "primary_attribute": "",
  "node_type": "Quality|Trust",
  "section": "Core",
  "content_level": "Pillar",
  "content_cluster": "cluster group name for this pillar",
  "parent_pillar_id": null,
  "parent_cluster_id": null,
  "funnel_stage": "ToFU|MoFU",
  "content_type": "Guide",
  "keyword_targets": ["primary keyword", "secondary keyword", "LSI keyword"],
  "macro_context": "Single-sentence purpose of this pillar page",
  "search_intent_type": "Informational|Commercial",
  "semantic_distance_score": 0,
  "priority_sequence": 1,
  "estimated_word_count": "3000-5000",
  "featured_snippet_target": true,
  "schema_type": "Article|FAQPage|HowTo",
  "status": "planned",
  "published_url": "",
  "cannibalization_risk": false,
  "cannibalization_conflict": "",
  "bridge_to_core": null,
  "trust_signal_type": null
}]`,

  /**
   * Phase 2: Generate CLUSTER pages under each pillar (5-8 per pillar).
   * These are focused sub-topic articles that link back to their pillar.
   */
  clusterPages: (centralEntity: string, pillarsSummary: string, eavJson: string, monetization: string) => `
Build CLUSTER PAGES for each pillar in this SearchAtlas-style topical map.
Central Entity: ${centralEntity}
Monetization: ${monetization}
Pillar Pages (with node_ids): ${pillarsSummary}
EAV Architecture: ${eavJson}

CLUSTER PAGE RULES:
- Generate 5-8 cluster pages PER PILLAR (total 30-60 cluster pages across all pillars)
- Each cluster page covers a specific sub-attribute or sub-topic of its parent pillar
- cluster pages MUST reference their parent pillar's node_id in parent_pillar_id
- content_level: "Cluster"
- Word count: 1200-2500
- Variety: mix of Informational, Commercial, and some Transactional
- Mix node types: Quality, Bridge, Trust, Historical, Trending
- content_cluster: same cluster group name as the parent pillar
- DO NOT repeat article titles or macro contexts

Return ONLY a JSON array — include ALL cluster pages for ALL pillars in one array:
[{
  "node_id": "generate-unique-uuid",
  "article_title": "",
  "slug_suggestion": "",
  "target_entity": "",
  "primary_attribute": "",
  "node_type": "Quality|Bridge|Trust|Historical|Trending",
  "section": "Core|Outer",
  "content_level": "Cluster",
  "content_cluster": "must match parent pillar cluster name",
  "parent_pillar_id": "uuid of parent pillar page",
  "parent_cluster_id": null,
  "funnel_stage": "ToFU|MoFU|BoFU",
  "content_type": "Guide|Tutorial|Comparison|Review|Definition|FAQ|Case Study|Checklist|Listicle",
  "keyword_targets": ["primary keyword", "secondary keyword"],
  "macro_context": "One sentence purpose",
  "search_intent_type": "Informational|Commercial|Transactional|Navigational",
  "semantic_distance_score": 0,
  "priority_sequence": 1,
  "estimated_word_count": "1200-2500",
  "featured_snippet_target": true,
  "schema_type": "Article|FAQPage|HowTo|Product",
  "status": "planned",
  "published_url": "",
  "cannibalization_risk": false,
  "cannibalization_conflict": "",
  "bridge_to_core": null,
  "trust_signal_type": "E-E-A-T|breadth|freshness|comparison|definition"
}]`,

  /**
   * Phase 3: Generate SUPPORTING pages (3-5 per content cluster).
   * These are narrow, specific pages (definitions, FAQs, comparison pages).
   */
  supportingPages: (centralEntity: string, clustersSummary: string, topicalBorders: string[]) => `
Build SUPPORTING PAGES for each cluster in this topical map.
Central Entity: ${centralEntity}
Topical Borders (NEVER cover): ${topicalBorders.join(", ")}
Cluster Pages (with node_ids): ${clustersSummary}

SUPPORTING PAGE RULES:
- Generate 2-4 supporting pages PER CLUSTER (focus on the most important clusters only)
- Supporting pages are narrow, highly specific: definitions, FAQs, tools, comparisons, stats pages
- content_level: "Supporting"
- Word count: 600-1200 (concise, featured snippet optimized)
- parent_cluster_id = the cluster page's node_id they support
- parent_pillar_id = same pillar as their parent cluster
- These are mostly ToFU (awareness) or BoFU (decision)
- content_type: "Definition|FAQ|Checklist|Tool Page|Comparison|Review"
- section: usually "Outer" (supporting content sits in outer ring)
- trust_signal_type: "breadth|definition|E-E-A-T|comparison"

Return ONLY a JSON array of ALL supporting pages:
[{
  "node_id": "generate-unique-uuid",
  "article_title": "",
  "slug_suggestion": "",
  "target_entity": "",
  "primary_attribute": "",
  "node_type": "Bridge|Trust|Historical",
  "section": "Outer",
  "content_level": "Supporting",
  "content_cluster": "must match parent cluster cluster name",
  "parent_pillar_id": "uuid of grandparent pillar",
  "parent_cluster_id": "uuid of parent cluster page",
  "funnel_stage": "ToFU|BoFU",
  "content_type": "Definition|FAQ|Checklist|Tool Page|Comparison|Review",
  "keyword_targets": ["primary keyword"],
  "macro_context": "One sentence, very specific",
  "search_intent_type": "Informational|Navigational",
  "semantic_distance_score": 0,
  "priority_sequence": 1,
  "estimated_word_count": "600-1200",
  "featured_snippet_target": true,
  "schema_type": "FAQPage|Article|HowTo",
  "status": "planned",
  "published_url": "",
  "cannibalization_risk": false,
  "cannibalization_conflict": "",
  "bridge_to_core": "parent cluster article title",
  "trust_signal_type": "breadth|definition|E-E-A-T|comparison"
}]`,

  sitemapGenerator: (topicalMap: string) => `
Generate XML sitemap configuration from topical map.
Topical Map: ${topicalMap}

Priority mapping: Quality=0.9, Trending=0.8, Bridge=0.7, Trust=0.6, Historical=0.5
Changefreq mapping: Trending=weekly, Quality=monthly, Bridge=monthly, Trust=yearly, Historical=yearly

Return ONLY this JSON:
{
  "sitemap_entries": [{
    "loc": "",
    "priority": 0.9,
    "changefreq": "monthly",
    "node_type": ""
  }],
  "xml_output": "<?xml version='1.0' encoding='UTF-8'?><urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'>...</urlset>"
}`
};
