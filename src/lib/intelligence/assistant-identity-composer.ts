import type { AssistantCapabilityManifest } from '@/src/lib/intelligence/assistant-capability-manifest';
import { assistantRealityBoundaries } from '@/src/lib/intelligence/assistant-reality-boundaries';

export type AssistantIntroContext =
  | 'executive_room_intro'
  | 'capability_overview'
  | 'evidence_intro'
  | 'interaction_model_intro'
  | 'starter_guidance'
  | 'general_intro';

export type AssistantIdentityBrief = {
  id: 'assistant-identity-brief-v1';
  productName: 'BBE Brand Assistant';
  preferredRoleName: 'evidence-led brand equity advisor';
  audience: string[];
  jobToBeDone: string[];
  interactionPromise: string;
  trustPromise: string[];
  voice: string[];
  metaphorPolicy: {
    allowed: string[];
    avoid: string[];
  };
  boundaries: string[];
};

export type AssistantIntroComposition = {
  writtenAnswer: string;
  spokenAnswer: string;
  suggestedNextMoves: string[];
  validation: {
    passed: boolean;
    issues: string[];
    source: 'openai' | 'deterministic_fallback';
    model: string | null;
  };
};

export const assistantIdentityBrief: AssistantIdentityBrief = {
  id: 'assistant-identity-brief-v1',
  productName: 'BBE Brand Assistant',
  preferredRoleName: 'evidence-led brand equity advisor',
  audience: ['PepsiCo CMOs', 'brand leaders', 'brand managers', 'insights teams'],
  jobToBeDone: [
    'diagnose brand equity health in plain English',
    'explain proof, gaps, and guardrails',
    'interpret momentum and commercial watch-outs',
    'suggest treatment paths to test',
    'build governed reads, proof packs, learning paths, and workspaces with approval'
  ],
  interactionPromise: 'Answer directly first; when the ask requires heavier work, offer to build an approved governed workspace with evidence, gaps, and review notes visible.',
  trustPromise: [
    'Use active brand evidence and approved product registries.',
    'Say when the current packet cannot answer a question.',
    'Do not invent data, source truth, diagnoses, treatments, approvals, or production readiness.'
  ],
  voice: ['senior', 'warm', 'executive', 'concise', 'human', 'evidence-led'],
  metaphorPolicy: {
    allowed: ['doctor', 'diagnosis', 'vital signs', 'prescription decision'],
    avoid: ['medical certainty', 'final prescription', 'cure claims']
  },
  boundaries: [
    'not a general marketing automation agent',
    'not a media planner',
    'not a sales forecaster',
    'not a SKU pricing advisor',
    'not an official approval, export, or source-of-truth system'
  ]
};

function readSetting(name: string) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

function includesAny(value: string, signals: string[]) {
  return signals.some((signal) => value.includes(signal));
}

function extractOutputText(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const outputText = (data as { output_text?: unknown }).output_text;
  if (typeof outputText === 'string' && outputText.trim()) return outputText.trim();
  const output = (data as { output?: unknown }).output;
  if (!Array.isArray(output)) return null;
  const chunks: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (!part || typeof part !== 'object') continue;
      const text = (part as { text?: unknown }).text;
      if (typeof text === 'string') chunks.push(text);
    }
  }
  return chunks.join('\n').trim() || null;
}

function parseJsonObject(text: string) {
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    try {
      return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

function stringArray(value: unknown, limit: number) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => typeof item === 'string' ? item.trim() : '')
    .filter(Boolean)
    .slice(0, limit);
}

export function classifyAssistantIntroContext(question: string): AssistantIntroContext {
  const normalized = question.toLowerCase();
  if (includesAny(normalized, ['cmo', 'leadership', 'executive', 'room', 'audience', 'group'])) return 'executive_room_intro';
  if (includesAny(normalized, ['data', 'evidence', 'source', 'knowledge', 'proof', 'where do you get'])) return 'evidence_intro';
  if (includesAny(normalized, ['voice', 'chat', 'jarvis', 'interaction', 'how do i use', 'how should i talk'])) return 'interaction_model_intro';
  if (includesAny(normalized, ['what should i ask', 'where should i start', 'starter', 'examples'])) return 'starter_guidance';
  if (includesAny(normalized, ['what can you do', 'capabilities', 'help me do'])) return 'capability_overview';
  return 'general_intro';
}

function topWorkspaceLabels(manifest: AssistantCapabilityManifest) {
  return manifest.governedWorkspaces
    .filter((workspace) => ['executive', 'insights_lead', 'marketer', 'learner'].includes(workspace.audience))
    .slice(0, 5)
    .map((workspace) => workspace.label);
}

function possessiveBrandName(brandName: string) {
  if (brandName.endsWith("'s")) return brandName;
  if (brandName.endsWith('s')) return `${brandName}'`;
  return `${brandName}'s`;
}

