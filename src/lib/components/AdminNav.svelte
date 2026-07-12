<script lang="ts">
	import { LayoutDashboard, Pickaxe, MessageSquare, Bot, ShieldAlert } from '@lucide/svelte';

	let { active = $bindable() }: { active: string } = $props();

	const areas = [
		{ id: 'rizinos', label: 'RizinOS', icon: LayoutDashboard },
		{ id: 'minecraft', label: 'Minecraft', icon: Pickaxe },
		{ id: 'minechat', label: 'Minechat', icon: MessageSquare },
		{ id: 'discord', label: 'Discord', icon: Bot },
		{ id: 'moderation', label: 'Moderation', icon: ShieldAlert }
	];
</script>

<div class="border-b">
	<div class="mx-auto max-w-7xl px-6">
		<div class="flex items-end justify-between pt-5 pb-0">
			<div class="pb-3">
				<h1 class="text-xl font-semibold leading-none">Database Administration</h1>
			</div>
		</div>
		<div class="flex overflow-x-auto">
			{#each areas as area (area.id)}
				{@const Icon = area.icon}
				<button
					onclick={() => (active = area.id)}
					class="flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors {active ===
					area.id
						? 'border-primary text-primary'
						: 'text-muted-foreground hover:text-foreground border-transparent'}"
				>
					<Icon class="h-3.5 w-3.5" />
					{area.label}
				</button>
			{/each}
		</div>
	</div>
</div>
