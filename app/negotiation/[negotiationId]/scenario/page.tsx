import { redirect } from 'next/navigation';

type ScenarioPageProps = {
  params: Promise<{ negotiationId: string }>;
};

export default async function ScenarioPage({ params }: ScenarioPageProps) {
  await params;
  redirect('/scenario-models?buyingGroup=carrefour');
}
