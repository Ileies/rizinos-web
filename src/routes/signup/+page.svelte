<script lang="ts">
	import { onMount } from 'svelte';
	import { ArrowRight, ArrowLeft } from '@lucide/svelte';
	import * as m from '$lib/messages.svelte';
	import { apiPost } from '$lib/api';

	let step = $state(1);
	const TOTAL_STEPS = 4;

	let firstInput: HTMLInputElement | undefined = $state();

	const formData = $state({
		gender: 'male' as 'male' | 'female',
		birthdate: '',
		firstName: '',
		lastName: '',
		username: '',
		password: '',
		email: ''
	});

	let confirmPassword = $state('');

	const errors = $state({
		firstName: '',
		lastName: '',
		birthdate: '',
		email: '',
		username: '',
		password: '',
		confirmPassword: ''
	});

	let serverError = $state('');
	let success = $state(false);
	let submitting = $state(false);

	onMount(() => {
		firstInput?.focus();
	});

	const stepTitle = $derived(
		step === 1
			? m.signup_name_title()
			: step === 2
				? m.signup_birth_title()
				: step === 3
					? m.signup_account_title()
					: m.signup_finish_title()
	);

	const now = new Date();
	const maxBirthdate = new Date(now.getFullYear() - 12, now.getMonth(), now.getDate())
		.toISOString()
		.split('T')[0];
	const minBirthdate = new Date(now.getFullYear() - 80, now.getMonth(), now.getDate())
		.toISOString()
		.split('T')[0];
	const todayStr = now.toISOString().split('T')[0];

	const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ'.-]+(?: [A-Za-zÀ-ÖØ-öø-ÿ'.-]+)*$/;

	function validateStep(s: number): boolean {
		if (s === 1) {
			errors.firstName = '';
			errors.lastName = '';
			let ok = true;
			const first = formData.firstName.trim();
			const last = formData.lastName.trim();
			if (!first) {
				errors.firstName = m.signup_first_name_required();
				ok = false;
			} else if (!nameRegex.test(first)) {
				errors.firstName = m.signup_name_invalid();
				ok = false;
			}
			if (!last) {
				errors.lastName = m.signup_last_name_required();
				ok = false;
			} else if (!nameRegex.test(last)) {
				errors.lastName = m.signup_name_invalid();
				ok = false;
			}
			return ok;
		}
		if (s === 2) {
			errors.birthdate = '';
			if (!formData.birthdate) {
				errors.birthdate = m.signup_birthdate_required();
				return false;
			}
			const parsed = new Date(formData.birthdate);
			if (isNaN(parsed.getTime())) {
				errors.birthdate = m.signup_birthdate_invalid();
				return false;
			}
			if (formData.birthdate > todayStr) {
				errors.birthdate = m.signup_birthdate_future();
				return false;
			}
			if (formData.birthdate > maxBirthdate) {
				errors.birthdate = m.signup_age_requirement();
				return false;
			}
			return true;
		}
		if (s === 3) {
			errors.email = '';
			errors.username = '';
			let ok = true;
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
				errors.email = m.signup_email_invalid();
				ok = false;
			}
			if (formData.username.length < 5) {
				errors.username = m.signup_username_too_short();
				ok = false;
			} else if (formData.username.length > 20) {
				errors.username = m.signup_username_too_long();
				ok = false;
			} else if (!/^[a-z][a-z0-9]*$/.test(formData.username)) {
				errors.username = m.signup_username_format();
				ok = false;
			}
			return ok;
		}
		if (s === 4) {
			errors.password = '';
			errors.confirmPassword = '';
			let ok = true;
			if (formData.password.length < 10) {
				errors.password = m.signup_password_too_short();
				ok = false;
			} else if (!/[A-Z]/.test(formData.password)) {
				errors.password = m.signup_password_uppercase();
				ok = false;
			} else if (!/[a-z]/.test(formData.password)) {
				errors.password = m.signup_password_lowercase();
				ok = false;
			} else if (!/\d/.test(formData.password)) {
				errors.password = m.signup_password_number();
				ok = false;
			} else if (!/[\W_]/.test(formData.password)) {
				errors.password = m.signup_password_special();
				ok = false;
			}
			if (formData.password !== confirmPassword) {
				errors.confirmPassword = m.signup_passwords_mismatch();
				ok = false;
			}
			return ok;
		}
		return true;
	}

	function tryNextStep() {
		if (validateStep(step)) step++;
	}

	// Map server-returned error IDs to translated messages
	const errorMessages: Record<string, () => string> = {
		signup_server_error: m.signup_server_error,
		signup_username_taken: m.signup_username_taken,
		signup_email_taken: m.signup_email_taken
	};

	function resolveErrorId(id: string): string {
		return (errorMessages[id] ?? m.signup_server_error)();
	}

	async function submitForm(e: SubmitEvent) {
		e.preventDefault();
		if (!validateStep(4) || submitting) return;
		submitting = true;
		serverError = '';

		const result = await apiPost<{ errorId?: string }>('/auth/signup', formData);
		submitting = false;

		if (result.ok) {
			success = true;
			return;
		}

		serverError = resolveErrorId(result.data?.errorId ?? 'signup_server_error');
	}

	const inputBase =
		'w-full rounded-lg border bg-muted px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground transition-colors focus:bg-background focus:ring-2';

	function ic(hasError: boolean) {
		return hasError
			? `${inputBase} border-destructive focus:border-destructive focus:ring-destructive/20`
			: `${inputBase} border-input focus:border-ring focus:ring-ring/20`;
	}
