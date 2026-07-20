import { redirect } from 'next/navigation';

type TimelinePageProps = {
  searchParams: Promise<{ ask?: string; prompt?: string; view?: string }>;
};

export default async function TimelinePage({ searchParams }: TimelinePageProps) {
  const query = await searchParams;
  const params = new URLSearchParams();
  if (query.ask) params.set('ask', query.ask);
  if (query.prompt) params.set('prompt', query.prompt);
  if (query.view) params.set('view', query.view ?? 'memory');

  redirect(`/intelligence${params.toString() ? `?${params.toString()}` : ''}`);
}
