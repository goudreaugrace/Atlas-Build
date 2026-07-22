import AtlasIntelligenceHub from '../atlas-intelligence-hub';

type ScenarioLabPageProps = {
  searchParams: Promise<{
    ask?: string;
    buyingGroup?: string;
    case?: string;
    market?: string;
    mode?: string;
    prompt?: string;
    returnLabel?: string;
    returnTo?: string;
    scenario?: string;
    view?: string;
  }>;
};

export default async function ScenarioLabPage({ searchParams }: ScenarioLabPageProps) {
  const query = await searchParams;

  return (
    <AtlasIntelligenceHub
      buyingGroupId={query.buyingGroup ?? ''}
      initialGeneratedView={query.view ?? ''}
      initialPrompt={query.ask ?? query.prompt ?? ''}
      initialScenarioCaseId={query.case ?? ''}
      initialScenarioId={query.scenario ?? ''}
      initialScenarioLabMode={query.mode ?? ''}
      marketId={query.market ?? ''}
      returnLabel={query.returnLabel ?? ''}
      returnTo={query.returnTo ?? ''}
      view="scenarioModels"
    />
  );
}
