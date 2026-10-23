<script lang="ts">
	import { Inbox, Paperclip, Search, Send, ShieldAlert, Trash2, User } from '@lucide/svelte';
	import AdminPanel from '#lib/components/AdminPanel.svelte';
	import Pagination from '#lib/components/Pagination.svelte';
	import Modal from '#lib/components/Modal.svelte';
	import * as Button from '#shadcn/button';
	import { type AdminTab } from '#lib/components/AdminTabs.svelte';
	import { adminGet, adminPost } from '#lib/adminApi.js';
	import { apiFetch } from '#lib/api.js';

	type Status = 'new' | 'open' | 'resolved' | 'spam';

	interface Row {
		id: string;
		ref: string;
		topic: string;
		status: Status;
		name: string;
		email: string;
		subject: string;
		preview: string;
		signedIn: boolean;
		attachments: number;
		createdAt: string;
	}

	interface Detail {
		message: {
			id: string;
			ref: string;
			topic: string;
			status: Status;
			name: string;
			email: string;
			subject: string;
			message: string;
			locale: string;
			details: Record<string, string>;
			createdAt: string;
			resolvedAt: string | null;
			expiresAt: string;
		};
		replies: { id: string; body: string; createdAt: string; author: string | null }[];
		attachments: { id: string; filename: string; mimeType: string; size: number }[];
		account: { id: string; username: string; email: string } | null;
	}

	const PAGE_SIZE = 25;

	const TOPIC_LABEL: Record<string, string> = {
		general: 'General',
		account: 'Account',
		bug: 'Bug',
		feedback: 'Feedback',
		security: 'Security',
		press: 'Press',
		legal: 'Legal'
	};

	const STATUS_CHIP: Record<Status, string> = {
		new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
		open: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
		resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
		spam: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
	};

	let status = $state('active');
	let topic = $state('');
	let search = $state('');
	let page = $state(1);

	let rows = $state<Row[]>([]);
	let total = $state(0);
	let counts = $state<Record<Status, number>>({ new: 0, open: 0, resolved: 0, spam: 0 });
	let error = $state('');
	let lastKey = '';

	const tabs = $derived<AdminTab[]>([
		{ id: 'active', label: 'Active', icon: Inbox, count: counts.new + counts.open },
		{ id: 'new', label: 'New', count: counts.new },
		{ id: 'open', label: 'Open', count: counts.open },
		{ id: 'resolved', label: 'Resolved', count: counts.resolved },
		{ id: 'spam', label: 'Spam and abuse', icon: ShieldAlert, count: counts.spam },
		{ id: 'all', label: 'All' }
	]);

	async function load() {
		try {
			const data = await adminGet<{
				messages: Row[];
				total: number;
				counts: Record<Status, number>;
			}>('/contact', { status, topic, q: search, contactPage: page, contactPageSize: PAGE_SIZE });
			rows = data.messages;
			total = data.total;
			counts = data.counts;
			error = '';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load';
		}
	}

	// Filters reset to page 1; typing in the search box is debounced.
	$effect(() => {
		const key = `${status}|${topic}|${search}`;
		const currentPage = page; // read unconditionally so page changes re-run this effect
		if (key !== lastKey) {
			lastKey = key;
			if (currentPage !== 1) {
				page = 1;
				return;
			}
		}
		const timer = setTimeout(load, search ? 250 : 0);
		return () => clearTimeout(timer);
	});

	// ---- Detail ---------------------------------------------------------------------------------

	let modalOpen = $state(false);
	let detail = $state<Detail | null>(null);
	let detailError = $state('');
	let reply = $state('');
	let replying = $state(false);
	let busy = $state(false);
	let thumbs = $state<Record<string, string>>({});

	async function openDetail(id: string) {
		detail = null;
		detailError = '';
		reply = '';
		modalOpen = true;
		await loadDetail(id);
	}

	async function loadDetail(id: string) {
		try {
			detail = await adminGet<Detail>('/contact', { id });
		} catch (e) {
			detailError = e instanceof Error ? e.message : 'Failed to load message';
		}
	}

	// Screenshots are admin-only, so they are fetched with the session cookie and shown from blob URLs.
	$effect(() => {
		const attachments = detail?.attachments ?? [];
		let cancelled = false;
		const created: string[] = [];
		thumbs = {};
		for (const file of attachments) {
			apiFetch(`/admin/contact/attachment/${file.id}`)
				.then((res) => (res.ok ? res.blob() : Promise.reject(new Error('fetch'))))
				.then((blob) => {
					if (cancelled) return;
					const url = URL.createObjectURL(blob);
					created.push(url);
					thumbs = { ...thumbs, [file.id]: url };
				})
				.catch(() => {});
		}
		return () => {
			cancelled = true;
			created.forEach((url) => URL.revokeObjectURL(url));
		};
	});

	async function setStatus(next: Status) {
		if (!detail || busy) return;
		busy = true;
		const res = await adminPost('/contact', {
			action: 'status',
			id: detail.message.id,
			status: next
		});
		if (res.ok) {
			await Promise.all([loadDetail(detail.message.id), load()]);
		} else {
			detailError = res.error ?? 'Failed to change status';
		}
		busy = false;
	}

	async function sendReply() {
		if (!detail || replying || !reply.trim()) return;
		replying = true;
		detailError = '';
		const res = await adminPost('/contact', {
			action: 'reply',
			id: detail.message.id,
			body: reply
		});
		if (res.ok) {
			reply = '';
			await Promise.all([loadDetail(detail.message.id), load()]);
		} else {
			detailError = res.error ?? 'Failed to send reply';
		}
		replying = false;
	}

	async function remove() {
		if (!detail || busy) return;
		if (!confirm(`Delete ${detail.message.ref} permanently, including its screenshots?`)) return;
		busy = true;
		const res = await adminPost('/contact', { action: 'delete', id: detail.message.id });
		busy = false;
		if (res.ok) {
			modalOpen = false;
			await load();
		} else {
			detailError = res.error ?? 'Failed to delete';
		}
	}

	const date = (value: string | Date) => new Date(value).toLocaleString();
	const inputClass =
		'border-input bg-background focus:border-ring focus:ring-ring/20 rounded-md border px-2.5 py-1.5 text-sm outline-none focus:ring-2';
