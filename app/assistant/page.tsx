import type { Metadata } from 'next';
import { AssistantClient } from './assistant-client';

export const metadata: Metadata = {
  title: 'AI Assistant — ATLAS',
  description: 'Conversational AI assistant for brand equity diagnosis, scenario modeling, and treatment planning.'
};

export default async function AssistantPage({
  searchParams
}: {
  searchParams: Promise<{ prompt?: string }>;
}) {
  const query = await searchParams;
  const initialPrompt = query.prompt ?? '';
  return <AssistantClient initialPrompt={initialPrompt} />;
}
