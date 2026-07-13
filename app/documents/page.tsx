import AtlasIntelligenceHub from '../atlas-intelligence-hub';

type DocumentsPageProps = {
  searchParams: Promise<{ ask?: string; prompt?: string; view?: string }>;
};

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const query = await searchParams;

  return <AtlasIntelligenceHub view="documents" initialGeneratedView={query.view ?? ''} initialPrompt={query.ask ?? query.prompt ?? ''} />;
}
