<script lang="ts">
	import { SiDiscord, SiGoogle } from '@icons-pack/svelte-simple-icons';
	import * as m from '$lib/messages.svelte';
	import { API_BASE } from '$lib/config';

	let { redirectTo }: { redirectTo?: string } = $props();

	function oauthUrl(provider: 'google' | 'discord') {
		const url = new URL(`${API_BASE}/auth/oauth/${provider}`);
		if (redirectTo) url.searchParams.set('redirect', redirectTo);
		return url.toString();
	}

	const buttonClass =
		'border-input bg-background text-foreground hover:bg-muted flex w-full items-center justify-center gap-2.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors';
</script>

<div class="space-y-2.5">
	<a class={buttonClass} href={oauthUrl('google')}>
		<SiGoogle class="size-4.5" />
		{m.oauth_continue_with_google()}
	</a>
	<a class={buttonClass} href={oauthUrl('discord')}>
		<SiDiscord class="size-4.5 text-[#5865F2]" />
		{m.oauth_continue_with_discord()}
	</a>
</div>

<div class="my-5 flex items-center gap-3">
	<div class="bg-border h-px flex-1"></div>
	<span class="text-muted-foreground text-xs tracking-wide uppercase">{m.oauth_divider()}</span>
	<div class="bg-border h-px flex-1"></div>
</div>
