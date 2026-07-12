<script lang="ts">
	import { Role } from '$lib/types';
	import { untrack } from 'svelte';

	const ROLES = Object.values(Role);

	interface UserRef {
		id: string;
		username: string;
	}

	interface Props {
		name?: string;
		value?: string[];
		readonly?: boolean;
		users?: UserRef[];
		onUserClick?: (userId: string) => void;
	}

	let {
		name = 'restrict',
		value = [],
		readonly = false,
		users = [],
		onUserClick
	}: Props = $props();

	let items = $state(untrack(() => [...value]));

	// Re-sync when `value` changes (e.g. a readonly row's data is reloaded after a save).
	$effect(() => {
		items = [...value];
	});

	let addOpen = $state(false);
	let addDeny = $state(false);
	let addType = $state<'role' | 'user'>('role');
	let addRole = $state<Role>(Role.User);
	let addUserId = $state('');
	let userSearch = $state('');
	let userDropdownOpen = $state(false);

	const userMap = $derived(new Map(users.map((u) => [u.id, u.username])));

	let filteredUsers = $derived(
		userSearch.trim().length === 0
			? users.slice(0, 8)
			: users.filter((u) => u.username.toLowerCase().includes(userSearch.toLowerCase())).slice(0, 8)
	);

	function chip(r: string) {
		const deny = r.startsWith('!');
		const rest = deny ? r.slice(1) : r;
		const isRole = rest.startsWith('@');
		let label: string;
		if (isRole) {
			label = rest.slice(1);
		} else {
			const username = userMap.get(rest);
			label = username ?? (rest.length > 10 ? rest.slice(0, 8) + '…' : rest);
		}
		return { deny, isRole, label };
	}

	function chipClass(deny: boolean) {
		if (deny) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
		return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
	}

	function remove(r: string) {
		items = items.filter((x) => x !== r);
	}

	function selectUser(u: UserRef) {
		addUserId = u.id;
		userSearch = u.username;
		userDropdownOpen = false;
	}

	function add() {
		let raw: string;
		if (addType === 'role') {
			raw = `${addDeny ? '!' : ''}@${addRole}`;
		} else {
			const id = addUserId.trim();
			if (!id) return;
			raw = `${addDeny ? '!' : ''}${id}`;
		}
		if (!items.includes(raw)) items = [...items, raw];
		addOpen = false;
		addUserId = '';
		userSearch = '';
		userDropdownOpen = false;
		addDeny = false;
		addType = 'role';
	}

	function resetAdd() {
		addOpen = false;
		addUserId = '';
		userSearch = '';
		userDropdownOpen = false;
		addDeny = false;
		addType = 'role';
	}
</script>

