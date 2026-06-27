<script lang="ts">
	import { onMount } from 'svelte';
	import { Bot, Plus } from '@lucide/svelte';
	import * as Table from '$shadcn/table';
	import * as Button from '$shadcn/button';
	import * as Input from '$shadcn/input';
	import Modal from '$lib/components/Modal.svelte';
	import AdminPanel from '$lib/components/AdminPanel.svelte';
	import RowActions from '$lib/components/RowActions.svelte';
	import UserViewModal from '$lib/components/UserViewModal.svelte';
	import { type AdminTab } from '$lib/components/AdminTabs.svelte';
	import { adminGet, adminPost } from '$lib/adminApi';
	import type { UserData } from '$lib/types';

	interface DcUser {
		name: string;
		discordUserId: string;
		userId: string;
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
	let submitting = $state(false);

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
		formError = '';
		modalOpen = true;
	}

	function openEdit(dc: DcUser) {
		modalMode = 'edit';
		dcName = dc.name;
		dcDiscordId = dc.discordUserId;
		dcUserId = dc.userId;
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
</script>

<AdminPanel error={loadError} tabs={innerTabs} bind:active={currentTab}>
	{#snippet toolbar()}
		<Button.Root size="sm" onclick={openCreate}>
			<Plus size={14} />
			Add User
		</Button.Root>
	{/snippet}

	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Discord Name</Table.Head>
				<Table.Head>Discord User ID</Table.Head>
				<Table.Head>Account</Table.Head>
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
						<RowActions onEdit={() => openEdit(dc)} onDelete={() => remove(dc.discordUserId)} />
					</Table.Cell>
				</Table.Row>
			{/each}
			{#if dcUsers.length === 0}
				<Table.Row>
					<Table.Cell colspan={4} class="text-muted-foreground py-8 text-center text-sm"
						>No Discord users linked</Table.Cell
					>
				</Table.Row>
			{/if}
		</Table.Body>
	</Table.Root>
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
</Modal>

<!-- USER VIEW MODAL -->
{#if viewingUser}
	<UserViewModal bind:open={viewUserOpen} user={viewingUser} />
{/if}
