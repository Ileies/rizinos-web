<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Role } from '$lib/types';
	import { session, loadSession } from '$lib/session.svelte';

	let { children } = $props();

	// Client-side admin gate. The backend still enforces this on every
	// /api/admin/* call (401/403); this only avoids flashing the UI to non-admins.
	let allowed = $state(false);

	onMount(async () => {
		await loadSession();
		const user = session.user;
		if (!user) {
			goto('/login?redirect=/admin');
		} else if (!user.roles?.includes(Role.Admin)) {
			goto('/');
		} else {
			allowed = true;
		}
	});

	// Redirect to login when the session expires mid-session (e.g. after a 401
	// response from an admin API call triggers refreshSession()).
	$effect(() => {
		if (session.loaded && session.error) {
			goto('/login?redirect=/admin');
		}
	});
</script>

{#if allowed}
	<div class="w-full">
		{@render children()}
	</div>
{/if}
