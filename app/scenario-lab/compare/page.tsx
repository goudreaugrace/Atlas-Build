import AtlasIntelligenceHub from '../../atlas-intelligence-hub';

type ScenarioComparePageProps = {
  searchParams: Promise<{
    buyingGroup?: string;
    case?: string;
    market?: string;
    returnLabel?: string;
    returnTo?: string;
    scenario?: string | string[];
  }>;
};

export default async function ScenarioComparePage({ searchParams }: ScenarioComparePageProps) {
  const query = await searchParams;
  const scenarioIds = Array.isArray(query.scenario)
    ? query.scenario
    : query.scenario
      ? query.scenario.split(',')
      : [];

  return (
    <AtlasIntelligenceHub
      buyingGroupId={query.buyingGroup ?? ''}
      initialGeneratedView={scenarioIds.join(',')}
      initialScenarioCaseId={query.case ?? ''}
      initialScenarioId={scenarioIds[0] ?? ''}
      marketId={query.market ?? ''}
      returnLabel={query.returnLabel ?? ''}
      returnTo={query.returnTo ?? ''}
      view="scenarioModels"
    />
  );
}
