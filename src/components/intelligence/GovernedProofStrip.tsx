import type { GovernedChatProof } from '@/src/lib/intelligence/governed-proof';

export default function GovernedProofStrip({ proof }: { proof?: GovernedChatProof }) {
  if (!proof) return null;
  return (
    <div className="governed-proof">
      <span>{proof.runtimeVersion ?? 'governed runtime'}</span>
      {proof.surface ? <span>{proof.surface}</span> : null}
      <span>{proof.persistence}</span>
      <span>{proof.quality}</span>
      <span>{proof.gates}</span>
      {proof.reviewIdentity ? <span>{proof.reviewIdentity}</span> : null}
      {proof.pilotLearning ? <span>{proof.pilotLearning}</span> : null}
      {proof.treatmentOutcomes ? <span>{proof.treatmentOutcomes}</span> : null}
      <span>{proof.evidence}</span>
      <span>{proof.views}</span>
    </div>
  );
}
