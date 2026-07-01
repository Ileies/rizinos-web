<script lang="ts">
	import { SvelteDate } from 'svelte/reactivity';
	import {
		cookie_banner_text,
		cookie_accept,
		cookie_decline,
		cookie_privacy_link
	} from '$lib/messages.svelte';

	let { onConsent }: { onConsent: (accepted: boolean) => void } = $props();

	function respond(accepted: boolean) {
		const expires = new SvelteDate();
		expires.setFullYear(expires.getFullYear() + 1);
		document.cookie = `cookie_consent=${accepted ? 'accepted' : 'declined'}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
		onConsent(accepted);
	}
</script>

<div
	class="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm"
>
	<div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 text-sm">
		<p class="text-muted-foreground">
			{cookie_banner_text()}
			<a href="/privacy" class="underline underline-offset-2 hover:text-foreground"
				>{cookie_privacy_link()}</a
			>
		</p>
		<div class="flex shrink-0 gap-2">
			<button
				onclick={() => respond(false)}
				class="rounded-md px-3 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
			>
				{cookie_decline()}
			</button>
			<button
				onclick={() => respond(true)}
				class="rounded-md bg-primary px-3 py-1 text-primary-foreground transition-opacity hover:opacity-90"
			>
				{cookie_accept()}
			</button>
		</div>
	</div>
</div>
