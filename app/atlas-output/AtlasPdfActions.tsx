'use client';

import { useState } from 'react';
import { ArrowLeft, Download, Pencil, Save } from 'lucide-react';

type AtlasPdfActionsProps = {
  editHref?: string;
  editable?: boolean;
  mode?: 'draft' | 'generated' | 'retrieved';
};

export default function AtlasPdfActions({ editHref, editable = false, mode = 'generated' }: AtlasPdfActionsProps) {
  const [saved, setSaved] = useState(false);
  const canEditRetrieved = mode === 'retrieved' && !editable && editHref;

  return (
    <div className="atlas-pdf-actions" aria-label="PDF output actions">
      <a href="/" target="_self">
        <ArrowLeft size={15} /> Back to ATLAS
      </a>
      {canEditRetrieved ? (
        <a href={editHref} target="_self" className="atlas-pdf-secondary-action">
          <Pencil size={15} /> Edit document
        </a>
      ) : null}
      {editable ? (
        <button type="button" className="atlas-pdf-secondary-action" onClick={() => setSaved(true)}>
          <Save size={15} /> {saved ? 'Saved' : 'Save'}
        </button>
      ) : null}
      <button type="button" onClick={() => window.print()}>
        <Download size={15} /> Download PDF
      </button>
    </div>
  );
}
