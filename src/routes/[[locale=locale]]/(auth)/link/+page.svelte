<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { CheckCircle, ArrowLeft } from '@lucide/svelte';
	import * as m from '$lib/messages.svelte';
	import { apiFetch } from '$lib/api';
	import { session, loadSession } from '$lib/session.svelte';
	import AuthCard from '$lib/components/AuthCard.svelte';

	let status = $state<number | null>(null);

	const errorMessage = $derived(
		status === null || status === 0
			? ''
			: (
					{
						1: m.link_error_generic(),
						2: m.link_error_no_token(),
						3: m.link_error_invalid(),
						4: m.link_error_user_already_linked(),
						5: m.link_error_discord_already_linked()
					} as Record<number, string>
				)[status] ?? m.link_error_generic()
	);

	onMount(async () => {
		const token = page.url.searchParams.get('token') ?? '';

		await loadSession();
		if (!session.loggedIn) {
			goto('/login?redirect=' + encodeURIComponent(`/link?token=${token}`));
			return;
		}

		try {
			const res = await apiFetch(`/discord/link?token=${encodeURIComponent(token)}`);
			status = (await res.json()).status;
		} catch {
			status = 1;
		}
	});
</script>

<AuthCard center>
	{#if status === 0}
		<div class="flex flex-col items-center text-center">
			<div class="bg-primary/10 mb-4 flex h-14 w-14 items-center justify-center rounded-full">
				<CheckCircle class="text-primary h-7 w-7" />
			</div>
			<h2 class="text-card-foreground text-xl font-bold tracking-tight">
				{m.link_success_title()}
			</h2>
			<p class="text-muted-foreground mt-2 text-sm">{m.link_success_desc()}</p>
			<a
				class="text-primary hover:text-primary/80 mt-6 flex items-center gap-1.5 text-sm font-medium transition-colors"
				href="/"
			>
				<ArrowLeft class="h-3.5 w-3.5" />
				{m.link_return_home()}
			</a>
		</div>
	{:else}
		<h2 class="text-card-foreground text-xl font-bold tracking-tight">{m.link_title()}</h2>
		{#if status === null}
			<p class="text-muted-foreground mt-2 text-sm">{m.link_pending()}</p>
		{:else}
			<p class="text-destructive mt-2 text-sm">{errorMessage}</p>
			<a
				class="text-primary hover:text-primary/80 mt-6 flex items-center gap-1.5 text-sm font-medium transition-colors"
				href="/"
			>
				<ArrowLeft class="h-3.5 w-3.5" />
				{m.link_return_home()}
			</a>
		{/if}
	{/if}
</AuthCard>
