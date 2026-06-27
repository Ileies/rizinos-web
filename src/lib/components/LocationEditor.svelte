<script lang="ts">
	import { untrack } from 'svelte';

	interface Props {
		name?: string;
		value?: string | null;
		worlds?: string[];
		readonly?: boolean;
	}

	let { name = 'location', value = null, worlds = [], readonly = false }: Props = $props();

	function parse(loc: string | null) {
		if (!loc) return { world: '', x: 0, y: 0, z: 0, yaw: 0, pitch: 0 };
		const get = (key: string) => {
			const m = loc.match(new RegExp(`(?:^|,)${key}=([^,]+)`));
			return m ? m[1] : null;
		};
		return {
			world: get('world') ?? '',
			x: parseFloat(get('x') ?? '0') || 0,
			y: parseFloat(get('y') ?? '0') || 0,
			z: parseFloat(get('z') ?? '0') || 0,
			yaw: parseFloat(get('yaw') ?? '0') || 0,
			pitch: parseFloat(get('pitch') ?? '0') || 0
		};
	}

	const init = untrack(() => parse(value));
	let world = $state(init.world);
	let x = $state(init.x);
	let y = $state(init.y);
	let z = $state(init.z);
	let yaw = $state(init.yaw);
	let pitch = $state(init.pitch);

	let locString = $derived(`world=${world},x=${x},y=${y},z=${z},pitch=${pitch},yaw=${yaw}`);

	const COORDS: { key: 'x' | 'y' | 'z' | 'yaw' | 'pitch'; label: string; step: number }[] = [
		{ key: 'x', label: 'X', step: 0.1 },
		{ key: 'y', label: 'Y', step: 0.1 },
		{ key: 'z', label: 'Z', step: 0.1 },
		{ key: 'yaw', label: 'Yaw', step: 0.01 },
		{ key: 'pitch', label: 'Pitch', step: 0.01 }
	];

	const vals: Record<'x' | 'y' | 'z' | 'yaw' | 'pitch', number> = {
		get x() {
			return x;
		},
		get y() {
			return y;
		},
		get z() {
			return z;
		},
		get yaw() {
			return yaw;
		},
		get pitch() {
			return pitch;
		}
	};

	function set(key: 'x' | 'y' | 'z' | 'yaw' | 'pitch', v: number) {
		if (key === 'x') x = v;
		else if (key === 'y') y = v;
		else if (key === 'z') z = v;
		else if (key === 'yaw') yaw = v;
		else pitch = v;
	}

	export function fmt(loc: string | null) {
		if (!loc) return '-';
		const p = parse(loc);
		const coords = `${Math.round(p.x)}, ${Math.round(p.y)}, ${Math.round(p.z)}`;
		return p.world ? `${p.world} (${coords})` : coords;
	}
</script>

{#if !readonly}
	<input type="hidden" {name} value={locString} />

	<div class="space-y-2">
		<div>
			<label for="{name}-world" class="text-muted-foreground mb-0.5 block text-xs">World</label>
			{#if worlds.length > 0}
				<select
					id="{name}-world"
					bind:value={world}
					class="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm"
				>
					{#if !world || !worlds.includes(world)}
						<option value={world || ''}>{world || 'Select world…'}</option>
					{/if}
					{#each worlds as w (w)}
						<option value={w}>{w}</option>
					{/each}
				</select>
			{:else}
				<input
					id="{name}-world"
					type="text"
					bind:value={world}
					placeholder="world name"
					class="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm"
				/>
			{/if}
		</div>

		<div class="grid grid-cols-5 gap-2">
			{#each COORDS as c (c.key)}
				<div>
					<label for="{name}-{c.key}" class="text-muted-foreground mb-0.5 block text-xs"
						>{c.label}</label
					>
					<input
						id="{name}-{c.key}"
						type="number"
						value={vals[c.key]}
						step={c.step}
						class="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-xs shadow-sm"
						oninput={(e) => set(c.key, parseFloat((e.target as HTMLInputElement).value) || 0)}
					/>
				</div>
			{/each}
		</div>
	</div>
{:else}
	<span class="text-muted-foreground font-mono text-xs">{fmt(value)}</span>
{/if}
