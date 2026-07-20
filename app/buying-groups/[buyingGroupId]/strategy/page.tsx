import AtlasIntelligenceHub from '../../../atlas-intelligence-hub';

type StrategyPageProps = {
  params: Promise<{ buyingGroupId: string }>;
};

export default async function BuyingGroupStrategyPage({ params }: StrategyPageProps) {
  const { buyingGroupId } = await params;
  return <AtlasIntelligenceHub view="buyingGroup" buyingGroupId={buyingGroupId} initialBuyingGroupView="strategy" />;
}
