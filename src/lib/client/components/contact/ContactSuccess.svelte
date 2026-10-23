<script lang="ts">
	import { onMount } from 'svelte';
	import { ArrowLeft, MailCheck, MailOpen, Reply } from '@lucide/svelte';
	import CopyButton from '#ui/contact/CopyButton.svelte';
	import { localePath } from '#lib/i18n.svelte.js';
	import * as m from '#lib/messages.svelte.js';

	let { reference, onReset }: { reference: string; onReset: () => void } = $props();

	let heading: HTMLHeadingElement;

	// Move focus so keyboard and screen reader users land on the confirmation instead of a vanished form.
	onMount(() => heading.focus());

	const steps = $derived([
		{ icon: MailCheck, text: m.contact_next_1() },
		{ icon: MailOpen, text: m.contact_next_2() },
		{ icon: Reply, text: m.contact_next_3() }
	]);
</script>

<div class="border-border bg-card rounded-2xl border p-6 sm:p-8" role="status">
	<div class="flex flex-col items-center text-center">
		<div
			class="bg-primary/10 text-primary mb-5 flex size-16 items-center justify-center rounded-full"
		>
			<svg
				viewBox="0 0 24 24"
				class="size-8"
				fill="none"
				stroke="currentColor"
				stroke-width="2.2"
				aria-hidden="true"
			>
				<circle class="ring" cx="12" cy="12" r="10" opacity="0.25" />
				<path class="tick" d="M7.5 12.5l3 3 6-6.5" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</div>

		<h2
			bind:this={heading}
			tabindex="-1"
			class="text-foreground text-2xl font-black tracking-tight outline-none"
		>
			{m.contact_success_title()}
		</h2>
		<p class="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
			{m.contact_success_desc()}
		</p>

		<div
			class="border-border bg-muted/50 mt-6 inline-flex items-center gap-2 rounded-lg border py-1.5 pr-1.5 pl-4"
		>
			<span class="text-muted-foreground text-xs">{m.contact_success_ref()}</span>
			<code class="text-foreground font-mono text-sm font-semibold tracking-wider">{reference}</code
			>
			<CopyButton text={reference} />
		</div>
	</div>

	<div class="border-border mt-8 border-t pt-6">
		<h3 class="text-foreground mb-4 text-sm font-semibold">{m.contact_next_heading()}</h3>
		<ol class="space-y-3">
			{#each steps as step (step.text)}
				{@const Icon = step.icon}
				<li class="text-muted-foreground flex items-start gap-3 text-sm">
					<span
						class="bg-secondary text-primary mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg"
					>
						<Icon class="size-3.5" />
					</span>
					<span class="pt-0.5 leading-snug">{step.text}</span>
				</li>
			{/each}
		</ol>
	</div>

	<div class="mt-8 flex flex-col gap-3 sm:flex-row">
		<button
			type="button"
			onclick={onReset}
			class="border-border bg-card text-foreground hover:bg-muted focus-visible:ring-ring/40 inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-2"
		>
			{m.contact_send_another()}
		</button>
		<a
			href={localePath('/')}
			class="text-primary hover:text-primary/80 inline-flex items-center justify-center gap-1.5 px-2 py-2.5 text-sm font-medium transition-colors"
		>
			<ArrowLeft class="size-3.5" />
			{m.contact_back_home()}
		</a>
	</div>
</div>

<style>
	.tick {
		stroke-dasharray: 20;
		stroke-dashoffset: 20;
		animation: draw 0.5s 0.15s ease-out forwards;
	}
	.ring {
		stroke-dasharray: 63;
		stroke-dashoffset: 63;
		animation: draw 0.6s ease-out forwards;
	}
	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.tick,
		.ring {
			animation: none;
			stroke-dashoffset: 0;
		}
	}
</style>
