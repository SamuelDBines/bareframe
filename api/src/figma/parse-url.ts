export function parseFigmaDesignUrl(url: string): { fileKey: string; nodeId?: string } | null {
  try {
    const u = new URL(url.trim());
    if (!u.hostname.endsWith('figma.com')) return null;
    const design = u.pathname.match(/\/design\/([A-Za-z0-9]+)/);
    const file = u.pathname.match(/\/file\/([A-Za-z0-9]+)/);
    const key = design?.[1] ?? file?.[1];
    if (!key) return null;
    const nodeId = u.searchParams.get('node-id')?.replace(/-/g, ':') ?? undefined;
    return { fileKey: key, nodeId };
  } catch {
    return null;
  }
}
