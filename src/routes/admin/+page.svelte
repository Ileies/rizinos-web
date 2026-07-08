<script lang="ts">
	import AdminNav from '$lib/components/AdminNav.svelte';
	import RizinosSection from '$lib/components/admin/RizinosSection.svelte';
	import MinecraftSection from '$lib/components/admin/MinecraftSection.svelte';
	import MinechatSection from '$lib/components/admin/MinechatSection.svelte';
	import DiscordSection from '$lib/components/admin/DiscordSection.svelte';
	import ModerationSection from '$lib/components/admin/ModerationSection.svelte';

	let area = $state('rizinos');
</script>

<AdminNav bind:active={area} />

{#if area === 'rizinos'}
	<RizinosSection />
{:else if area === 'minecraft'}
	<MinecraftSection />
{:else if area === 'minechat'}
	<MinechatSection />
{:else if area === 'discord'}
	<DiscordSection />
{:else if area === 'moderation'}
	<ModerationSection />
{/if}
