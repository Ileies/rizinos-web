<script lang="ts">
	import { onMount } from 'svelte';
	import { Role, type UserData } from '$lib/types';
	import { Users, ScrollText, LayoutGrid, Trash2, Plus, Search, X } from '@lucide/svelte';
	import * as Table from '$shadcn/table';
	import * as Button from '$shadcn/button';
	import * as Input from '$shadcn/input';
	import Modal from '$lib/components/Modal.svelte';
	import RestrictEditor from '$lib/components/RestrictEditor.svelte';
	import AdminPanel from '$lib/components/AdminPanel.svelte';
	import RowActions from '$lib/components/RowActions.svelte';
	import { type AdminTab } from '$lib/components/AdminTabs.svelte';
	import { ROLE_CHIP, CHIP_FALLBACK } from '$lib/adminConstants';
	import { adminGet, adminPost } from '$lib/adminApi';
	import Pagination from '$lib/components/Pagination.svelte';

	interface LogEntry {
		id: string;
		type: string;
		message: string;
		createdAt: string | Date;
		data: unknown;
	}
	interface AppEntry {
		id: string;
		name: string;
		title: string;
		authorId: string;
		restrict: string[] | null;
		user: { username: string } | null;
	}

	let users = $state<UserData[]>([]);
	let logs = $state<LogEntry[]>([]);
	let apps = $state<AppEntry[]>([]);
	let loadError = $state('');
	let formError = $state('');
	let formSuccess = $state('');
	let submitting = $state(false);

	async function load() {
		try {
			const data = await adminGet<{ users: UserData[]; logs: LogEntry[]; apps: AppEntry[] }>('');
			users = data.users;
			logs = data.logs;
			apps = data.apps;
		} catch (e) {
			loadError = e instanceof Error ? e.message : 'Failed to load';
		}
	}

	onMount(load);

	/** Submit a form's fields as an admin action; close + reload on success. */
	async function submitForm(e: SubmitEvent, action: string, close?: () => void) {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		const body = Object.fromEntries(new FormData(form).entries());
		submitting = true;
		formError = '';
		formSuccess = '';
		const res = await adminPost('', { action, ...body });
		submitting = false;
		if (res.ok) {
			close?.();
			await load();
			if (!close) formSuccess = 'Saved.';
		} else {
			formError = res.error ?? 'Failed';
		}
	}

	async function remove(action: string, body: Record<string, unknown>) {
		const res = await adminPost('', { action, ...body });
		if (res.ok) await load();
		else loadError = res.error ?? 'Failed to delete';
	}

	let currentTab = $state('users');

	const ROLES = [
		Role.Admin,
		Role.Moderator,
		Role.BetaTester,
		Role.Developer,
		Role.Supporter,
		Role.Trusted,
		Role.User,
		Role.Bot
	];

	const LOG_CHIP: Record<string, string> = {
		info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
		warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500',
		error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
		debug: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
	};

	const GENDER_ICON: Record<string, { symbol: string; cls: string }> = {
		male: { symbol: '♂', cls: 'text-blue-500' },
		female: { symbol: '♀', cls: 'text-pink-500' }
	};

	// --- Search / filter ---
	let userSearch = $state('');
	let logLevel = $state('all');

	const USER_PAGE_SIZE = 25;
	let usersPage = $state(1);

	let filteredUsers = $derived(
		userSearch.trim()
			? users.filter((u) => {
					const q = userSearch.toLowerCase();
					return (
						u.username.toLowerCase().includes(q) ||
						u.email.toLowerCase().includes(q) ||
						u.firstName.toLowerCase().includes(q) ||
						u.lastName.toLowerCase().includes(q) ||
						u.roles.some((r) => r.toLowerCase().includes(q))
					);
				})
			: users
	);

	// Reset to page 1 when search changes
	$effect(() => {
		void userSearch;
		usersPage = 1;
	});

	let pagedUsers = $derived(
		filteredUsers.slice((usersPage - 1) * USER_PAGE_SIZE, usersPage * USER_PAGE_SIZE)
	);

	let filteredLogs = $derived(logLevel === 'all' ? logs : logs.filter((l) => l.type === logLevel));

	const innerTabs = $derived<AdminTab[]>([
		{ id: 'users', label: 'Users', icon: Users, count: filteredUsers.length },
		{ id: 'logs', label: 'Logs', icon: ScrollText, count: filteredLogs.length },
		{ id: 'apps', label: 'Apps', icon: LayoutGrid, count: apps.length }
	]);

	// --- Users ---
	let editingUserId = $state<string | null>(null);
	let userModalOpen = $state(false);
	let pendingRoles = $state<string[]>([]);
	let editingUser = $derived(users.find((u) => u.id === editingUserId) ?? null);

	function openUserEdit(id: string) {
		const user = users.find((u) => u.id === id);
		pendingRoles = [...(user?.roles ?? [])];
		editingUserId = id;
		formError = '';
		userModalOpen = true;
	}

	$effect(() => {
		if (!userModalOpen) editingUserId = null;
	});

	function toggleRole(role: string) {
		if (pendingRoles.includes(role)) {
			pendingRoles = pendingRoles.filter((r) => r !== role);
		} else {
			pendingRoles = [...pendingRoles, role];
		}
	}

	// --- Logs ---
	let logModalOpen = $state(false);
	let selectedLog = $state<LogEntry | null>(null);

	function openLog(log: LogEntry) {
		selectedLog = log;
		logModalOpen = true;
	}

	// --- Create User ---
	let createUserOpen = $state(false);

	// --- Delete User Confirmation ---
	let confirmDeleteUser = $state(false);

	$effect(() => {
		if (!userModalOpen) confirmDeleteUser = false;
	});

	// --- Apps ---
	let appModalOpen = $state(false);
	let appModalMode = $state<'create' | 'edit'>('create');
	let editingApp = $state<AppEntry | null>(null);
	let appName = $state('');
	let appTitle = $state('');
	let appAuthorId = $state('');
	let appRestrict = $state<string[]>([]);

	// --- Delete App Confirmation ---
	let deleteConfirmApp = $state<AppEntry | null>(null);
	let deleteConfirmAppOpen = $state(false);

	function openAppDeleteConfirm(app: AppEntry) {
		deleteConfirmApp = app;
		deleteConfirmAppOpen = true;
	}

	$effect(() => {
		if (!deleteConfirmAppOpen) deleteConfirmApp = null;
	});

	function openAppCreate() {
		appModalMode = 'create';
		editingApp = null;
		appName = '';
		appTitle = '';
		appAuthorId = users[0]?.id ?? '';
		appRestrict = [];
		formError = '';
		appModalOpen = true;
	}

	function openAppEdit(app: AppEntry) {
		appModalMode = 'edit';
		editingApp = app;
		appName = app.name;
		appTitle = app.title;
		appAuthorId = app.authorId;
		appRestrict = app.restrict ?? [];
		formError = '';
		appModalOpen = true;
	}

	$effect(() => {
		if (!appModalOpen) editingApp = null;
	});
