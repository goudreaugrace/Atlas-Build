import AtlasIntelligenceHub from '../atlas-intelligence-hub';

type ScenarioModelsPageProps = {
  searchParams: Promise<{ ask?: string; buyingGroup?: string; market?: string; prompt?: string; view?: string }>;
};

export default async function ScenarioModelsPage({ searchParams }: ScenarioModelsPageProps) {
  const query = await searchParams;

  return <AtlasIntelligenceHub buyingGroupId={query.buyingGroup ?? ''} marketId={query.market ?? ''} view="scenarioModels" initialGeneratedView={query.view ?? ''} initialPrompt={query.ask ?? query.prompt ?? ''} />;
}
