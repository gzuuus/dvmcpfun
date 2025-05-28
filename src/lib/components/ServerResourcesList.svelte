<script lang="ts">
	import type { Resource } from '@modelcontextprotocol/sdk/types.js';
	import type { ResourcesListWithProvider } from '$lib/types';
	import Spinner from './spinner.svelte';

	// Props
	export let resourcesData: ResourcesListWithProvider | null | undefined = undefined;
	export let isLoading: boolean = false;
	export let error: Error | null = null;
	export let onSelectResource: (resource: Resource) => void = () => {};

	// Helper function to get pricing for a resource
	function getResourcePricing(name: string) {
		return resourcesData?.resourcesPricing?.get(name);
	}

	// Computed property for resources
	$: resources = resourcesData?.resources || [];
	$: hasResources = resources.length > 0;
</script>

<div>
	{#if isLoading}
		<div class="flex h-full w-full items-center justify-center py-4">
			<Spinner />
		</div>
	{:else if error}
		<div class="py-2 text-destructive">
			Error loading resources: {error.message}
		</div>
	{:else if hasResources}
		<div class="mb-6">
			<h3 class="mb-3 text-lg font-semibold text-primary">Resources</h3>
			<div class="space-y-2">
				{#each resources as resource}
					<div
						class="cursor-pointer rounded-lg border border-primary/20 bg-background p-3 transition-colors hover:border-primary/40"
						on:click={() => onSelectResource(resource)}
						on:keydown={(e) => e.key === 'Enter' && onSelectResource(resource)}
						tabindex="0"
						role="button"
					>
						<div class="flex items-center justify-between">
							<h4 class="text-base font-medium text-primary">{resource.name}</h4>
							{#if getResourcePricing(resource.name)}
								{@const pricing = getResourcePricing(resource.name)}
								<span class="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
									Price: {pricing?.price}
									{pricing?.unit}
								</span>
							{/if}
						</div>
						{#if resource.description}
							<p class="mt-1 text-sm text-foreground">{resource.description}</p>
						{/if}
						{#if resource.mimeType}
							<p class="mt-1 text-xs text-foreground/70">Type: {resource.mimeType}</p>
						{/if}
						<p class="mt-1 truncate text-xs text-foreground/70">URI: {resource.uri}</p>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="py-2 text-foreground/70">No resources available.</div>
	{/if}
</div>
