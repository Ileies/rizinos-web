<script lang="ts">
	import * as m from '$lib/messages.svelte';
</script>

<svelte:head>
	<title>Terms of Service - RizinOS</title>
	<meta
		name="description"
		content="Read the Terms of Service for RizinOS, the web-based operating system."
	/>
</svelte:head>

<div>
	<h1>{m.terms_title()}</h1>
	<p><em>{m.terms_last_updated()}</em></p>

	<h2>{m.terms_acceptance_title()}</h2>
	<p>{m.terms_acceptance_text()}</p>

	<h2>{m.terms_service_title()}</h2>
	<p>{m.terms_service_text()}</p>

	<h2>{m.terms_account_title()}</h2>
	<p>{m.terms_account_text()}</p>

	<h2>{m.terms_acceptable_use_title()}</h2>
	<p>{m.terms_acceptable_use_text()}</p>

	<h2>{m.terms_ip_title()}</h2>
	<p>{m.terms_ip_text()}</p>

	<h2>{m.terms_disclaimer_title()}</h2>
	<p>{m.terms_disclaimer_text()}</p>

	<h2>{m.terms_liability_title()}</h2>
	<p>{m.terms_liability_text()}</p>

	<h2>{m.terms_termination_title()}</h2>
	<p>{m.terms_termination_text()}</p>

	<h2>{m.terms_changes_title()}</h2>
	<p>{m.terms_changes_text()}</p>

	<h2>{m.terms_governing_law_title()}</h2>
	<p>{m.terms_governing_law_text()}</p>

	<h2>{m.terms_contact_title()}</h2>
	<p>{m.terms_contact_text()}</p>
</div>
