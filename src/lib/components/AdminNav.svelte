<script lang="ts">
	import { page } from '$app/state';
	import { LayoutDashboard, Pickaxe, MessageSquare, Bot } from '@lucide/svelte';

	const tabs = [
		{ label: 'RizinOS', href: '/admin', icon: LayoutDashboard },
		{ label: 'Minecraft', href: '/admin/minecraft', icon: Pickaxe },
		{ label: 'Minechat', href: '/admin/minechat', icon: MessageSquare },
		{ label: 'Discord', href: '/admin/discord', icon: Bot }
	];

	function isActive(href: string) {
		// trailingSlash is 'always', so normalise the trailing slash before comparing.
		const path = page.url.pathname.replace(/\/+$/, '');
		if (href === '/admin') return path === '/admin';
		return path.startsWith(href);
	}
</script>

<div class="border-b">
	<div class="mx-auto max-w-7xl px-6">
		<div class="flex items-end justify-between pt-5 pb-0">
			<div class="pb-3">
				<p class="text-muted-foreground mb-0.5 text-xs font-medium tracking-widest uppercase">Admin</p>
				<h1 class="text-xl font-semibold leading-none">
					{tabs.find((t) => isActive(t.href))?.label ?? 'Dashboard'}
				</h1>
			</div>
		</div>
		<div class="flex">
			{#each tabs as tab (tab.href)}
				{@const active = isActive(tab.href)}
				{@const Icon = tab.icon}
				<a
					href={tab.href}
					class="flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors {active
						? 'border-primary text-primary'
						: 'text-muted-foreground hover:text-foreground border-transparent'}"
				>
					<Icon class="h-3.5 w-3.5" />
					{tab.label}
				</a>
			{/each}
		</div>
	</div>
</div>
