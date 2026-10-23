<script lang="ts">
	import { onMount } from 'svelte';
	import { ArrowUpRight, Mail } from '@lucide/svelte';
	import { SiDiscord, SiGithub, SiX } from '@icons-pack/svelte-simple-icons';
	import CopyButton from '$ui/contact/CopyButton.svelte';
	import { MAILBOXES, mailboxAddress, t } from '#lib/contact.js';
	import { discord, github, x } from '#lib/config.js';
	import * as m from '#lib/messages.svelte.js';

	interface DiscordInvite {
		guild?: { description: string | null };
		approximate_member_count: number;
		approximate_presence_count: number;
	}

	const discordInviteCode = discord.split('/').pop();

	let invite = $state<DiscordInvite | null>(null);

	// Live member counts from Discord's public invite endpoint. The card works fine without them.
	onMount(() => {
		const controller = new AbortController();
		fetch(`https://discord.com/api/v10/invites/${discordInviteCode}?with_counts=true`, {
			signal: controller.signal
		})
			.then((r) => (r.ok ? r.json() : Promise.reject(new Error('invite'))))
			.then((data: DiscordInvite) => (invite = data))
			.catch(() => {});
		return () => controller.abort();
	});

	const card = 'border-border bg-card rounded-2xl border p-5';
	const iconBox =
		'bg-secondary text-primary flex size-9 shrink-0 items-center justify-center rounded-lg';
	const linkButton =
		'text-primary hover:text-primary/80 focus-visible:ring-ring/40 mt-4 inline-flex items-center gap-1 rounded-md text-sm font-semibold transition-colors outline-none focus-visible:ring-2';
</script>

<div class="space-y-4">
	<h2 class="text-foreground text-sm font-semibold">{m.contact_channels_heading()}</h2>

	<section class={card} aria-labelledby="channel-discord">
		<div class="flex items-center gap-3">
			<span class={iconBox}><SiDiscord class="size-4" /></span>
			<h3 id="channel-discord" class="text-foreground font-semibold">Discord</h3>
		</div>
		<p class="text-muted-foreground mt-3 text-sm leading-relaxed">
			{invite?.guild?.description || m.contact_ch_discord_desc()}
		</p>
		{#if invite}
			<p class="text-muted-foreground mt-3 text-xs tabular-nums">
				<span class="text-foreground font-semibold">{invite.approximate_member_count}</span>
				{m.contact_discord_members()}
				<span class="mx-1">·</span>
				<span class="text-foreground font-semibold">{invite.approximate_presence_count}</span>
				{m.contact_discord_online()}
			</p>
		{/if}
		<a href={discord} target="_blank" rel="external noopener noreferrer" class={linkButton}>
			{m.contact_discord_join()}
			<ArrowUpRight class="size-3.5" />
		</a>
	</section>

	<section class={card} aria-labelledby="channel-email">
		<div class="flex items-center gap-3">
			<span class={iconBox}><Mail class="size-4" /></span>
			<h3 id="channel-email" class="text-foreground font-semibold">
				{m.contact_ch_email_heading()}
			</h3>
		</div>
		<ul class="divide-border mt-2 divide-y">
			{#each MAILBOXES as mailbox (mailbox)}
				{@const address = mailboxAddress(mailbox)}
				<li class="flex items-center justify-between gap-3 py-2.5">
					<div class="min-w-0">
						<a
							href="mailto:{address}"
							class="text-foreground hover:text-primary block truncate text-sm font-medium transition-colors"
						>
							{address}
						</a>
						<span class="text-muted-foreground text-xs">{t(`contact_mail_${mailbox}`)}</span>
					</div>
					<CopyButton text={address} />
				</li>
			{/each}
		</ul>
	</section>

	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
		<section class={card} aria-labelledby="channel-github">
			<div class="flex items-center gap-3">
				<span class={iconBox}><SiGithub class="size-4" /></span>
				<h3 id="channel-github" class="text-foreground font-semibold">GitHub</h3>
			</div>
			<p class="text-muted-foreground mt-3 text-sm leading-relaxed">{m.contact_ch_github_desc()}</p>
			<a href={github} target="_blank" rel="external noopener noreferrer" class={linkButton}>
				{m.contact_ch_github_cta()}
				<ArrowUpRight class="size-3.5" />
			</a>
		</section>

		<section class={card} aria-labelledby="channel-x">
			<div class="flex items-center gap-3">
				<span class={iconBox}><SiX class="size-4" /></span>
				<h3 id="channel-x" class="text-foreground font-semibold">X</h3>
			</div>
			<p class="text-muted-foreground mt-3 text-sm leading-relaxed">{m.contact_ch_x_desc()}</p>
			<a href={x} target="_blank" rel="external noopener noreferrer" class={linkButton}>
				{m.contact_ch_x_cta()}
				<ArrowUpRight class="size-3.5" />
			</a>
		</section>
	</div>
</div>