{#if !readonly}
	<input type="hidden" {name} value={items.join(',')} />
{/if}

<div class={readonly ? 'flex flex-nowrap gap-1 overflow-hidden' : 'flex flex-wrap gap-1'}>
	{#each items as r (r)}
		{@const c = chip(r)}
		{@const userId = !c.isRole ? (c.deny ? r.slice(1) : r) : null}
		{@const clickable = readonly && userId !== null && !!onUserClick}
		{#if clickable}
			<button
				type="button"
				onclick={() => onUserClick!(userId!)}
				class="flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-75 {chipClass(
					c.deny
				)}"
			>
				{c.label}
			</button>
		{:else}
			<span
				class="flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium {chipClass(
					c.deny
				)}"
			>
				{#if c.isRole}<span class="opacity-60">@</span>{/if}{c.label}
				{#if !readonly}
					<button
						type="button"
						onclick={() => remove(r)}
						class="ml-0.5 opacity-50 hover:opacity-100">×</button
					>
				{/if}
			</span>
		{/if}
	{/each}

	{#if !readonly && !addOpen}
		{#if items.length === 0}
			<span class="text-muted-foreground text-xs">none</span>
		{/if}
		<button
			type="button"
			onclick={() => (addOpen = true)}
			class="text-muted-foreground hover:border-foreground hover:text-foreground rounded border border-dashed px-1.5 py-0.5 text-xs transition-colors"
			>+ Add</button
		>
	{/if}
</div>

{#if !readonly && addOpen}
	<div class="bg-muted/30 mt-2 space-y-2 rounded-md border p-2">
		<div class="flex flex-wrap items-center gap-1.5">
			<div class="flex overflow-hidden rounded border text-xs">
				<button
					type="button"
					onclick={() => (addDeny = false)}
					class="px-2 py-1 transition-colors {!addDeny
						? 'bg-green-600 text-white'
						: 'hover:bg-muted'}">Allow</button
				>
				<button
					type="button"
					onclick={() => (addDeny = true)}
					class="px-2 py-1 transition-colors {addDeny
						? 'bg-destructive text-destructive-foreground'
						: 'hover:bg-muted'}">Deny</button
				>
			</div>

			<div class="flex overflow-hidden rounded border text-xs">
				<button
					type="button"
					onclick={() => (addType = 'role')}
					class="px-2 py-1 transition-colors {addType === 'role'
						? 'bg-primary text-primary-foreground'
						: 'hover:bg-muted'}">Role</button
				>
				<button
					type="button"
					onclick={() => (addType = 'user')}
					class="px-2 py-1 transition-colors {addType === 'user'
						? 'bg-primary text-primary-foreground'
						: 'hover:bg-muted'}">User</button
				>
			</div>
		</div>

		{#if addType === 'role'}
			<div class="flex items-center gap-1.5">
				<select bind:value={addRole} class="bg-background rounded border px-2 py-1 text-xs">
					{#each ROLES as role (role)}
						<option value={role}>{role}</option>
					{/each}
				</select>
				<button
					type="button"
					onclick={add}
					class="bg-primary text-primary-foreground rounded px-2 py-1 text-xs hover:opacity-90"
					>Add</button
				>
				<button
					type="button"
					onclick={resetAdd}
					class="text-muted-foreground hover:bg-muted rounded px-2 py-1 text-xs">Cancel</button
				>
			</div>
		{:else}
			<div class="relative">
				<input
					type="text"
					bind:value={userSearch}
					placeholder={users.length > 0 ? 'Search username…' : 'Enter user ID…'}
					class="bg-background w-full rounded border px-2 py-1 text-xs"
					oninput={() => {
						addUserId = '';
						userDropdownOpen = true;
					}}
					onfocus={() => (userDropdownOpen = true)}
					onblur={() => (userDropdownOpen = false)}
				/>
				{#if userDropdownOpen && users.length > 0 && filteredUsers.length > 0}
					<ul
						class="bg-background absolute z-50 mt-0.5 w-full overflow-hidden rounded border shadow-md"
					>
						{#each filteredUsers as u (u.id)}
							<li>
								<button
									type="button"
									class="hover:bg-muted flex w-full items-center justify-between px-2 py-1.5 text-left text-xs {addUserId ===
									u.id
										? 'bg-muted font-medium'
										: ''}"
									onmousedown={(e) => {
										e.preventDefault();
										selectUser(u);
									}}
								>
									<span>{u.username}</span>
									<span class="text-muted-foreground font-mono">{u.id}</span>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
			<div class="flex items-center gap-1.5">
				<button
					type="button"
					onclick={add}
					disabled={!addUserId}
					class="bg-primary text-primary-foreground rounded px-2 py-1 text-xs hover:opacity-90 disabled:opacity-40"
					>Add</button
				>
				<button
					type="button"
					onclick={resetAdd}
					class="text-muted-foreground hover:bg-muted rounded px-2 py-1 text-xs">Cancel</button
				>
				{#if addUserId && userSearch}
					<span class="text-muted-foreground text-xs"
						>ID: <span class="font-mono">{addUserId}</span></span
					>
				{/if}
			</div>
		{/if}
	</div>
{/if}
