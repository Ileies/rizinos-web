<script lang="ts">
	import { onMount } from 'svelte';
	import { Bot, Plus } from '@lucide/svelte';
	import * as Table from '$shadcn/table';
	import * as Button from '$shadcn/button';
	import * as Input from '$shadcn/input';
	import Modal from '$lib/components/Modal.svelte';
	import AdminPanel from '$lib/components/AdminPanel.svelte';
	import AdminCard from '$lib/components/AdminCard.svelte';
	import RowActions from '$lib/components/RowActions.svelte';
	import UserViewModal from '$lib/components/UserViewModal.svelte';
	import { type AdminTab } from '$lib/components/AdminTabs.svelte';
	import { adminGet, adminPost } from '$lib/adminApi';
	import type { UserData } from '$lib/types';

	interface DcUser {
		name: string;
		discordUserId: string;
		userId: string;
		bannedUntil: string | Date | null;
		bannedReason: string | null;
		banId: string | null;
		user: UserData | null;
	}

	let dcUsers = $state<DcUser[]>([]);
	let users = $state<{ id: string; username: string }[]>([]);
	let loadError = $state('');
	let formError = $state('');

	async function load() {
		try {
			const data = await adminGet<{ dcUsers: DcUser[]; users: { id: string; username: string }[] }>(
				'/discord'
			);
			dcUsers = data.dcUsers;
			users = data.users;
		} catch (e) {
			loadError = e instanceof Error ? e.message : 'Failed to load';
		}
	}

	onMount(load);

	let currentTab = $state('users');
	const innerTabs = $derived<AdminTab[]>([
		{ id: 'users', label: 'Users', icon: Bot, count: dcUsers.length }
	]);

	let modalOpen = $state(false);
	let modalMode = $state<'create' | 'edit'>('create');
	let dcName = $state('');
	let dcDiscordId = $state('');
	let dcUserId = $state('');
	let editingDcUser = $state<DcUser | null>(null);
	let submitting = $state(false);
	let formSuccess = $state('');

	// --- User view ---
	let viewUserOpen = $state(false);
	let viewingUser = $state<UserData | null>(null);

	function openViewUser(user: UserData) {
		viewingUser = user;
		viewUserOpen = true;
	}

	function openCreate() {
		modalMode = 'create';
		dcName = '';
		dcDiscordId = '';
		dcUserId = users[0]?.id ?? '';
		editingDcUser = null;
		formError = '';
		modalOpen = true;
	}

	function openEdit(dc: DcUser) {
		modalMode = 'edit';
		dcName = dc.name;
		dcDiscordId = dc.discordUserId;
		dcUserId = dc.userId;
		editingDcUser = dc;
		formError = '';
		modalOpen = true;
	}

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;
		formError = '';
		const res = await adminPost('/discord', {
			action: modalMode === 'create' ? 'userCreate' : 'userUpdate',
			name: dcName,
			discordUserId: dcDiscordId,
			userId: dcUserId
		});
		submitting = false;
		if (res.ok) {
			modalOpen = false;
			await load();
		} else {
			formError = res.error ?? 'Failed';
		}
	}

	async function remove(discordUserId: string) {
		const res = await adminPost('/discord', { action: 'userDelete', discordUserId });
		if (res.ok) await load();
		else loadError = res.error ?? 'Failed to delete';
	}

	async function submitBan(e: SubmitEvent) {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		const body = Object.fromEntries(new FormData(form).entries());
		formError = '';
		formSuccess = '';
		const res = await adminPost('/discord', { action: 'dcUserBan', ...body });
		if (res.ok) {
			formSuccess = 'Saved.';
			await load();
			editingDcUser = dcUsers.find((u) => u.discordUserId === editingDcUser?.discordUserId) ?? null;
		} else {
			formError = res.error ?? 'Failed';
		}
	}
</script>

