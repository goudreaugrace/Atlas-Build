import { redirect } from 'next/navigation';

type CompetitorsPageProps = {
  searchParams: Promise<{ ask?: string; prompt?: string; view?: string }>;
};

export default async function CompetitorsPage({ searchParams }: CompetitorsPageProps) {
  const query = await searchParams;
  const params = new URLSearchParams();
  const ask = query.ask ?? query.prompt;
  if (ask) params.set('ask', ask);
  if (query.view) params.set('view', query.view);

  redirect(`/${params.size ? `?${params.toString()}` : ''}`);
}
