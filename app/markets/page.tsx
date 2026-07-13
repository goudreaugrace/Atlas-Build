import AtlasIntelligenceHub from '../atlas-intelligence-hub';

type MarketsPageProps = {
  searchParams: Promise<{ ask?: string; prompt?: string; sort?: string; view?: string }>;
};

export default async function MarketsPage({ searchParams }: MarketsPageProps) {
  const query = await searchParams;

  return <AtlasIntelligenceHub view="markets" initialGeneratedView={query.view ?? ''} initialPrompt={query.ask ?? query.prompt ?? ''} initialSort={query.sort ?? ''} />;
}
