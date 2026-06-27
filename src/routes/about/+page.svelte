<script lang="ts">
	import Container from '$ui/homepage/Container.svelte';
</script>

<svelte:head>
	<title>About - RizinOS</title>
	<meta
		name="description"
		content="Learn about RizinOS, the browser-native operating system built on Rust WASM and a NixOS-inspired architecture."
	/>
</svelte:head>

<Container>
	<div class="py-24 sm:py-32">
		<!-- Hero -->
		<div class="mb-16">
			<p class="text-primary mb-4 text-sm font-semibold tracking-widest uppercase">About</p>
			<h1 class="text-foreground mb-6 text-4xl font-black tracking-tight sm:text-5xl">
				An operating system<br />that lives in your browser.
			</h1>
			<p class="text-muted-foreground max-w-2xl text-lg leading-relaxed">
				RizinOS is a full desktop environment that runs entirely in the browser - no installation,
				no drivers, no hardware requirements. Just open a tab and you're in.
			</p>
		</div>

		<!-- Why section -->
		<div class="mb-16 grid gap-8 sm:grid-cols-2">
			<div class="bg-card border-border rounded-2xl border p-8">
				<div
					class="bg-primary/10 text-primary mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold"
				>
					?
				</div>
				<h2 class="text-foreground mb-3 text-xl font-bold">Why does this exist?</h2>
				<p class="text-muted-foreground leading-relaxed">
					Traditional operating systems come with real friction: hardware compatibility issues,
					driver hell, complex setup. RizinOS removes that entirely. The browser is already
					everywhere - on your laptop, your phone, your TV. It makes sense to build on top of it.
				</p>
			</div>
			<div class="bg-card border-border rounded-2xl border p-8">
				<div
					class="bg-primary/10 text-primary mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold"
				>
					~
				</div>
				<h2 class="text-foreground mb-3 text-xl font-bold">What can you do with it?</h2>
				<p class="text-muted-foreground leading-relaxed">
					Run apps, manage files, open a terminal - the same things you'd expect from a desktop OS.
					The difference is that your environment follows you across devices, and every app is
					sandboxed by default.
				</p>
			</div>
		</div>

		<!-- Tech section -->
		<div class="mb-16">
			<h2 class="text-foreground mb-2 text-2xl font-bold">Technical vision</h2>
			<p class="text-muted-foreground mb-8 max-w-2xl">
				RizinOS is built on a small set of ideas that we're committed to for the long term.
			</p>
			<div class="space-y-4">
				<div class="border-border flex gap-6 rounded-2xl border p-6">
					<div class="bg-primary mt-1 h-2 w-2 flex-shrink-0 rounded-full"></div>
					<div>
						<h3 class="text-foreground mb-1 font-semibold">Rust + WebAssembly modules</h3>
						<p class="text-muted-foreground text-sm leading-relaxed">
							Core OS services are written in Rust and compiled to WASM. This means near-native
							performance in the browser, strong memory safety, and a clear module boundary between
							the OS kernel and user-space apps.
						</p>
					</div>
				</div>
				<div class="border-border flex gap-6 rounded-2xl border p-6">
					<div class="bg-primary mt-1 h-2 w-2 flex-shrink-0 rounded-full"></div>
					<div>
						<h3 class="text-foreground mb-1 font-semibold">Declarative configuration</h3>
						<p class="text-muted-foreground text-sm leading-relaxed">
							Inspired by NixOS, your entire environment is described as configuration. Install
							apps, set preferences, define your desktop layout - all reproducible and
							version-controlled. No more "it works on my machine".
						</p>
					</div>
				</div>
				<div class="border-border flex gap-6 rounded-2xl border p-6">
					<div class="bg-primary mt-1 h-2 w-2 flex-shrink-0 rounded-full"></div>
					<div>
						<h3 class="text-foreground mb-1 font-semibold">The browser as a platform</h3>
						<p class="text-muted-foreground text-sm leading-relaxed">
							Rather than fighting the browser's constraints, RizinOS embraces them. Tabs are
							processes. The network stack is already there. Security sandboxing comes for free. We
							treat the browser as the hardware layer.
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Status -->
		<div class="bg-card border-border mb-16 rounded-2xl border p-8">
			<div class="flex items-start gap-4">
				<span
					class="mt-0.5 inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400"
				>
					<span class="h-1.5 w-1.5 rounded-full bg-current"></span>
					Early Access
				</span>
			</div>
			<h2 class="text-foreground mt-4 mb-3 text-xl font-bold">Currently in development</h2>
			<p class="text-muted-foreground leading-relaxed">
				RizinOS is early-stage software. The core desktop shell is functional, but many features are
				still being built. Expect rough edges and frequent updates. Early adopters get to shape what
				this becomes - sign up to get access and leave feedback.
			</p>
		</div>

		<!-- Creator -->
		<div class="border-border border-t pt-16">
			<h2 class="text-foreground mb-8 text-2xl font-bold">Who's building this?</h2>
			<div class="flex flex-col gap-6 sm:flex-row sm:items-start">
				<div class="flex-1">
					<h3 class="text-foreground mb-1 text-lg font-bold">Ileies Blitz</h3>
					<p class="text-primary mb-4 text-sm font-medium">Solo developer</p>
					<p class="text-muted-foreground leading-relaxed">
						RizinOS is a solo project. I'm a developer who got frustrated with the friction of
						traditional operating systems and decided to explore whether the browser could be a
						better foundation. Everything you see here - the OS shell, the backend, the
						infrastructure - is built and maintained by one person.
					</p>
					<p class="text-muted-foreground mt-4 leading-relaxed">
						The project is open to early users and I genuinely read every piece of feedback. If
						something is broken or missing, I want to know.
					</p>
				</div>
			</div>
		</div>
	</div>
</Container>
