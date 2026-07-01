<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import {
		ChevronDown,
		ExternalLink,
		Menu,
		X,
		Globe,
		LogOut,
		LayoutDashboard
	} from '@lucide/svelte';
	import { SiGithub } from '@icons-pack/svelte-simple-icons';
	import { PUBLIC_APP_NAME } from '$env/static/public';
	import { browser } from '$app/environment';
	import { github, APP_URL } from '$lib/config';
	import { setLocale } from '$lib/messages.svelte';
	import * as m from '$lib/messages.svelte';
	import { localePath, switchLocalePath } from '$lib/i18n.svelte';
	import { logout } from '$lib/session.svelte';

	const languages = [
		{ code: 'en', name: 'English', flag: '🇬🇧' },
		{ code: 'de', name: 'Deutsch', flag: '🇩🇪' },
		{ code: 'ru', name: 'Русский', flag: '🇷🇺' },
		{ code: 'cn', name: '简体中文', flag: '🇨🇳' }
	];

	let navItems = $derived(
		(() => {
			return [
				{
					label: m.features(),
					href: localePath('/features'),
					dropdown: [
						{ label: m.overview(), href: localePath('/features') },
						{ label: m.performance(), href: localePath('/features/performance') },
						{ label: m.security(), href: localePath('/features/security') },
						{ label: m.integration(), href: localePath('/features/integration') }
					]
				},
				{
					label: m.documentation(),
					href: localePath('/docs'),
					dropdown: [
						{ label: m.getting_started(), href: localePath('/docs') + '#getting-started' },
						{ label: m.api_reference(), href: localePath('/docs') + '#api' },
						{ label: m.tutorials(), href: localePath('/docs') + '#tutorials' }
					]
				},
				{ label: m.pricing(), href: localePath('/pricing') },
				{ label: m.enterprise(), href: localePath('/enterprise') }
			];
		})()
	);

	let {
		loggedIn = false,
		sessionLoaded = false,
		isAdmin = false
	}: { loggedIn?: boolean; sessionLoaded?: boolean; isAdmin?: boolean } = $props();

	let isMenuOpen = $state(false);
	let isScrolled = $state(false);
	let innerWidth = $state(0);
	let activeDropdown: string | null = $state(null);
	let isLanguageDropdownOpen = $state(false);
	let isMobile = $derived(innerWidth < 1024);

	if (browser) {
		const handleScroll = () => (isScrolled = window.scrollY > 20);
		window.addEventListener('scroll', handleScroll);
	}

	function toggleDropdown(e: MouseEvent, label: string) {
		e.stopPropagation();
		activeDropdown = activeDropdown === label ? null : label;
		isLanguageDropdownOpen = false;
	}

	function toggleLanguageDropdown(e: MouseEvent) {
		e.stopPropagation();
		isLanguageDropdownOpen = !isLanguageDropdownOpen;
		activeDropdown = null;
	}

	function stopPropagation(e: MouseEvent | KeyboardEvent) {
		e.stopPropagation();
	}

	function closeAll() {
		activeDropdown = null;
		isLanguageDropdownOpen = false;
	}

	function selectLanguage(code: string) {
		const targetPath = switchLocalePath(code, page.url.pathname);
		setLocale(code);
		goto(targetPath);
		isLanguageDropdownOpen = false;
	}

	async function handleLogout() {
		await logout();
		goto('/');
	}
</script>

<svelte:window bind:innerWidth />
<svelte:document onclick={closeAll} />

<header
	class="bg-background sticky top-0 z-50 w-full border-b transition-all duration-200 {isScrolled
		? 'border-border'
		: 'border-transparent'}"
