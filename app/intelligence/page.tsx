import AtlasIntelligenceHub from '../atlas-intelligence-hub';

type IntelligencePageProps = {
  searchParams: Promise<{ ask?: string; prompt?: string; view?: string }>;
};

export default async function IntelligencePage({ searchParams }: IntelligencePageProps) {
  const query = await searchParams;

  return (
    <AtlasIntelligenceHub
      initialGeneratedView={query.view ?? ''}
      initialPrompt={query.ask ?? query.prompt ?? ''}
      view="database"
    />
  );
}
