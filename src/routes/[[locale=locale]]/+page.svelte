<script lang="ts">
	import Hero from '#ui/homepage/Hero.svelte';
	import { session } from '#lib/session.svelte.js';
</script>

<Hero loggedIn={session.loggedIn} />
