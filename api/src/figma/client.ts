export type FigmaFileResponse = {
  name: string;
  document: FigmaNode;
};

export type FigmaNode = {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  reactions?: {
    trigger: { type: string };
    actions: { type: string; destinationId?: string; navigation?: string }[];
  }[];
};

export async function figmaFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`https://api.figma.com${path}`, {
    headers: { 'X-Figma-Token': token },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Figma API ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchFile(fileKey: string, token: string): Promise<FigmaFileResponse> {
  return figmaFetch(`/v1/files/${fileKey}?geometry=paths`, token);
}

export async function fetchFrameImages(
  fileKey: string,
  nodeIds: string[],
  token: string,
): Promise<Record<string, string | null>> {
  if (nodeIds.length === 0) return {};
  const ids = nodeIds.join(',');
  const data = await figmaFetch<{ images: Record<string, string | null> }>(
    `/v1/images/${fileKey}?ids=${encodeURIComponent(ids)}&format=png&scale=1`,
    token,
  );
  return data.images ?? {};
}
