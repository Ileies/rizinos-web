<script lang="ts">
	import { ArrowUpRight, Gavel } from '@lucide/svelte';
	import { TOPICS, t, type TopicId } from '#lib/contact.js';
	import { localePath } from '#lib/i18n.svelte.js';
	import * as m from '#lib/messages.svelte.js';

	let { value = $bindable() }: { value: TopicId } = $props();

	const tile =
		'group border-border bg-card relative flex gap-3 rounded-xl border p-3.5 text-left transition-colors';
	const iconBox =
		'bg-secondary text-primary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors';
</script>

<fieldset>
	<legend class="text-foreground mb-3 text-sm font-semibold">{m.contact_topic_heading()}</legend>

	<div class="grid gap-2.5 sm:grid-cols-2">
		{#each TOPICS as topic (topic.id)}
			{@const Icon = topic.icon}
			<label
				class="{tile} hover:border-primary/40 has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-ring/40 cursor-pointer has-focus-visible:ring-2"
			>
				<input
					type="radio"
					name="contact-topic"
					value={topic.id}
					bind:group={value}
					class="sr-only"
				/>
				<span
					class="{iconBox} group-has-checked:bg-primary group-has-checked:text-primary-foreground"
				>
					<Icon class="size-4" />
				</span>
				<span class="min-w-0">
					<span class="text-foreground block text-sm font-semibold">
						{t(`contact_topic_${topic.id}`)}
					</span>
					<span class="text-muted-foreground mt-0.5 block text-xs leading-snug">
						{t(`contact_topic_${topic.id}_hint`)}
					</span>
				</span>
			</label>
		{/each}

		<!-- Bans have their own flow with a ban ID, so this tile links out instead of selecting a topic. -->
		<a
			href={localePath('/unban-request')}
			class="{tile} hover:border-primary/40 focus-visible:ring-ring/40 border-dashed outline-none focus-visible:ring-2"
		>
			<span class={iconBox}><Gavel class="size-4" /></span>
			<span class="min-w-0 flex-1">
				<span class="text-foreground flex items-center gap-1 text-sm font-semibold">
					{m.contact_topic_unban()}
					<ArrowUpRight
						class="text-muted-foreground size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
					/>
				</span>
				<span class="text-muted-foreground mt-0.5 block text-xs leading-snug">
					{m.contact_topic_unban_hint()}
				</span>
			</span>
		</a>
	</div>
</fieldset>
