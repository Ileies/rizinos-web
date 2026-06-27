<script lang="ts">
	import { enhance } from '$app/forms';
	import { Edit2, Check, X } from '@lucide/svelte';
	import * as Button from '$shadcn/button';
	import * as Input from '$shadcn/input';
	import type { Snippet } from 'svelte';
	import { untrack } from 'svelte';

	interface Props {
		value: string | number;
		label: string;
		action: string;
		fieldName?: string;
		hiddenFields?: Record<string, string>;
		type?: 'text' | 'number' | 'select';
		selectOptions?: Array<{ value: string; label: string }>;
		onEditStart?: () => void;
		onEditEnd?: () => void;
		children?: Snippet;
	}

	let {
		value,
		label,
		action,
		fieldName = 'value',
		hiddenFields = {},
		type = 'text',
		selectOptions = [],
		onEditStart = () => {},
		onEditEnd = () => {},
		children
	}: Props = $props();

	let isEditing = $state(false);
	let inputValue = $state(untrack(() => String(value)));

	function toggleEdit() {
		isEditing = !isEditing;
		if (isEditing) {
			onEditStart();
		} else {
			onEditEnd();
		}
	}

	function handleSubmit() {
		toggleEdit();
	}
</script>

<div>
	<p class="text-muted-foreground mb-2 text-xs font-medium uppercase">{label}</p>
	{#if !isEditing}
		<div class="flex items-center justify-between">
			{#if children}
				{@render children()}
			{:else}
				<p class="text-sm">{value || '-'}</p>
			{/if}
			<Button.Root type="button" variant="ghost" size="sm" onclick={toggleEdit}>
				<Edit2 size={14} />
			</Button.Root>
		</div>
	{:else}
		<form method="POST" {action} use:enhance class="flex gap-2" onsubmit={handleSubmit}>
			{#each Object.entries(hiddenFields) as [name, val] (name)}
				<input type="hidden" {name} value={val} />
			{/each}

			{#if type === 'select'}
				<select
					name={fieldName}
					bind:value={inputValue}
					class="bg-background flex-1 rounded-md border px-2 py-1 text-sm"
				>
					<option value="">Select...</option>
					{#each selectOptions as opt (opt.value)}
						<option value={opt.value} selected={opt.value === String(value)}>
							{opt.label}
						</option>
					{/each}
				</select>
			{:else}
				<Input.Root name={fieldName} {type} bind:value={inputValue} required class="text-sm" />
			{/if}

			<Button.Root type="submit" variant="ghost" size="sm">
				<Check size={14} />
			</Button.Root>
			<Button.Root type="button" variant="ghost" size="sm" onclick={toggleEdit}>
				<X size={14} />
			</Button.Root>
		</form>
	{/if}
</div>
