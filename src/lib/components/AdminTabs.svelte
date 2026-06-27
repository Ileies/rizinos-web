<script lang="ts">
	import type { Component } from 'svelte';

	type IconComponent = Component<{ class?: string; size?: number | string }>;

	export interface AdminTab {
		id: string;
		label: string;
		icon?: IconComponent;
		/** Optional count rendered as `(n)` next to the label. */
		count?: number;
	}

	let { tabs, active = $bindable() }: { tabs: AdminTab[]; active: string } = $props();
</script>

<div class="mb-4 flex gap-1 border-b">
	{#each tabs as tab (tab.id)}
		{@const Icon = tab.icon}
		<button
			class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors {active ===
			tab.id
				? 'border-primary text-primary border-b-2'
				: 'text-muted-foreground hover:text-foreground'}"
			onclick={() => (active = tab.id)}
		>
			{#if Icon}
				<Icon class="h-3.5 w-3.5" />
			{/if}
			{tab.label}
			{#if tab.count !== undefined}
				<span class="text-xs {active === tab.id ? 'text-primary/70' : 'text-muted-foreground/60'}"
					>({tab.count})</span
				>
			{/if}
		</button>
	{/each}
</div>
