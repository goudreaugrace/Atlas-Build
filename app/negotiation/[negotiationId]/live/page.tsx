import AtlasLiveNegotiatorMode from '../../../atlas-live-negotiator-mode';

type LiveNegotiationPageProps = {
  params: Promise<{ negotiationId: string }>;
  searchParams: Promise<{ autostart?: string; deck?: string; group?: string }>;
};

export default async function LiveNegotiationPage({ params, searchParams }: LiveNegotiationPageProps) {
  const { negotiationId } = await params;
  const query = await searchParams;

  return (
    <AtlasLiveNegotiatorMode
      autoStartLive={query.autostart === '1'}
      initialPrepDeckLabel={query.deck}
      initialBuyingGroupId={query.group}
      initialStartedAt={query.autostart === '1' ? new Date().toISOString() : undefined}
      negotiationId={negotiationId}
    />
  );
}
