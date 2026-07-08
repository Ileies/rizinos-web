<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { ArrowRight } from '@lucide/svelte';
	import * as m from '$lib/messages.svelte';
	import { apiGet, apiPost } from '$lib/api';
	import { refreshSession } from '$lib/session.svelte';
	import { APP_URL } from '$lib/config';
	import AuthCard from '$lib/components/AuthCard.svelte';

	const token = $derived(page.url.searchParams.get('token') ?? '');

	let loading = $state(true);
	let invalidToken = $state(false);
	let email = $state('');

	let username = $state('');
	let birthdate = $state('');
	let password = $state('');
	let confirmPassword = $state('');

	let error = $state('');
	let submitting = $state(false);

	const now = new Date();
	const maxBirthdate = new Date(now.getFullYear() - 13, now.getMonth(), now.getDate())
		.toISOString()
		.split('T')[0];
	const minBirthdate = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate())
		.toISOString()
		.split('T')[0];

	onMount(async () => {
		if (!token) {
			invalidToken = true;
			loading = false;
			return;
		}
		try {
			const data = await apiGet<{ email?: string }>(
				`/auth/oauth/complete?token=${encodeURIComponent(token)}`
			);
			if (!data.email) {
				invalidToken = true;
			} else {
				email = data.email;
			}
		} catch {
			invalidToken = true;
		}
		loading = false;
	});

	const errorMessages: Record<string, () => string> = {
		signup_server_error: m.signup_server_error,
		signup_username_taken: m.signup_username_taken,
		signup_email_taken: m.signup_email_taken,
		oauth_invalid_token: m.oauth_complete_error_invalid_token
	};

	function resolveErrorId(id: string): string {
		return (errorMessages[id] ?? m.signup_server_error)();
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (submitting) return;

		if (password !== confirmPassword) {
			error = m.signup_passwords_mismatch();
			return;
		}

		submitting = true;
		error = '';

		const result = await apiPost<{ errorId?: string }>('/auth/oauth/complete', {
			token,
			username,
			birthdate,
			password
		});

		if (result.ok) {
			await refreshSession();
			window.location.href = APP_URL;
			return;
		}

		error = resolveErrorId(result.data?.errorId ?? 'signup_server_error');
		submitting = false;
	}
</script>

<AuthCard>
	{#if loading}
		<p class="text-muted-foreground text-sm">…</p>
	{:else if invalidToken}
		<h2 class="text-card-foreground text-xl font-bold tracking-tight">
			{m.oauth_complete_error_invalid_token()}
		</h2>
		<a
			class="text-primary hover:text-primary/80 mt-4 block text-sm font-medium transition-colors"
			href="/signup"
		>
			{m.signup_create_account()}
		</a>
	{:else}
		<h2 class="text-card-foreground text-xl font-bold tracking-tight">
			{m.oauth_complete_title()}
		</h2>
		<p class="text-muted-foreground mt-1 text-sm">{m.oauth_complete_desc()}</p>
		<p class="text-foreground mt-1 text-sm font-medium">{email}</p>

		{#if error}
			<div
				class="border-destructive/30 bg-destructive/10 text-destructive mt-4 rounded-lg border px-4 py-3 text-sm"
			>
				{error}
			</div>
		{/if}

		<form class="mt-6 space-y-4" onsubmit={handleSubmit}>
			<div>
				<label class="text-foreground mb-1.5 block text-sm font-medium" for="username">
					{m.signup_username_label()}
				</label>
				<input
					bind:value={username}
					class="border-input bg-muted text-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:ring-ring/20 w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors outline-none focus:ring-2"
					id="username"
					maxlength={20}
					name="username"
					placeholder={m.signup_username_placeholder()}
					required
					type="text"
				/>
			</div>

			<div>
				<label class="text-foreground mb-1.5 block text-sm font-medium" for="birthdate">
					{m.signup_birthdate_label()}
				</label>
				<input
					bind:value={birthdate}
					autocomplete="bday"
					class="border-input bg-muted text-foreground focus:border-ring focus:bg-background focus:ring-ring/20 w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors outline-none focus:ring-2"
					id="birthdate"
					max={maxBirthdate}
					min={minBirthdate}
					name="birthdate"
					required
					type="date"
				/>
			</div>

			<div>
				<label class="text-foreground mb-1.5 block text-sm font-medium" for="password">
					{m.signup_password_label()}
				</label>
				<input
					autocomplete="new-password"
					bind:value={password}
					class="border-input bg-muted text-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:ring-ring/20 w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors outline-none focus:ring-2"
					id="password"
					minlength={8}
					name="password"
					placeholder={m.signup_password_placeholder()}
					required
					type="password"
				/>
			</div>

			<div>
				<label class="text-foreground mb-1.5 block text-sm font-medium" for="confirm-password">
					{m.signup_confirm_password()}
				</label>
				<input
					autocomplete="new-password"
					bind:value={confirmPassword}
					class="border-input bg-muted text-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:ring-ring/20 w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors outline-none focus:ring-2"
					id="confirm-password"
					minlength={8}
					name="confirm-password"
					required
					type="password"
				/>
			</div>

			<button
				class="group bg-primary text-primary-foreground hover:bg-primary/90 mt-1 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
				disabled={submitting}
				type="submit"
			>
				{m.oauth_complete_create_account()}
				<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
			</button>
		</form>
	{/if}
</AuthCard>
