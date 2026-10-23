<script lang="ts">
	import { ImagePlus, X } from '@lucide/svelte';
	import { ALLOWED_IMAGE_TYPES, LIMITS, formatBytes } from '#lib/contact.js';
	import * as m from '#lib/messages.svelte.js';

	let { files = $bindable([]), error = $bindable('') }: { files: File[]; error?: string } =
		$props();

	let input: HTMLInputElement;
	let dragging = $state(false);
	let urls = $state<string[]>([]);

	const mb = LIMITS.attachmentBytes / 1024 / 1024;

	// Thumbnails use object URLs that must be released when files change or the component goes away.
	$effect(() => {
		const created = files.map((file) => URL.createObjectURL(file));
		urls = created;
		return () => created.forEach((url) => URL.revokeObjectURL(url));
	});

	/** Adds images from a file picker, drag and drop or the clipboard. Invalid files are reported, not silently dropped. */
	export function add(list: FileList | File[]) {
		error = '';
		const next = [...files];
		for (const file of Array.from(list)) {
			if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
				error = m.contact_err_att_type();
				continue;
			}
			if (file.size > LIMITS.attachmentBytes) {
				error = m.contact_err_att_too_large({ mb });
				continue;
			}
			if (next.length >= LIMITS.attachments) {
				error = m.contact_err_att_too_many({ max: LIMITS.attachments });
				break;
			}
			next.push(file);
		}
		files = next;
	}

	function remove(index: number) {
		error = '';
		files = files.filter((_, i) => i !== index);
	}

	function onDrop(event: DragEvent) {
		event.preventDefault();
		dragging = false;
		if (event.dataTransfer?.files.length) add(event.dataTransfer.files);
	}
</script>

<div>
	<div class="text-foreground mb-1.5 flex items-center gap-1.5 text-sm font-medium">
		{m.contact_attach_heading()}
		<span class="text-muted-foreground font-normal">({m.contact_optional()})</span>
	</div>

	<div
		role="group"
		aria-label={m.contact_attach_heading()}
		class="border-input bg-muted/40 rounded-lg border border-dashed transition-colors {dragging
			? 'border-primary bg-primary/5'
			: 'hover:border-primary/50'}"
		ondragover={(e) => {
			e.preventDefault();
			dragging = true;
		}}
		ondragleave={() => (dragging = false)}
		ondrop={onDrop}
	>
		<button
			type="button"
			onclick={() => input.click()}
			disabled={files.length >= LIMITS.attachments}
			class="focus-visible:ring-ring/40 flex w-full items-center gap-3 rounded-lg px-4 py-3.5 text-left outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
		>
			<span
				class="bg-secondary text-primary flex size-9 shrink-0 items-center justify-center rounded-lg"
			>
				<ImagePlus class="size-4" />
			</span>
			<span class="min-w-0">
				<span class="text-foreground block text-sm font-medium">{m.contact_attach_drop()}</span>
				<span class="text-muted-foreground block text-xs">
					{m.contact_attach_hint({ max: LIMITS.attachments, mb })}
				</span>
			</span>
		</button>

		{#if files.length}
			<ul class="grid grid-cols-1 gap-2 border-t border-dashed p-3 sm:grid-cols-3">
				{#each files as file, i (file.name + file.size + i)}
					<li
						class="border-border bg-card relative flex items-center gap-2.5 rounded-lg border p-2"
					>
						{#if urls[i]}
							<img src={urls[i]} alt="" class="size-12 shrink-0 rounded-md object-cover" />
						{/if}
						<span class="min-w-0 flex-1">
							<span class="text-foreground block truncate text-xs font-medium">{file.name}</span>
							<span class="text-muted-foreground block text-xs">{formatBytes(file.size)}</span>
						</span>
						<button
							type="button"
							onclick={() => remove(i)}
							class="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring/40 rounded-md p-1 outline-none focus-visible:ring-2"
							aria-label="{m.contact_attach_remove()}: {file.name}"
						>
							<X class="size-3.5" />
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	{#if error}
		<p class="text-destructive mt-1.5 text-xs" role="alert">{error}</p>
	{/if}

	<input
		bind:this={input}
		type="file"
		accept={ALLOWED_IMAGE_TYPES.join(',')}
		multiple
		class="sr-only"
		tabindex="-1"
		onchange={(e) => {
			add(e.currentTarget.files ?? []);
			e.currentTarget.value = '';
		}}
	/>
</div>
