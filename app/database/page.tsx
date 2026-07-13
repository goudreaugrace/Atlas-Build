import AtlasIntelligenceHub from '../atlas-intelligence-hub';

type DatabasePageProps = {
  searchParams: Promise<{ ask?: string; prompt?: string; view?: string }>;
};

export default async function DatabasePage({ searchParams }: DatabasePageProps) {
  const query = await searchParams;

  return <AtlasIntelligenceHub view="database" initialGeneratedView={query.view ?? ''} initialPrompt={query.ask ?? query.prompt ?? ''} />;
}
