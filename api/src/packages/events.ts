type Listener = (event: Record<string, unknown>) => void;

const jobs = new Map<string, Set<Listener>>();

export function subscribePackageJob(jobId: string, listener: Listener): () => void {
  let set = jobs.get(jobId);
  if (!set) {
    set = new Set();
    jobs.set(jobId, set);
  }
  set.add(listener);
  return () => set!.delete(listener);
}

export function publishPackageJobEvent(jobId: string, event: Record<string, unknown>) {
  const set = jobs.get(jobId);
  if (!set) return;
  for (const listener of set) listener(event);
}

export function resetPackageJobEventBusForTests() {
  jobs.clear();
}
