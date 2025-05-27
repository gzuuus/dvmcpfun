<script lang="ts">
	import { createToolsListQuery } from '$lib/queries/servers';
	import Spinner from './spinner.svelte';
	import type { Tool } from '@modelcontextprotocol/sdk/types.js';

	// Props
	export let serverId: string;
	export let onSelectTool: (tool: Tool) => void = () => {};

	// Fetch tools list for this server
	$: toolsListQuery = serverId ? createToolsListQuery(serverId) : undefined;
</script>

<div>
	{#if !toolsListQuery}
		<div class="py-2 text-foreground/70">No server ID provided.</div>
	{:else if $toolsListQuery?.isLoading}
		<div class="flex h-full w-full items-center justify-center py-4">
			<Spinner />
		</div>
	{:else if $toolsListQuery?.error}
		<div class="py-2 text-destructive">
			Error loading tools: {$toolsListQuery?.error?.message}
		</div>
	{:else if $toolsListQuery?.data && $toolsListQuery?.data?.tools && $toolsListQuery?.data?.tools.length > 0}
		<div class="space-y-4">
			{#each $toolsListQuery?.data?.tools || [] as tool}
				<div
					class="cursor-pointer rounded-lg border border-primary/20 bg-background p-4 transition-colors hover:border-primary/40"
					on:click={() => onSelectTool(tool)}
					on:keydown={(e) => e.key === 'Enter' && onSelectTool(tool)}
					tabindex="0"
					role="button"
				>
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-medium text-primary">{tool.name}</h3>
						{#if $toolsListQuery?.data?.toolsPricing && $toolsListQuery?.data?.toolsPricing.get(tool.name)}
							<span class="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
								Price: {$toolsListQuery?.data?.toolsPricing.get(tool.name)?.price}
								{$toolsListQuery?.data?.toolsPricing.get(tool.name)?.unit}
							</span>
						{/if}
					</div>
					{#if tool.description}
						<p class="mt-2 text-foreground">{tool.description}</p>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<div class="py-2 text-foreground/70">No tools available for this server.</div>
	{/if}
</div>