</script>

<AdminPanel error={loadError} tabs={innerTabs} bind:active={currentTab}>
	{#snippet toolbar()}
		{#if currentTab === 'users'}
			<div class="flex items-center gap-2">
				<div class="relative flex-1 max-w-xs">
					<Search size={13} class="text-muted-foreground absolute top-2.5 left-2.5" />
					<Input.Root
						placeholder="Search users..."
						bind:value={userSearch}
						class="h-8 pl-7 text-xs"
					/>
					{#if userSearch}
						<button
							onclick={() => (userSearch = '')}
							class="text-muted-foreground hover:text-foreground absolute top-2 right-2"
						>
							<X size={13} />
						</button>
					{/if}
				</div>
				<Button.Root size="sm" onclick={() => (createUserOpen = true)}>
					<Plus size={14} />
					New User
				</Button.Root>
			</div>
		{:else if currentTab === 'logs'}
			<div class="flex gap-1">
				{#each ['all', 'info', 'warning', 'error', 'debug'] as level (level)}
					<button
						onclick={() => (logLevel = level)}
						class="rounded px-2.5 py-1 text-xs font-medium transition-colors {logLevel === level
							? 'bg-primary text-primary-foreground'
							: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
					>
						{level}
					</button>
				{/each}
			</div>
		{:else if currentTab === 'apps'}
			<Button.Root size="sm" onclick={openAppCreate}>
				<Plus size={14} />
				Add App
			</Button.Root>
		{/if}
	{/snippet}

	<!-- USERS -->
	{#if currentTab === 'users'}
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-36">Username</Table.Head>
					<Table.Head>Email</Table.Head>
					<Table.Head>Roles</Table.Head>
					<Table.Head class="w-8 text-center" title="Gender">G</Table.Head>
					<Table.Head class="w-20 text-right">Credit</Table.Head>
					<Table.Head class="w-28">Last Online</Table.Head>
					<Table.Head class="w-10"></Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each pagedUsers as user (user.id)}
					<Table.Row class="hover:bg-muted/40 group">
						<Table.Cell class="py-1.5">
							<div class="flex items-center gap-1.5 font-medium">
								{user.username}
								{#if user.bannedUntil}
									<span
										class="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400"
										>banned</span
									>
								{/if}
							</div>
							<div class="text-muted-foreground text-xs">{user.firstName} {user.lastName}</div>
						</Table.Cell>
						<Table.Cell class="text-muted-foreground py-1.5 text-xs">{user.email}</Table.Cell>
						<Table.Cell class="py-1.5">
							<div class="flex flex-wrap gap-1">
								{#each user.roles as role (role)}
									<span
										class="rounded px-1.5 py-0.5 text-xs font-medium {ROLE_CHIP[role] ??
											CHIP_FALLBACK}">{role}</span
									>
								{/each}
							</div>
						</Table.Cell>
						<Table.Cell class="py-1.5 text-center">
							{#if user.gender && GENDER_ICON[user.gender]}
								<span class="text-sm font-bold {GENDER_ICON[user.gender].cls}"
									>{GENDER_ICON[user.gender].symbol}</span
								>
							{:else}
								<span class="text-muted-foreground">-</span>
							{/if}
						</Table.Cell>
						<Table.Cell class="py-1.5 text-right text-sm tabular-nums">{user.credit}</Table.Cell>
						<Table.Cell class="text-muted-foreground py-1.5 text-xs">
							{new Date(user.lastOnline).toLocaleDateString('en', {
								month: 'short',
								day: 'numeric',
								year: '2-digit'
							})}
						</Table.Cell>
						<Table.Cell class="py-1.5">
							<RowActions onEdit={() => openUserEdit(user.id)} />
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
		<Pagination
			page={usersPage}
			total={filteredUsers.length}
			pageSize={USER_PAGE_SIZE}
			onPageChange={(p) => (usersPage = p)}
		/>
	{/if}

	<!-- LOGS -->
	{#if currentTab === 'logs'}
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-20">Level</Table.Head>
					<Table.Head class="w-80">Message</Table.Head>
					<Table.Head class="w-36">Timestamp</Table.Head>
					<Table.Head>Data</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each filteredLogs as log (log.id)}
					<Table.Row class="hover:bg-muted/40 cursor-pointer" onclick={() => openLog(log)}>
						<Table.Cell class="py-1.5">
							<span
								class="rounded px-1.5 py-0.5 text-xs font-medium {LOG_CHIP[log.type] ??
									CHIP_FALLBACK}">{log.type}</span
							>
						</Table.Cell>
						<Table.Cell class="max-w-[20rem] truncate py-1.5 text-sm">{log.message}</Table.Cell>
						<Table.Cell class="text-muted-foreground py-1.5 text-xs tabular-nums">
							{new Date(log.createdAt).toLocaleString('en', {
								month: 'short',
								day: 'numeric',
								hour: '2-digit',
								minute: '2-digit',
								second: '2-digit'
							})}
						</Table.Cell>
						<Table.Cell class="py-1.5">
							{#if log.data}
								<span class="text-muted-foreground block truncate font-mono text-xs">
									{JSON.stringify(log.data)}
								</span>
							{:else}
								<span class="text-muted-foreground/40 text-xs">-</span>
							{/if}
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
		{#if logs.length === 500}
			<p class="text-muted-foreground mt-2 text-xs">Showing 500 most recent entries.</p>
		{/if}
	{/if}

	<!-- APPS -->
	{#if currentTab === 'apps'}
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-48">Name</Table.Head>
					<Table.Head>Title</Table.Head>
					<Table.Head class="w-28">Author</Table.Head>
					<Table.Head>Restrictions</Table.Head>
					<Table.Head class="w-16"></Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each apps as app (app.id)}
					<Table.Row class="hover:bg-muted/40 group">
						<Table.Cell class="py-1.5 font-mono text-sm">{app.name}</Table.Cell>
						<Table.Cell class="py-1.5 font-medium">{app.title}</Table.Cell>
						<Table.Cell class="py-1.5">
							{#if app.user}
								<button
									onclick={() => openUserEdit(app.authorId)}
									class="text-muted-foreground hover:text-foreground text-sm hover:underline"
								>
									{app.user.username}
								</button>
							{:else}
								<span class="text-muted-foreground text-sm">-</span>
							{/if}
						</Table.Cell>
						<Table.Cell class="overflow-hidden py-1.5">
							<RestrictEditor
								value={app.restrict ?? []}
								readonly
								{users}
								onUserClick={(id) => openUserEdit(id)}
							/>
						</Table.Cell>
						<Table.Cell class="py-1.5">
							<RowActions
								onEdit={() => openAppEdit(app)}
								onDelete={() => openAppDeleteConfirm(app)}
							/>
						</Table.Cell>
					</Table.Row>
				{/each}
				{#if apps.length === 0}
					<Table.Row>
						<Table.Cell colspan={5} class="text-muted-foreground py-8 text-center text-sm"
							>No apps</Table.Cell
						>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
	{/if}
</AdminPanel>

<!-- USER EDIT MODAL -->
{#if editingUser}
	<Modal bind:open={userModalOpen} title="Edit: {editingUser.username}" wide>
		<div class="space-y-5">
			{#if formSuccess}
				<div
					class="rounded bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400"
				>
					{formSuccess}
				</div>
			{/if}
			{#if formError}
				<div class="bg-destructive/10 text-destructive rounded px-3 py-2 text-sm">{formError}</div>
			{/if}
			<!-- Profile -->
			<form onsubmit={(e) => submitForm(e, 'userUpdateProfile')} class="space-y-3">
				<input type="hidden" name="userId" value={editingUser.id} />
				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="edit-username" class="text-muted-foreground mb-1 block text-xs font-medium"
							>Username</label
						>
						<Input.Root id="edit-username" name="username" value={editingUser.username} required />
					</div>
					<div>
						<label for="edit-email" class="text-muted-foreground mb-1 block text-xs font-medium"
							>Email</label
						>
						<Input.Root
							id="edit-email"
							name="email"
							type="email"
							value={editingUser.email}
							required
						/>
					</div>
					<div>
						<label for="edit-credit" class="text-muted-foreground mb-1 block text-xs font-medium"
							>Credit</label
						>
						<Input.Root
							id="edit-credit"
							name="credit"
							type="number"
							value={editingUser.credit}
							min="0"
							required
						/>
					</div>
					<div>
						<label for="edit-gender" class="text-muted-foreground mb-1 block text-xs font-medium"
							>Gender</label
						>
						<select
							id="edit-gender"
							name="gender"
							class="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm"
						>
							<option value="" selected={!editingUser.gender}>-</option>
							<option value="male" selected={editingUser.gender === 'male'}>♂ Male</option>
							<option value="female" selected={editingUser.gender === 'female'}>♀ Female</option>
						</select>
					</div>
				</div>
				<Button.Root type="submit" size="sm">Save Profile</Button.Root>
			</form>

			<!-- Password -->
			<div class="border-t pt-4">
				<form onsubmit={(e) => submitForm(e, 'userUpdatePassword')} class="space-y-2">
					<input type="hidden" name="userId" value={editingUser.id} />
					<label for="edit-password" class="text-muted-foreground block text-xs font-medium"
						>Reset Password</label
					>
					<div class="flex gap-2">
						<Input.Root
							id="edit-password"
							name="newPassword"
							type="text"
							placeholder="New password"
							class="flex-1"
						/>
						<Button.Root type="submit" size="sm" variant="outline">Set</Button.Root>
					</div>
				</form>
			</div>

			<!-- Roles -->
			<div class="border-t pt-4">
				<p class="text-muted-foreground mb-2 text-xs font-medium">Roles</p>
				<div class="mb-3 flex flex-wrap gap-1.5">
					{#each ROLES as role (role)}
						<button
							type="button"
							onclick={() => toggleRole(role)}
							class="rounded px-2 py-0.5 text-xs font-medium transition-all {pendingRoles.includes(
								role
							)
								? (ROLE_CHIP[role] ?? CHIP_FALLBACK)
								: 'text-muted-foreground hover:border-foreground hover:text-foreground border border-dashed'}"
							>{role}</button
						>
					{/each}
				</div>
				<form onsubmit={(e) => submitForm(e, 'userSetRoles')}>
					<input type="hidden" name="userId" value={editingUser.id} />
					<input type="hidden" name="roles" value={pendingRoles.join(',')} />
					<Button.Root type="submit" size="sm">Save Roles</Button.Root>
				</form>
			</div>

			<!-- Ban -->
			<div class="space-y-2 border-t pt-4">
				<p class="text-muted-foreground text-xs font-medium">Ban</p>
				{#if editingUser.bannedUntil}
					<div
						class="flex items-center justify-between rounded border border-red-200 bg-red-50 px-3 py-2 text-xs dark:border-red-800 dark:bg-red-950/20"
					>
						<div>
							<span class="font-medium text-red-700 dark:text-red-400">Until:</span>
							<span class="ml-1 text-red-600">{new Date(editingUser.bannedUntil).toLocaleString()}</span>
							{#if editingUser.bannedReason}
								<span class="ml-1 text-red-500">- {editingUser.bannedReason}</span>
							{/if}
							{#if editingUser.banId}
								<span class="ml-1 font-mono text-red-500">[{editingUser.banId}]</span>
							{/if}
						</div>
						<form onsubmit={(e) => submitForm(e, 'userUnban')} class="ml-3 shrink-0">
							<input type="hidden" name="userId" value={editingUser.id} />
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
				<form onsubmit={(e) => submitForm(e, 'userBan')} class="flex items-end gap-2">
					<input type="hidden" name="userId" value={editingUser.id} />
					<div class="flex-1">
						<label for="user-ban-until" class="text-muted-foreground mb-1 block text-xs">Until</label>
						<Input.Root id="user-ban-until" type="datetime-local" name="until" required />
					</div>
					<div class="flex-1">
						<label for="user-ban-reason" class="text-muted-foreground mb-1 block text-xs">Reason</label>
						<Input.Root id="user-ban-reason" name="reason" placeholder="Optional" />
					</div>
					<Button.Root type="submit" size="sm" variant="destructive" class="shrink-0">Ban</Button.Root>
				</form>
			</div>

			<!-- Meta -->
			<div class="text-muted-foreground border-t pt-3 text-xs">
				<p>ID: <span class="font-mono">{editingUser.id}</span></p>
				<p class="mt-0.5">Last online: {new Date(editingUser.lastOnline).toLocaleString()}</p>
			</div>

			<!-- Delete -->
			<div class="border-t pt-4">
				{#if confirmDeleteUser}
					<p class="text-destructive mb-2 text-xs font-medium">
						Really delete <span class="font-semibold">{editingUser.username}</span>? This cannot be
						undone.
					</p>
					<div class="flex gap-2">
						<form
							onsubmit={(e) => submitForm(e, 'userDelete', () => (userModalOpen = false))}
							class="flex-1"
						>
							<input type="hidden" name="userId" value={editingUser.id} />
							<Button.Root type="submit" variant="destructive" size="sm" class="w-full">
								<Trash2 size={14} />
								Yes, delete
							</Button.Root>
						</form>
						<Button.Root
							type="button"
							variant="outline"
							size="sm"
							onclick={() => (confirmDeleteUser = false)}
						>
							Cancel
						</Button.Root>
					</div>
				{:else}
					<Button.Root
						type="button"
						variant="destructive"
						size="sm"
						class="w-full"
						onclick={() => (confirmDeleteUser = true)}
					>
						<Trash2 size={14} />
						Delete User
					</Button.Root>
				{/if}
			</div>
		</div>
	</Modal>
{/if}

<!-- LOG DETAIL MODAL -->
{#if selectedLog}
	<Modal bind:open={logModalOpen} title="Log Entry" wide>
		<div class="space-y-3">
			<div class="flex items-center gap-2">
				<span
					class="rounded px-1.5 py-0.5 text-xs font-medium {LOG_CHIP[selectedLog.type] ??
						CHIP_FALLBACK}">{selectedLog.type}</span
				>
				<span class="text-muted-foreground text-xs tabular-nums">
					{new Date(selectedLog.createdAt).toLocaleString('en', {
						dateStyle: 'medium',
						timeStyle: 'medium'
					})}
				</span>
			</div>
			<div>
				<p class="text-muted-foreground mb-1 text-xs font-medium">Message</p>
				<p class="text-sm">{selectedLog.message}</p>
			</div>
			{#if selectedLog.data}
				<div>
					<p class="text-muted-foreground mb-1 text-xs font-medium">Data</p>
					<pre class="bg-muted overflow-auto rounded-md p-3 text-xs">{JSON.stringify(
							selectedLog.data,
							null,
							2
						)}</pre>
				</div>
			{/if}
			<div class="text-muted-foreground pt-1 text-xs">
				ID: <span class="font-mono">{selectedLog.id}</span>
			</div>
		</div>
	</Modal>
{/if}

<!-- APP MODAL -->
<Modal bind:open={appModalOpen} title={appModalMode === 'create' ? 'Add App' : 'Edit App'}>
	<form
		onsubmit={(e) =>
			submitForm(
				e,
				appModalMode === 'create' ? 'appCreate' : 'appUpdate',
				() => (appModalOpen = false)
			)}
		class="space-y-3"
	>
		{#if formError}
			<div class="bg-destructive/10 text-destructive rounded px-3 py-2 text-sm">{formError}</div>
		{/if}
		{#if appModalMode === 'edit' && editingApp}
			<input type="hidden" name="appId" value={editingApp.id} />
		{/if}
		<div>
			<label for="app-name" class="text-muted-foreground mb-1 block text-xs font-medium"
				>Name (slug)</label
			>
			<Input.Root id="app-name" name="name" bind:value={appName} placeholder="my-app" required />
			<p class="text-muted-foreground mt-1 text-xs">
				Unique identifier used by the OS to load this app. URL-safe, lowercase, no spaces.
			</p>
		</div>
		<div>
			<label for="app-title" class="text-muted-foreground mb-1 block text-xs font-medium"
				>Title</label
			>
			<Input.Root id="app-title" name="title" bind:value={appTitle} placeholder="My App" required />
			<p class="text-muted-foreground mt-1 text-xs">Display name shown to users in the desktop.</p>
		</div>
		<div>
			<label for="app-author" class="text-muted-foreground mb-1 block text-xs font-medium"
				>Author</label
			>
			<select
				id="app-author"
				name="authorId"
				bind:value={appAuthorId}
				class="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm"
				required
			>
				{#each users as u (u.id)}
					<option value={u.id}>{u.username}</option>
				{/each}
			</select>
			<p class="text-muted-foreground mt-1 text-xs">
				The user who owns this app. Deleted when the author is deleted.
			</p>
		</div>
		<div>
			<p class="text-muted-foreground mb-1 text-xs font-medium">Restrictions</p>
			{#key editingApp?.id ?? 'create'}
				<RestrictEditor name="restrict" value={appRestrict} {users} />
			{/key}
			<p class="text-muted-foreground mt-1 text-xs">
				Limit access to specific users or roles. Leave empty to allow all authenticated users.
			</p>
		</div>
		<div class="flex justify-end gap-2 pt-2">
			<Button.Root type="button" variant="outline" size="sm" onclick={() => (appModalOpen = false)}
				>Cancel</Button.Root
			>
			<Button.Root type="submit" size="sm" disabled={submitting}
				>{appModalMode === 'create' ? 'Create' : 'Save'}</Button.Root
			>
		</div>
	</form>
</Modal>

<!-- DELETE APP CONFIRMATION MODAL -->
<Modal bind:open={deleteConfirmAppOpen} title="Delete App">
	<p class="mb-4 text-sm">
		Really delete app <span class="font-mono font-semibold">{deleteConfirmApp?.name}</span>? This
		cannot be undone.
	</p>
	<div class="flex justify-end gap-2">
		<Button.Root variant="outline" size="sm" onclick={() => (deleteConfirmAppOpen = false)}
			>Cancel</Button.Root
		>
		<Button.Root
			variant="destructive"
			size="sm"
			onclick={async () => {
				if (!deleteConfirmApp) return;
				const app = deleteConfirmApp;
				deleteConfirmAppOpen = false;
				await remove('appDelete', { appId: app.id });
			}}
		>
			<Trash2 size={14} />
			Delete
		</Button.Root>
	</div>
</Modal>

<!-- CREATE USER MODAL -->
<Modal bind:open={createUserOpen} title="New User" wide>
	<form
		onsubmit={(e) => submitForm(e, 'userCreate', () => (createUserOpen = false))}
		class="space-y-3"
	>
		{#if formError}
			<div class="bg-destructive/10 text-destructive rounded px-3 py-2 text-sm">{formError}</div>
		{/if}
		<div class="grid grid-cols-2 gap-3">
			<div>
				<label for="new-username" class="text-muted-foreground mb-1 block text-xs font-medium"
					>Username</label
				>
				<Input.Root id="new-username" name="username" placeholder="johndoe" required />
			</div>
			<div>
				<label for="new-email" class="text-muted-foreground mb-1 block text-xs font-medium"
					>Email</label
				>
				<Input.Root
					id="new-email"
					name="email"
					type="email"
					placeholder="john@example.com"
					required
				/>
			</div>
			<div>
				<label for="new-firstname" class="text-muted-foreground mb-1 block text-xs font-medium"
					>First Name</label
				>
				<Input.Root id="new-firstname" name="firstName" placeholder="John" required />
			</div>
			<div>
				<label for="new-lastname" class="text-muted-foreground mb-1 block text-xs font-medium"
					>Last Name</label
				>
				<Input.Root id="new-lastname" name="lastName" placeholder="Doe" required />
			</div>
			<div>
				<label for="new-password" class="text-muted-foreground mb-1 block text-xs font-medium"
					>Password</label
				>
				<Input.Root
					id="new-password"
					name="password"
					type="text"
					placeholder="Initial password"
					required
				/>
			</div>
			<div>
				<label for="new-birthdate" class="text-muted-foreground mb-1 block text-xs font-medium"
					>Birthdate</label
				>
				<Input.Root id="new-birthdate" name="birthdate" type="date" required />
			</div>
			<div>
				<label for="new-gender" class="text-muted-foreground mb-1 block text-xs font-medium"
					>Gender</label
				>
				<select
					id="new-gender"
					name="gender"
					class="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm"
					required
				>
					<option value="male">♂ Male</option>
					<option value="female">♀ Female</option>
				</select>
			</div>
		</div>
		<div class="flex justify-end gap-2 pt-2">
			<Button.Root
				type="button"
				variant="outline"
				size="sm"
				onclick={() => (createUserOpen = false)}>Cancel</Button.Root
			>
			<Button.Root type="submit" size="sm" disabled={submitting}>Create</Button.Root>
		</div>
	</form>
</Modal>
