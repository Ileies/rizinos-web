<script lang="ts">
	import Hero from '$ui/homepage/Hero.svelte';
	import { session } from '$lib/session.svelte';
	import { LayoutDashboard } from '@lucide/svelte';
</script>

<Hero loggedIn={session.loggedIn} />

{#if session.isAdmin}
	<a
		href="/admin"
		class="bg-primary text-primary-foreground hover:bg-primary/90 fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-lg transition-colors"
	>
		<LayoutDashboard size={16} />
		Admin
	</a>
{/if}
