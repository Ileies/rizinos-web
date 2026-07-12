<script lang="ts">
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { ArrowRight, CheckCircle } from '@lucide/svelte';
	import * as m from '$lib/messages.svelte';
	import { apiPost } from '$lib/api';
	import AuthCard from '$lib/components/AuthCard.svelte';

	let password = $state('');
	let confirmPassword = $state('');
	let submitting = $state(false);
	let success = $state(false);
	let error = $state('');

	const token = $derived(browser ? (page.url.searchParams.get('token') ?? '') : '');

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (submitting) return;

		if (password !== confirmPassword) {
			error = m.reset_passwords_no_match();
			return;
		}

		submitting = true;
		error = '';

		const result = await apiPost('/auth/reset-password', { token, password });

		if (result.ok) {
			success = true;
			return;
		}

		error = result.error ?? m.reset_token_invalid();
		submitting = false;
	}
</script>

<AuthCard>
	{#if !token}
		<h2 class="text-card-foreground text-xl font-bold tracking-tight">
			{m.reset_token_missing()}
		</h2>
		<a
			class="text-primary hover:text-primary/80 mt-4 block text-sm font-medium transition-colors"
			href="/forgot-password"
		>
			{m.forgot_submit_button()}
		</a>
	{:else if success}
		<div class="flex flex-col items-center text-center">
			<div class="bg-primary/10 mb-4 flex h-14 w-14 items-center justify-center rounded-full">
				<CheckCircle class="text-primary h-7 w-7" />
			</div>
			<h2 class="text-card-foreground text-xl font-bold tracking-tight">
				{m.reset_success_title()}
			</h2>
			<p class="text-muted-foreground mt-2 text-sm">{m.reset_success_desc()}</p>
			<a
				class="group bg-primary text-primary-foreground hover:bg-primary/90 mt-6 flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
				href="/login"
			>
				{m.reset_sign_in_button()}
				<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
			</a>
		</div>
	{:else}
		<h2 class="text-card-foreground text-xl font-bold tracking-tight">{m.reset_title()}</h2>
		<p class="text-muted-foreground mt-1 text-sm">{m.reset_desc()}</p>

		{#if error}
			<div
				class="border-destructive/30 bg-destructive/10 text-destructive mt-4 rounded-lg border px-4 py-3 text-sm"
			>
				{error}
			</div>
		{/if}

		<form class="mt-6 space-y-4" onsubmit={handleSubmit}>
			<!--
				This form has no server-side fallback: if it's ever natively submitted before
				hydration attaches `handleSubmit` (e.g. a password manager auto-submitting), the
				browser GET-navigates to this same page with the form fields as the query string,
				which would otherwise drop the reset token and show "invalid or expired". This
				hidden field keeps the token in the URL if that happens.
			-->
			<input name="token" type="hidden" value={token} />
			<div>
				<label class="text-foreground mb-1.5 block text-sm font-medium" for="password">
					{m.reset_password_label()}
				</label>
				<input
					autocomplete="new-password"
					bind:value={password}
					class="border-input bg-muted text-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:ring-ring/20 w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors outline-none focus:ring-2"
					id="password"
					name="password"
					placeholder="••••••••"
					required
					type="password"
				/>
			</div>

			<div>
				<label class="text-foreground mb-1.5 block text-sm font-medium" for="confirm-password">
					{m.reset_confirm_label()}
				</label>
				<input
					autocomplete="new-password"
					bind:value={confirmPassword}
					class="border-input bg-muted text-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:ring-ring/20 w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors outline-none focus:ring-2"
					id="confirm-password"
					name="confirm-password"
					placeholder="••••••••"
					required
					type="password"
				/>
			</div>

			<button
				class="group bg-primary text-primary-foreground hover:bg-primary/90 mt-1 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
				disabled={submitting}
				type="submit"
			>
				{m.reset_submit_button()}
				<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
			</button>
		</form>
	{/if}
</AuthCard>
