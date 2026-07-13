import registry from '@/src/data/config/governed-runtime-surface-registry.json';

export type RuntimeSurfaceType = 'api' | 'ui' | 'chat_surface' | 'voice_surface' | 'provider_adapter';
export type RuntimeSurfaceDefaultState =
  | 'governed_default'
  | 'governed_opt_in'
  | 'scoped_legacy_default'
  | 'gated_candidate'
  | 'gated_disabled';
export type RuntimeSurfaceStatus = 'ready' | 'ready_opt_in' | 'legacy_stable' | 'gated' | 'disabled';
export type RuntimeSurfaceVoiceState = 'none' | 'push_to_talk_browser_stt' | 'realtime_candidate' | 'tts_disabled';

export type GovernedRuntimeSurface = {
  id: string;
  name: string;
  surfaceType: RuntimeSurfaceType;
  route: string;
  defaultState: RuntimeSurfaceDefaultState;
  runtimePath: string;
  sessionStrategy: string;
  persistence: string;
  proofSurface: string;
  streaming: boolean;
  voice: RuntimeSurfaceVoiceState;
  status: RuntimeSurfaceStatus;
  owner: string;
  connectedRuntimeRails: string[];
  gates: string[];
  guardrails: string[];
  nextStep: string;
};

export type GovernedRuntimeSurfaceRegistry = {
  id: string;
  lastReviewed: string;
  principle: string;
  surfaces: GovernedRuntimeSurface[];
  guardrails: string[];
  caveats: string[];
};

export type RuntimeSurfaceSummary = {
  ready: number;
  optIn: number;
  legacy: number;
  gated: number;
  disabled: number;
  governedDefault: number;
};

export const governedRuntimeSurfaceRegistry = registry as GovernedRuntimeSurfaceRegistry;

export function summarizeRuntimeSurfaces(surfaces: GovernedRuntimeSurface[]): RuntimeSurfaceSummary {
  return {
    ready: surfaces.filter((surface) => surface.status === 'ready').length,
    optIn: surfaces.filter((surface) => surface.status === 'ready_opt_in').length,
    legacy: surfaces.filter((surface) => surface.status === 'legacy_stable').length,
    gated: surfaces.filter((surface) => surface.status === 'gated').length,
    disabled: surfaces.filter((surface) => surface.status === 'disabled').length,
    governedDefault: surfaces.filter((surface) => surface.defaultState === 'governed_default').length
  };
}
