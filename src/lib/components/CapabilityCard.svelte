<script lang="ts">
	export let name: string;
	export let description: string | undefined = undefined;
	export let price: number | undefined = undefined;
	export let unit: string | undefined = undefined;
	export let type: 'prompt' | 'resource' | 'resourceTemplate' | 'tool';
	export let args: { name: string; required?: boolean; description?: string }[] | undefined =
		undefined;
	export let mimeType: string | undefined = undefined;
	export let uri: string | undefined = undefined;
	export let uriTemplate: string | undefined = undefined;
	export let capability: any;
	export let onSelect: (capability: any) => void;

	$: paddingClass = type === 'tool' ? 'p-4' : 'p-3';
	$: headingTag = type === 'tool' ? 'h3' : 'h4';
	$: headingClass = type === 'tool' ? 'text-lg' : 'text-base';
</script>

<div
	class="cursor-pointer rounded-lg border border-primary/20 bg-background {paddingClass} transition-colors hover:border-primary/40"
	on:click={() => onSelect(capability)}
	on:keydown={(e) => e.key === 'Enter' && onSelect(capability)}
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

	{#if type === 'resource' || type === 'resourceTemplate'}
		{#if mimeType}
			<p class="mt-1 text-xs text-foreground/70">Type: {mimeType}</p>
		{/if}
		{#if type === 'resource' && uri}
			<p class="mt-1 truncate text-xs text-foreground/70">URI: {uri}</p>
		{/if}
		{#if type === 'resourceTemplate' && uriTemplate}
			<p class="mt-1 truncate text-xs text-foreground/70">Template: {uriTemplate}</p>
		{/if}
	{/if}
</div>
