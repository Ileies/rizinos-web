<script lang="ts">
	import {
		ArrowRight,
		Cpu,
		Layers,
		Download,
		Shield,
		Zap,
		Users,
		Check,
		Code2,
		Lock,
		Globe,
		Wifi
	} from '@lucide/svelte';
	import SignupFlow from '$ui/homepage/SignupFlow.svelte';
	import * as m from '$lib/messages.svelte';

	let { loggedIn = false }: { loggedIn?: boolean } = $props();

	let features = $derived(
		(() => {
			return [
				{ icon: Cpu, title: m.feature_rust_wasm_title(), description: m.feature_rust_wasm_desc() },
				{ icon: Layers, title: m.feature_nixos_title(), description: m.feature_nixos_desc() },
				{
					icon: Shield,
					title: m.feature_encryption_title(),
					description: m.feature_encryption_desc()
				},
				{ icon: Zap, title: m.feature_instant_title(), description: m.feature_instant_desc() },
				{ icon: Download, title: m.feature_bgapp_title(), description: m.feature_bgapp_desc() },
				{ icon: Users, title: m.feature_collab_title(), description: m.feature_collab_desc() }
			];
		})()
	);

	const apps = [
		{ name: 'Files', label: 'F' },
		{ name: 'Terminal', label: '>_' },
		{ name: 'Browser', label: 'B' },
		{ name: 'Notes', label: 'N' },
		{ name: 'Mail', label: 'M' },
		{ name: 'Chat', label: 'C' },
		{ name: 'Calendar', label: 'Ca' },
		{ name: 'Photos', label: 'Ph' },
		{ name: 'Video', label: 'V' },
		{ name: 'Music', label: 'Mu' },
		{ name: 'Settings', label: 'S' },
		{ name: 'Store', label: 'St' }
	];

	let syncFeatures = $derived(
		(() => {
			return [
				m.sync_bidirectional(),
				m.sync_native_dnd(),
				m.sync_backups(),
				m.sync_push_notif(),
				m.sync_peripherals(),
				m.sync_offline()
			];
		})()
	);

	let bridgeCaps = $derived(
		(() => {
			return [
				m.cap_file_sync(),
				m.cap_cloud_backup(),
				m.cap_notifications(),
				m.cap_offline_mode(),
				m.cap_peripherals(),
				m.cap_usb_access()
			];
		})()
	);

	let zeroErrorsItems = $derived(
		(() => {
			return [
				{ title: m.hardware_independent_title(), desc: m.hardware_independent_desc() },
				{ title: m.declarative_config_title(), desc: m.declarative_config_desc() },
				{ title: m.atomic_updates_title(), desc: m.atomic_updates_desc() }
			];
		})()
	);

	const layers = [
		{
			label: 'Applications',
			sub: 'Files · Terminal · Browser · Notes · Chat · Mail · Calendar...'
		},
		{ label: 'System Shell', sub: 'Window manager · Dock · Notifications · Permissions UI' },
		{ label: 'OS Services', sub: 'Auth · Storage · Networking · IPC bus · Event system' },
		{ label: 'Rust WASM Kernel', sub: 'Scheduling · Memory isolation · Crypto · Compression' },
		{ label: 'Browser Runtime', sub: 'WebAssembly · Web APIs · WebGL · WebRTC · WebSockets' }
	];
</script>

