import AtlasIntelligenceHub from '../atlas-intelligence-hub';

type BuyingGroupsPageProps = {
  searchParams: Promise<{ ask?: string; prompt?: string; sort?: string; view?: string }>;
};

export default async function BuyingGroupsPage({ searchParams }: BuyingGroupsPageProps) {
  const query = await searchParams;

  return <AtlasIntelligenceHub view="buyingGroups" initialGeneratedView={query.view ?? ''} initialPrompt={query.ask ?? query.prompt ?? ''} initialSort={query.sort ?? ''} />;
}
