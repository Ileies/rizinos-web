<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { ArrowRight } from '@lucide/svelte';
	import * as m from '$lib/messages.svelte';
	import { session, loadSession, refreshSession } from '$lib/session.svelte';
	import { apiPost } from '$lib/api';
	import { APP_URL } from '$lib/config';

	let emailElement: HTMLInputElement;
	let error = $state('');
	let submitting = $state(false);

	const redirectTo = () => page.url.searchParams.get('redirect') || APP_URL;

	onMount(async () => {
		emailElement.focus();
		await loadSession();
		if (session.loggedIn) goto(redirectTo());
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (submitting) return;
		submitting = true;
		error = '';

		const data = new FormData(e.currentTarget as HTMLFormElement);
		const result = await apiPost('/auth/login', {
			email: data.get('email'),
			password: data.get('password'),
			keep: data.get('keep') === 'on'
		});

		if (result.ok) {
			await refreshSession();
			goto(redirectTo());
			return;
		}

		error = result.error ?? 'Login failed.';
		submitting = false;
	}
</script>

<div class="bg-background relative flex flex-grow flex-col items-center justify-center px-4 py-16">
	<!-- Subtle grid -->
	<div
		class="pointer-events-none absolute inset-0 opacity-40"
		style="background-image: linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px); background-size: 40px 40px;"
	></div>

	<!-- Card -->
	<div class="border-border bg-card relative w-full max-w-sm rounded-2xl border p-8 shadow-sm">
		<h2 class="text-card-foreground text-xl font-bold tracking-tight">{m.login_welcome_label()}</h2>
		<p class="text-muted-foreground mt-1 text-sm">{m.login_sign_in_desc()}</p>

		{#if error}
			<div
				class="border-destructive/30 bg-destructive/10 text-destructive mt-4 rounded-lg border px-4 py-3 text-sm"
			>
				{error}
			</div>
		{/if}

		<form class="mt-6 space-y-4" onsubmit={handleSubmit}>
			<div>
				<label class="text-foreground mb-1.5 block text-sm font-medium" for="email">
					{m.login_email_label()}
				</label>
				<input
					autocomplete="email"
					bind:this={emailElement}
					class="border-input bg-muted text-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:ring-ring/20 w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors outline-none focus:ring-2"
					id="email"
					name="email"
					placeholder="you@example.com"
					required
					type="email"
				/>
			</div>

			<div>
				<label class="text-foreground mb-1.5 block text-sm font-medium" for="password">
					{m.login_password_label()}
				</label>
				<input
					autocomplete="current-password"
					class="border-input bg-muted text-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:ring-ring/20 w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors outline-none focus:ring-2"
					id="password"
					name="password"
					placeholder="••••••••"
					required
					type="password"
				/>
				<a
					class="text-primary hover:text-primary/80 mt-1.5 block text-xs transition-colors"
					href="/forgot-password"
					tabindex="-1"
				>
					{m.login_forgot_password()}
				</a>
			</div>

			<button
				class="group bg-primary text-primary-foreground hover:bg-primary/90 mt-1 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
				disabled={submitting}
				type="submit"
			>
				{m.login_sign_in_button()}
				<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
			</button>
		</form>
	</div>

	<p class="text-muted-foreground relative mt-5 text-sm">
		{m.login_no_account()}
		<a class="text-primary hover:text-primary/80 font-medium transition-colors" href="/signup">
			{m.login_create_one()}
		</a>
	</p>
</div>
