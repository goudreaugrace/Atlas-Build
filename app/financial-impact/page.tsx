import AtlasIntelligenceHub from '../atlas-intelligence-hub';

type FinancialImpactPageProps = {
  searchParams: Promise<{ ask?: string; prompt?: string; view?: string }>;
};

export default async function FinancialImpactPage({ searchParams }: FinancialImpactPageProps) {
  const query = await searchParams;

  return <AtlasIntelligenceHub view="financialImpact" initialGeneratedView={query.view ?? ''} initialPrompt={query.ask ?? query.prompt ?? ''} />;
}
