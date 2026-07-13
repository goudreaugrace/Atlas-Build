import { notFound } from 'next/navigation';
import modules from '@/src/data/config/grounding-education-modules.json';
import pages from '@/src/data/config/learning-module-pages.json';
import LearnModulePage, {
  type GroundingEducationModule,
  type LearnModuleContent
} from '@/src/components/education/LearnModulePage';

const typedModules = modules as GroundingEducationModule[];
const typedPages = pages as LearnModuleContent[];

type LearnRouteProps = {
  params: Promise<{ moduleId: string }>;
};

export function generateStaticParams() {
  return typedPages.map((page) => ({ moduleId: page.moduleId }));
}

export async function generateMetadata({ params }: LearnRouteProps) {
  const { moduleId } = await params;
  const page = typedPages.find((item) => item.moduleId === moduleId);

  if (!page) return { title: 'Learning Module | BBE Brand Doctor' };

  return {
    title: `${page.title} | BBE Brand Doctor`,
    description: page.promise
  };
}

export default async function LearnModuleRoute({ params }: LearnRouteProps) {
  const { moduleId } = await params;
  const sortedModules = [...typedModules].sort((a, b) => a.order - b.order);
  const module = sortedModules.find((item) => item.id === moduleId);
  const page = typedPages.find((item) => item.moduleId === moduleId);

  if (!module || !page) notFound();

  const moduleIndex = sortedModules.findIndex((item) => item.id === module.id);
  const previousModule = moduleIndex > 0 ? sortedModules[moduleIndex - 1] : undefined;
  const nextModule = moduleIndex < sortedModules.length - 1 ? sortedModules[moduleIndex + 1] : undefined;

  return (
    <LearnModulePage
      module={module}
      page={page}
      previousModule={previousModule}
      nextModule={nextModule}
    />
  );
}
