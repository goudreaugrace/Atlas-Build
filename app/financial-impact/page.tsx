import { redirect } from 'next/navigation';

type FinancialImpactPageProps = {
  searchParams: Promise<{ ask?: string; prompt?: string; view?: string }>;
};

export default async function FinancialImpactPage({ searchParams }: FinancialImpactPageProps) {
  const query = await searchParams;
  const params = new URLSearchParams();
  const ask = query.ask ?? query.prompt;
  if (ask) params.set('ask', ask);
  if (query.view) params.set('view', query.view);

  redirect(`/scenario-lab${params.size ? `?${params.toString()}` : ''}`);
}
