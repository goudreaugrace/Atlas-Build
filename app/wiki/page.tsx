import fs from 'node:fs/promises';
import path from 'node:path';
import wikiNav from '@/src/data/config/wiki-nav.json';
import SystemWiki, { type WikiPage } from '@/src/components/wiki/SystemWiki';

type WikiNavItem = {
  id: string;
  title: string;
  file: string;
  summary: string;
};

async function loadWikiPages(): Promise<WikiPage[]> {
  const wikiDir = path.join(process.cwd(), 'docs/wiki');
  return Promise.all((wikiNav as WikiNavItem[]).map(async (item) => ({
    ...item,
    content: await fs.readFile(path.join(wikiDir, item.file), 'utf8')
  })));
}

export default async function WikiPage() {
  const pages = await loadWikiPages();
  return <SystemWiki pages={pages} />;
}
