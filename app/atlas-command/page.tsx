import { redirect } from 'next/navigation';
type AtlasCommandPageProps = {
  searchParams: Promise<{ prompt?: string }>;
};

function routeForPrompt(prompt: string) {
  return `/atlas-output?prompt=${encodeURIComponent(prompt)}`;
}

export default async function AtlasCommandPage({ searchParams }: AtlasCommandPageProps) {
  const query = await searchParams;
  redirect(routeForPrompt(query.prompt ?? ''));
}
