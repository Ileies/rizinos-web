<script lang="ts">
	import { Ban, Pencil, Plus, Trash2 } from '@lucide/svelte';
	import Modal from '#lib/components/Modal.svelte';
	import * as Button from '#shadcn/button';
	import { formatDateTime, type AdminMaintenance, type AdminStatus } from '#lib/status.js';

	let {
		data,
		act
	}: { data: AdminStatus; act: (body: Record<string, unknown>) => Promise<boolean> } = $props();

	const names = $derived(Object.fromEntries(data.components.map((c) => [c.slug, c.name])));
	const upcoming = $derived(
		data.maintenance.filter((m) => m.phase === 'scheduled' || m.phase === 'in_progress')
	);
	const past = $derived(
		data.maintenance.filter((m) => m.phase === 'completed' || m.phase === 'cancelled').reverse()
	);

	let busy = $state(false);
	let formOpen = $state(false);
	let editing = $state<AdminMaintenance | null>(null);
	let title = $state('');
	let description = $state('');
	let startsAt = $state('');
	let endsAt = $state('');
	let selected = $state<string[]>([]);

	/** `datetime-local` wants local time without a zone. */
	function toLocalInput(iso: string | Date): string {
		const d = new Date(iso);
		const pad = (n: number) => String(n).padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
	}

	function openForm(m: AdminMaintenance | null) {
		editing = m;
		title = m?.title ?? '';
		description = m?.description ?? '';
		const start = m ? new Date(m.startsAt) : new Date(Date.now() + 3_600_000);
		const end = m ? new Date(m.endsAt) : new Date(start.getTime() + 3_600_000);
		startsAt = toLocalInput(start);
		endsAt = toLocalInput(end);
		selected = m ? [...m.components] : [];
		formOpen = true;
	}

	async function save() {
		busy = true;
		const ok = await act({
			action: editing ? 'maintenanceUpdate' : 'maintenanceCreate',
			...(editing ? { id: editing.id } : {}),
			title,
			description,
			startsAt: new Date(startsAt).toISOString(),
			endsAt: new Date(endsAt).toISOString(),
			components: selected
		});
		busy = false;
		if (ok) formOpen = false;
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

{#snippet row(m: AdminMaintenance)}
	<li
		class="border-border bg-card flex flex-wrap items-start justify-between gap-3 rounded-lg border p-3"
	>
		<div class="min-w-0">
			<p class="flex flex-wrap items-center gap-2">
				<span class="font-medium">{m.title}</span>
				<span class="bg-muted rounded px-1.5 py-0.5 text-[11px] font-medium">{m.phase}</span>
				{#if m.discordMessageId}
					<span class="bg-muted rounded px-1.5 py-0.5 text-[11px] font-medium">in Discord</span>
				{/if}
			</p>
			<p class="text-muted-foreground mt-1 text-xs">
				{formatDateTime(m.startsAt, 'en')} to {formatDateTime(m.endsAt, 'en')}
				· {m.components.map((c) => names[c] ?? c).join(', ')}
			</p>
			{#if m.description}
				<p class="text-muted-foreground mt-1 line-clamp-2 text-xs whitespace-pre-line">
					{m.description}
				</p>
			{/if}
		</div>
		<div class="flex shrink-0 items-center gap-1.5">
			{#if m.phase === 'scheduled' || m.phase === 'in_progress'}
				<Button.Root size="sm" variant="outline" disabled={busy} onclick={() => openForm(m)}>
					<Pencil /> Edit
				</Button.Root>
				<Button.Root
					size="sm"
					variant="outline"
					disabled={busy}
					onclick={() =>
						run({ action: 'maintenanceCancel', id: m.id }, 'Cancel this maintenance window?')}
				>
					<Ban /> Cancel
				</Button.Root>
			{/if}
			<Button.Root
				size="icon-sm"
				variant="ghost"
				aria-label="Delete maintenance"
				disabled={busy}
				onclick={() =>
					run({ action: 'maintenanceDelete', id: m.id }, 'Delete this entry for good?')}
			>
				<Trash2 />
			</Button.Root>
		</div>
	</li>
{/snippet}

<div class="mb-4 flex items-center justify-between">
	<p class="text-muted-foreground text-xs">
		During a window the affected components show as "Maintenance", are excluded from uptime and
		never open incidents.
	</p>
	<Button.Root size="sm" onclick={() => openForm(null)}><Plus /> Schedule maintenance</Button.Root>
</div>

<div class="space-y-6">
	<section>
		<h3 class="mb-2 text-sm font-semibold">Upcoming and running ({upcoming.length})</h3>
		<ul class="space-y-2">
			{#each upcoming as m (m.id)}{@render row(m)}{:else}
				<li class="text-muted-foreground text-sm">Nothing scheduled.</li>
			{/each}
		</ul>
	</section>
	<section>
		<h3 class="mb-2 text-sm font-semibold">Past, last 60 days ({past.length})</h3>
		<ul class="space-y-2">
			{#each past as m (m.id)}{@render row(m)}{:else}
				<li class="text-muted-foreground text-sm">Nothing yet.</li>
			{/each}
		</ul>
	</section>
</div>

<Modal bind:open={formOpen} title={editing ? 'Edit maintenance' : 'Schedule maintenance'} wide>
	<form
		class="space-y-3"
		onsubmit={(e) => {
			e.preventDefault();
			void save();
		}}
	>
		<div>
			<label class={label} for="mt-title">Title</label>
			<input
				id="mt-title"
				class={input}
				bind:value={title}
				maxlength="140"
				required
				placeholder="e.g. Database upgrade"
			/>
		</div>
		<div class="grid grid-cols-2 gap-3">
			<div>
				<label class={label} for="mt-start">Starts (your local time)</label>
				<input id="mt-start" type="datetime-local" class={input} bind:value={startsAt} required />
			</div>
			<div>
				<label class={label} for="mt-end">Ends</label>
				<input id="mt-end" type="datetime-local" class={input} bind:value={endsAt} required />
			</div>
		</div>
		<fieldset>
			<legend class={label}>Affected components</legend>
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
			<label class={label} for="mt-desc">Details (English, optional)</label>
			<textarea
				id="mt-desc"
				class={input}
				rows="3"
				bind:value={description}
				maxlength="2000"
				placeholder="What changes for users?"></textarea>
		</div>
		<div class="flex justify-end gap-2 pt-1">
			<Button.Root type="button" variant="ghost" onclick={() => (formOpen = false)}
				>Cancel</Button.Root
			>
			<Button.Root
				type="submit"
				disabled={busy || !title.trim() || !selected.length || !startsAt || !endsAt}
			>
				{editing ? 'Save changes' : 'Schedule'}
			</Button.Root>
		</div>
	</form>
</Modal>
