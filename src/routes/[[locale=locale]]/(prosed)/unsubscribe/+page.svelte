<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import * as Button from '$shadcn/button';
	import * as m from '$lib/messages.svelte';
	import { apiPost } from '$lib/api';

	type State = 'idle' | 'loading' | 'success' | 'error_invalid' | 'error_generic' | 'no_token';

	const token = $derived(page.url.searchParams.get('token'));
	let state = $state<State>('idle');

	$effect(() => {
		if (!token) state = 'no_token';
	});

	async function unsubscribe() {
		if (!token) return;
		state = 'loading';
		const result = await apiPost('/auth/unsubscribe', { token });
		if (result.ok) {
			state = 'success';
		} else if (result.status === 400 || result.status === 404) {
			state = 'error_invalid';
		} else {
			state = 'error_generic';
		}
	}
</script>

<h1>{m.unsubscribe_title()}</h1>

{#if state === 'idle'}
	<p>{m.unsubscribe_intro()}</p>
	<Button.Root onclick={unsubscribe}>{m.unsubscribe_button()}</Button.Root>
{:else if state === 'loading'}
	<p class="text-muted-foreground">{m.unsubscribe_button()}...</p>
{:else if state === 'success'}
	<h2>{m.unsubscribe_success_title()}</h2>
	<p>{m.unsubscribe_success_body()}</p>
	<div class="flex gap-3">
		<Button.Root variant="outline" onclick={() => goto('/')}
			>{m.unsubscribe_return_home()}</Button.Root
		>
		<Button.Root onclick={() => goto('/app')}>{m.unsubscribe_account_settings()}</Button.Root>
	</div>
{:else if state === 'error_invalid'}
	<p class="text-destructive">{m.unsubscribe_error_invalid()}</p>
	<Button.Root variant="outline" onclick={() => goto('/')}
		>{m.unsubscribe_return_home()}</Button.Root
	>
{:else if state === 'error_generic'}
	<p class="text-destructive">{m.unsubscribe_error_generic()}</p>
	<Button.Root variant="outline" onclick={() => goto('/')}
		>{m.unsubscribe_return_home()}</Button.Root
	>
{:else if state === 'no_token'}
	<p class="text-destructive">{m.unsubscribe_no_token()}</p>
	<Button.Root variant="outline" onclick={() => goto('/')}
		>{m.unsubscribe_return_home()}</Button.Root
	>
{/if}
