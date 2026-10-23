<script lang="ts">
	import { onMount, type Component } from 'svelte';

	// Static, always-on layer. The 3D scene below is an enhancement on top of it.
	let host: HTMLDivElement;
	let probe: HTMLSpanElement;

	// Type-only import: erased at build time, so Three.js is not pulled into the page bundle.
	type CanvasComponent = typeof import('@threlte/core').Canvas;

	let Canvas = $state<CanvasComponent | null>(null);
	let Scene = $state<Component<{ color: string }> | null>(null);
	let color = $state('#6366f1');
	let visible = $state(false);

	function supportsEnhancement(): boolean {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
		if (!matchMedia('(min-width: 1024px)').matches) return false;
		const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
			.connection;
		if (connection?.saveData) return false;
		try {
			const canvas = document.createElement('canvas');
			return !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
		} catch {
			return false;
		}
	}

	/** Resolves the theme's primary colour (oklch in Tailwind 4) to an sRGB value three.js understands. */
	function resolveColor(): string {
		try {
			const ctx = document.createElement('canvas').getContext('2d')!;
			ctx.fillStyle = getComputedStyle(probe).color;
			ctx.fillRect(0, 0, 1, 1);
			const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
			return `rgb(${r}, ${g}, ${b})`;
		} catch {
			return '#6366f1';
		}
	}

	onMount(() => {
		if (!supportsEnhancement()) return;

		let cancelled = false;
		const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
		observer.observe(host);

		// Three.js is only fetched on devices that will actually show it.
		Promise.all([import('@threlte/core'), import('$ui/contact/BackdropScene.svelte')])
			.then(([core, scene]) => {
				if (cancelled) return;
				color = resolveColor();
				Canvas = core.Canvas;
				Scene = scene.default as unknown as Component<{ color: string }>;
			})
			.catch(() => {});

		return () => {
			cancelled = true;
			observer.disconnect();
		};
	});
</script>

<div
	bind:this={host}
	class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] overflow-hidden mask-[linear-gradient(to_bottom,black_30%,transparent)]"
	aria-hidden="true"
>
	<span bind:this={probe} class="text-primary absolute size-0"></span>

	<div
		class="from-primary/10 absolute -top-24 right-0 h-96 w-[40rem] rounded-full bg-gradient-to-br to-transparent blur-3xl"
	></div>
	<div
		class="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[3.5rem_3.5rem] opacity-40 mask-[radial-gradient(ellipse_at_top_right,black,transparent_70%)]"
	></div>

	{#if Canvas && Scene && visible}
		<div class="absolute inset-0">
			<Canvas>
				<Scene {color} />
			</Canvas>
		</div>
	{/if}
</div>
