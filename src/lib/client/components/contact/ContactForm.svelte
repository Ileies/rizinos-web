<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { ArrowRight, Info, LoaderCircle, Lock } from '@lucide/svelte';
	import { page } from '$app/state';
	import { browser } from '$app/env';
	import AttachmentPicker from '#ui/contact/AttachmentPicker.svelte';
	import ContactSuccess from '#ui/contact/ContactSuccess.svelte';
	import TopicPicker from '#ui/contact/TopicPicker.svelte';
	import {
		LIMITS,
		RETENTION_MONTHS,
		TOPICS,
		collectEnvironment,
		errorText,
		fieldLabel,
		fieldPlaceholder,
		isTopicId,
		optionLabel,
		t,
		topicById,
		validateClient,
		type FieldErrors,
		type TopicId
	} from '#lib/contact.js';
	import { createChallenge, sendContact, type SubmitResult } from '#lib/contactApi.js';
	import { localePath } from '#lib/i18n.svelte.js';
	import { loadSession, session } from '#lib/session.svelte.js';
	import * as m from '#lib/messages.svelte.js';

	const DRAFT_KEY = 'rizinos-contact-draft';

	const emptyDetails = () =>
		Object.fromEntries(
			TOPICS.map((topic) => [topic.id, Object.fromEntries(topic.fields.map((f) => [f.key, '']))])
		) as Record<TopicId, Record<string, string>>;

	const requestedTopic = browser ? page.url.searchParams.get('topic') : null;

	let topicId = $state<TopicId>(isTopicId(requestedTopic) ? requestedTopic : 'general');
	let name = $state('');
	let email = $state('');
	let subject = $state('');
	let message = $state('');
	let detailsByTopic = $state(emptyDetails());
	let files = $state<File[]>([]);
	let attachError = $state('');
	let attachEnvironment = $state(true);
	let website = $state('');

	let errors = $state<FieldErrors>({});
	let globalError = $state('');
	let submitting = $state(false);
	let sentRef = $state<string | null>(null);

	let picker = $state<ReturnType<typeof AttachmentPicker>>();

	const topic = $derived(topicById(topicId));
	const locked = $derived(session.loggedIn);
	const challenge = createChallenge();

	// Signed-in users send as their account, so replies are tied to a verified address.
	$effect(() => {
		const user = session.user;
		if (!user) return;
		name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username;
		email = user.email;
	});

	onMount(() => {
		void loadSession();
		void challenge.prepare();
		restoreDraft();
	});

	// A long bug report should survive an accidental reload, but never outlive the browser tab.
	function restoreDraft() {
		try {
			const raw = sessionStorage.getItem(DRAFT_KEY);
			if (!raw) return;
			const draft = JSON.parse(raw) as Partial<{
				topicId: TopicId;
				subject: string;
				message: string;
				name: string;
				email: string;
				details: Record<TopicId, Record<string, string>>;
			}>;
			if (!requestedTopic && isTopicId(draft.topicId)) topicId = draft.topicId;
			subject = draft.subject ?? '';
			message = draft.message ?? '';
			if (!session.loggedIn) {
				name = draft.name ?? name;
				email = draft.email ?? email;
			}
			if (draft.details) {
				for (const [id, values] of Object.entries(draft.details)) {
					if (isTopicId(id)) Object.assign(detailsByTopic[id], values);
				}
			}
		} catch {
			/* storage unavailable or corrupt draft: start empty */
		}
	}

	$effect(() => {
		if (!browser || sentRef) return;
		const draft = JSON.stringify({
			topicId,
			subject,
			message,
			name: locked ? '' : name,
			email: locked ? '' : email,
			details: detailsByTopic
		});
		try {
			if (subject || message) sessionStorage.setItem(DRAFT_KEY, draft);
		} catch {
			/* ignore */
		}
	});

	function clearDraft() {
		try {
			sessionStorage.removeItem(DRAFT_KEY);
		} catch {
			/* ignore */
		}
	}

	const fieldOrder = $derived([
		'name',
		'email',
		'subject',
		...topic.fields.map((f) => f.key),
		'message'
	]);

	async function focusFirstError(found: FieldErrors) {
		await tick();
		const first = fieldOrder.find((key) => key in found);
		if (first) document.getElementById(`contact-${first}`)?.focus();
	}

	function applyResult(result: Exclude<SubmitResult, { ok: true }>) {
		switch (result.kind) {
			case 'validation': {
				const found: FieldErrors = {};
				for (const issue of result.issues) found[issue.field] = issue.code;
				errors = found;
				globalError = m.contact_err_fix();
				void focusFirstError(found);
				break;
			}
			case 'attachment':
				attachError =
					result.issue === 'too_many'
						? m.contact_err_att_too_many({ max: LIMITS.attachments })
						: result.issue === 'too_large'
							? m.contact_err_att_too_large({ mb: LIMITS.attachmentBytes / 1024 / 1024 })
							: m.contact_err_att_type();
				break;
			case 'rate_limited':
				globalError = m.contact_err_rate({
					minutes: Math.max(1, Math.ceil(result.retryAfter / 60))
				});
				break;
			case 'challenge':
				globalError = m.contact_err_challenge();
				break;
			case 'network':
				globalError = m.contact_err_network();
				break;
			default:
				globalError = m.contact_err_generic();
		}
	}

	async function submit(event?: Event) {
		event?.preventDefault();
		if (submitting) return;

		globalError = '';
		attachError = '';
		const details = { ...detailsByTopic[topicId] };
		const found = validateClient(topic, { name, email, subject, message, details });
		errors = found;
		if (Object.keys(found).length) {
			globalError = m.contact_err_fix();
			void focusFirstError(found);
			return;
		}

		if (topic.environment && attachEnvironment) details.environment = collectEnvironment();

		submitting = true;
		const result = await sendContact(
			{
				topic: topicId,
				name,
				email,
				subject,
				message,
				locale: m.getLocale(),
				details,
				website
			},
			files,
			challenge
		);
		submitting = false;

		if (result.ok) {
			sentRef = result.ref;
			clearDraft();
			return;
		}
		applyResult(result);
	}

	function reset() {
		subject = '';
		message = '';
		files = [];
		detailsByTopic = emptyDetails();
		errors = {};
		globalError = '';
		sentRef = null;
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
			event.preventDefault();
			void submit();
		}
	}

	function onPaste(event: ClipboardEvent) {
		const images = Array.from(event.clipboardData?.files ?? []).filter((f) =>
			f.type.startsWith('image/')
		);
		if (!images.length) return;
		event.preventDefault();
		picker?.add(images);
	}

	const inputClass =
		'border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/20 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20 w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors outline-none focus:ring-2 read-only:bg-muted read-only:text-muted-foreground';
	const labelClass = 'text-foreground mb-1.5 flex items-center gap-1.5 text-sm font-medium';
