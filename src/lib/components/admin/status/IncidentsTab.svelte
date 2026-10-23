<script lang="ts">
	import { Check, Eye, MessageSquarePlus, Plus, Trash2 } from '@lucide/svelte';
	import Modal from '#lib/components/Modal.svelte';
	import * as Button from '#shadcn/button';
	import {
		IMPACT_BG,
		INCIDENT_IMPACTS,
		INCIDENT_STATUSES,
		formatDateTime,
		relativeTime,
		type AdminIncident,
		type AdminStatus,
		type IncidentImpact,
		type IncidentStatus
	} from '#lib/status.js';

	let {
		data,
		act
	}: { data: AdminStatus; act: (body: Record<string, unknown>) => Promise<boolean> } = $props();

	const now = $derived(Date.parse(data.generatedAt));
	const names = $derived(Object.fromEntries(data.components.map((c) => [c.slug, c.name])));

	const drafts = $derived(data.incidents.filter((i) => !i.published));
	const open = $derived(data.incidents.filter((i) => i.published && i.status !== 'resolved'));
	const past = $derived(data.incidents.filter((i) => i.published && i.status === 'resolved'));

	let busy = $state(false);

	// ---- Create ----------------------------------------------------------------------------------

	let createOpen = $state(false);
	let title = $state('');
	let impact = $state<IncidentImpact>('minor');
	let status = $state<IncidentStatus>('investigating');
	let selected = $state<string[]>([]);
	let body = $state('');
	let publish = $state(true);

	function openCreate() {
		title = '';
		impact = 'minor';
		status = 'investigating';
		selected = [];
		body = '';
		publish = true;
		createOpen = true;
	}

	async function create() {
		busy = true;
		const ok = await act({
			action: 'incidentCreate',
			title,
			impact,
			status,
			components: selected,
			body,
			publish
		});
		busy = false;
		if (ok) createOpen = false;
	}

	// ---- Post update -------------------------------------------------------------------------------

	let updateOpen = $state(false);
	let target = $state<AdminIncident | null>(null);
	let upStatus = $state<IncidentStatus>('investigating');
	let upImpact = $state<IncidentImpact>('minor');
	let upBody = $state('');

	function openUpdate(incident: AdminIncident) {
		target = incident;
		upStatus = incident.status;
		upImpact = incident.impact;
		upBody = '';
		updateOpen = true;
	}

	async function postUpdate() {
		if (!target) return;
		busy = true;
		const ok = await act({
			action: 'incidentUpdate',
			id: target.id,
			status: upStatus,
			impact: upImpact,
			body: upBody
		});
		busy = false;
		if (ok) updateOpen = false;
	}

	async function run(body: Record<string, unknown>, confirmText?: string) {
		if (confirmText && !confirm(confirmText)) return;
		busy = true;
		await act(body);
		busy = false;
	}

	const input =
		'border-input bg-background focus-visible:ring-ring/50 w-full rounded-md border px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2';
	const label = 'text-muted-foreground mb-1 block text-xs font-medium';
</script>

