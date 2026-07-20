import { redirect } from 'next/navigation';

type DocumentsPageProps = {
  searchParams: Promise<{ ask?: string; prompt?: string; view?: string }>;
};

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const query = await searchParams;
  const params = new URLSearchParams();
  const ask = query.ask ?? query.prompt;
  if (ask) params.set('ask', ask);
  if (query.view) params.set('view', query.view);

  redirect(`/intelligence${params.size ? `?${params.toString()}` : ''}`);
}
