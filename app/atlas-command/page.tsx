import { redirect } from 'next/navigation';
type AtlasCommandPageProps = {
  searchParams: Promise<{ prompt?: string }>;
};

function routeForPrompt(prompt: string) {
  return `/generated-views?prompt=${encodeURIComponent(prompt || 'Create a scenario evidence output')}&mode=draft&editable=1`;
}

export default async function AtlasCommandPage({ searchParams }: AtlasCommandPageProps) {
  const query = await searchParams;
  redirect(routeForPrompt(query.prompt ?? ''));
}
