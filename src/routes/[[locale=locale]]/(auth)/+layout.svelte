<script lang="ts">
	let { children } = $props();
</script>

<div class="bg-background relative flex flex-grow flex-col items-center justify-center px-4 py-16">
	<!-- Subtle grid -->
	<div
		class="pointer-events-none absolute inset-0 opacity-40"
		style="background-image: linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px); background-size: 40px 40px;"
	></div>

	{@render children()}
</div>
