// Types and helpers for the status page. The shapes mirror the backend's
// `src/lib/server/status/types.ts` (GET /api/status and /api/admin/status). Keep in sync.

export type ComponentState = 'operational' | 'degraded' | 'down' | 'maintenance' | 'unknown';
export type ComponentGroup = 'platform' | 'game' | 'community';
export type OverallState =
	'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'maintenance' | 'unknown';
export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';
export type IncidentImpact = 'minor' | 'major' | 'critical';
export type MaintenancePhase = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type CheckLevel = 'ok' | 'slow' | 'degraded' | 'fail';

export const GROUPS: ComponentGroup[] = ['platform', 'game', 'community'];
export const INCIDENT_STATUSES: IncidentStatus[] = [
	'investigating',
	'identified',
	'monitoring',
	'resolved'
];
export const INCIDENT_IMPACTS: IncidentImpact[] = ['minor', 'major', 'critical'];

export interface DayCell {
	day: string;
	state: 'operational' | 'degraded' | 'down' | 'maintenance' | 'nodata';
	uptime: number | null;
	downMinutes: number;
	degradedMinutes: number;
}

export interface StatusComponent {
	slug: string;
	name: string;
	description: string;
	group: ComponentGroup;
	state: ComponentState;
	since: string | null;
	uptime90: number | null;
	days: DayCell[];
}

export interface IncidentUpdate {
	id: string;
	status: IncidentStatus;
	body: string;
	createdAt: string;
}

export interface Incident {
	id: string;
	title: string;
	status: IncidentStatus;
	impact: IncidentImpact;
	components: string[];
	startedAt: string;
	resolvedAt: string | null;
	updates: IncidentUpdate[];
}

export interface Maintenance {
	id: string;
	title: string;
	description: string;
	phase: MaintenancePhase;
	startsAt: string;
	endsAt: string;
	components: string[];
}

export interface PublicStatus {
	generatedAt: string;
	monitor: { stale: boolean; lastBeatAt: string | null };
	overall: OverallState;
	components: StatusComponent[];
	incidents: Incident[];
	history: Incident[];
	maintenance: Maintenance[];
	stats: { onlineUsers: number; version: string | null; runningSince: string };
}

export interface StatusBannerData {
	overall: OverallState;
	incidents: Pick<Incident, 'id' | 'title' | 'status' | 'impact'>[];
	maintenance: Pick<Maintenance, 'id' | 'title' | 'phase' | 'startsAt' | 'endsAt'>[];
}

// ---- Admin-only shapes ------------------------------------------------------------------------

export interface AdminCheck {
	at: string;
	level: CheckLevel;
	state: ComponentState;
	latencyMs: number | null;
	error: string | null;
}

export interface AdminComponent extends StatusComponent {
	paused: boolean;
	autoIncident: boolean;
	degradedLatencyMs: number;
	intervalSec: number;
	probeState: ComponentState;
	failStreak: number;
	okStreak: number;
	slowStreak: number;
	lastCheckedAt: string | null;
	lastOkAt: string | null;
	lastLatencyMs: number | null;
	info: Record<string, unknown>;
	latency: {
		p50: number | null;
		p95: number | null;
		p99: number | null;
		series: { at: string; avg: number | null; fails: number }[];
	};
	recent: AdminCheck[];
}

export interface AdminIncident extends Incident {
	source: 'auto' | 'manual';
	published: boolean;
	discordMessageId: string | null;
}

export interface AdminMaintenance extends Maintenance {
	discordMessageId: string | null;
}

export interface AdminStatus {
	generatedAt: string;
	monitor: { stale: boolean; lastBeatAt: string | null; version: string | null };
	vitals: Record<string, unknown> | null;
	vitalsAt: string | null;
	components: AdminComponent[];
	incidents: AdminIncident[];
	maintenance: AdminMaintenance[];
	discordConfigured: boolean;
	probeRequestedAt: string | null;
}

// ---- Presentation -----------------------------------------------------------------------------

/** Tailwind background class of the state color (mark fills, dots). */
export const STATE_BG: Record<ComponentState | DayCell['state'], string> = {
	operational: 'bg-status-good',
	degraded: 'bg-status-warning',
	down: 'bg-status-critical',
	maintenance: 'bg-status-maintenance',
	unknown: 'bg-status-idle',
	nodata: 'bg-muted-foreground/15'
};

/** Soft tinted surface for banners and chips, with the matching border. */
export const STATE_TINT: Record<ComponentState, string> = {
	operational: 'bg-status-good/10 border-status-good/30',
	degraded: 'bg-status-warning/10 border-status-warning/40',
	down: 'bg-status-critical/10 border-status-critical/30',
	maintenance: 'bg-status-maintenance/10 border-status-maintenance/30',
	unknown: 'bg-status-idle/10 border-status-idle/30'
};

export const OVERALL_AS_STATE: Record<OverallState, ComponentState> = {
	operational: 'operational',
	degraded: 'degraded',
	partial_outage: 'down',
	major_outage: 'down',
	maintenance: 'maintenance',
	unknown: 'unknown'
};

export const IMPACT_BG: Record<IncidentImpact, string> = {
	minor: 'bg-status-warning',
	major: 'bg-status-serious',
	critical: 'bg-status-critical'
};

const LOCALE_TAG: Record<string, string> = { de: 'de', en: 'en', cn: 'zh-CN', ru: 'ru' };
export const localeTag = (locale: string) => LOCALE_TAG[locale] ?? 'en';

export function formatUptime(value: number | null): string {
	if (value === null) return '-';
	// Never round a non-perfect number up to 100.
	const floored = Math.floor(value * 100) / 100;
	return `${(value >= 100 ? 100 : floored).toFixed(2)}%`;
}

export function formatDay(day: string, locale: string): string {
	return new Intl.DateTimeFormat(localeTag(locale), {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone: 'UTC'
	}).format(new Date(`${day}T00:00:00Z`));
}

export function formatDateTime(iso: string, locale: string): string {
	return new Intl.DateTimeFormat(localeTag(locale), {
		day: 'numeric',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit'
	}).format(new Date(iso));
}

export function formatTime(iso: string, locale: string): string {
	return new Intl.DateTimeFormat(localeTag(locale), { hour: '2-digit', minute: '2-digit' }).format(
		new Date(iso)
	);
}

/** "3 minutes ago" / "in 2 hours", localised. */
export function relativeTime(iso: string, locale: string, now = Date.now()): string {
	const diff = Date.parse(iso) - now;
	const abs = Math.abs(diff);
	const rtf = new Intl.RelativeTimeFormat(localeTag(locale), { numeric: 'auto' });
	if (abs < 45_000) return rtf.format(0, 'second');
	if (abs < 45 * 60_000) return rtf.format(Math.round(diff / 60_000), 'minute');
	if (abs < 22 * 3_600_000) return rtf.format(Math.round(diff / 3_600_000), 'hour');
	return rtf.format(Math.round(diff / 86_400_000), 'day');
}

/** Compact duration such as `2h 5m`, `45m`, `3d`. Locale neutral on purpose. */
export function formatDuration(ms: number): string {
	const minutes = Math.max(1, Math.round(ms / 60_000));
	if (minutes < 60) return `${minutes}m`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return minutes % 60 ? `${hours}h ${minutes % 60}m` : `${hours}h`;
	const days = Math.floor(hours / 24);
	return hours % 24 ? `${days}d ${hours % 24}h` : `${days}d`;
}

export function formatMinutes(minutes: number): string {
	return formatDuration(minutes * 60_000);
}
