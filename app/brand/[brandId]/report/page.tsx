import BrandDoctorApp from '../../../prototype-client';

type BrandReportPageProps = {
  params: Promise<{ brandId: string }>;
};

export default async function BrandReportPage({ params }: BrandReportPageProps) {
  const { brandId } = await params;
  return <BrandDoctorApp initialBrandId={brandId} />;
}
