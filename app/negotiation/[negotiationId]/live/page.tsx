import { redirect } from 'next/navigation';

type LiveNegotiationPageProps = {
  params: Promise<{ negotiationId: string }>;
  searchParams: Promise<{ group?: string }>;
};

export default async function LiveNegotiationPage({ params, searchParams }: LiveNegotiationPageProps) {
  await params;
  const query = await searchParams;
  const buyingGroupId = query.group || 'carrefour';

  redirect(`/buying-groups/${buyingGroupId}?view=memory&legacy=live-room`);
}
