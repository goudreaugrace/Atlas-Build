import personas from '@/src/data/config/personas.json';
import PersonaWiki from '@/src/components/wiki/PersonaWiki';
import type { AiPersona } from '@/src/types/domain';

export default function PersonasWikiPage() {
  return <PersonaWiki personas={personas as AiPersona[]} />;
}