{#snippet row(i: AdminIncident)}
	<li class="border-border bg-card rounded-lg border p-3">
		<div class="flex flex-wrap items-start justify-between gap-3">
			<div class="min-w-0">
				<p class="flex flex-wrap items-center gap-2">
					<span class="size-2.5 shrink-0 rounded-full {IMPACT_BG[i.impact]}"></span>
					<span class="font-medium">{i.title}</span>
					<span class="bg-muted rounded px-1.5 py-0.5 text-[11px] font-medium">{i.status}</span>
					<span class="bg-muted rounded px-1.5 py-0.5 text-[11px] font-medium">{i.impact}</span>
					<span class="bg-muted rounded px-1.5 py-0.5 text-[11px] font-medium">
						{i.source === 'auto' ? 'auto-detected' : 'manual'}
					</span>
					{#if i.discordMessageId}
						<span class="bg-muted rounded px-1.5 py-0.5 text-[11px] font-medium">in Discord</span>
					{/if}
				</p>
				<p class="text-muted-foreground mt-1 text-xs">
					{i.components.map((c) => names[c] ?? c).join(', ') || 'No components'}
					· started {relativeTime(i.startedAt, 'en', now)}
					{#if i.resolvedAt}· resolved {formatDateTime(i.resolvedAt, 'en')}{/if}
				</p>
				{#if i.updates[0]}
					<p class="text-muted-foreground mt-2 line-clamp-2 text-xs whitespace-pre-line">
						{i.updates[0].body}
					</p>
				{/if}
			</div>
			<div class="flex shrink-0 items-center gap-1.5">
				{#if !i.published}
					<Button.Root
						size="sm"
						disabled={busy}
						onclick={() => run({ action: 'incidentPublish', id: i.id })}
					>
						<Eye /> Publish
					</Button.Root>
				{/if}
				{#if i.status !== 'resolved' || !i.published}
					<Button.Root size="sm" variant="outline" disabled={busy} onclick={() => openUpdate(i)}>
						<MessageSquarePlus /> Update
					</Button.Root>
				{/if}
				{#if i.published && i.status !== 'resolved'}
					<Button.Root
						size="sm"
						variant="outline"
						disabled={busy}
						onclick={() => run({ action: 'incidentUpdate', id: i.id, status: 'resolved' })}
					>
						<Check /> Resolve
					</Button.Root>
				{/if}
				<Button.Root
					size="icon-sm"
					variant="ghost"
					aria-label="Delete incident"
					disabled={busy}
					onclick={() =>
						run(
							{ action: 'incidentDelete', id: i.id },
							i.published
								? 'Delete this published incident? It disappears from the page.'
								: 'Discard this draft?'
						)}
				>
					<Trash2 />
				</Button.Root>
			</div>
		</div>
	</li>
{/snippet}

<div class="mb-4 flex items-center justify-between">
	<p class="text-muted-foreground text-xs">
		Probe failures create drafts automatically. Nothing is public until you publish it.
		{#if !data.discordConfigured}Discord is not configured for this backend.{/if}
	</p>
	<Button.Root size="sm" onclick={openCreate}><Plus /> New incident</Button.Root>
</div>

<div class="space-y-6">
	{#if drafts.length}
		<section>
			<h3 class="mb-2 text-sm font-semibold">Drafts ({drafts.length})</h3>
			<ul class="space-y-2">
				{#each drafts as i (i.id)}{@render row(i)}{/each}
			</ul>
		</section>
	{/if}

	<section>
		<h3 class="mb-2 text-sm font-semibold">Open ({open.length})</h3>
		<ul class="space-y-2">
			{#each open as i (i.id)}{@render row(i)}{:else}
				<li class="text-muted-foreground text-sm">No open incidents.</li>
			{/each}
		</ul>
	</section>

	<section>
		<h3 class="mb-2 text-sm font-semibold">Resolved, last 90 days ({past.length})</h3>
		<ul class="space-y-2">
			{#each past as i (i.id)}{@render row(i)}{:else}
				<li class="text-muted-foreground text-sm">Nothing yet.</li>
			{/each}
		</ul>
	</section>
</div>

<Modal bind:open={createOpen} title="New incident" wide>
	<form
		class="space-y-3"
		onsubmit={(e) => {
			e.preventDefault();
			void create();
		}}
	>
		<div>
			<label class={label} for="inc-title">Title</label>
			<input
				id="inc-title"
				class={input}
				bind:value={title}
				maxlength="140"
				required
				placeholder="Short and specific, e.g. Sign-in is failing for some users"
			/>
		</div>
		<div class="grid grid-cols-2 gap-3">
			<div>
				<label class={label} for="inc-impact">Impact</label>
				<select id="inc-impact" class={input} bind:value={impact}>
					{#each INCIDENT_IMPACTS as v (v)}<option value={v}>{v}</option>{/each}
				</select>
			</div>
			<div>
				<label class={label} for="inc-status">Status</label>
				<select id="inc-status" class={input} bind:value={status}>
					{#each INCIDENT_STATUSES as v (v)}<option value={v}>{v}</option>{/each}
				</select>
			</div>
		</div>
		<fieldset>
			<legend class={label}>Affected components (shows them as degraded or down while open)</legend>
			<div class="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
				{#each data.components as c (c.slug)}
					<label class="flex items-center gap-1.5 text-sm">
						<input type="checkbox" value={c.slug} bind:group={selected} />
						{c.name}
					</label>
				{/each}
			</div>
		</fieldset>
		<div>
			<label class={label} for="inc-body">First update (English)</label>
			<textarea
				id="inc-body"
				class={input}
				rows="4"
				bind:value={body}
				maxlength="4000"
				required
				placeholder="What is happening, who is affected, what are we doing?"></textarea>
		</div>
		<label class="flex items-center gap-2 text-sm">
			<input type="checkbox" bind:checked={publish} />
			Publish immediately (unchecked saves a private draft)
		</label>
		<div class="flex justify-end gap-2 pt-1">
			<Button.Root type="button" variant="ghost" onclick={() => (createOpen = false)}
				>Cancel</Button.Root
			>
			<Button.Root type="submit" disabled={busy || !title.trim() || !body.trim()}>
				{publish ? 'Publish incident' : 'Save draft'}
			</Button.Root>
		</div>
	</form>
</Modal>

<Modal bind:open={updateOpen} title={target ? `Update: ${target.title}` : 'Update'} wide>
	<form
		class="space-y-3"
		onsubmit={(e) => {
			e.preventDefault();
			void postUpdate();
		}}
	>
		<div class="grid grid-cols-2 gap-3">
			<div>
				<label class={label} for="up-status">Status</label>
				<select id="up-status" class={input} bind:value={upStatus}>
					{#each INCIDENT_STATUSES as v (v)}<option value={v}>{v}</option>{/each}
				</select>
			</div>
			<div>
				<label class={label} for="up-impact">Impact</label>
				<select id="up-impact" class={input} bind:value={upImpact}>
					{#each INCIDENT_IMPACTS as v (v)}<option value={v}>{v}</option>{/each}
				</select>
			</div>
		</div>
		<div>
			<label class={label} for="up-body">Update text (English)</label>
			<textarea
				id="up-body"
				class={input}
				rows="4"
				bind:value={upBody}
				maxlength="4000"
				placeholder="Required when the status changes. Leave empty to only change impact."
			></textarea>
		</div>
		{#if target && !target.published}
			<p class="text-muted-foreground text-xs">
				This is a draft. The update is private until you publish it.
			</p>
		{/if}
		<div class="flex justify-end gap-2 pt-1">
			<Button.Root type="button" variant="ghost" onclick={() => (updateOpen = false)}
				>Cancel</Button.Root
			>
			<Button.Root type="submit" disabled={busy}>Post update</Button.Root>
		</div>
	</form>
</Modal>
