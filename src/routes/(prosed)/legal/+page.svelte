<script lang="ts">
	import { PUBLIC_ORIGIN } from '$env/static/public';
	import * as m from '$lib/messages.svelte';
	import * as config from '$lib/config';

	const email = `info@${PUBLIC_ORIGIN}`;
	const liabilityEmail = `liability@${PUBLIC_ORIGIN}`;
</script>

<svelte:head>
	<title>Imprint - RizinOS</title>
	<meta
		name="description"
		content="Legal notice and imprint for RizinOS, including operator contact details."
	/>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto my-8">
	<h1>{m.legal_imprint_title()}</h1>

	<p>{m.legal_imprint_pursuant()}</p>

	<p>
		<strong>{m.legal_imprint_operator()}:</strong><br />
		{config.operatorName}
	</p>

	<p>
		<strong>{m.legal_imprint_address()}:</strong><br />
		{config.operatorAddress}
	</p>

	<p>
		<strong>{m.legal_imprint_contact()}:</strong><br />
		E-Mail: <a class="text-blue-600 hover:underline" href="mailto:{email}">{email}</a><br />
		{m.legal_imprint_phone()}:
		<a class="text-blue-600 hover:underline" href="tel:{config.operatorPhone}"
			>{config.operatorPhone}</a
		>
	</p>

	{#if config.handelsregister && config.registergericht}
		<p>
			<strong>{m.legal_imprint_trade_register()}:</strong><br />
			{m.legal_imprint_register_court()}: {config.registergericht}<br />
			{m.legal_imprint_register_number()}: {config.handelsregister}
		</p>
	{/if}

	{#if config.ustId}
		<p>
			<strong>{m.legal_imprint_vat_id()}:</strong><br />
			{m.legal_imprint_vat_pursuant({ id: config.ustId })}
		</p>
	{/if}

	<h2>{m.legal_liability_content_title()}</h2>
	<p>{m.legal_liability_content_p1()}</p>
	<p>{m.legal_liability_content_p2()}</p>

	<h2>{m.legal_liability_links_title()}</h2>
	<p>{m.legal_liability_links_p1()}</p>
	<p>{m.legal_liability_links_p2()}</p>

	<h2>{m.legal_liability_contact_title()}</h2>
	<p>
		{m.legal_liability_contact_text()}
		<a class="text-blue-600 hover:underline" href="mailto:{liabilityEmail}">{liabilityEmail}</a>
	</p>
</div>
