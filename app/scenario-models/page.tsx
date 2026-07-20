import { redirect } from 'next/navigation';

type ScenarioModelsPageProps = {
  searchParams: Promise<{ ask?: string; buyingGroup?: string; market?: string; prompt?: string; view?: string }>;
};

export default async function ScenarioModelsPage({ searchParams }: ScenarioModelsPageProps) {
  const query = await searchParams;
  const params = new URLSearchParams();
  if (query.ask) params.set('ask', query.ask);
  if (query.buyingGroup) params.set('buyingGroup', query.buyingGroup);
  if (query.market) params.set('market', query.market);
  if (query.prompt) params.set('prompt', query.prompt);
  if (query.view) params.set('view', query.view);

  redirect(`/scenario-lab${params.toString() ? `?${params.toString()}` : ''}`);
}
