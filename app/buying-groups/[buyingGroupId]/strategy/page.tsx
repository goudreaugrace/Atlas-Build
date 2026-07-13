import AtlasNegotiationPlanBuilder from '../../../atlas-negotiation-plan-builder';

type StrategyPageProps = {
  params: Promise<{ buyingGroupId: string }>;
};

export default async function BuyingGroupStrategyPage({ params }: StrategyPageProps) {
  const { buyingGroupId } = await params;
  return <AtlasNegotiationPlanBuilder buyingGroupId={buyingGroupId} />;
}