</script>


{#if success}
	<div class="bg-background flex flex-grow flex-col items-center justify-center px-4 py-16">
		<div
			class="border-border bg-card relative w-full max-w-sm rounded-2xl border p-8 text-center shadow-sm"
		>
			<h2 class="text-card-foreground text-xl font-bold tracking-tight">
				{m.signup_thanks_title()}
			</h2>
			<p class="text-muted-foreground mt-2 text-sm">{m.signup_confirm_sent()}</p>
			<p class="text-foreground mt-1 text-sm font-medium">{formData.email}</p>
			<p class="text-muted-foreground mt-3 text-xs">{m.signup_check_spam()}</p>
		</div>
	</div>
{:else}
	<div
		class="bg-background relative flex flex-grow flex-col items-center justify-center px-4 py-16"
	>
		<!-- Subtle grid -->
		<div
			class="pointer-events-none absolute inset-0 opacity-40"
			style="background-image: linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px); background-size: 40px 40px;"
		></div>

		<!-- Card -->
		<div class="border-border bg-card relative w-full max-w-sm rounded-2xl border p-8 shadow-sm">
			<!-- Progress bar -->
			<div class="mb-5 flex gap-1.5">
				{#each Array.from({ length: TOTAL_STEPS }, (_, idx) => idx) as i (i)}
					<div
						class="h-1 flex-1 rounded-full transition-colors {i < step ? 'bg-primary' : 'bg-muted'}"
					></div>
				{/each}
			</div>

			<p class="text-muted-foreground text-xs font-medium">
				{m.signup_step({ step })} / {TOTAL_STEPS}
			</p>
			<h2 class="text-card-foreground mt-1 text-xl font-bold tracking-tight">{stepTitle}</h2>

			{#if serverError}
				<div
					class="border-destructive/30 bg-destructive/10 text-destructive mt-4 rounded-lg border px-4 py-3 text-sm"
				>
					{serverError}
				</div>
			{/if}

			<form class="mt-6" onsubmit={submitForm}>
				<div class="space-y-4">
					<!-- Step 1: Name -->
					<div class:hidden={step !== 1} class="space-y-4">
						<div>
							<label class="text-foreground mb-1.5 block text-sm font-medium" for="firstName">
								{m.signup_first_name()}
							</label>
							<input
								bind:this={firstInput}
								bind:value={formData.firstName}
								autocomplete="given-name"
								class={ic(!!errors.firstName)}
								id="firstName"
								maxlength={50}
								name="firstName"
								placeholder={m.signup_first_name()}
								type="text"
							/>
							{#if errors.firstName}
								<p class="text-destructive mt-1 text-xs">{errors.firstName}</p>
							{/if}
						</div>
						<div>
							<label class="text-foreground mb-1.5 block text-sm font-medium" for="lastName">
								{m.signup_last_name()}
							</label>
							<input
								bind:value={formData.lastName}
								autocomplete="family-name"
								class={ic(!!errors.lastName)}
								id="lastName"
								maxlength={50}
								name="lastName"
								placeholder={m.signup_last_name()}
								type="text"
							/>
							{#if errors.lastName}
								<p class="text-destructive mt-1 text-xs">{errors.lastName}</p>
							{/if}
						</div>
					</div>

					<!-- Step 2: Birthdate & Gender -->
					<div class:hidden={step !== 2} class="space-y-4">
						<div>
							<label class="text-foreground mb-1.5 block text-sm font-medium" for="birthdate">
								{m.signup_birthdate_label()}
							</label>
							<input
								bind:value={formData.birthdate}
								autocomplete="bday"
								class={ic(!!errors.birthdate)}
								id="birthdate"
								max={maxBirthdate}
								min={minBirthdate}
								name="birthdate"
								type="date"
							/>
							{#if errors.birthdate}
								<p class="text-destructive mt-1 text-xs">{errors.birthdate}</p>
							{/if}
						</div>
						<div>
							<p class="text-foreground mb-2 text-sm font-medium">
								{m.signup_gender_male()} / {m.signup_gender_female()}
							</p>
							<div class="flex gap-4">
								<label class="text-foreground flex cursor-pointer items-center gap-2 text-sm">
									<input
										bind:group={formData.gender}
										class="accent-primary"
										name="gender"
										type="radio"
										value="male"
									/>
									{m.signup_gender_male()}
								</label>
								<label class="text-foreground flex cursor-pointer items-center gap-2 text-sm">
									<input
										bind:group={formData.gender}
										class="accent-primary"
										name="gender"
										type="radio"
										value="female"
									/>
									{m.signup_gender_female()}
								</label>
							</div>
						</div>
					</div>

					<!-- Step 3: Account Details -->
					<div class:hidden={step !== 3} class="space-y-4">
						<div>
							<label class="text-foreground mb-1.5 block text-sm font-medium" for="email">
								{m.signup_email_label()}
							</label>
							<input
								bind:value={formData.email}
								autocomplete="email"
								class={ic(!!errors.email)}
								id="email"
								maxlength={320}
								name="email"
								placeholder={m.signup_email_placeholder()}
								type="email"
							/>
							{#if errors.email}
								<p class="text-destructive mt-1 text-xs">{errors.email}</p>
							{/if}
						</div>
						<div>
							<label class="text-foreground mb-1.5 block text-sm font-medium" for="username">
								{m.signup_username_label()}
							</label>
							<input
								bind:value={formData.username}
								class={ic(!!errors.username)}
								id="username"
								maxlength={20}
								name="username"
								placeholder={m.signup_username_placeholder()}
								type="text"
							/>
							{#if errors.username}
								<p class="text-destructive mt-1 text-xs">{errors.username}</p>
							{/if}
						</div>
					</div>

					<!-- Step 4: Password -->
					<div class:hidden={step !== 4} class="space-y-4">
						<div>
							<label class="text-foreground mb-1.5 block text-sm font-medium" for="password">
								{m.signup_password_label()}
							</label>
							<input
								bind:value={formData.password}
								autocomplete="new-password"
								class={ic(!!errors.password)}
								id="password"
								maxlength={71}
								name="password"
								placeholder={m.signup_password_placeholder()}
								type="password"
							/>
							{#if errors.password}
								<p class="text-destructive mt-1 text-xs">{errors.password}</p>
							{/if}
						</div>
						<div>
							<label class="text-foreground mb-1.5 block text-sm font-medium" for="confirmPassword">
								{m.signup_confirm_password()}
							</label>
							<input
								bind:value={confirmPassword}
								autocomplete="new-password"
								class={ic(!!errors.confirmPassword)}
								id="confirmPassword"
								maxlength={71}
								placeholder={m.signup_confirm_password()}
								type="password"
							/>
							{#if errors.confirmPassword}
								<p class="text-destructive mt-1 text-xs">{errors.confirmPassword}</p>
							{/if}
						</div>
					</div>
				</div>

				<!-- Navigation -->
				<div class="mt-6 flex items-center {step > 1 ? 'justify-between' : 'justify-end'}">
					{#if step > 1}
						<button
							class="border-input text-foreground hover:bg-muted flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
							onclick={() => step--}
							type="button"
						>
							<ArrowLeft class="h-4 w-4" />
							{m.signup_back()}
						</button>
					{/if}

					{#if step < TOTAL_STEPS}
						<button
							class="group bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
							onclick={tryNextStep}
							type="button"
						>
							{m.signup_next()}
							<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
						</button>
					{:else}
						<button
							class="group bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
							disabled={submitting}
							type="submit"
						>
							{m.signup_create_account()}
							<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
						</button>
					{/if}
				</div>
			</form>
		</div>

		<p class="text-muted-foreground relative mt-5 text-sm">
			{m.signup_have_account()}
			<a class="text-primary hover:text-primary/80 font-medium transition-colors" href="/login">
				{m.signup_log_in()}
			</a>
		</p>
	</div>
{/if}
