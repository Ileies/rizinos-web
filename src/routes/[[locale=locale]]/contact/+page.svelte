<script lang="ts">
	import Container from '$ui/homepage/Container.svelte';
	import ChannelCards from '$ui/contact/ChannelCards.svelte';
	import ContactBackdrop from '$ui/contact/ContactBackdrop.svelte';
	import ContactForm from '$ui/contact/ContactForm.svelte';
	import StatusChip from '$ui/contact/StatusChip.svelte';
	import * as m from '#lib/messages.svelte.js';
</script>

<Container>
	<div class="relative py-20 sm:py-28">
		<ContactBackdrop />

		<header class="max-w-2xl">
			<p class="text-primary mb-4 text-sm font-semibold tracking-widest uppercase">
				{m.contact_eyebrow()}
			</p>
			<h1 class="text-foreground mb-5 text-4xl font-black tracking-tight sm:text-5xl">
				{m.contact_title()}
			</h1>
			<p class="text-muted-foreground mb-7 text-lg leading-relaxed">{m.contact_lead()}</p>
			<StatusChip />
		</header>

		<div
			class="mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] xl:grid-cols-[minmax(0,1fr)_23rem]"
		>
			<ContactForm />
			<aside aria-label={m.contact_channels_heading()} class="lg:sticky lg:top-8">
				<ChannelCards />
			</aside>
		</div>
	</div>
</Container>
