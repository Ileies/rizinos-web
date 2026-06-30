<script lang="ts">
	import * as m from '$lib/messages.svelte';
</script>


<div>
	<h1>{m.privacy_title()}</h1>
	<p><em>{m.privacy_last_updated()}</em></p>

	<h2>{m.privacy_intro_title()}</h2>
	<p>{m.privacy_intro_text()}</p>

	<h2>{m.privacy_controller_title()}</h2>
	<p>{m.privacy_controller_text()}</p>

	<h2>{m.privacy_collected_title()}</h2>

	<h3>{m.privacy_collected_account_title()}</h3>
	<p>{m.privacy_collected_account_text()}</p>

	<h3>{m.privacy_collected_usage_title()}</h3>
	<p>{m.privacy_collected_usage_text()}</p>

	<h3>{m.privacy_collected_session_title()}</h3>
	<p>{m.privacy_collected_session_text()}</p>

	<h2>{m.privacy_analytics_title()}</h2>
	<p>{m.privacy_analytics_text()}</p>

	<h2>{m.privacy_oauth_title()}</h2>
	<p>{m.privacy_oauth_text()}</p>

	<h2>{m.privacy_retention_title()}</h2>
	<p>{m.privacy_retention_text()}</p>

	<h2>{m.privacy_rights_title()}</h2>
	<p>{m.privacy_rights_intro()}</p>
	<ul>
		<li>{m.privacy_right_access()}</li>
		<li>{m.privacy_right_rectification()}</li>
		<li>{m.privacy_right_erasure()}</li>
		<li>{m.privacy_right_restriction()}</li>
		<li>{m.privacy_right_portability()}</li>
		<li>{m.privacy_right_objection()}</li>
		<li>{m.privacy_right_withdraw()}</li>
	</ul>

	<h2>{m.privacy_supervisory_title()}</h2>
	<p>{m.privacy_supervisory_text()}</p>

	<h2>{m.privacy_security_title()}</h2>
	<p>{m.privacy_security_text()}</p>

	<section id="cookies">
		<h2>{m.privacy_cookies_section_title()}</h2>

		<h3>{m.privacy_cookies_essential_title()}</h3>
		<p>{m.privacy_cookies_essential_text()}</p>

		<h3>{m.privacy_cookies_analytics_title()}</h3>
		<p>{m.privacy_cookies_analytics_text()}</p>
	</section>

	<h2>{m.privacy_contact_title()}</h2>
	<p>{m.privacy_contact_text()}</p>
</div>
