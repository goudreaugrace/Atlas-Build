import BrandDataView from '@/src/components/brand/BrandDataView';
import { findBrandRecord } from '@/src/lib/brand-context';

type DataPageProps = {
  params: Promise<{ brandId: string }>;
};

export default async function DataPage({ params }: DataPageProps) {
  const { brandId } = await params;
  return <BrandDataView record={findBrandRecord(brandId)} />;
}
