<script lang="ts">
	import { createPromptsListQuery } from '$lib/queries/servers';
	import Spinner from './spinner.svelte';
	import CapabilityCard from './CapabilityCard.svelte';
	import type { Prompt } from '@modelcontextprotocol/sdk/types.js';

	// Props
	let {
		serverId,
		onSelectPrompt = () => {}
	}: {
		serverId: string;
		onSelectPrompt?: (prompt: Prompt) => void;
	} = $props();

	// Fetch prompts list for this server
	const promptsListQuery = $derived(serverId ? createPromptsListQuery(serverId) : undefined);
</script>

<div>
	{#if !promptsListQuery}
		<div class="py-2 text-foreground/70">No server ID provided.</div>
	{:else if $promptsListQuery?.isLoading}
		<div class="flex h-full w-full items-center justify-center py-4">
			<Spinner />
		</div>
	{:else if $promptsListQuery?.error}
		<div class="py-2 text-destructive">
			Error loading prompts: {$promptsListQuery?.error?.message}
		</div>
	{:else if $promptsListQuery?.data?.prompts && $promptsListQuery?.data?.prompts.length > 0}
		<div class="space-y-2">
			{#each $promptsListQuery?.data?.prompts || [] as prompt}
				{@const pricing = $promptsListQuery?.data?.promptsPricing?.get(prompt.name)}
				<CapabilityCard
					name={prompt.name}
					description={prompt.description}
					price={typeof pricing?.price === 'string' ? parseFloat(pricing.price) : pricing?.price}
					unit={pricing?.unit}
					type="prompt"
					args={prompt.arguments}
					capability={prompt}
					onSelect={onSelectPrompt}
				/>
			{/each}
		</div>
	{:else}
		<div class="py-2 text-foreground/70">No prompts available for this server.</div>
	{/if}
</div>
