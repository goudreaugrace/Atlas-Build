import AgentLabClient from './AgentLabClient';
import { brandRecords } from '@/src/lib/data';
import { runAgentTurn } from '@/src/lib/intelligence/agent-runtime';
import { scanMomentumRuntimeSourceFileDropAudit } from '@/src/lib/intelligence/server-momentum-file-drop-audit';
import { governedRuntimeSurfaceRegistry } from '@/src/lib/intelligence/runtime-surface-registry';

const defaultPrompt = "Why is Lay's slipping if it is still strong, and what should we bring to QBR?";

export default function AgentLabPage() {
  const initialResult = runAgentTurn({
    brandId: 'lay-s',
    question: defaultPrompt,
    runtimeSurfaceId: 'agent-lab-command-center',
    audienceMode: 'insights_lead',
    momentumRuntimeSourceFileDropAudit: scanMomentumRuntimeSourceFileDropAudit()
  });

  const brandOptions = brandRecords.map((record) => ({
    brandId: record.brandId,
    brandName: record.brandName,
    category: record.category,
    period: record.period
  }));

  return (
    <AgentLabClient
      initialResult={initialResult}
      brandOptions={brandOptions}
      defaultPrompt={defaultPrompt}
      runtimeSurfaceRegistry={governedRuntimeSurfaceRegistry}
    />
  );
}
