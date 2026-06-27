<script lang="ts">
	import type { UserData } from '$lib/types';
	import { ROLE_CHIP, CHIP_FALLBACK } from '$lib/adminConstants';
	import Modal from '$lib/components/Modal.svelte';

	let { open = $bindable(false), user }: { open: boolean; user: UserData } = $props();
</script>

<Modal bind:open title={user.username}>
	<div class="space-y-3">
		<div class="flex flex-wrap gap-1">
			{#each user.roles as role (role)}
				<span class="rounded px-1.5 py-0.5 text-xs font-medium {ROLE_CHIP[role] ?? CHIP_FALLBACK}"
					>{role}</span
				>
			{/each}
		</div>
		<div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
			<span class="text-muted-foreground">Email</span><span>{user.email}</span>
			<span class="text-muted-foreground">Credit</span><span class="tabular-nums"
				>{user.credit}</span
			>
			<span class="text-muted-foreground">Last online</span>
			<span
				>{new Date(user.lastOnline).toLocaleDateString('en', {
					month: 'short',
					day: 'numeric',
					year: '2-digit'
				})}</span
			>
		</div>
		<div class="text-muted-foreground pt-1 text-xs">
			ID: <span class="font-mono">{user.id}</span>
		</div>
	</div>
</Modal>
