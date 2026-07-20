import { redirect } from 'next/navigation';

type DatabasePageProps = {
  searchParams: Promise<{ ask?: string; prompt?: string; view?: string }>;
};

export default async function DatabasePage({ searchParams }: DatabasePageProps) {
  const query = await searchParams;
  const params = new URLSearchParams();
  if (query.ask) params.set('ask', query.ask);
  if (query.prompt) params.set('prompt', query.prompt);
  if (query.view) params.set('view', query.view);

  redirect(`/intelligence${params.toString() ? `?${params.toString()}` : ''}`);
}
