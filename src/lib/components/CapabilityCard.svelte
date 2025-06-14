<script lang="ts">
	import type { CapabilityType } from '$lib/types';
	let {
		name,
		description = undefined,
		price = undefined,
		unit = undefined,
		type,
		args = undefined,
		mimeType = undefined,
		uri = undefined,
		uriTemplate = undefined,
		capability,
		onSelect
	}: {
		name: string;
		description?: string;
		price?: number;
		unit?: string;
		type: CapabilityType;
		args?: { name: string; required?: boolean; description?: string }[];
		mimeType?: string;
		uri?: string;
		uriTemplate?: string;
		capability: any;
		onSelect: (capability: any) => void;
	} = $props();
	const paddingClass = $derived(type === 'tool' ? 'p-4' : 'p-3');
	const headingTag = $derived(type === 'tool' ? 'h3' : 'h4');
	const headingClass = $derived(type === 'tool' ? 'text-lg' : 'text-base');
</script>

<div
	class="cursor-pointer rounded-lg border border-primary/20 bg-background {paddingClass} transition-colors hover:border-primary/40"
	onclick={() => onSelect(capability)}
	onkeydown={(e) => e.key === 'Enter' && onSelect(capability)}
	tabindex="0"
	role="button"
>
	<div class="flex items-center justify-between">
		<svelte:element this={headingTag} class="{headingClass} font-medium text-primary"
			>{name}</svelte:element
		>
		{#if price !== undefined && unit !== undefined}
			<span class="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
				Price: {price}
				{unit}
			</span>
		{/if}
	</div>
	{#if description}
		<p class="mt-1 text-sm text-foreground">{description}</p>
	{/if}

	{#if type === 'prompt' && args && args.length > 0}
		<div class="mt-2">
			<p class="text-xs font-medium text-foreground/70">Arguments:</p>
			<div class="mt-1 space-y-1">
				{#each args as arg}
					<div class="flex items-center gap-1 text-xs">
						<span class="font-medium">{arg.name}</span>
						{#if arg.required}
							<span class="text-destructive">*</span>
						{/if}
						{#if arg.description}
							<span class="text-foreground/70">- {arg.description}</span>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if type === 'resource' || type === 'resourceTemplates'}
		{#if mimeType}
			<p class="mt-1 text-xs text-foreground/70">Type: {mimeType}</p>
		{/if}
		{#if type === 'resource' && uri}
			<p class="mt-1 truncate text-xs text-foreground/70">URI: {uri}</p>
		{/if}
		{#if type === 'resourceTemplates' && uriTemplate}
			<p class="mt-1 truncate text-xs text-foreground/70">Template: {uriTemplate}</p>
		{/if}
	{/if}
</div>
