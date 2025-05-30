<script lang="ts">
	import { createToolsListQuery } from '$lib/queries/servers';
	import Spinner from './spinner.svelte';
	import CapabilityCard from './CapabilityCard.svelte';
	import type { Tool } from '@modelcontextprotocol/sdk/types.js';

	// Props
	let {
		serverId,
		onSelectTool = () => {}
	}: {
		serverId: string;
		onSelectTool?: (tool: Tool) => void;
	} = $props();

	// Fetch tools list for this server
	const toolsListQuery = $derived(serverId ? createToolsListQuery(serverId) : undefined);
</script>

<section>
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
				{@const pricing = $toolsListQuery?.data?.toolsPricing?.get(tool.name)}
				<CapabilityCard
					name={tool.name}
					description={tool.description}
					price={typeof pricing?.price === 'string' ? parseFloat(pricing.price) : pricing?.price}
					unit={pricing?.unit}
					type="tool"
					capability={tool}
					onSelect={onSelectTool}
				/>
			{/each}
		</div>
	{:else}
		<div class="py-2 text-foreground/70">No tools available for this server.</div>
	{/if}
</section>
