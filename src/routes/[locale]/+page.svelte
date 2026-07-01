<script lang="ts">
	import Hero from '$ui/homepage/Hero.svelte';
	import { session } from '$lib/session.svelte';
</script>

<Hero loggedIn={session.loggedIn} />
