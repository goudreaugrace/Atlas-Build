import type { Metadata } from 'next';
import { AssistantClient } from './assistant-client';

export const metadata: Metadata = {
  title: 'AI Assistant — ATLAS',
  description: 'Conversational AI assistant for brand equity diagnosis, scenario modeling, and treatment planning.'
};

export default function AssistantPage({
  searchParams
}: {
  searchParams: { prompt?: string };
}) {
  const initialPrompt = searchParams?.prompt ?? '';
  return <AssistantClient initialPrompt={initialPrompt} />;
}
