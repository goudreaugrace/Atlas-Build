import { redirect } from 'next/navigation';

type NegotiationPageProps = {
  params: Promise<{ negotiationId: string }>;
  searchParams?: Promise<{
    panel?: string | string[];
    savedAction?: string | string[];
    scenarioPrompt?: string | string[];
    stressMove?: string | string[];
    version?: string | string[];
    workingVersion?: string | string[];
  }>;
};

export default async function NegotiationPage({ params, searchParams }: NegotiationPageProps) {
  await params;
  await searchParams;
  redirect('/buying-groups/carrefour');
}
