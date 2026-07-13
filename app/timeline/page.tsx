import AtlasIntelligenceHub from '../atlas-intelligence-hub';

type TimelinePageProps = {
  searchParams: Promise<{ ask?: string; prompt?: string; view?: string }>;
};

export default async function TimelinePage({ searchParams }: TimelinePageProps) {
  const query = await searchParams;

  return <AtlasIntelligenceHub view="timeline" initialGeneratedView={query.view ?? ''} initialPrompt={query.ask ?? query.prompt ?? ''} />;
}
