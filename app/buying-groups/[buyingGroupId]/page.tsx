import AtlasIntelligenceHub from '../../atlas-intelligence-hub';

type BuyingGroupPageProps = {
  params: Promise<{ buyingGroupId: string }>;
  searchParams: Promise<{ ask?: string; phase?: string; view?: string }>;
};

export default async function BuyingGroupPage({ params, searchParams }: BuyingGroupPageProps) {
  const { buyingGroupId } = await params;
  const query = await searchParams;

  return (
    <AtlasIntelligenceHub
      view="buyingGroup"
      buyingGroupId={buyingGroupId}
      initialBuyingGroupPhase={query.phase ?? ''}
      initialBuyingGroupPrompt={query.ask ?? ''}
      initialBuyingGroupView={query.view ?? ''}
    />
  );
}
