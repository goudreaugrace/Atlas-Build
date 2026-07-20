import { redirect } from 'next/navigation';

type AtlasOutputPageProps = {
  searchParams: Promise<{
    buyingGroupId?: string;
    documentId?: string;
    editable?: string;
    marketId?: string;
    mode?: string;
    prompt?: string;
  }>;
};

export default async function AtlasOutputPage({ searchParams }: AtlasOutputPageProps) {
  const query = await searchParams;
  const params = new URLSearchParams();

  params.set('brief', '1');
  params.set('source', 'legacy-output-link');
  params.set('ask', query.prompt?.trim() || 'Create a scenario brief from the current modeled risk.');

  if (query.buyingGroupId) params.set('buyingGroupId', query.buyingGroupId);
  if (query.marketId) params.set('marketId', query.marketId);

  redirect(`/scenario-lab?${params.toString()}`);
}
