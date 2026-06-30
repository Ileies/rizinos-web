<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import * as Button from '$shadcn/button';
	import * as m from '$lib/messages.svelte';

	let status = $state<number | null>(null);

	const error = $derived(
		status === null
			? ''
			: [
					'',
					m.confirm_email_pending(),
					m.confirm_email_token_invalid(),
					m.confirm_email_user_exists()
				][status]
	);

	onMount(async () => {
		const token = page.url.searchParams.get('token');
		try {
			const res = await fetch(`/api/auth/confirm-email?token=${encodeURIComponent(token ?? '')}`);
			status = (await res.json()).status;
		} catch {
			status = 2; // treat network failure as invalid token
		}
	});
</script>


<div class="w-full max-w-7xl">
	<div class="mb-6">
		<h1 class="mb-4 text-2xl font-bold">{m.confirm_email_title()}</h1>
		{#if status === null}
			<p class="text-gray-500">{m.confirm_email_pending()}</p>
		{:else if error}
			<p class="text-red-500">{error}</p>
		{:else}
			<p class="text-gray-500">{m.confirm_email_verified()}</p>
		{/if}
		<div>
			<Button.Root class="mt-4" onclick={() => goto('/')}
				>{m.confirm_email_return_home()}</Button.Root
			>
		</div>
	</div>
</div>
