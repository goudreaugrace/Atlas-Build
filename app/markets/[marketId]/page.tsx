import AtlasIntelligenceHub from '../../atlas-intelligence-hub';

type MarketPageProps = {
  params: Promise<{ marketId: string }>;
  searchParams: Promise<{ ask?: string; prompt?: string; view?: string }>;
};

export default async function MarketPage({ params, searchParams }: MarketPageProps) {
  const { marketId } = await params;
  const query = await searchParams;

  return <AtlasIntelligenceHub view="market" marketId={marketId} initialGeneratedView={query.view ?? ''} initialPrompt={query.ask ?? query.prompt ?? ''} />;
}
