const STORAGE_KEY = 'netmirror_server_quality';

export interface ServerStats {
  serverId: string;
  successfulLoads: number;
  failedLoads: number;
  timeoutCount: number;
  bufferingReports: number;
  popupReports: number;
  adHeavyReports: number;
  blackScreenReports: number;
  lastSuccessfulPlay: number;
  lastFailedPlay: number;
  qualityScore: number;
  status: 'recommended' | 'backup' | 'ad_heavy' | 'unstable' | 'disabled';
}

function getDefaultStats(serverId: string): ServerStats {
  return {
    serverId,
    successfulLoads: 0,
    failedLoads: 0,
    timeoutCount: 0,
    bufferingReports: 0,
    popupReports: 0,
    adHeavyReports: 0,
    blackScreenReports: 0,
    lastSuccessfulPlay: 0,
    lastFailedPlay: 0,
    qualityScore: 70,
    status: 'backup',
  };
}

function loadAll(): Record<string, ServerStats> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, ServerStats>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function getServerStats(serverId: string): ServerStats {
  const all = loadAll();
  return all[serverId] || getDefaultStats(serverId);
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function deriveStatus(stats: ServerStats): ServerStats['status'] {
  if (stats.qualityScore >= 80) return 'recommended';
  if (stats.qualityScore >= 50) return 'backup';
  if (stats.adHeavyReports >= 3 || stats.popupReports >= 3) return 'ad_heavy';
  if (stats.qualityScore < 30) return 'unstable';
  return 'backup';
}

function updateServer(serverId: string, updater: (s: ServerStats) => void) {
  const all = loadAll();
  const stats = all[serverId] || getDefaultStats(serverId);
  updater(stats);
  stats.qualityScore = clampScore(stats.qualityScore);
  stats.status = deriveStatus(stats);
  all[serverId] = stats;
  saveAll(all);
}

export function recordSuccess(serverId: string) {
  updateServer(serverId, s => {
    s.successfulLoads++;
    s.qualityScore += 10;
    s.lastSuccessfulPlay = Date.now();
  });
}

export function recordLongWatch(serverId: string) {
  updateServer(serverId, s => {
    s.qualityScore += 20;
    s.lastSuccessfulPlay = Date.now();
  });
}

export function recordTimeout(serverId: string) {
  updateServer(serverId, s => {
    s.timeoutCount++;
    s.qualityScore -= 20;
    s.lastFailedPlay = Date.now();
  });
}

export function recordFailure(serverId: string) {
  updateServer(serverId, s => {
    s.failedLoads++;
    s.qualityScore -= 30;
    s.lastFailedPlay = Date.now();
  });
}

export function recordQuickSwitch(serverId: string) {
  updateServer(serverId, s => {
    s.qualityScore -= 5;
  });
}

export type ReportType = 'ads' | 'popups' | 'not_playing' | 'buffering' | 'black_screen' | 'wrong_title' | 'audio' | 'subtitle';

export function reportIssue(serverId: string, issue: ReportType) {
  updateServer(serverId, s => {
    switch (issue) {
      case 'ads': s.adHeavyReports++; s.qualityScore -= 15; break;
      case 'popups': s.popupReports++; s.qualityScore -= 20; break;
      case 'not_playing': s.failedLoads++; s.qualityScore -= 30; break;
      case 'buffering': s.bufferingReports++; s.qualityScore -= 10; break;
      case 'black_screen': s.blackScreenReports++; s.qualityScore -= 25; break;
      case 'wrong_title': s.qualityScore -= 10; break;
      case 'audio': s.qualityScore -= 5; break;
      case 'subtitle': s.qualityScore -= 3; break;
    }
    s.lastFailedPlay = Date.now();
  });
}

export function getServerLabel(serverId: string): string {
  const stats = getServerStats(serverId);
  switch (stats.status) {
    case 'recommended': return 'Recommended';
    case 'ad_heavy': return 'May show ads';
    case 'unstable': return 'Unstable';
    default: return '';
  }
}

export function sortServersByQuality(serverIds: string[]): string[] {
  return [...serverIds].sort((a, b) => {
    const sa = getServerStats(a);
    const sb = getServerStats(b);
    return sb.qualityScore - sa.qualityScore;
  });
}
