import { agentCapabilityRegistry, agentSkillRegistry, dynamicViewRegistry, experienceTemplateRegistry } from '@/src/lib/intelligence/kernel';
import { governedRuntimeSurfaceRegistry, summarizeRuntimeSurfaces } from '@/src/lib/intelligence/runtime-surface-registry';
import voiceOrchestrationReadinessRequirementsJson from '@/src/data/config/voice-orchestration-readiness-requirements.json';
import type {
  AgentCapabilityDefinition,
  AgentSkillDefinition,
  BrandIntelligencePacket,
  DynamicViewDefinition,
  ExperienceTemplateDefinition
} from '@/src/lib/intelligence/types';

export type AssistantManifestCapability = {
  id: string;
  label: string;
  detail: string;
  source: 'skill' | 'view' | 'template' | 'runtime' | 'data';
};

export type AssistantManifestWorkspace = {
  id: string;
  label: string;
  audience: string;
  objective: string;
  purpose: string;
  requiredSkillIds: string[];
  viewIds: string[];
  humanApproval: string;
};

export type AssistantManifestBlockedCapability = {
  id: string;
  label: string;
  reason: string;
  riskLevel: AgentCapabilityDefinition['riskLevel'];
};

export type AssistantCapabilityManifest = {
  id: 'assistant-capability-manifest-v1';
  generatedAt: string;
  brand: {
    brandId: string;
    brandName: string;
    category: string;
    period: string;
  };
  identity: {
    name: string;
    role: string;
    scope: string;
    notA: string[];
  };
  availableNow: AssistantManifestCapability[];
  approvedSkills: AssistantManifestCapability[];
  approvedViews: AssistantManifestCapability[];
  governedWorkspaces: AssistantManifestWorkspace[];
  dataCoverage: {
    metricCount: number;
    trendMetricCount: number;
    evidenceReadiness: string;
    growthNavigatorEvidenceMode: string;
    strategicContextStatus: string;
    strategicContextCanonicalForExecutiveUse: boolean;
    momentumSourceStatus: string;
    momentumSourceCanonicalForExecutiveUse: boolean;
    evidenceGapCount: number;
  };
  runtime: {
    principle: string;
    readySurfaceCount: number;
    optInSurfaceCount: number;
    legacySurfaceCount: number;
    gatedSurfaceCount: number;
    disabledSurfaceCount: number;
    readySurfaceLabels: string[];
    gatedSurfaceLabels: string[];
  };
  voiceAndInteraction: {
    readyRequirements: string[];
    gatedRequirements: string[];
    blockedRequirements: string[];
    caveats: string[];
  };
  blockedCapabilities: AssistantManifestBlockedCapability[];
  guardrails: string[];
  starterQuestions: string[];
};

type VoiceReadinessRequirement = {
  id: string;
  label: string;
  status: 'ready' | 'gated' | 'blocked' | string;
  blockers?: string[];
  nextAction?: string;
};

type VoiceReadinessRequirements = {
  requirements: VoiceReadinessRequirement[];
  caveats: string[];
};

const voiceReadinessRequirements = voiceOrchestrationReadinessRequirementsJson as VoiceReadinessRequirements;

function topPrioritySkills(skills: AgentSkillDefinition[]) {
  const priorityRank: Record<AgentSkillDefinition['pilotPriority'], number> = {
    p0: 0,
    p1: 1,
    p2: 2,
    future: 3
  };
  return [...skills]
    .sort((a, b) => priorityRank[a.pilotPriority] - priorityRank[b.pilotPriority] || a.name.localeCompare(b.name))
    .slice(0, 10);
}

function voiceCanvasViews(views: DynamicViewDefinition[]) {
  return views
    .filter((view) => view.supportedModes.includes('voice_canvas'))
    .slice(0, 10);
}

function workspaceViewIds(template: ExperienceTemplateDefinition) {
  return Array.from(new Set(template.zones.map((zone) => zone.viewId))).slice(0, 8);
}

function workspaceRecord(template: ExperienceTemplateDefinition): AssistantManifestWorkspace {
  return {
    id: template.id,
    label: template.name,
    audience: template.audience,
    objective: template.objective,
    purpose: template.purpose,
    requiredSkillIds: template.requiredSkillIds,
    viewIds: workspaceViewIds(template),
    humanApproval: template.humanApproval
  };
}

function blockedCapabilityRecord(capability: AgentCapabilityDefinition): AssistantManifestBlockedCapability {
  return {
    id: capability.id,
    label: capability.label,
    reason: capability.blockedReason ?? capability.description,
    riskLevel: capability.riskLevel
  };
}

function manifestGuardrails(packet: BrandIntelligencePacket) {
  return Array.from(new Set([
    'Answer direct brand-equity questions first, then offer approved work only when useful.',
    'Use active brand evidence, diagnosis rules, treatment library, and approved dynamic views.',
    'Do not invent data, diagnoses, treatments, source truth, approvals, or production readiness.',
    'Treatments stay as options to consider or paths to test, not prescriptions.',
    'Pricing Power means broad brand-equity price justification, not SKU-level pricing advice.',
    ...packet.agentGuardrails
  ])).slice(0, 8);
}

function possessiveBrandName(brandName: string) {
  return brandName.endsWith('s') || brandName.endsWith("'s") ? brandName : `${brandName}'s`;
}

