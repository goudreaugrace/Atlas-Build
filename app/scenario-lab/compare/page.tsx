import AtlasIntelligenceHub from '../../atlas-intelligence-hub';

type ScenarioComparePageProps = {
  searchParams: Promise<{
    buyingGroup?: string;
    market?: string;
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
      marketId={query.market ?? ''}
      view="scenarioCompare"
    />
  );
}
