'use client';

import { Download } from 'lucide-react';

export default function AtlasReportActions() {
  return (
    <button className="atlas-report-download" type="button" onClick={() => window.print()}>
      <Download size={15} /> Download PDF
    </button>
  );
}
