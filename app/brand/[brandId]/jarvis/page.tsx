import JarvisWorkbenchClient from './JarvisWorkbenchClient';
import { findBrandRecord } from '@/src/lib/brand-context';

type JarvisWorkbenchPageProps = {
  params: Promise<{ brandId: string }>;
  searchParams?: Promise<{ workId?: string }>;
};

export default async function JarvisWorkbenchPage({ params, searchParams }: JarvisWorkbenchPageProps) {
  const { brandId } = await params;
  const activeWorkId = (await searchParams)?.workId;
  return <JarvisWorkbenchClient record={findBrandRecord(brandId)} activeWorkId={activeWorkId} />;
}