<AdminPanel error={loadError} tabs={innerTabs} bind:active={currentTab}>
	{#snippet toolbar()}
		<Button.Root size="sm" onclick={openCreate}>
			<Plus size={14} />
			Add User
		</Button.Root>
	{/snippet}

	<div class="hidden md:block">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Discord Name</Table.Head>
					<Table.Head>Discord User ID</Table.Head>
					<Table.Head>Account</Table.Head>
					<Table.Head class="w-24">Status</Table.Head>
					<Table.Head class="w-16"></Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each dcUsers as dc (dc.discordUserId)}
					<Table.Row class="hover:bg-muted/40 group">
						<Table.Cell class="py-1.5 font-medium">{dc.name}</Table.Cell>
						<Table.Cell class="text-muted-foreground py-1.5 font-mono text-xs"
							>{dc.discordUserId}</Table.Cell
						>
						<Table.Cell class="py-1.5">
							{#if dc.user}
								{@const u = dc.user}
								<button
									onclick={() => openViewUser(u)}
									class="text-muted-foreground hover:text-foreground text-sm hover:underline"
								>
									{u.username}
								</button>
							{:else}
								<span class="text-muted-foreground text-sm">-</span>
							{/if}
						</Table.Cell>
						<Table.Cell class="py-1.5">
							{#if dc.bannedUntil}
								<span
									class="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400"
									>banned</span
								>
							{:else}
								<span class="text-muted-foreground text-xs">-</span>
							{/if}
						</Table.Cell>
						<Table.Cell class="py-1.5">
							<RowActions onEdit={() => openEdit(dc)} onDelete={() => remove(dc.discordUserId)} />
						</Table.Cell>
					</Table.Row>
				{/each}
				{#if dcUsers.length === 0}
					<Table.Row>
						<Table.Cell colspan={5} class="text-muted-foreground py-8 text-center text-sm"
							>No Discord users linked</Table.Cell
						>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex flex-col gap-2 md:hidden">
		{#each dcUsers as dc (dc.discordUserId)}
			<AdminCard>
				<div class="flex items-start justify-between gap-2">
					<div class="min-w-0">
						<div class="flex items-center gap-1.5 font-medium">
							<span class="truncate">{dc.name}</span>
							{#if dc.bannedUntil}
								<span
									class="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400"
									>banned</span
								>
							{/if}
						</div>
						<div class="text-muted-foreground truncate font-mono text-xs">{dc.discordUserId}</div>
					</div>
					<RowActions
						onEdit={() => openEdit(dc)}
						onDelete={() => remove(dc.discordUserId)}
						alwaysVisible
					/>
				</div>
				{#if dc.user}
					{@const u = dc.user}
					<button
						onclick={() => openViewUser(u)}
						class="text-muted-foreground hover:text-foreground text-xs hover:underline"
					>
						{u.username}
					</button>
				{:else}
					<span class="text-muted-foreground text-xs">-</span>
				{/if}
			</AdminCard>
		{/each}
		{#if dcUsers.length === 0}
			<p class="text-muted-foreground py-8 text-center text-sm">No Discord users linked</p>
		{/if}
	</div>
</AdminPanel>

<!-- DC USER MODAL -->
<Modal
	bind:open={modalOpen}
	title={modalMode === 'create' ? 'Add Discord User' : 'Edit Discord User'}
>
	<form onsubmit={submit} class="space-y-3">
		{#if formError}
			<div class="bg-destructive/10 text-destructive rounded px-3 py-2 text-sm">{formError}</div>
		{/if}
		<div>
			<label for="dc-name" class="text-muted-foreground mb-1 block text-xs font-medium"
				>Discord Name</label
			>
			<Input.Root
				id="dc-name"
				name="name"
				bind:value={dcName}
				placeholder="username#1234"
				required
			/>
		</div>
		<div>
			<label for="dc-id" class="text-muted-foreground mb-1 block text-xs font-medium"
				>Discord User ID</label
			>
			<Input.Root
				id="dc-id"
				name="discordUserId"
				bind:value={dcDiscordId}
				placeholder="123456789012345678"
				required
				readonly={modalMode === 'edit'}
			/>
		</div>
		<div>
			<label for="dc-user" class="text-muted-foreground mb-1 block text-xs font-medium"
				>RizinOS Account</label
			>
			<select
				id="dc-user"
				name="userId"
				bind:value={dcUserId}
				class="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm"
				required
			>
				{#each users as u (u.id)}
					<option value={u.id}>{u.username}</option>
				{/each}
			</select>
		</div>
		<div class="flex justify-end gap-2 pt-2">
			<Button.Root type="button" variant="outline" size="sm" onclick={() => (modalOpen = false)}
				>Cancel</Button.Root
			>
			<Button.Root type="submit" size="sm" disabled={submitting}
				>{modalMode === 'create' ? 'Create' : 'Save'}</Button.Root
			>
		</div>
	</form>

	{#if modalMode === 'edit' && editingDcUser}
		<div class="space-y-2 border-t pt-4 mt-4">
			<p class="text-muted-foreground text-xs font-medium">Ban</p>
			{#if formSuccess}
				<div
					class="rounded bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400"
				>
					{formSuccess}
				</div>
			{/if}
			{#if editingDcUser.bannedUntil}
				<div
					class="flex items-center justify-between rounded border border-red-200 bg-red-50 px-3 py-2 text-xs dark:border-red-800 dark:bg-red-950/20"
				>
					<div>
						<span class="font-medium text-red-700 dark:text-red-400">Until:</span>
						<span class="ml-1 text-red-600"
							>{new Date(editingDcUser.bannedUntil).toLocaleString()}</span
						>
						{#if editingDcUser.bannedReason}
							<span class="ml-1 text-red-500">- {editingDcUser.bannedReason}</span>
						{/if}
						{#if editingDcUser.banId}
							<span class="ml-1 font-mono text-red-500">[{editingDcUser.banId}]</span>
						{/if}
					</div>
					<form onsubmit={submitBan} class="ml-3 shrink-0">
						<input type="hidden" name="discordUserId" value={editingDcUser.discordUserId} />
						<input type="hidden" name="until" value="" />
						<Button.Root
							type="submit"
							size="sm"
							variant="outline"
							class="h-6 border-red-300 px-2 text-xs text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-400"
							>Lift</Button.Root
						>
					</form>
				</div>
			{/if}
			<form onsubmit={submitBan} class="flex items-end gap-2">
				<input type="hidden" name="discordUserId" value={editingDcUser.discordUserId} />
				<div class="flex-1">
					<label for="dc-ban-until" class="text-muted-foreground mb-1 block text-xs">Until</label>
					<Input.Root id="dc-ban-until" type="datetime-local" name="until" required />
				</div>
				<div class="flex-1">
					<label for="dc-ban-reason" class="text-muted-foreground mb-1 block text-xs">Reason</label>
					<Input.Root id="dc-ban-reason" name="reason" placeholder="Optional" />
				</div>
				<Button.Root type="submit" size="sm" variant="destructive" class="shrink-0">Ban</Button.Root
				>
			</form>
		</div>
	{/if}
</Modal>

<!-- USER VIEW MODAL -->
{#if viewingUser}
	<UserViewModal bind:open={viewUserOpen} user={viewingUser} />
{/if}
