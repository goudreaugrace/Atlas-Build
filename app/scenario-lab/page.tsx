import AtlasIntelligenceHub from '../atlas-intelligence-hub';

type ScenarioLabPageProps = {
  searchParams: Promise<{ ask?: string; buyingGroup?: string; market?: string; mode?: string; prompt?: string; scenario?: string; view?: string }>;
};

export default async function ScenarioLabPage({ searchParams }: ScenarioLabPageProps) {
  const query = await searchParams;

  return (
    <AtlasIntelligenceHub
      buyingGroupId={query.buyingGroup ?? ''}
      initialGeneratedView={query.view ?? ''}
      initialPrompt={query.ask ?? query.prompt ?? ''}
      initialScenarioId={query.scenario ?? ''}
      initialScenarioLabMode={query.mode ?? ''}
      marketId={query.market ?? ''}
      view="scenarioModels"
    />
  );
}
