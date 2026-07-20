import { redirect } from 'next/navigation';

type ReportPageProps = {
  params: Promise<{ negotiationId: string; reportType: string }>;
};

export default async function ReportPage({ params }: ReportPageProps) {
  const { reportType } = await params;
  const prompt = encodeURIComponent(
    reportType === 'strategy-deck'
      ? 'Create a scenario evidence output for Carrefour'
      : `Create a ${reportType.replaceAll('-', ' ')} scenario output for Carrefour`
  );

  redirect(`/generated-views?prompt=${prompt}&mode=draft&editable=1&buyingGroupId=carrefour`);
}
