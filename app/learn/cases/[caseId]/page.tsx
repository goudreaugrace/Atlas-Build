import { notFound } from 'next/navigation';
import cases from '@/src/data/config/learning-case-walkthroughs.json';
import BrandCaseWalkthrough, {
  type BrandCaseWalkthroughContent
} from '@/src/components/education/BrandCaseWalkthrough';

const typedCases = cases as BrandCaseWalkthroughContent[];

type CaseRouteProps = {
  params: Promise<{ caseId: string }>;
};

export function generateStaticParams() {
  return typedCases.map((item) => ({ caseId: item.caseId }));
}

export async function generateMetadata({ params }: CaseRouteProps) {
  const { caseId } = await params;
  const caseContent = typedCases.find((item) => item.caseId === caseId);

  if (!caseContent) return { title: 'Learning Case | BBE Brand Doctor' };

  return {
    title: `${caseContent.title} | BBE Brand Doctor`,
    description: caseContent.subtitle
  };
}

export default async function LearnCaseRoute({ params }: CaseRouteProps) {
  const { caseId } = await params;
  const caseContent = typedCases.find((item) => item.caseId === caseId);

  if (!caseContent) notFound();

  return <BrandCaseWalkthrough caseContent={caseContent} />;
}
