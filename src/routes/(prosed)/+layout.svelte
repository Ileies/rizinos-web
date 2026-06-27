<script lang="ts">
	let { children } = $props();
</script>

<div class="m-8 flex w-full justify-center">
	<div class="prose prose-lg w-full max-w-4xl">
		{@render children()}
	</div>
</div>