function introSuggestedMoves(context: AssistantIntroContext, manifest: AssistantCapabilityManifest) {
  const possessiveName = possessiveBrandName(manifest.brand.brandName);
  if (context === 'executive_room_intro') {
    return [
      `Show me ${possessiveName} equity diagnosis.`,
      'What should a CMO know first?',
      'Build a leadership-review equity draft.',
      'Show proof and gaps.'
    ];
  }
  if (context === 'evidence_intro') {
    return [
      'Show me what is measured versus simulated.',
      'Which evidence gaps matter most?',
      'Open the proof and gaps workspace.'
    ];
  }
  if (context === 'starter_guidance') {
    return [
      `Tell me about ${possessiveName} momentum.`,
      'What would I tell the CMO?',
      'Build this into a meeting prep read with proof.'
    ];
  }
  return [
    `Tell me about ${possessiveName} momentum.`,
    'Show proof and gaps.',
    'Build a leadership-review draft.'
  ];
}

function deterministicIntro(context: AssistantIntroContext, manifest: AssistantCapabilityManifest): AssistantIntroComposition {
  const brandName = manifest.brand.brandName;
  const possessiveName = possessiveBrandName(brandName);
  const workspaces = topWorkspaceLabels(manifest).join(', ');
  const capabilityBuckets = assistantRealityBoundaries.capabilityBuckets
    .map((bucket) => `${bucket.label}: ${bucket.definition}`)
    .join('\n');
  const executive = context === 'executive_room_intro';
  const evidence = context === 'evidence_intro';
  const capabilityOverview = context === 'capability_overview' || context === 'general_intro';
  const writtenAnswer = evidence
    ? [
      `I am the BBE Brand Assistant, an evidence-led brand equity advisor for ${brandName}. My knowledge comes from the active Brand Intelligence Packet, diagnosis rules, evidence ledger, treatment library, and approved product registries.`,
      `I can explain what is measured, what is directional, what is missing, and what should not be overclaimed. I will not invent data, source truth, final prescriptions, or production approvals.`,
      `When a question needs more than a direct answer, I can build governed work such as ${workspaces}, with proof, gaps, and review notes visible.`
    ].join('\n\n')
    : executive
      ? [
        `I am the BBE Brand Assistant: an evidence-led brand equity advisor for PepsiCo teams.`,
        `I help leaders quickly understand what is happening in ${possessiveName} equity, what proof supports the read, what is still missing, and which treatment paths are worth testing.`,
        `I can answer directly, or when the ask needs more work, build a governed read with approved views, evidence, gaps, and review notes on screen. I will not invent data or make final prescriptions; I help the team see the diagnosis clearly enough to decide.`
      ].join('\n\n')
      : capabilityOverview
      ? [
        `I am the BBE Brand Assistant for ${brandName}: an evidence-led brand equity advisor for this active brand.`,
        capabilityBuckets,
        `For ${brandName}, I can diagnose equity health, explain proof and gaps, interpret momentum, suggest treatment paths to test, and build review-draft workspaces such as ${workspaces} when you approve heavier work.`,
        `I cannot invent data, make final prescriptions, officially export or circulate artifacts, certify production readiness, write source truth, or give SKU-level pricing advice.`
      ].join('\n\n')
      : [
        `I am the BBE Brand Assistant for ${brandName}: an evidence-led brand equity advisor for this active brand that answers direct questions first and builds approved governed workspace work when useful.`,
        `I can diagnose equity health, explain proof and gaps, interpret momentum, suggest treatment paths to test, and create review drafts or governed workspaces such as ${workspaces}.`,
        `I cannot invent data, make final prescriptions, officially export or circulate artifacts, certify production readiness, write source truth, or give SKU-level pricing advice.`
      ].join('\n\n');
  const spokenAnswer = executive
    ? `I am the B B E Brand Assistant: an evidence-led brand equity advisor. I help leaders understand the diagnosis, proof, gaps, and treatment paths to test, then can build a governed read on screen.`
    : `I am the B B E Brand Assistant for ${brandName}. I answer brand equity questions first, then can build governed proof, Q B R, treatment, or learning work with approval.`;

  return {
    writtenAnswer,
    spokenAnswer,
    suggestedNextMoves: introSuggestedMoves(context, manifest),
    validation: {
      passed: true,
      issues: [],
      source: 'deterministic_fallback',
      model: null
    }
  };
}

