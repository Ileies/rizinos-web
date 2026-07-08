<script lang="ts">
	import { SiDiscord } from '@icons-pack/svelte-simple-icons';
	import Container from '$ui/homepage/Container.svelte';
	import * as Card from '$shadcn/card';
	import { Button } from '$shadcn/button';
	import { discord } from '$lib/config';

	const discordInviteCode = discord.split('/').pop();

	interface DiscordInvite {
		guild?: { description: string | null };
		approximate_member_count: number;
		approximate_presence_count: number;
	}

	let invite = $state<DiscordInvite | null>(null);
	let inviteError = $state(false);

	$effect(() => {
		fetch(`https://discord.com/api/v10/invites/${discordInviteCode}?with_counts=true`)
			.then((r) => (r.ok ? r.json() : Promise.reject()))
			.then((d) => (invite = d))
			.catch(() => (inviteError = true));
	});
</script>

<Container>
	<div class="py-24 sm:py-32">
		<p class="text-primary mb-4 text-sm font-semibold tracking-widest uppercase">Contact</p>
		<h1 class="text-foreground mb-6 text-4xl font-black tracking-tight sm:text-5xl">
			Get in touch.
		</h1>
		<p class="text-muted-foreground max-w-2xl text-lg leading-relaxed">
			Contact details are coming soon.
		</p>

		<Card.Root class="mt-12 max-w-md">
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<SiDiscord class="size-5" />
					Discord
				</Card.Title>
				{#if invite?.guild?.description}
					<Card.Description>{invite.guild.description}</Card.Description>
				{/if}
			</Card.Header>
			<Card.Content>
				{#if invite && !inviteError}
					<p class="text-muted-foreground text-sm">
						<span class="text-foreground font-semibold">{invite.approximate_member_count}</span> members
						<span class="mx-1">·</span>
						<span class="text-foreground font-semibold">{invite.approximate_presence_count}</span> online
					</p>
				{:else if inviteError}
					<p class="text-muted-foreground text-sm">Join our community on Discord.</p>
				{/if}
			</Card.Content>
			<Card.Footer>
				<Button href={discord} target="_blank" rel="external noopener noreferrer">
					Join Discord
				</Button>
			</Card.Footer>
		</Card.Root>
	</div>
</Container>