export function buildAssistantCapabilityManifest(packet: BrandIntelligencePacket): AssistantCapabilityManifest {
  const topSkills = topPrioritySkills(agentSkillRegistry);
  const canvasViews = voiceCanvasViews(dynamicViewRegistry);
  const workspaces = experienceTemplateRegistry
    .filter((template) => template.pilotPriority !== 'future')
    .map(workspaceRecord);
  const runtimeSummary = summarizeRuntimeSurfaces(governedRuntimeSurfaceRegistry.surfaces);
  const readyVoiceRequirements = voiceReadinessRequirements.requirements.filter((requirement) => requirement.status === 'ready');
  const gatedVoiceRequirements = voiceReadinessRequirements.requirements.filter((requirement) => requirement.status === 'gated');
  const blockedVoiceRequirements = voiceReadinessRequirements.requirements.filter((requirement) => requirement.status === 'blocked');
  const readySurfaces = governedRuntimeSurfaceRegistry.surfaces.filter((surface) => surface.status === 'ready' || surface.status === 'ready_opt_in');
  const gatedSurfaces = governedRuntimeSurfaceRegistry.surfaces.filter((surface) => surface.status === 'gated' || surface.status === 'disabled');
  const blockedCapabilities = agentCapabilityRegistry.filter((capability) => !capability.enabled).map(blockedCapabilityRecord);

  return {
    id: 'assistant-capability-manifest-v1',
    generatedAt: new Date().toISOString(),
    brand: {
      brandId: packet.brand.brandId,
      brandName: packet.brand.brandName,
      category: packet.brand.category,
      period: packet.brand.period
    },
    identity: {
      name: 'BBE Brand Assistant',
      role: 'Brand-equity strategist and governed workspace operator',
      scope: 'Brand equity diagnosis, evidence explanation, momentum interpretation, treatment paths to test, learning support, and approved workspace/report/proof planning for the active brand.',
      notA: [
        'general enterprise automation agent',
        'media planner',
        'sales forecaster',
        'SKU pricing advisor',
        'official approval or source-of-truth system'
      ]
    },
    availableNow: [
      {
        id: 'direct-brand-equity-answering',
        label: 'Answer active-brand questions',
        detail: `Uses ${packet.brand.brandName}'s Brand Intelligence Packet, evidence ledger, diagnosis rules, treatment library, and guardrails.`,
        source: 'data'
      },
      {
        id: 'proof-and-gap-explanation',
        label: 'Explain proof and gaps',
        detail: `${packet.evidenceReadiness.label} readiness with ${packet.evidenceGaps.length} visible evidence gap${packet.evidenceGaps.length === 1 ? '' : 's'}.`,
        source: 'data'
      },
      {
        id: 'approved-workspace-planning',
        label: 'Offer approved governed workspaces',
        detail: `${workspaces.length} pilot workspaces are available behind approval, including QBR, proof, treatment, learning, review, and readiness flows.`,
        source: 'template'
      },
      {
        id: 'voice-and-text-entry',
        label: 'Support text and initiated voice',
        detail: 'Text is the default source of truth. User-initiated voice can use the same assistant decision brain; continuous/background voice remains gated.',
        source: 'runtime'
      }
    ],
    approvedSkills: topSkills.map((skill) => ({
      id: skill.id,
      label: skill.name,
      detail: skill.purpose,
      source: 'skill' as const
    })),
    approvedViews: canvasViews.map((view) => ({
      id: view.id,
      label: view.name,
      detail: view.purpose,
      source: 'view' as const
    })),
    governedWorkspaces: workspaces,
    dataCoverage: {
      metricCount: packet.dataCoverage.metricCount,
      trendMetricCount: packet.dataCoverage.trendMetricCount,
      evidenceReadiness: packet.evidenceReadiness.label,
      growthNavigatorEvidenceMode: packet.dataCoverage.growthNavigatorEvidenceMode,
      strategicContextStatus: packet.strategicContextReadiness.status,
      strategicContextCanonicalForExecutiveUse: packet.strategicContextReadiness.canonicalForExecutiveUse,
      momentumSourceStatus: packet.momentumSourceReadiness.status,
      momentumSourceCanonicalForExecutiveUse: packet.momentumSourceReadiness.canonicalForExecutiveUse,
      evidenceGapCount: packet.evidenceGaps.length
    },
    runtime: {
      principle: governedRuntimeSurfaceRegistry.principle,
      readySurfaceCount: runtimeSummary.ready,
      optInSurfaceCount: runtimeSummary.optIn,
      legacySurfaceCount: runtimeSummary.legacy,
      gatedSurfaceCount: runtimeSummary.gated,
      disabledSurfaceCount: runtimeSummary.disabled,
      readySurfaceLabels: readySurfaces.map((surface) => surface.name).slice(0, 8),
      gatedSurfaceLabels: gatedSurfaces.map((surface) => surface.name).slice(0, 8)
    },
    voiceAndInteraction: {
      readyRequirements: readyVoiceRequirements.map((requirement) => requirement.label),
      gatedRequirements: gatedVoiceRequirements.map((requirement) => requirement.label),
      blockedRequirements: blockedVoiceRequirements.map((requirement) => requirement.label),
      caveats: voiceReadinessRequirements.caveats.slice(0, 4)
    },
    blockedCapabilities,
    guardrails: manifestGuardrails(packet),
    starterQuestions: [
      `Introduce yourself for a ${packet.brand.brandName} leadership room.`,
      `Tell me about ${possessiveBrandName(packet.brand.brandName)} momentum.`,
      'Show me the proof and gaps.',
      'What would I tell the CMO?',
      'Build this into a meeting prep read with proof.',
      'Build a learning path for this read.'
    ]
  };
}
