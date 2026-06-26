const PFX = 'netmirror:selectedServer';

export function loadSavedServer(type: string, id: string): number {
  try {
    const v = localStorage.getItem(`${PFX}:${type}:${id}`);
    if (v === null) return 0;
    const parsed = parseInt(v, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export function saveSelectedServer(type: string, id: string, idx: number): void {
  try {
    localStorage.setItem(`${PFX}:${type}:${id}`, String(idx));
  } catch {}
}
