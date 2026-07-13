import AtlasIntelligenceHub from '../atlas-intelligence-hub';

type CompetitorsPageProps = {
  searchParams: Promise<{ ask?: string; prompt?: string; view?: string }>;
};

export default async function CompetitorsPage({ searchParams }: CompetitorsPageProps) {
  const query = await searchParams;

  return <AtlasIntelligenceHub view="competitors" initialGeneratedView={query.view ?? ''} initialPrompt={query.ask ?? query.prompt ?? ''} />;
}
