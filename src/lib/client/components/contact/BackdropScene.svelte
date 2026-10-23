<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import type { Group } from 'three';

	let { color }: { color: string } = $props();

	let group = $state<Group>();

	// Slow enough to read as ambient depth rather than motion.
	useTask((delta) => {
		if (!group) return;
		group.rotation.y += delta * 0.07;
		group.rotation.x += delta * 0.025;
	});
</script>

<T.PerspectiveCamera makeDefault position={[0, 0, 8]} fov={38} />

<T.Group bind:ref={group} position={[3.4, 0.4, 0]} rotation={[0.4, 0.3, 0]}>
	<T.Mesh>
		<T.IcosahedronGeometry args={[2.6, 1]} />
		<T.MeshBasicMaterial {color} wireframe transparent opacity={0.22} />
	</T.Mesh>
	<T.Mesh>
		<T.OctahedronGeometry args={[1.35, 0]} />
		<T.MeshBasicMaterial {color} wireframe transparent opacity={0.36} />
	</T.Mesh>
</T.Group>
