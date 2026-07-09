<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { ArrowRight } from '@lucide/svelte';
	import * as m from '$lib/messages.svelte';
	import { session, loadSession, refreshSession } from '$lib/session.svelte';
	import { apiPost } from '$lib/api';
	import { APP_URL } from '$lib/config';
	import AuthCard from '$lib/components/AuthCard.svelte';
	import OAuthButtons from '$lib/components/OAuthButtons.svelte';

	let emailElement: HTMLInputElement;
	let email = $state('');
	let error = $state('');
	let submitting = $state(false);

	const redirectTo = () => (browser ? page.url.searchParams.get('redirect') : null) || APP_URL;
	const absoluteRedirectTo = () => {
		const target = redirectTo();
		return target.startsWith('/') ? `${page.url.origin}${target}` : target;
	};

	function redirectAfterLogin() {
		const target = redirectTo();
		if (target.startsWith('/')) {
			goto(target);
		} else {
			window.location.href = target;
		}
	}

	onMount(async () => {
		emailElement.focus();
		await loadSession();
		if (session.loggedIn) redirectAfterLogin();
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
			redirectAfterLogin();
			return;
		}

		error = result.error ?? 'Login failed.';
		submitting = false;
	}
</script>

<AuthCard>
	<h2 class="text-card-foreground text-xl font-bold tracking-tight">{m.login_welcome_label()}</h2>
	<p class="text-muted-foreground mt-1 text-sm">{m.login_sign_in_desc()}</p>

	{#if error}
		<div
			class="border-destructive/30 bg-destructive/10 text-destructive mt-4 rounded-lg border px-4 py-3 text-sm"
		>
			{error}
		</div>
	{/if}

	<div class="mt-6">
		<OAuthButtons redirectTo={absoluteRedirectTo()} />
	</div>

	<form class="space-y-4" onsubmit={handleSubmit}>
		<div>
			<label class="text-foreground mb-1.5 block text-sm font-medium" for="email">
				{m.login_email_label()}
			</label>
			<input
				autocomplete="email"
				bind:this={emailElement}
				bind:value={email}
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
				href={email ? `/forgot-password?email=${encodeURIComponent(email)}` : '/forgot-password'}
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
</AuthCard>

<p class="text-muted-foreground relative mt-5 text-sm">
	{m.login_no_account()}
	<a class="text-primary hover:text-primary/80 font-medium transition-colors" href="/signup">
		{m.login_create_one()}
	</a>
</p>
