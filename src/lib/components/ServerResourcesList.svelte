<script lang="ts">
	import type { Resource } from '@modelcontextprotocol/sdk/types.js';
	import type { ResourcesListWithProvider } from '$lib/types';
	import Spinner from './spinner.svelte';
	import CapabilityCard from './CapabilityCard.svelte';

	// Props
	export let resourcesData: ResourcesListWithProvider | null | undefined = undefined;
	export let isLoading: boolean = false;
	export let error: Error | null = null;
	export let onSelectResource: (resource: Resource) => void = () => {};

	// Computed property for resources
	$: resources = resourcesData?.resources || [];
	$: hasResources = resources.length > 0;
</script>

<section>
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
					{@const pricing = resourcesData?.resourcesPricing?.get(resource.name)}
					<CapabilityCard
						name={resource.name}
						description={resource.description}
						price={typeof pricing?.price === 'string' ? parseFloat(pricing.price) : pricing?.price}
						unit={pricing?.unit}
						type="resource"
						mimeType={resource.mimeType}
						uri={resource.uri}
						capability={resource}
						onSelect={onSelectResource}
					/>
				{/each}
			</div>
		</div>
	{:else}
		<div class="py-2 text-foreground/70">No resources available.</div>
	{/if}
</section>
