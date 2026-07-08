<script lang="ts">
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { ArrowRight, CheckCircle, ArrowLeft } from '@lucide/svelte';
	import * as m from '$lib/messages.svelte';
	import { apiPost } from '$lib/api';
	import AuthCard from '$lib/components/AuthCard.svelte';

	let banId = $state(browser ? (page.url.searchParams.get('id') ?? '') : '');
	let message = $state('');
	let submitting = $state(false);
	let submitted = $state(false);
	let error = $state('');

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (submitting) return;
		submitting = true;
		error = '';

		const result = await apiPost('/unban-request', { banId, message });

		if (result.ok) {
			submitted = true;
		} else {
			error = result.error ?? m.unban_error_generic();
		}
		submitting = false;
	}
</script>

<AuthCard>
	{#if submitted}
		<div class="flex flex-col items-center text-center">
			<div class="bg-primary/10 mb-4 flex h-14 w-14 items-center justify-center rounded-full">
				<CheckCircle class="text-primary h-7 w-7" />
			</div>
			<h2 class="text-card-foreground text-xl font-bold tracking-tight">
				{m.unban_success_title()}
			</h2>
			<p class="text-muted-foreground mt-2 text-sm">{m.unban_success_desc()}</p>
			<a
				class="text-primary hover:text-primary/80 mt-6 flex items-center gap-1.5 text-sm font-medium transition-colors"
				href="/"
			>
				<ArrowLeft class="h-3.5 w-3.5" />
				{m.unban_back_home()}
			</a>
		</div>
	{:else}
		<h2 class="text-card-foreground text-xl font-bold tracking-tight">{m.unban_title()}</h2>
		<p class="text-muted-foreground mt-1 text-sm">{m.unban_desc()}</p>

		{#if error}
			<div
				class="border-destructive/30 bg-destructive/10 text-destructive mt-4 rounded-lg border px-4 py-3 text-sm"
			>
				{error}
			</div>
		{/if}

		<form class="mt-6 space-y-4" onsubmit={handleSubmit}>
			<div>
				<label class="text-foreground mb-1.5 block text-sm font-medium" for="banId">
					{m.unban_id_label()}
				</label>
				<input
					bind:value={banId}
					class="border-input bg-muted text-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:ring-ring/20 w-full rounded-lg border px-3.5 py-2.5 text-sm tracking-widest uppercase transition-colors outline-none focus:ring-2"
					id="banId"
					name="banId"
					placeholder="XXXXXXXX"
					required
					type="text"
				/>
			</div>

			<div>
				<label class="text-foreground mb-1.5 block text-sm font-medium" for="message">
					{m.unban_message_label()}
				</label>
				<textarea
					bind:value={message}
					class="border-input bg-muted text-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:ring-ring/20 w-full resize-none rounded-lg border px-3.5 py-2.5 text-sm transition-colors outline-none focus:ring-2"
					id="message"
					name="message"
					placeholder={m.unban_message_placeholder()}
					required
					rows="5"></textarea>
			</div>

			<button
				class="group bg-primary text-primary-foreground hover:bg-primary/90 mt-1 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
				disabled={submitting}
				type="submit"
			>
				{m.unban_submit_button()}
				<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
			</button>
		</form>
	{/if}
</AuthCard>
