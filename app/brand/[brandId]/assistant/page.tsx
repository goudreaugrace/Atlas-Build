import BrandAssistantClient from './BrandAssistantClient';
import { brandRecords } from '@/src/lib/data';

type BrandAssistantPageProps = {
  params: Promise<{ brandId: string }>;
  searchParams?: Promise<{ workId?: string }>;
};

export default async function BrandAssistantPage({ params, searchParams }: BrandAssistantPageProps) {
  const { brandId } = await params;
  const activeWorkId = (await searchParams)?.workId;
  const record = brandRecords.find((brand) => brand.brandId === brandId) ?? brandRecords[0];
  return <BrandAssistantClient record={record} activeWorkId={activeWorkId} />;
}
