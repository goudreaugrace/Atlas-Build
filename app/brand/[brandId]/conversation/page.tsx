import BrandConversationPage from '@/src/components/brand/BrandConversationPage';
import { findBrandRecord } from '@/src/lib/brand-context';

type ConversationPageProps = {
  params: Promise<{ brandId: string }>;
};

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { brandId } = await params;
  return <BrandConversationPage record={findBrandRecord(brandId)} />;
}