>
	<div class="container mx-auto px-4">
		<nav class="flex h-20 items-center justify-between">
			<!-- Logo -->
			<a class="flex items-center gap-2" href={localePath('/')}>
				<img src="/favicon.png" alt={PUBLIC_APP_NAME} class="h-8 w-8" width="32" height="32" />
				<span class="text-foreground text-xl font-black tracking-tight">{PUBLIC_APP_NAME}</span>
			</a>

			<!-- Desktop Navigation -->
			{#if !isMobile}
				<div class="flex items-center space-x-8">
					{#each navItems as item (item.href)}
						<div class="relative">
							{#if item.dropdown}
								<button
									onclick={(e) => toggleDropdown(e, item.label)}
									class="text-foreground/70 hover:text-foreground flex items-center space-x-1 py-2 transition-colors duration-200"
									class:text-primary={page.url.pathname.startsWith(item.href)}
								>
									<span>{item.label}</span>
									<ChevronDown
										size={16}
										class="transition-transform duration-200 {activeDropdown === item.label
											? 'rotate-180'
											: ''}"
									/>
								</button>
							{:else}
								<a
									href={item.href}
									class="text-foreground/70 hover:text-foreground flex items-center py-2 transition-colors duration-200"
									class:text-primary={page.url.pathname.startsWith(item.href)}
								>
									{item.label}
								</a>
							{/if}

							{#if item.dropdown && activeDropdown === item.label}
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div
									onclick={stopPropagation}
									onkeydown={stopPropagation}
									class="border-border bg-popover absolute top-full left-1/2 mt-2 w-56 -translate-x-1/2 rounded-xl border py-2 shadow-xl"
								>
									<div
										class="border-border bg-popover absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-t border-l"
									></div>
									{#each item.dropdown as dropItem (dropItem.href)}
										<a
											href={dropItem.href}
											onclick={closeAll}
											class="text-foreground/70 hover:bg-muted hover:text-foreground block px-4 py-2 transition-colors duration-200"
										>
											{dropItem.label}
										</a>
									{/each}
								</div>
							{/if}
						</div>
					{/each}

					<a
						href={github}
						class="text-muted-foreground hover:text-foreground transition-colors"
						target="_blank"
						rel="external noopener noreferrer"
					>
						<SiGithub size={18} />
					</a>

					<!-- Language Switcher -->
					<div class="relative">
						<button
							onclick={toggleLanguageDropdown}
							class="text-muted-foreground hover:text-foreground p-2 transition-colors duration-200"
							aria-label={m.select_language()}
						>
							<Globe size={18} />
						</button>

						{#if isLanguageDropdownOpen}
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								onclick={stopPropagation}
								onkeydown={stopPropagation}
								class="border-border bg-popover absolute top-full right-0 z-50 mt-2 w-48 rounded-xl border py-2 shadow-xl"
							>
								{#each languages as lang (lang.code)}
									<button
										onclick={() => selectLanguage(lang.code)}
										class="text-foreground/70 hover:bg-muted hover:text-foreground flex w-full items-center space-x-3 px-4 py-3 text-left transition-colors duration-200"
									>
										<span class="text-lg">{lang.flag}</span>
										<span>{lang.name}</span>
									</button>
								{/each}
							</div>
						{/if}
					</div>

					{#if sessionLoaded}
						{#if loggedIn}
							<a
								href={APP_URL}
								class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-5 py-2 text-sm font-semibold transition-colors"
							>
								{m.open_your_os()}
							</a>
							{#if isAdmin}
								<a
									href="/admin"
									class="text-muted-foreground hover:text-foreground p-2 transition-colors"
									aria-label="Admin"
								>
									<LayoutDashboard size={18} />
								</a>
							{/if}
							<button
								onclick={handleLogout}
								class="text-muted-foreground hover:text-foreground p-2 transition-colors"
								aria-label={m.log_out()}
							>
								<LogOut size={18} />
							</button>
						{:else}
							<a
								href={localePath('/login')}
								class="border-border text-foreground/70 hover:border-border hover:bg-muted rounded-lg border px-5 py-2 text-sm font-semibold transition-colors"
							>
								{m.log_in()}
							</a>
						{/if}
					{/if}
				</div>
			{:else}
				<!-- Mobile Menu Button -->
				<button
					onclick={() => (isMenuOpen = !isMenuOpen)}
					class="text-muted-foreground hover:text-foreground p-2 transition-colors duration-200"
					aria-label={m.toggle_menu()}
				>
					{#if isMenuOpen}
						<X size={24} />
					{:else}
						<Menu size={24} />
					{/if}
				</button>
			{/if}
		</nav>

		<!-- Mobile Navigation -->
		{#if isMobile && isMenuOpen}
			<div
				class="border-border bg-background absolute top-20 left-0 w-full border-t px-4 py-4 shadow-lg"
			>
				{#each navItems as item (item.label)}
					<div class="py-1">
						<button
							class="text-foreground/70 hover:text-foreground flex w-full items-center justify-between py-2"
							onclick={(e) => toggleDropdown(e, item.label)}
						>
							<span>{item.label}</span>
							{#if item.dropdown}
								<ChevronDown
									size={16}
									class="transition-transform duration-200 {activeDropdown === item.label
										? 'rotate-180'
										: ''}"
								/>
							{/if}
						</button>

						{#if item.dropdown && activeDropdown === item.label}
							<div class="border-border mt-2 ml-4 space-y-2 border-l-2 pl-4">
								{#each item.dropdown as dropItem (dropItem.href)}
									<a
										href={dropItem.href}
										class="text-muted-foreground hover:text-foreground block py-2 transition-colors duration-200"
									>
										{dropItem.label}
									</a>
								{/each}
							</div>
						{/if}
					</div>
				{/each}

				<div class="bg-border my-4 h-px w-full"></div>

				<!-- Mobile Language Switcher -->
				<div class="py-1">
					<button
						class="text-foreground/70 hover:text-foreground flex w-full items-center justify-between py-2"
						onclick={toggleLanguageDropdown}
					>
						<span class="flex items-center space-x-2">
							<Globe size={16} />
							<span>{m.language()}</span>
						</span>
						<ChevronDown
							size={16}
							class="transition-transform duration-200 {isLanguageDropdownOpen ? 'rotate-180' : ''}"
						/>
					</button>
					{#if isLanguageDropdownOpen}
						<div class="border-border mt-2 ml-4 space-y-1 border-l-2 pl-4">
							{#each languages as lang (lang.code)}
								<button
									onclick={() => selectLanguage(lang.code)}
									class="text-muted-foreground hover:text-foreground flex w-full items-center space-x-3 py-2 text-left"
								>
									<span>{lang.flag}</span>
									<span>{lang.name}</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<div class="bg-border my-4 h-px w-full"></div>

				<a
					href={github}
					class="text-foreground/70 hover:text-foreground flex items-center space-x-2 py-2"
					target="_blank"
					rel="external noopener noreferrer"
				>
					<SiGithub size={20} />
					<span>GitHub</span>
					<ExternalLink size={14} class="text-muted-foreground" />
				</a>

				{#if sessionLoaded}
					{#if loggedIn}
						<a
							href={APP_URL}
							class="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 block w-full rounded-lg px-6 py-3 text-center text-sm font-semibold transition-colors"
						>
							{m.open_your_os()}
						</a>
						{#if isAdmin}
							<a
								href="/admin"
								class="text-muted-foreground hover:text-foreground mt-3 flex w-full items-center justify-center p-2 transition-colors"
								aria-label="Admin"
							>
								<LayoutDashboard size={20} />
							</a>
						{/if}
						<button
							onclick={handleLogout}
							class="text-muted-foreground hover:text-foreground mt-3 flex w-full items-center justify-center p-2 transition-colors"
							aria-label={m.log_out()}
						>
							<LogOut size={20} />
						</button>
					{:else}
						<a
							href={localePath('/login')}
							class="border-border text-foreground/70 hover:bg-muted mt-4 block w-full rounded-lg border px-6 py-3 text-center text-sm font-semibold transition-colors"
						>
							{m.log_in()}
						</a>
					{/if}
				{/if}
			</div>
		{/if}
	</div>
</header>