function validateIntro(text: string, context: AssistantIntroContext) {
  const normalized = text.toLowerCase();
  const issues: string[] = [];
  if (!normalized.includes('brand equity')) issues.push('missing_brand_equity_scope');
  if (!includesAny(normalized, ['evidence', 'proof'])) issues.push('missing_evidence_or_proof');
  if (!includesAny(normalized, ['gap', 'missing', 'caveat'])) issues.push('missing_gap_or_caveat_language');
  if (!includesAny(normalized, ['will not invent', 'do not invent', "won't invent", 'cannot invent'])) issues.push('missing_no_invention_boundary');
  if (includesAny(normalized, ['media plan', 'media planner', 'sales forecast', 'sales forecaster', 'sku-level pricing advisor', 'official approval system'])) issues.push('overclaimed_generic_capability');
  if (includesAny(normalized, ['source of truth', 'production ready', 'export artifacts']) && !includesAny(normalized, ['not', 'cannot', 'will not', "won't"])) {
    issues.push('unsafe_source_or_production_claim');
  }
  if (includesAny(normalized, ['cmo-ready', 'board-ready', 'final artifact', 'approved artifact', 'shareable artifact'])) {
    issues.push('unsafe_artifact_readiness_claim');
  }
  if (context === 'executive_room_intro' && !includesAny(normalized, ['leader', 'cmo', 'decide', 'decision'])) {
    issues.push('missing_executive_decision_context');
  }
  return {
    passed: issues.length === 0,
    issues
  };
}

export async function composeAssistantIntroduction(input: {
  question: string;
  manifest: AssistantCapabilityManifest;
}): Promise<AssistantIntroComposition> {
  const context = classifyAssistantIntroContext(input.question);
  const fallback = deterministicIntro(context, input.manifest);
  const apiKey = readSetting('OPENAI_API_KEY');
  const mode = readSetting('LLM_MODE') ?? 'mock';
  const model = readSetting('OPENAI_MODEL') ?? 'gpt-4.1-mini';
  if (!apiKey || mode !== 'live') return fallback;

  const body: Record<string, unknown> = {
    model,
    instructions: [
      'You compose short introductions for the BBE Brand Assistant.',
      'Use only the supplied identity brief and capability manifest. Do not invent product capabilities, data sources, approvals, exports, source truth, or production readiness.',
      'Use the supplied reality boundaries. Separate available today, prototype governed workspaces, and gated/future capabilities. Say review draft/workspace, not CMO-ready, final, approved, or shareable, unless an official approval workflow exists.',
      'Adapt to the user question and intro context. Sound like a senior, warm, evidence-led PepsiCo brand equity advisor.',
      'Mention direct answers plus governed workspaces when relevant. For executive audiences, emphasize diagnosis, proof, gaps, treatment paths to test, and decision support, not final prescriptions.',
      'Return valid JSON only: {"writtenAnswer": string, "spokenAnswer": string, "suggestedNextMoves": string[]}.',
      'writtenAnswer: 2-3 short paragraphs. spokenAnswer: 1-2 natural sentences under 55 words. suggestedNextMoves: 3-4 concise actions.'
    ].join('\n'),
    input: JSON.stringify({
      userQuestion: input.question,
      introContext: context,
      identityBrief: assistantIdentityBrief,
      capabilityManifest: {
        brand: input.manifest.brand,
        identity: input.manifest.identity,
        availableNow: input.manifest.availableNow,
        governedWorkspaceLabels: topWorkspaceLabels(input.manifest),
        dataCoverage: input.manifest.dataCoverage,
        blockedCapabilities: input.manifest.blockedCapabilities.slice(0, 6),
        guardrails: input.manifest.guardrails.slice(0, 6)
      },
      realityBoundaries: {
        capabilityBuckets: assistantRealityBoundaries.capabilityBuckets,
        sourcePeriodRule: assistantRealityBoundaries.sourcePeriodRule,
        shareExportRule: assistantRealityBoundaries.shareExportRule,
        workOrderLanguage: assistantRealityBoundaries.workOrderLanguage
      }
    }, null, 2),
    max_output_tokens: 700
  };
  const reasoningEffort = readSetting('OPENAI_REASONING_EFFORT');
  const textVerbosity = readSetting('OPENAI_TEXT_VERBOSITY');
  if (reasoningEffort) body.reasoning = { effort: reasoningEffort };
  if (textVerbosity) body.text = { verbosity: textVerbosity };

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) return fallback;
    const text = extractOutputText(data);
    if (!text) return fallback;
    const parsed = parseJsonObject(text);
    if (!parsed) return fallback;
    const writtenAnswer = typeof parsed.writtenAnswer === 'string' ? parsed.writtenAnswer.trim() : '';
    const spokenAnswer = typeof parsed.spokenAnswer === 'string' ? parsed.spokenAnswer.trim() : '';
    const suggestedNextMoves = stringArray(parsed.suggestedNextMoves, 4);
    if (!writtenAnswer || !spokenAnswer) return fallback;
    const validation = validateIntro(`${writtenAnswer}\n${spokenAnswer}`, context);
    if (!validation.passed) return {
      ...fallback,
      validation: {
        ...fallback.validation,
        issues: validation.issues,
        source: 'deterministic_fallback',
        model: null
      }
    };
    return {
      writtenAnswer,
      spokenAnswer,
      suggestedNextMoves: suggestedNextMoves.length ? suggestedNextMoves : fallback.suggestedNextMoves,
      validation: {
        passed: true,
        issues: [],
        source: 'openai',
        model
      }
    };
  } catch {
    return fallback;
  }
}
