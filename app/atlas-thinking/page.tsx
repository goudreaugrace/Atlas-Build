import { redirect } from 'next/navigation';

type AtlasThinkingPageProps = {
  searchParams: Promise<{ prompt?: string }>;
};

export default async function AtlasThinkingPage({ searchParams }: AtlasThinkingPageProps) {
  const query = await searchParams;
  const params = new URLSearchParams({
    editable: '1',
    mode: 'draft',
    prompt: query.prompt?.trim() || 'Create a scenario evidence output'
  });

  redirect(`/generated-views?${params.toString()}`);
}
