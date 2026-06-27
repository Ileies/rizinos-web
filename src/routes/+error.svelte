<script lang="ts">
	import { page } from '$app/state';
	import { ArrowLeft, Home } from '@lucide/svelte';
	import * as m from '$lib/messages.svelte';

	let status = $derived(page.status);
	let message = $derived(
		status === 404 ? m.error_404() : (page.error?.message ?? m.error_generic())
	);
</script>

<section class="bg-background flex w-full flex-grow items-center justify-center px-6 py-24">
	<div class="mx-auto max-w-md text-center">
		<p class="text-primary mb-4 text-sm font-semibold tracking-widest uppercase">
			{status === 404 ? 'Not Found' : 'Error'}
		</p>

		<h1
			class="text-foreground text-8xl leading-none font-black tracking-tight tabular-nums lg:text-9xl"
		>
			{status}
		</h1>

		<p class="text-muted-foreground mt-6 text-lg leading-relaxed">
			{message}
		</p>

		<div class="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
			<a
				href="/"
				class="group bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-7 py-3.5 font-semibold transition-colors"
			>
				<Home class="h-4 w-4" />
				{m.go_back_home()}
			</a>
			<button
				type="button"
				onclick={() => history.back()}
				class="group border-border bg-card text-foreground/70 hover:bg-muted inline-flex items-center gap-2 rounded-lg border px-7 py-3.5 font-medium transition-colors"
			>
				<ArrowLeft class="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
				{m.error_go_back()}
			</button>
		</div>
	</div>
</section>
