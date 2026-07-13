import { BookOpen, Download, FileText, Home, Search, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

export type WikiPage = {
  id: string;
  title: string;
  file: string;
  summary: string;
  content: string;
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function renderInlineMarkdown(text: string) {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);

  return tokens.map((token, index) => {
    if (token.startsWith('`') && token.endsWith('`')) {
      return <code key={`${token}-${index}`}>{token.slice(1, -1)}</code>;
    }
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={`${token}-${index}`}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('*') && token.endsWith('*')) {
      return <em key={`${token}-${index}`}>{token.slice(1, -1)}</em>;
    }
    return <span key={`${token}-${index}`}>{token}</span>;
  });
}

function MarkdownArticle({ content }: { content: string }) {
  const lines = content.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const title = heading[2];
      const id = slugify(title);
      if (level === 1) blocks.push(<h1 id={id} key={`h1-${index}`}>{renderInlineMarkdown(title)}</h1>);
      if (level === 2) blocks.push(<h2 id={id} key={`h2-${index}`}>{renderInlineMarkdown(title)}</h2>);
      if (level === 3) blocks.push(<h3 id={id} key={`h3-${index}`}>{renderInlineMarkdown(title)}</h3>);
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ''));
        index += 1;
      }
      blocks.push(
        <ul key={`ul-${index}`}>
          {items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>)}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ''));
        index += 1;
      }
      blocks.push(
        <ol key={`ol-${index}`}>
          {items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>)}
        </ol>
      );
      continue;
    }

    const paragraphLines = [line];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,3})\s+/.test(lines[index].trim()) &&
      !/^[-*]\s+/.test(lines[index].trim()) &&
      !/^\d+\.\s+/.test(lines[index].trim())
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }
    blocks.push(<p key={`p-${index}`}>{renderInlineMarkdown(paragraphLines.join(' '))}</p>);
  }

  return <div className="wiki-article-body">{blocks}</div>;
}

export default function SystemWiki({ pages }: { pages: WikiPage[] }) {
  return (
    <main className="wiki-page">
      <header className="wiki-hero">
        <div>
          <div className="section-kicker"><BookOpen size={14} /> System Wiki</div>
          <h1>How Brand Doctor Works</h1>
          <p>Readable source-of-truth documentation for the data, rules, treatments, AI guardrails, personas, and Live Consult experience.</p>
        </div>
        <nav className="wiki-actions" aria-label="Wiki navigation">
          <Link href="/"><Home size={15} /> Home</Link>
          <Link href="/brands"><Search size={15} /> Brands</Link>
          <Link href="/wiki/personas"><Sparkles size={15} /> Personas</Link>
          <Link href="/start-here"><ShieldCheck size={15} /> Start Here</Link>
        </nav>
      </header>

      <div className="wiki-shell">
        <aside className="wiki-sidebar" aria-label="Wiki sections">
          <strong>Contents</strong>
          <div className="wiki-export-card" aria-label="Wiki exports">
            <span>Share with the team</span>
            <p>Editable Word guide plus a read-ahead PDF generated from the same markdown source.</p>
            <div>
              <a href="/exports/bbe-brand-doctor-system-wiki.docx" download>
                <Download size={14} /> Word
              </a>
              <a href="/exports/bbe-brand-doctor-system-wiki.pdf" download>
                <Download size={14} /> PDF
              </a>
            </div>
          </div>
          <nav>
            {pages.map((page) => (
              <a href={`#${page.id}`} key={page.id}>
                <span>{page.title}</span>
                <em>{page.summary}</em>
              </a>
            ))}
          </nav>
        </aside>

        <section className="wiki-content">
          <div className="wiki-principle">
            <FileText size={18} />
            <div>
              <strong>No Magic documentation</strong>
              <p>These pages are backed by markdown in `docs/wiki` and should stay aligned with JSON config, deterministic services, and visible app behavior.</p>
            </div>
          </div>
          {pages.map((page) => (
            <article className="wiki-section" id={page.id} key={page.id}>
              <div className="wiki-section-head">
                <span>{page.file}</span>
                <p>{page.summary}</p>
              </div>
              <MarkdownArticle content={page.content} />
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