</script>

{#if sentRef}
	<ContactSuccess reference={sentRef} onReset={reset} />
{:else}
	<!-- Ctrl+Enter and image paste are handled here for events bubbling up from the fields. -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<form
		onsubmit={submit}
		onkeydown={onKeydown}
		onpaste={onPaste}
		novalidate
		class="border-border bg-card rounded-2xl border p-5 sm:p-8"
		aria-busy={submitting}
	>
		<TopicPicker bind:value={topicId} />

		<div class="border-border my-7 border-t"></div>

		<h2 class="text-foreground mb-5 text-sm font-semibold">{m.contact_details_heading()}</h2>

		{#if topic.notice}
			<div
				class="border-primary/20 bg-primary/5 text-foreground/80 mb-5 flex gap-2.5 rounded-lg border px-3.5 py-3 text-xs leading-relaxed"
			>
				<Info class="text-primary mt-0.5 size-4 shrink-0" />
				<p>{t(topic.notice)}</p>
			</div>
		{/if}

		<div class="grid gap-5 sm:grid-cols-2">
			<div>
				<label class={labelClass} for="contact-name">{m.contact_name()}</label>
				<input
					id="contact-name"
					bind:value={name}
					class={inputClass}
					type="text"
					autocomplete="name"
					maxlength={LIMITS.name}
					readonly={locked}
					aria-invalid={errors.name ? 'true' : undefined}
					aria-describedby={errors.name ? 'contact-name-error' : undefined}
				/>
				{#if errors.name}
					<p id="contact-name-error" class="text-destructive mt-1.5 text-xs">
						{errorText(errors.name, 'name', topic)}
					</p>
				{/if}
			</div>

			<div>
				<label class={labelClass} for="contact-email">
					{m.contact_email()}
					{#if locked}<Lock class="text-muted-foreground size-3" />{/if}
				</label>
				<input
					id="contact-email"
					bind:value={email}
					class={inputClass}
					type="email"
					autocomplete="email"
					maxlength={LIMITS.email}
					readonly={locked}
					aria-invalid={errors.email ? 'true' : undefined}
					aria-describedby={errors.email
						? 'contact-email-error'
						: locked
							? 'contact-email-hint'
							: undefined}
				/>
				{#if errors.email}
					<p id="contact-email-error" class="text-destructive mt-1.5 text-xs">
						{errorText(errors.email, 'email', topic)}
					</p>
				{:else if locked}
					<p id="contact-email-hint" class="text-muted-foreground mt-1.5 text-xs">
						{m.contact_email_locked()}
					</p>
				{/if}
			</div>

			<div class="sm:col-span-2">
				<label class={labelClass} for="contact-subject">{m.contact_subject()}</label>
				<input
					id="contact-subject"
					bind:value={subject}
					class={inputClass}
					type="text"
					maxlength={LIMITS.subject}
					aria-invalid={errors.subject ? 'true' : undefined}
					aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
				/>
				{#if errors.subject}
					<p id="contact-subject-error" class="text-destructive mt-1.5 text-xs">
						{errorText(errors.subject, 'subject', topic)}
					</p>
				{/if}
			</div>

			{#each topic.fields as field (topicId + field.key)}
				{@const id = `contact-${field.key}`}
				{@const wide = field.type === 'textarea' || field.max >= 300}
				<div class={wide ? 'sm:col-span-2' : ''}>
					<label class={labelClass} for={id}>
						{fieldLabel(topicId, field.key)}
						<span class="text-muted-foreground font-normal">({m.contact_optional()})</span>
					</label>

					{#if field.type === 'select'}
						<select
							{id}
							bind:value={detailsByTopic[topicId][field.key]}
							class={inputClass}
							aria-invalid={errors[field.key] ? 'true' : undefined}
						>
							<option value="">{m.contact_select_placeholder()}</option>
							{#each field.options ?? [] as option (option)}
								<option value={option}>{optionLabel(topicId, field.key, option)}</option>
							{/each}
						</select>
					{:else if field.type === 'textarea'}
						<textarea
							{id}
							bind:value={detailsByTopic[topicId][field.key]}
							class="{inputClass} resize-y"
							rows={field.rows ?? 3}
							maxlength={field.max}
							placeholder={fieldPlaceholder(topicId, field.key)}
							aria-invalid={errors[field.key] ? 'true' : undefined}></textarea>
					{:else}
						<input
							{id}
							bind:value={detailsByTopic[topicId][field.key]}
							class={inputClass}
							type="text"
							maxlength={field.max}
							placeholder={fieldPlaceholder(topicId, field.key)}
							aria-invalid={errors[field.key] ? 'true' : undefined}
						/>
					{/if}

					{#if errors[field.key]}
						<p class="text-destructive mt-1.5 text-xs">
							{errorText(errors[field.key], field.key, topic)}
						</p>
					{/if}
				</div>
			{/each}

			<div class="sm:col-span-2">
				<label class={labelClass} for="contact-message">{m.contact_message()}</label>
				<textarea
					id="contact-message"
					bind:value={message}
					class="{inputClass} min-h-40 resize-y"
					rows="7"
					maxlength={LIMITS.message}
					placeholder={m.contact_message_placeholder()}
					aria-invalid={errors.message ? 'true' : undefined}
					aria-describedby={errors.message ? 'contact-message-error' : undefined}></textarea>
				<div class="mt-1.5 flex items-start justify-between gap-3">
					{#if errors.message}
						<p id="contact-message-error" class="text-destructive text-xs">
							{errorText(errors.message, 'message', topic)}
						</p>
					{:else}
						<span></span>
					{/if}
					<span class="text-muted-foreground shrink-0 text-xs tabular-nums">
						{m.contact_counter({ count: message.length, max: LIMITS.message })}
					</span>
				</div>
			</div>

			<div class="sm:col-span-2">
				<AttachmentPicker bind:this={picker} bind:files bind:error={attachError} />
			</div>

			{#if topic.environment}
				<label
					class="border-border bg-muted/40 flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 sm:col-span-2"
				>
					<input
						type="checkbox"
						bind:checked={attachEnvironment}
						class="accent-primary mt-0.5 size-4 shrink-0"
					/>
					<span>
						<span class="text-foreground block text-sm font-medium">{m.contact_env_label()}</span>
						<span class="text-muted-foreground mt-0.5 block text-xs leading-relaxed">
							{m.contact_env_hint()}
						</span>
					</span>
				</label>
			{/if}
		</div>

		<!-- Honeypot: invisible to people, tempting to bots. Never filled by a real visit. -->
		<div class="absolute -left-[9999px] size-0 overflow-hidden" aria-hidden="true">
			<label>
				Homepage
				<input type="text" name="homepage" tabindex="-1" autocomplete="off" bind:value={website} />
			</label>
		</div>

		{#if globalError}
			<div
				class="border-destructive/30 bg-destructive/10 text-destructive mt-6 rounded-lg border px-4 py-3 text-sm"
				role="alert"
			>
				{globalError}
			</div>
		{/if}

		<div class="mt-6 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
			<p class="text-muted-foreground max-w-md text-xs leading-relaxed">
				{m.contact_privacy_note({ months: RETENTION_MONTHS })}
				<a href={localePath('/privacy')} class="text-primary underline-offset-2 hover:underline">
					{m.contact_privacy_link()}</a
				>.
			</p>

			<div class="flex shrink-0 flex-col items-stretch gap-1.5 sm:items-end">
				<button
					type="submit"
					disabled={submitting}
					class="group bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/40 inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 disabled:opacity-70"
				>
					{#if submitting}
						<LoaderCircle class="size-4 animate-spin" />
						{m.contact_sending()}
					{:else}
						{m.contact_submit()}
						<ArrowRight class="size-4 transition-transform group-hover:translate-x-0.5" />
					{/if}
				</button>
				<span class="text-muted-foreground hidden text-center text-xs sm:block">
					{m.contact_shortcut()}
				</span>
			</div>
		</div>
	</form>
{/if}