<div class="flex w-full flex-col">
	<!-- ===================================================
	     HERO
	     =================================================== -->
	<section class="border-border bg-background border-b px-6 py-24 lg:py-36">
		<div class="mx-auto max-w-4xl text-center">
			<h1 class="text-foreground text-5xl leading-[1.08] font-black tracking-tight lg:text-7xl">
				{m.hero_title()}
			</h1>

			<p class="text-muted-foreground mt-4 font-mono text-xs">public beta · v11.0.0</p>

			<p class="text-muted-foreground mx-auto mt-6 max-w-xl text-lg leading-relaxed">
				{m.hero_subtitle()}
			</p>

			<div class="mt-10">
				<SignupFlow {loggedIn} />
			</div>
		</div>

		<!-- OS Mockup -->
		<div class="mx-auto mt-20 max-w-5xl">
			<div
				class="border-border bg-card overflow-hidden rounded-2xl border shadow-[0_32px_80px_rgba(0,0,0,0.12)]"
			>
				<!-- Browser bar -->
				<div class="border-border bg-muted flex items-center gap-2 border-b px-4 py-3">
					<div class="flex gap-1.5">
						<div class="h-3 w-3 rounded-full bg-gray-300"></div>
						<div class="h-3 w-3 rounded-full bg-gray-300"></div>
						<div class="h-3 w-3 rounded-full bg-gray-300"></div>
					</div>
					<div
						class="bg-background text-muted-foreground ring-border mx-3 flex flex-1 items-center gap-2 rounded-md px-3 py-1.5 text-xs shadow-sm ring-1"
					>
						<Lock class="h-3 w-3 text-green-500" />
						rizinos.com/app
					</div>
				</div>

				<!-- Desktop surface -->
				<div class="relative h-[380px] overflow-hidden bg-slate-100 lg:h-[480px]">
					<!-- Desktop background pattern -->
					<div
						class="absolute inset-0"
						style="background: linear-gradient(135deg, #e8edf5 0%, #dde4f0 100%)"
					></div>

					<!-- Desktop icons -->
					<div class="absolute top-4 left-4 flex flex-col gap-1">
						{#each ['Files', 'Terminal', 'Browser', 'Notes'] as icon (icon)}
							<div
								class="flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/40"
							>
								<div class="bg-primary h-8 w-8 rounded-lg shadow-sm"></div>
								<span class="text-foreground/70 text-xs font-medium">{icon}</span>
							</div>
						{/each}
					</div>

					<!-- Window: Files -->
					<div
						class="border-border bg-card absolute top-8 left-24 hidden w-64 overflow-hidden rounded-xl border shadow-xl sm:block lg:w-80"
					>
						<div class="border-border bg-muted flex items-center gap-2 border-b px-4 py-2.5">
							<div class="flex gap-1.5">
								<div class="bg-muted-foreground/30 h-2.5 w-2.5 rounded-full"></div>
								<div class="bg-muted-foreground/30 h-2.5 w-2.5 rounded-full"></div>
								<div class="bg-muted-foreground/30 h-2.5 w-2.5 rounded-full"></div>
							</div>
							<span class="text-muted-foreground ml-2 text-xs font-medium">Files</span>
						</div>
						<div class="divide-border divide-y">
							{#each ['Documents', 'Downloads', 'Pictures', 'Music', 'Projects'] as folder (folder)}
								<div class="hover:bg-accent flex cursor-default items-center gap-3 px-4 py-2.5">
									<div class="bg-primary/80 h-4 w-4 rounded"></div>
									<span class="text-foreground/80 text-sm">{folder}</span>
								</div>
							{/each}
						</div>
					</div>

					<!-- Window: Terminal -->
					<div
						class="absolute top-10 right-4 hidden w-52 overflow-hidden rounded-xl border border-gray-300 bg-gray-900 shadow-xl sm:right-8 sm:block lg:w-64"
					>
						<div class="flex items-center gap-2 border-b border-gray-700 bg-gray-800 px-4 py-2.5">
							<div class="flex gap-1.5">
								<div class="h-2.5 w-2.5 rounded-full bg-gray-600"></div>
								<div class="h-2.5 w-2.5 rounded-full bg-gray-600"></div>
								<div class="h-2.5 w-2.5 rounded-full bg-gray-600"></div>
							</div>
							<span class="ml-2 font-mono text-xs text-gray-400">bash</span>
						</div>
						<div class="p-4 font-mono text-xs leading-relaxed">
							<div class="text-gray-500">user@rizinos ~ %</div>
							<div class="text-gray-300">uname -a</div>
							<div class="text-gray-500">RizinOS 11.0.0 wasm64</div>
							<div class="text-gray-500">Kernel: rzk-wasm-rust</div>
							<div class="mt-2 text-gray-500">
								user@rizinos ~ % <span class="animate-pulse text-gray-300">|</span>
							</div>
						</div>
					</div>

					<!-- Notification -->
					<div
						class="border-border bg-card absolute top-4 left-1/2 hidden -translate-x-1/2 items-center gap-3 rounded-xl border px-4 py-2.5 shadow-lg sm:flex lg:w-64"
					>
						<div class="h-7 w-7 flex-shrink-0 rounded-lg bg-green-500"></div>
						<div class="text-foreground/70 text-xs">{m.mock_sync_complete()}</div>
					</div>

					<!-- Dock -->
					<div
						class="border-border bg-background/80 absolute right-0 bottom-0 left-0 flex items-center justify-between border-t px-6 py-2 backdrop-blur-md"
					>
						<div class="flex items-center gap-2">
							{#each [0, 1, 2, 3, 4, 5] as i (i)}
								<div
									class="bg-primary h-8 w-8 rounded-lg shadow-sm transition-transform hover:scale-110 {i ===
										0 || i === 2
										? 'ring-primary/30 ring-2'
										: ''}"
								></div>
							{/each}
						</div>
						<div class="text-muted-foreground font-mono text-xs">12:34</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ===================================================
	     ZERO ERRORS
	     =================================================== -->
	<section class="bg-muted/50 px-6 py-24">
		<div class="mx-auto max-w-7xl">
			<div class="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
				<div>
					<p class="text-primary mb-3 text-sm font-semibold tracking-widest uppercase">
						{m.core_promise_label()}
					</p>
					<h2 class="text-foreground text-4xl leading-tight font-black tracking-tight lg:text-5xl">
						{m.zero_errors_title()}
					</h2>
					<p class="text-muted-foreground mt-5 text-lg leading-relaxed">
						{m.zero_errors_desc()}
					</p>
				</div>

				<div class="grid grid-cols-1 gap-4">
					{#each zeroErrorsItems as item (item.title)}
						<div class="border-border bg-card rounded-xl border p-6">
							<h3 class="text-foreground mb-2 font-semibold">{item.title}</h3>
							<p class="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- ===================================================
	     FEATURES
	     =================================================== -->
	<section class="bg-background px-6 py-24">
		<div class="mx-auto max-w-7xl">
			<div class="mb-16 max-w-xl">
				<p class="text-primary mb-3 text-sm font-semibold tracking-widest uppercase">
					{m.capabilities_label()}
				</p>
				<h2 class="text-foreground text-4xl font-black tracking-tight">
					{m.features_era_title()}
				</h2>
			</div>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each features as feature (feature.title)}
					{@const Icon = feature.icon}
					<div
						class="border-border bg-card rounded-xl border p-7 transition-shadow hover:shadow-md"
					>
						<div
							class="bg-secondary mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg"
						>
							<Icon class="text-primary h-5 w-5" />
						</div>
						<h3 class="text-foreground mb-2 font-semibold">{feature.title}</h3>
						<p class="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- ===================================================
	     BACKGROUND APP
	     =================================================== -->
	<section class="border-border bg-muted/50 border-y px-6 py-24">
		<div class="mx-auto max-w-7xl">
			<div class="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
				<div>
					<p class="text-primary mb-3 text-sm font-semibold tracking-widest uppercase">
						{m.bg_app_label()}
					</p>
					<h2 class="text-foreground text-4xl leading-tight font-black tracking-tight">
						{m.bg_app_title()}
					</h2>
					<p class="text-muted-foreground mt-5 text-lg leading-relaxed">
						{m.bg_app_desc()}
					</p>
					<div class="mt-8 space-y-3">
						{#each syncFeatures as item (item)}
							<div class="flex items-start gap-3">
								<Check class="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
								<span class="text-muted-foreground text-sm">{item}</span>
							</div>
						{/each}
					</div>
					<div class="mt-10 flex flex-wrap gap-3">
						{#each ['Linux', 'macOS', 'Windows'] as platform (platform)}
							<button
								class="border-border bg-card text-foreground/70 hover:border-border hover:bg-muted inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors"
							>
								{m.download_for({ platform })}
							</button>
						{/each}
					</div>
				</div>

				<!-- Bridge diagram -->
				<div class="border-border bg-card rounded-xl border p-8 shadow-sm">
					<div class="flex flex-col items-stretch gap-3">
						<div class="border-primary/20 bg-secondary rounded-lg border p-5">
							<div class="flex items-center gap-3">
								<Globe class="text-primary h-5 w-5" />
								<div>
									<div class="text-foreground text-sm font-semibold">{m.bridge_browser()}</div>
									<div class="text-muted-foreground text-xs">rizinos.com/app</div>
								</div>
								<div class="ml-auto h-2 w-2 rounded-full bg-green-400"></div>
							</div>
						</div>

						<div class="flex flex-col items-center gap-0.5 py-1">
							<div class="bg-border h-6 w-px"></div>
							<div
								class="border-border bg-card text-muted-foreground rounded-full border px-4 py-1 text-xs"
							>
								{m.bridge_encrypted()}
							</div>
							<div class="bg-border h-6 w-px"></div>
						</div>

						<div class="border-border bg-muted rounded-lg border p-5">
							<div class="flex items-center gap-3">
								<Wifi class="text-muted-foreground h-5 w-5" />
								<div>
									<div class="text-foreground text-sm font-semibold">{m.bg_app_label()}</div>
									<div class="text-muted-foreground text-xs">{m.bridge_running_device()}</div>
								</div>
								<div class="ml-auto h-2 w-2 rounded-full bg-green-400"></div>
							</div>
						</div>

						<div class="mt-4 grid grid-cols-2 gap-2">
							{#each bridgeCaps as cap (cap)}
								<div
									class="border-border bg-muted text-muted-foreground rounded-md border px-3 py-2 text-center text-xs"
								>
									{cap}
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ===================================================
	     APPS
	     =================================================== -->
	<section class="bg-background px-6 py-24">
		<div class="mx-auto max-w-7xl">
			<div class="mb-16 max-w-xl">
				<p class="text-primary mb-3 text-sm font-semibold tracking-widest uppercase">
					{m.applications_label()}
				</p>
				<h2 class="text-foreground text-4xl font-black tracking-tight">
					{m.apps_title()}
				</h2>
				<p class="text-muted-foreground mt-4">
					{m.apps_desc()}
				</p>
			</div>

			<div class="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-6">
				{#each apps as app (app.name)}
					<div
						class="group border-border flex cursor-default flex-col items-center gap-2.5 rounded-xl border p-4 transition-shadow hover:shadow-sm"
					>
						<div
							class="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold shadow-sm"
						>
							{app.label.length <= 2 ? app.label : app.label[0]}
						</div>
						<span class="text-muted-foreground text-xs font-medium">{app.name}</span>
					</div>
				{/each}
			</div>

			<p class="text-muted-foreground mt-6 text-sm">
				{m.apps_roadmap()}
			</p>
		</div>
	</section>

	<!-- ===================================================
	     ARCHITECTURE
	     =================================================== -->
	<section class="border-border bg-muted/50 border-y px-6 py-24">
		<div class="mx-auto max-w-7xl">
			<div class="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
				<div>
					<p class="text-primary mb-3 text-sm font-semibold tracking-widest uppercase">
						{m.arch_label()}
					</p>
					<h2 class="text-foreground text-4xl leading-tight font-black tracking-tight">
						{m.arch_title()}
					</h2>
					<p class="text-muted-foreground mt-5 text-lg leading-relaxed">
						{m.arch_desc()}
					</p>

					<!-- Developer snippet -->
					<div class="border-border mt-8 overflow-hidden rounded-xl border bg-gray-900">
						<div class="border-b border-gray-700 px-5 py-3">
							<div class="flex items-center gap-2 text-xs text-gray-500">
								<Code2 class="h-3.5 w-3.5" />
								my-app/index.ts
							</div>
						</div>
						<div class="p-5 font-mono text-xs leading-relaxed">
							<div>
								<span class="text-purple-400">import</span>
								<span class="text-white"> &lbrace; </span>
								<span class="text-blue-300">App, ipc, fs</span>
								<span class="text-white"> &rbrace; </span>
								<span class="text-purple-400">from</span>
								<span class="text-green-400"> 'rizinos-sdk'</span>
							</div>
							<div class="mt-3 text-gray-500">// declare capabilities at install time</div>
							<div>
								<span class="text-purple-400">export const</span>
								<span class="text-yellow-300"> manifest</span>
								<span class="text-white"> = &lbrace;</span>
							</div>
							<div class="pl-5">
								<span class="text-blue-300">permissions</span><span class="text-white">: [</span
								><span class="text-green-400">'fs:read'</span><span class="text-white"
									>,
								</span><span class="text-green-400">'network'</span><span class="text-white">]</span
								>
							</div>
							<div><span class="text-white">&rbrace;</span></div>
							<div class="mt-3 text-gray-500">// runs as an isolated WASM process</div>
							<div>
								<span class="text-purple-400">export default</span>
								<span class="text-purple-400"> new</span>
								<span class="text-yellow-300"> App</span><span class="text-white">(&lbrace;</span>
							</div>
							<div class="pl-5">
								<span class="text-blue-300">onMount</span><span class="text-white">: </span><span
									class="text-purple-400">async</span
								>
								<span class="text-white">(ctx) => </span><span class="text-white">&lbrace;</span>
							</div>
							<div class="pl-10">
								<span class="text-purple-400">const</span>
								<span class="text-white"> files = </span><span class="text-purple-400"
									>await
								</span><span class="text-blue-300">fs</span><span class="text-white">.</span><span
									class="text-yellow-300">readdir</span
								><span class="text-white">('~/Documents')</span>
							</div>
							<div class="pl-5"><span class="text-white">&rbrace;</span></div>
							<div><span class="text-white">&rbrace;)</span></div>
						</div>
					</div>
				</div>

				<!-- Layer stack -->
				<div class="flex flex-col gap-2">
					{#each layers as layer, i (layer.label)}
						<div
							class="border-border bg-card rounded-lg border px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
						>
							<div class="flex items-center justify-between">
								<span class="text-foreground text-sm font-semibold">{layer.label}</span>
								<span class="text-muted-foreground text-xs">Layer {layers.length - i}</span>
							</div>
							<div class="text-muted-foreground mt-1 text-xs">{layer.sub}</div>
						</div>
					{/each}
					<p class="text-muted-foreground mt-3 text-xs">
						{m.arch_ipc_note()}
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- ===================================================
	     CTA
	     =================================================== -->
	<section class="bg-background px-6 py-28">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-foreground text-4xl font-black tracking-tight lg:text-5xl">
				{m.cta_title()}
			</h2>
			<p class="text-muted-foreground mt-5 text-lg">
				{m.cta_desc()}
			</p>
			<div class="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
				<a
					href="/signup"
					class="group bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-8 py-4 font-semibold transition-colors"
				>
					{m.cta_button()}
					<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
				</a>
			</div>
			<p class="text-muted-foreground mt-4 text-sm">
				{m.cta_note()}
			</p>
		</div>
	</section>
</div>
