import fs from 'node:fs';
import path from 'node:path';
import { brandStrategicContextRuntimeFileDropPolicy } from '@/src/lib/intelligence/kernel';
import type {
  BrandStrategicContextRuntimeSourceFileDropAudit,
  BrandStrategicContextRuntimeSourceFileKindAudit,
  BrandStrategicContextSourceOwnerFile,
  BrandStrategicContextSourceOwnerFileKind
} from '@/src/lib/intelligence/types';

const SOURCE_OWNER_FILE_DROP_DIR = path.join(process.cwd(), 'src', 'data', 'source', 'brand-strategic-context-source-owner-files');

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function normalizeFilePath(filePath: string) {
  return filePath.split(path.sep).join('/');
}

function listJsonFiles(directoryPath: string) {
  if (!fs.existsSync(directoryPath)) return [];
  return fs.readdirSync(directoryPath)
    .filter((fileName) => fileName.endsWith('.json'))
    .map((fileName) => path.join(directoryPath, fileName));
}

function sourceFilesFromJson(value: unknown): BrandStrategicContextSourceOwnerFile[] {
  const objectValue = asObject(value);
  if (!objectValue) return [];
  if (Array.isArray(objectValue.sourceFiles)) return objectValue.sourceFiles as BrandStrategicContextSourceOwnerFile[];
  if (typeof objectValue.fileKind === 'string') return [objectValue as BrandStrategicContextSourceOwnerFile];
  return [];
}

function auditFileKind(
  fileKind: BrandStrategicContextSourceOwnerFileKind,
  parsedFiles: { path: string; sourceFile: BrandStrategicContextSourceOwnerFile; bundleType: string | null }[]
): BrandStrategicContextRuntimeSourceFileKindAudit {
  const matches = parsedFiles.filter((item) => item.sourceFile.fileKind === fileKind);
  const issues: string[] = [];
  if (matches.length === 0) issues.push('No matching Brand Strategic Context source-owner file block found.');

  const reviewStatuses = Array.from(new Set(matches.map((item) => item.sourceFile.reviewStatus).filter(Boolean)));
  const invalidReviewStatuses = reviewStatuses.filter((status) => status !== 'approved_source');
  if (invalidReviewStatuses.length > 0) {
    issues.push(`Found non-approved review statuses: ${invalidReviewStatuses.join(', ')}.`);
  }
  if (matches.some((item) => !Array.isArray(item.sourceFile.rows) || item.sourceFile.rows.length === 0)) {
    issues.push('At least one matching file block has no rows.');
  }
  if (matches.some((item) => (item.sourceFile.rows ?? []).some((row) => row.reviewStatus !== 'approved_source'))) {
    issues.push('At least one matching row is not approved_source.');
  }

  return {
    fileKind,
    present: matches.length > 0 && issues.length === 0,
    expectedPathHint: `${brandStrategicContextRuntimeFileDropPolicy.expectedSourceDirectory}${fileKind}.json`,
    candidatePaths: matches.map((item) => normalizeFilePath(path.relative(process.cwd(), item.path))),
    parsedBundleType: matches[0]?.bundleType ?? null,
    rowCount: matches.reduce((sum, item) => sum + (Array.isArray(item.sourceFile.rows) ? item.sourceFile.rows.length : 0), 0),
    brandIds: Array.from(new Set(matches.flatMap((item) => (item.sourceFile.rows ?? []).map((row) => row.brandId)).filter(Boolean))),
    reviewStatuses: reviewStatuses as BrandStrategicContextRuntimeSourceFileKindAudit['reviewStatuses'],
    sourceTypes: Array.from(new Set(matches.flatMap((item) => (item.sourceFile.rows ?? []).map((row) => row.sourceType)).filter(Boolean))) as BrandStrategicContextRuntimeSourceFileKindAudit['sourceTypes'],
    issues
  };
}

export function scanBrandStrategicContextRuntimeSourceFileDropAudit(): BrandStrategicContextRuntimeSourceFileDropAudit {
  const directoryPath = SOURCE_OWNER_FILE_DROP_DIR;
  const directoryExists = fs.existsSync(directoryPath) && fs.statSync(directoryPath).isDirectory();
  const candidatePaths = directoryExists ? listJsonFiles(directoryPath) : [];
  const parsedFiles: { path: string; sourceFile: BrandStrategicContextSourceOwnerFile; bundleType: string | null }[] = [];
  const parseIssuesByPath = new Map<string, string>();

  for (const candidatePath of candidatePaths) {
    try {
      const raw = JSON.parse(fs.readFileSync(candidatePath, 'utf8')) as unknown;
      const bundleType = asObject(raw)?.sourceBundleType;
      for (const sourceFile of sourceFilesFromJson(raw)) {
        parsedFiles.push({
          path: candidatePath,
          sourceFile,
          bundleType: typeof bundleType === 'string' ? bundleType : null
        });
      }
    } catch (error) {
      parseIssuesByPath.set(
        normalizeFilePath(path.relative(process.cwd(), candidatePath)),
        error instanceof Error ? error.message : 'Unable to parse JSON.'
      );
    }
  }

  const fileKindAudits = brandStrategicContextRuntimeFileDropPolicy.requiredFileKinds.map((fileKind) =>
    auditFileKind(fileKind, parsedFiles)
  );
  if (parseIssuesByPath.size > 0) {
    const issue = Array.from(parseIssuesByPath.entries())
      .map(([filePath, message]) => `${filePath}: ${message}`)
      .join('; ');
    for (const audit of fileKindAudits) audit.issues.push(`Candidate JSON parse issue: ${issue}`);
  }

  return {
    auditMode: 'server_directory_scan',
    scannedAt: new Date().toISOString(),
    sourceDirectoryExists: directoryExists,
    expectedSourceDirectory: brandStrategicContextRuntimeFileDropPolicy.expectedSourceDirectory,
    candidateFileCount: candidatePaths.length,
    fileKindAudits,
    caveats: [
      'This is a read-only server audit of the expected Brand Strategic Context source-owner landing zone.',
      'Presence of approved-looking files does not enable runtime consumption or canonical use while policy gates remain disabled.'
    ]
  };
}
