<script lang="ts">
	import Container from '#ui/homepage/Container.svelte';
	import * as m from '#lib/messages.svelte.js';
</script>

<Container>
	<div class="py-24 sm:py-32">
		<p class="text-primary mb-4 text-sm font-semibold tracking-widest uppercase">{m.blog()}</p>
		<h1 class="text-foreground mb-6 text-4xl font-black tracking-tight sm:text-5xl">
			{m.blog_title()}
		</h1>
		<p class="text-muted-foreground max-w-2xl text-lg leading-relaxed">{m.blog_lead()}</p>
	</div>
</Container>
