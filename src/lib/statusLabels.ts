import * as m from '#lib/messages.svelte.js';
import type {
	ComponentGroup,
	ComponentState,
	IncidentImpact,
	IncidentStatus,
	MaintenancePhase,
	OverallState
} from '#lib/status.js';

type Message = (params?: Record<string, string | number>) => string;

// Message functions are looked up by name so component names and descriptions can come from
// the translated topic file while unknown slugs (components added later) fall back to the
// English name the backend sends.
const dict = m as unknown as Record<string, Message | undefined>;

export function componentName(slug: string, fallback: string): string {
	return dict[`status_component_${slug}`]?.() ?? fallback;
}

export function componentDescription(slug: string, fallback: string): string {
	return dict[`status_component_${slug}_desc`]?.() ?? fallback;
}

export const overallLabel = (s: OverallState) => dict[`status_overall_${s}`]!();
export const stateLabel = (s: ComponentState) => dict[`status_state_${s}`]!();
export const groupLabel = (g: ComponentGroup) => dict[`status_group_${g}`]!();
export const incidentStatusLabel = (s: IncidentStatus) => dict[`status_incident_${s}`]!();
export const impactLabel = (i: IncidentImpact) => dict[`status_impact_${i}`]!();
export const maintenancePhaseLabel = (p: MaintenancePhase) =>
	p === 'cancelled' ? '' : dict[`status_maintenance_${p}`]!();