</script>

<AdminPanel {error} {tabs} bind:active={status}>
	{#snippet toolbar()}
		<div class="flex flex-wrap items-center gap-2">
			<div class="relative">
				<Search class="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
				<input
					bind:value={search}
					type="search"
					placeholder="Search reference, name, email, text"
					class="{inputClass} w-72 pl-8"
					aria-label="Search messages"
				/>
			</div>
			<select bind:value={topic} class={inputClass} aria-label="Filter by topic">
				<option value="">All topics</option>
				{#each Object.entries(TOPIC_LABEL) as [id, label] (id)}
					<option value={id}>{label}</option>
				{/each}
			</select>
		</div>
	{/snippet}

	<ul class="divide-y rounded-lg border">
		{#each rows as row (row.id)}
			<li>
				<button
					type="button"
					onclick={() => openDetail(row.id)}
					class="hover:bg-muted/50 focus-visible:bg-muted/50 flex w-full items-start gap-3 px-3 py-2.5 text-left outline-none"
				>
					<span class="mt-0.5 flex w-24 shrink-0 flex-col gap-1">
						<span
							class="rounded px-1.5 py-0.5 text-center text-xs font-medium {STATUS_CHIP[
								row.status
							]}"
						>
							{row.status}
						</span>
						<span class="text-muted-foreground text-center text-xs"
							>{TOPIC_LABEL[row.topic] ?? row.topic}</span
						>
					</span>
					<span class="min-w-0 flex-1">
						<span class="flex items-center gap-2 text-sm">
							<span class="truncate font-medium">{row.subject}</span>
							{#if row.attachments}
								<Paperclip class="text-muted-foreground size-3 shrink-0" />
							{/if}
							{#if row.signedIn}
								<User class="text-muted-foreground size-3 shrink-0" />
							{/if}
						</span>
						<span class="text-muted-foreground block truncate text-xs">
							{row.name} &lt;{row.email}&gt; · {row.preview}
						</span>
					</span>
					<span class="shrink-0 text-right">
						<span class="block font-mono text-xs">{row.ref}</span>
						<span class="text-muted-foreground block text-xs">{date(row.createdAt)}</span>
					</span>
				</button>
			</li>
		{:else}
			<li class="text-muted-foreground py-8 text-center text-sm">No messages.</li>
		{/each}
	</ul>

	<Pagination {page} {total} pageSize={PAGE_SIZE} onPageChange={(p) => (page = p)} />
</AdminPanel>

<Modal
	bind:open={modalOpen}
	title={detail ? `${detail.message.ref}  ·  ${detail.message.subject}` : 'Message'}
	wide
>
	{#if detailError}
		<div class="bg-destructive/10 text-destructive mb-3 rounded px-3 py-2 text-sm">
			{detailError}
		</div>
	{/if}

	{#if detail}
		{@const msg = detail.message}
		<div class="space-y-5">
			<div class="flex flex-wrap items-center gap-2 text-xs">
				<span class="rounded px-1.5 py-0.5 font-medium {STATUS_CHIP[msg.status]}">{msg.status}</span
				>
				<span class="bg-muted rounded px-1.5 py-0.5">{TOPIC_LABEL[msg.topic] ?? msg.topic}</span>
				<span class="text-muted-foreground">{date(msg.createdAt)}</span>
				<span class="text-muted-foreground">· language {msg.locale}</span>
				<span class="text-muted-foreground"
					>· deleted automatically {new Date(msg.expiresAt).toLocaleDateString()}</span
				>
			</div>

			<dl class="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1.5 text-sm">
				<dt class="text-muted-foreground">From</dt>
				<dd>
					{msg.name}
					<a class="text-primary hover:underline" href="mailto:{msg.email}">&lt;{msg.email}&gt;</a>
				</dd>
				<dt class="text-muted-foreground">Account</dt>
				<dd>
					{#if detail.account}
						{detail.account.username}
						<span class="text-muted-foreground text-xs">({detail.account.id})</span>
					{:else}
						Not signed in
					{/if}
				</dd>
				{#each Object.entries(msg.details) as [key, value] (key)}
					<dt class="text-muted-foreground capitalize">{key}</dt>
					<dd class="break-words whitespace-pre-wrap">{value}</dd>
				{/each}
			</dl>

			<div
				class="bg-muted/40 rounded-lg border p-3.5 text-sm leading-relaxed break-words whitespace-pre-wrap"
			>
				{msg.message}
			</div>

			{#if detail.attachments.length}
				<div class="flex flex-wrap gap-2">
					{#each detail.attachments as file (file.id)}
						{#if thumbs[file.id]}
							<a
								href={thumbs[file.id]}
								target="_blank"
								rel="noopener"
								class="block"
								title={file.filename}
							>
								<img
									src={thumbs[file.id]}
									alt={file.filename}
									class="size-28 rounded-md border object-cover"
								/>
							</a>
						{:else}
							<span
								class="bg-muted text-muted-foreground flex size-28 items-center justify-center rounded-md border text-xs"
							>
								Loading
							</span>
						{/if}
					{/each}
				</div>
			{/if}

			{#if detail.replies.length}
				<div class="space-y-2">
					<h3 class="text-sm font-semibold">Replies</h3>
					{#each detail.replies as r (r.id)}
						<div class="border-primary/40 bg-primary/5 rounded-r-lg border-l-2 p-3 text-sm">
							<div class="text-muted-foreground mb-1 text-xs">
								{r.author ?? 'Staff'} · {date(r.createdAt)}
							</div>
							<div class="break-words whitespace-pre-wrap">{r.body}</div>
						</div>
					{/each}
				</div>
			{/if}

			<div class="space-y-2">
				<label class="text-sm font-semibold" for="contact-reply">Reply by email</label>
				<textarea
					id="contact-reply"
					bind:value={reply}
					rows="4"
					maxlength="5000"
					placeholder="Sent from support@ with the reference in the subject."
					class="{inputClass} w-full resize-y"></textarea>
				<Button.Root onclick={sendReply} disabled={replying || !reply.trim()} size="sm">
					<Send class="mr-1.5 size-3.5" />
					{replying ? 'Sending...' : 'Send reply'}
				</Button.Root>
			</div>

			<div class="flex flex-wrap items-center gap-2 border-t pt-4">
				{#if msg.status !== 'open'}
					<Button.Root
						onclick={() => setStatus('open')}
						disabled={busy}
						size="sm"
						variant="outline"
					>
						Mark open
					</Button.Root>
				{/if}
				{#if msg.status !== 'resolved'}
					<Button.Root onclick={() => setStatus('resolved')} disabled={busy} size="sm">
						Resolve
					</Button.Root>
				{/if}
				{#if msg.status !== 'spam'}
					<Button.Root
						onclick={() => setStatus('spam')}
						disabled={busy}
						size="sm"
						variant="outline"
					>
						<ShieldAlert class="mr-1.5 size-3.5" />
						Mark as spam or abuse
					</Button.Root>
				{/if}
				<Button.Root
					onclick={remove}
					disabled={busy}
					size="sm"
					variant="ghost"
					class="text-destructive hover:text-destructive ml-auto"
				>
					<Trash2 class="mr-1.5 size-3.5" />
					Delete
				</Button.Root>
			</div>
		</div>
	{:else if !detailError}
		<p class="text-muted-foreground py-6 text-center text-sm">Loading...</p>
	{/if}
</Modal>
