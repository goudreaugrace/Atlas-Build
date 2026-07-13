import AtlasIntelligenceHub from './atlas-intelligence-hub';

type PageProps = {
  searchParams: Promise<{ ask?: string; monitor?: string; prompt?: string; view?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const query = await searchParams;

  return (
    <AtlasIntelligenceHub
      view="overview"
      initialGeneratedView={query.view ?? ''}
      initialPrompt={query.ask ?? query.prompt ?? ''}
      initialMonitorTab={query.monitor ?? ''}
    />
  );
}
