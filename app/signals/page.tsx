import AtlasIntelligenceHub from '../atlas-intelligence-hub';

type SignalsPageProps = {
  searchParams: Promise<{ ask?: string; prompt?: string; view?: string }>;
};

export default async function SignalsPage({ searchParams }: SignalsPageProps) {
  const query = await searchParams;

  return <AtlasIntelligenceHub view="signals" initialGeneratedView={query.view ?? ''} initialPrompt={query.ask ?? query.prompt ?? ''} />;
}
